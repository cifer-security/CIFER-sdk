// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/// @title ICiferEncrypted
/// @notice Interface for CIFER-encrypted message commitments:
///         - cifer + encryptedMessage are emitted in events (not stored)
///         - only hashes + minimal metadata are stored
interface ICiferEncrypted {
    // --- Errors ---
    /// @notice Thrown when encryptedMessage is empty
    error EmptyPayload();
    /// @notice Thrown when cifer is empty
    error EmptyEnvelope();
    /// @notice Thrown when cifer size doesn't match expected CIFER size (1104 bytes)
    error BadEnvelopeSize(uint256 got, uint256 expected);
    /// @notice Thrown when encryptedMessage exceeds maximum allowed size
    error PayloadTooLarge(uint256 got, uint256 maxAllowed);
    /// @notice Thrown when dataId is bytes32(0)
    error InvalidDataId();
    /// @notice Thrown when secretId is 0
    error InvalidSecretId();
    /// @notice Thrown when attempting to delete non-existent data
    error DataNotFound();

    /// @dev ML-KEM-768 ciphertext (1088) + AES-GCM tag (16) = 1104 bytes
    function CIFER_ENVELOPE_BYTES() external pure returns (uint256);

    /// @dev Upper bound for emitted encryptedMessage bytes
    function MAX_PAYLOAD_BYTES() external pure returns (uint256);

    /// @notice Emitted when CIFER data is stored for the first time
    /// @param dataId Unique identifier for the encrypted data
    /// @param secretId CIFER secret identifier used for encryption
    /// @param cifer Fixed-size CIFER bytes (1104 bytes)
    /// @param encryptedMessage AES-encrypted message bytes
    /// @param ciferHash keccak256(cifer)
    /// @param encryptedMessageHash keccak256(encryptedMessage)
    event CIFERDataStored(
        bytes32 indexed dataId,
        uint256 indexed secretId,
        bytes cifer,
        bytes encryptedMessage,
        bytes32 ciferHash,
        bytes32 encryptedMessageHash
    );

    /// @notice Emitted when CIFER data is updated
    event CIFERDataUpdated(
        bytes32 indexed dataId,
        uint256 indexed secretId,
        bytes cifer,
        bytes encryptedMessage,
        bytes32 ciferHash,
        bytes32 encryptedMessageHash
    );

    /// @notice Emitted when CIFER data is deleted
    /// @param dataId The unique identifier of the deleted data
    event CIFERDataDeleted(bytes32 indexed dataId);

    /// @notice Read the stored commitment/metadata for a dataId
    /// @return secretId The CIFER secret identifier
    /// @return storedAtBlock Block number when last stored/updated (for event lookup)
    /// @return ciferHash keccak256(cifer)
    /// @return encryptedMessageHash keccak256(encryptedMessage)
    function getCIFERMetadata(bytes32 dataId)
        external
        view
        returns (uint256 secretId, uint64 storedAtBlock, bytes32 ciferHash, bytes32 encryptedMessageHash);

    /// @notice Returns true if metadata exists for dataId
    function ciferDataExists(bytes32 dataId) external view returns (bool exists);
}
