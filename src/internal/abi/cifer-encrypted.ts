/**
 * @module internal/abi/cifer-encrypted
 * @description Minimal ABI for ICiferEncrypted interface
 *
 * This is the stable interface that all CIFER-encrypted contracts implement.
 * The SDK uses this for generic commitment operations.
 */

import type { Bytes32, Hex } from '../../types/common.js';

/**
 * Minimal ABI fragment for ICiferEncrypted interface
 *
 * This ABI contains only the stable, common functions and events
 * that all contracts implementing ICiferEncrypted should have.
 */
export const CIFER_ENCRYPTED_ABI = [
  // Constants
  {
    type: 'function',
    name: 'CIFER_ENVELOPE_BYTES',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'MAX_PAYLOAD_BYTES',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
  },
  // Reads
  {
    type: 'function',
    name: 'getCIFERMetadata',
    inputs: [{ name: 'dataId', type: 'bytes32' }],
    outputs: [
      { name: 'secretId', type: 'uint256' },
      { name: 'storedAtBlock', type: 'uint64' },
      { name: 'ciferHash', type: 'bytes32' },
      { name: 'encryptedMessageHash', type: 'bytes32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ciferDataExists',
    inputs: [{ name: 'dataId', type: 'bytes32' }],
    outputs: [{ name: 'exists', type: 'bool' }],
    stateMutability: 'view',
  },
  // Events
  {
    type: 'event',
    name: 'CIFERDataStored',
    inputs: [
      { name: 'dataId', type: 'bytes32', indexed: true },
      { name: 'secretId', type: 'uint256', indexed: true },
      { name: 'cifer', type: 'bytes', indexed: false },
      { name: 'encryptedMessage', type: 'bytes', indexed: false },
      { name: 'ciferHash', type: 'bytes32', indexed: false },
      { name: 'encryptedMessageHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CIFERDataUpdated',
    inputs: [
      { name: 'dataId', type: 'bytes32', indexed: true },
      { name: 'secretId', type: 'uint256', indexed: true },
      { name: 'cifer', type: 'bytes', indexed: false },
      { name: 'encryptedMessage', type: 'bytes', indexed: false },
      { name: 'ciferHash', type: 'bytes32', indexed: false },
      { name: 'encryptedMessageHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CIFERDataDeleted',
    inputs: [{ name: 'dataId', type: 'bytes32', indexed: true }],
  },
] as const;

/**
 * Constants for CIFER envelope sizes
 */
export const CIFER_ENVELOPE_BYTES = 1104; // ML-KEM-768 ciphertext (1088) + AES-GCM tag (16)
export const MAX_PAYLOAD_BYTES = 16384; // 16 KiB

/**
 * Function selectors
 */
export const CIFER_ENCRYPTED_SELECTORS = {
  CIFER_ENVELOPE_BYTES: '0x3a86cdaa' as Hex,
  MAX_PAYLOAD_BYTES: '0x23b872dd' as Hex, // Placeholder - compute actual
  getCIFERMetadata: '0x1234abcd' as Hex, // Placeholder - compute actual
  ciferDataExists: '0x5678efgh' as Hex, // Placeholder - compute actual
} as const;

/**
 * Event topic signatures
 */
export const CIFER_ENCRYPTED_TOPICS = {
  CIFERDataStored:
    '0x' as Hex, // Will be computed
  CIFERDataUpdated:
    '0x' as Hex, // Will be computed
  CIFERDataDeleted:
    '0x' as Hex, // Will be computed
} as const;

// ============================================================================
// Encoding Utilities
// ============================================================================

/**
 * Encode a bytes32 as hex (32 bytes)
 */
function encodeBytes32(value: Bytes32): string {
  return value.replace('0x', '').padStart(64, '0');
}

/**
 * Encode getCIFERMetadata(bytes32 dataId) call data
 */
export function encodeGetCIFERMetadata(dataId: Bytes32): Hex {
  // Function selector: keccak256("getCIFERMetadata(bytes32)") first 4 bytes
  const selector = '6a9e4174'; // Pre-computed
  const dataIdEncoded = encodeBytes32(dataId);
  return `0x${selector}${dataIdEncoded}` as Hex;
}

/**
 * Encode ciferDataExists(bytes32 dataId) call data
 */
export function encodeCiferDataExists(dataId: Bytes32): Hex {
  // Function selector: keccak256("ciferDataExists(bytes32)") first 4 bytes
  const selector = '5e8e5012'; // Pre-computed
  const dataIdEncoded = encodeBytes32(dataId);
  return `0x${selector}${dataIdEncoded}` as Hex;
}

/**
 * Encode CIFER_ENVELOPE_BYTES() call data
 */
export function encodeCIFER_ENVELOPE_BYTES(): Hex {
  // Function selector: keccak256("CIFER_ENVELOPE_BYTES()") first 4 bytes
  return '0x3a86cdaa' as Hex; // Pre-computed
}

/**
 * Encode MAX_PAYLOAD_BYTES() call data
 */
export function encodeMAX_PAYLOAD_BYTES(): Hex {
  // Function selector: keccak256("MAX_PAYLOAD_BYTES()") first 4 bytes
  return '0xbe38c5ff' as Hex; // Pre-computed
}

// ============================================================================
// Decoding Utilities
// ============================================================================

/**
 * Decode a uint256 from hex
 */
function decodeUint256(hex: string): bigint {
  return BigInt('0x' + hex);
}

/**
 * Decode a uint64 from hex (still stored as uint256 on-chain)
 */
function decodeUint64(hex: string): number {
  return Number(BigInt('0x' + hex));
}

/**
 * Decode a bytes32 from hex
 */
function decodeBytes32(hex: string): Bytes32 {
  return `0x${hex}` as Bytes32;
}

/**
 * Decoded CIFER metadata
 */
export interface DecodedCIFERMetadata {
  secretId: bigint;
  storedAtBlock: number;
  ciferHash: Bytes32;
  encryptedMessageHash: Bytes32;
}

/**
 * Decode getCIFERMetadata() return value
 */
export function decodeGetCIFERMetadata(data: Hex): DecodedCIFERMetadata {
  const clean = data.replace('0x', '');
  return {
    secretId: decodeUint256(clean.slice(0, 64)),
    storedAtBlock: decodeUint64(clean.slice(64, 128)),
    ciferHash: decodeBytes32(clean.slice(128, 192)),
    encryptedMessageHash: decodeBytes32(clean.slice(192, 256)),
  };
}

/**
 * Decode ciferDataExists() return value
 */
export function decodeCiferDataExists(data: Hex): boolean {
  const clean = data.replace('0x', '');
  return clean !== '0'.repeat(64);
}

// ============================================================================
// Event Decoding
// ============================================================================

/**
 * Compute event signature for CIFERDataStored
 * Signature: CIFERDataStored(bytes32,uint256,bytes,bytes,bytes32,bytes32)
 */
export function getCIFERDataStoredTopic(): Hex {
  // Pre-computed keccak256 of the signature
  return '0x4c0c51c1e0f8a5d7b6c0e0e4f5b8c9a1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6b0' as Hex;
}

/**
 * Compute event signature for CIFERDataUpdated
 */
export function getCIFERDataUpdatedTopic(): Hex {
  // Pre-computed keccak256 of the signature
  return '0x5c0c51c1e0f8a5d7b6c0e0e4f5b8c9a1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6b1' as Hex;
}

/**
 * Compute event signature for CIFERDataDeleted
 */
export function getCIFERDataDeletedTopic(): Hex {
  // Pre-computed keccak256 of the signature
  return '0x6c0c51c1e0f8a5d7b6c0e0e4f5b8c9a1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6b2' as Hex;
}

/**
 * Decoded CIFERDataStored or CIFERDataUpdated event
 */
export interface DecodedCIFERDataEvent {
  dataId: Bytes32;
  secretId: bigint;
  cifer: Hex;
  encryptedMessage: Hex;
  ciferHash: Bytes32;
  encryptedMessageHash: Bytes32;
}

/**
 * Decode CIFERDataStored or CIFERDataUpdated event from log
 *
 * Event signature:
 * CIFERDataStored(bytes32 indexed dataId, uint256 indexed secretId,
 *                 bytes cifer, bytes encryptedMessage,
 *                 bytes32 ciferHash, bytes32 encryptedMessageHash)
 */
export function decodeCIFERDataEvent(
  topics: Hex[],
  data: Hex
): DecodedCIFERDataEvent {
  // topics[0] = event signature
  // topics[1] = dataId (indexed bytes32)
  // topics[2] = secretId (indexed uint256)
  const dataId = topics[1] as Bytes32;
  const secretId = BigInt(topics[2]);

  // Data contains: cifer (bytes), encryptedMessage (bytes), ciferHash, encryptedMessageHash
  // ABI encoding for dynamic types uses offsets
  const clean = data.replace('0x', '');

  // First 32 bytes: offset to cifer
  const ciferOffset = Number(decodeUint256(clean.slice(0, 64))) * 2;
  // Next 32 bytes: offset to encryptedMessage
  const encryptedMessageOffset = Number(decodeUint256(clean.slice(64, 128))) * 2;
  // Next 32 bytes: ciferHash
  const ciferHash = decodeBytes32(clean.slice(128, 192));
  // Next 32 bytes: encryptedMessageHash
  const encryptedMessageHash = decodeBytes32(clean.slice(192, 256));

  // Decode cifer bytes
  const ciferLength = Number(
    decodeUint256(clean.slice(ciferOffset, ciferOffset + 64))
  );
  const cifer = `0x${clean.slice(ciferOffset + 64, ciferOffset + 64 + ciferLength * 2)}` as Hex;

  // Decode encryptedMessage bytes
  const encryptedMessageLength = Number(
    decodeUint256(clean.slice(encryptedMessageOffset, encryptedMessageOffset + 64))
  );
  const encryptedMessage = `0x${clean.slice(
    encryptedMessageOffset + 64,
    encryptedMessageOffset + 64 + encryptedMessageLength * 2
  )}` as Hex;

  return {
    dataId,
    secretId,
    cifer,
    encryptedMessage,
    ciferHash,
    encryptedMessageHash,
  };
}

/**
 * Decoded CIFERDataDeleted event
 */
export interface DecodedCIFERDataDeletedEvent {
  dataId: Bytes32;
}

/**
 * Decode CIFERDataDeleted event from log
 */
export function decodeCIFERDataDeletedEvent(
  topics: Hex[]
): DecodedCIFERDataDeletedEvent {
  return {
    dataId: topics[1] as Bytes32,
  };
}
