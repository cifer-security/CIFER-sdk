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
  CIFER_ENVELOPE_BYTES: '0xe759b48d' as Hex,
  MAX_PAYLOAD_BYTES: '0xd31ecaa7' as Hex,
  getCIFERMetadata: '0x183b7021' as Hex,
  ciferDataExists: '0x200880f6' as Hex,
} as const;

/**
 * Event topic signatures
 */
export const CIFER_ENCRYPTED_TOPICS = {
  CIFERDataStored:
    '0x54d564244beef53abea650e9891767ae254ba12a95350cfbd6c81ac838efc3ea' as Hex,
  CIFERDataUpdated:
    '0xc902a8ea9d9da6a4ba78de0905bd343e185133e2ea49cab8fe55517c480c533e' as Hex,
  CIFERDataDeleted:
    '0xbb6d02273787e993a43d0045289f43b7f1c1ed69ae4a74a3099bc963e210f8e8' as Hex,
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
  const selector = '183b7021'; // Pre-computed
  const dataIdEncoded = encodeBytes32(dataId);
  return `0x${selector}${dataIdEncoded}` as Hex;
}

/**
 * Encode ciferDataExists(bytes32 dataId) call data
 */
export function encodeCiferDataExists(dataId: Bytes32): Hex {
  // Function selector: keccak256("ciferDataExists(bytes32)") first 4 bytes
  const selector = '200880f6'; // Pre-computed
  const dataIdEncoded = encodeBytes32(dataId);
  return `0x${selector}${dataIdEncoded}` as Hex;
}

/**
 * Encode CIFER_ENVELOPE_BYTES() call data
 */
export function encodeCIFER_ENVELOPE_BYTES(): Hex {
  // Function selector: keccak256("CIFER_ENVELOPE_BYTES()") first 4 bytes
  return '0xe759b48d' as Hex; // Pre-computed
}

/**
 * Encode MAX_PAYLOAD_BYTES() call data
 */
export function encodeMAX_PAYLOAD_BYTES(): Hex {
  // Function selector: keccak256("MAX_PAYLOAD_BYTES()") first 4 bytes
  return '0xd31ecaa7' as Hex; // Pre-computed
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
  return '0x54d564244beef53abea650e9891767ae254ba12a95350cfbd6c81ac838efc3ea' as Hex;
}

/**
 * Compute event signature for CIFERDataUpdated
 */
export function getCIFERDataUpdatedTopic(): Hex {
  // Pre-computed keccak256 of the signature
  return '0xc902a8ea9d9da6a4ba78de0905bd343e185133e2ea49cab8fe55517c480c533e' as Hex;
}

/**
 * Compute event signature for CIFERDataDeleted
 */
export function getCIFERDataDeletedTopic(): Hex {
  // Pre-computed keccak256 of the signature
  return '0xbb6d02273787e993a43d0045289f43b7f1c1ed69ae4a74a3099bc963e210f8e8' as Hex;
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
