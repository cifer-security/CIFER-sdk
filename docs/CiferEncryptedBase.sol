// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ICiferEncrypted} from "./ICiferEncrypted.sol";

/// @title CiferEncryptedBase
/// @notice Minimal-storage CIFER base:
///         - emits cifer + encryptedMessage in events
///         - stores only hashes + secretId + block number
abstract contract CiferEncryptedBase is ICiferEncrypted {
    // --- Limits (baked in) ---

    /// @dev ML-KEM-768 ciphertext (1088) + AES-GCM tag (16)
    uint256 internal constant _CIFER_ENVELOPE_BYTES = 1104;

    /// @dev Reasonable event encryptedMessage limit.
    ///      32 KiB is large enough for typical messages and avoids pathological calldata/log sizes.
    ///      Adjust in a fork if your chain policy allows more.
    uint256 internal constant _MAX_PAYLOAD_BYTES = 16 * 1024; // 16384

    function CIFER_ENVELOPE_BYTES() external pure returns (uint256) {
        return _CIFER_ENVELOPE_BYTES;
    }

    function MAX_PAYLOAD_BYTES() external pure returns (uint256) {
        return _MAX_PAYLOAD_BYTES;
    }

    // --- Storage (minimal) ---
    struct EncryptedMeta {
        bytes32 ciferHash;
        bytes32 encryptedMessageHash;
        uint256 secretId;
        uint64 storedAtBlock;
    }

    mapping(bytes32 => EncryptedMeta) internal _meta;

    /// @notice Store or update CIFER data (cifer + encryptedMessage emitted; only hashes stored)
    /// @dev Calls _computeDataId internally - child contracts MUST implement _computeDataId
    /// @param dataOwner The address that owns this data (typically msg.sender)
    /// @param key User-provided key for the data
    /// @param secretId The CIFER secret ID used for encryption
    /// @param encryptedMessage AES-encrypted message bytes (from blackbox encryptedMessage)
    /// @param cifer CIFER bytes (from blackbox cifer) - must be 1104 bytes
    function _storeEncrypted(
        address dataOwner,
        bytes32 key,
        uint256 secretId,
        bytes calldata encryptedMessage,
        bytes calldata cifer
    ) internal virtual {
        // Compute dataId using child's implementation
        bytes32 dataId = _computeDataId(dataOwner, key);

        // Validate identifiers
        if (dataId == bytes32(0)) revert InvalidDataId();
        if (secretId == 0) revert InvalidSecretId();

        // Validate encryptedMessage
        if (encryptedMessage.length == 0) revert EmptyPayload();
        if (encryptedMessage.length > _MAX_PAYLOAD_BYTES)
            revert PayloadTooLarge(encryptedMessage.length, _MAX_PAYLOAD_BYTES);

        // Validate cifer
        if (cifer.length == 0) revert EmptyEnvelope();
        if (cifer.length != _CIFER_ENVELOPE_BYTES)
            revert BadEnvelopeSize(cifer.length, _CIFER_ENVELOPE_BYTES);

        // Hashes calculated on-chain
        bytes32 encryptedMessageHash = keccak256(encryptedMessage);
        bytes32 ciferHash = keccak256(cifer);

        bool isUpdate = _meta[dataId].storedAtBlock != 0;

        _meta[dataId] = EncryptedMeta({
            ciferHash: ciferHash,
            encryptedMessageHash: encryptedMessageHash,
            secretId: secretId,
            storedAtBlock: uint64(block.number)
        });

        if (isUpdate) {
            emit CIFERDataUpdated(
                dataId,
                secretId,
                cifer,
                encryptedMessage,
                ciferHash,
                encryptedMessageHash
            );
        } else {
            emit CIFERDataStored(
                dataId,
                secretId,
                cifer,
                encryptedMessage,
                ciferHash,
                encryptedMessageHash
            );
        }
    }

    /// @inheritdoc ICiferEncrypted
    function getCIFERMetadata(
        bytes32 dataId
    )
        external
        view
        override
        returns (
            uint256 secretId,
            uint64 storedAtBlock,
            bytes32 ciferHash,
            bytes32 encryptedMessageHash
        )
    {
        EncryptedMeta storage m = _meta[dataId];
        return (m.secretId, m.storedAtBlock, m.ciferHash, m.encryptedMessageHash);
    }

    /// @inheritdoc ICiferEncrypted
    function ciferDataExists(
        bytes32 dataId
    ) external view override returns (bool exists) {
        return _meta[dataId].storedAtBlock != 0;
    }

    /// @notice Check if data exists for a given dataOwner and key
    /// @dev Calls _computeDataId internally
    /// @param dataOwner The address that owns this data
    /// @param key User-provided key for the data
    /// @return exists True if data exists
    function _ciferDataExists(
        address dataOwner,
        bytes32 key
    ) internal view returns (bool exists) {
        bytes32 dataId = _computeDataId(dataOwner, key);
        return _meta[dataId].storedAtBlock != 0;
    }

    /// @notice Delete CIFER data metadata
    /// @dev Calls _computeDataId internally - child contracts MUST implement _computeDataId
    /// @param dataOwner The address that owns this data (typically msg.sender)
    /// @param key User-provided key for the data
    function _deleteEncrypted(
        address dataOwner,
        bytes32 key
    ) internal virtual {
        bytes32 dataId = _computeDataId(dataOwner, key);
        if (_meta[dataId].storedAtBlock == 0) revert DataNotFound();
        delete _meta[dataId];
        emit CIFERDataDeleted(dataId);
    }

    // --- Abstract Functions (must be implemented by child contracts) ---

    /// @notice Compute a unique dataId from data owner address and key
    /// @dev MUST be implemented by child contracts to define data isolation strategy.
    ///
    /// SECURITY: This function enforces per-owner data isolation by including the owner
    /// address in the dataId computation. This prevents users from overwriting each other's data.
    ///
    /// @param dataOwner The address that owns this data (typically msg.sender for writes)
    /// @param key User-provided key or identifier for the data
    /// @return dataId Unique identifier used for storage and event lookup
    ///
    /// @custom:example Per-user isolation (RECOMMENDED - used in CiferVault):
    /// ```solidity
    /// function _computeDataId(address dataOwner, bytes32 key) internal pure override returns (bytes32) {
    ///     return keccak256(abi.encodePacked(dataOwner, key));
    /// }
    ///
    /// // Usage in child contract:
    /// function store(bytes32 key, bytes calldata encryptedMessage, bytes calldata cifer) external {
    ///     _storeEncrypted(msg.sender, key, secretId, encryptedMessage, cifer);
    /// }
    ///
    /// function deleteData(bytes32 key) external {
    ///     _deleteEncrypted(msg.sender, key);
    /// }
    ///
    /// function hasData(address user, bytes32 key) external view returns (bool) {
    ///     return _ciferDataExists(user, key);
    /// }
    ///
    /// // For view functions needing dataId, use _computeDataId directly:
    /// function getUserMetadata(address user, bytes32 key) external view returns (...) {
    ///     bytes32 dataId = _computeDataId(user, key);
    ///     return _meta[dataId];
    /// }
    /// ```
    ///
    /// @custom:example Pass-through (for admin-controlled contracts with external access control):
    /// ```solidity
    /// function _computeDataId(address dataOwner, bytes32 key) internal pure override returns (bytes32) {
    ///     return key;  // Ignores owner - ENSURE you have proper access control!
    /// }
    /// ```
    ///
    /// @custom:example Multi-tenant with contract-level namespace:
    /// ```solidity
    /// function _computeDataId(address dataOwner, bytes32 key) internal view override returns (bytes32) {
    ///     return keccak256(abi.encodePacked(address(this), dataOwner, key));
    /// }
    /// ```
    function _computeDataId(
        address dataOwner,
        bytes32 key
    ) internal view virtual returns (bytes32 dataId);

    /// @dev Reserved storage space for future upgrades (upgrade-safe pattern)
    uint256[49] private __gap;
}
