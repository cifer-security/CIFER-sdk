/**
 * @module commitments/metadata
 * @description Read operations for CIFER encrypted commitments
 */

import type { Address, Bytes32, ChainId, Hex, CIFERMetadata } from '../types/common.js';
import type { ReadClient } from '../types/adapters.js';
import {
  CIFER_ENVELOPE_BYTES,
  MAX_PAYLOAD_BYTES,
  encodeGetCIFERMetadata,
  encodeCiferDataExists,
  decodeGetCIFERMetadata,
  decodeCiferDataExists,
} from '../internal/abi/cifer-encrypted.js';
import { CommitmentsError, CommitmentNotFoundError } from '../internal/errors/index.js';
import { keccak_256 } from '@noble/hashes/sha3';

/**
 * CIFER envelope size in bytes (1104)
 * ML-KEM-768 ciphertext (1088) + AES-GCM tag (16)
 */
export { CIFER_ENVELOPE_BYTES };

/**
 * Maximum payload size in bytes (16384 = 16KB)
 */
export { MAX_PAYLOAD_BYTES };

/**
 * Parameters for commitment read operations
 */
export interface CommitmentReadParams {
  /** Chain ID */
  chainId: ChainId;
  /** Contract address implementing ICiferEncrypted */
  contractAddress: Address;
  /** Read client for making RPC calls */
  readClient: ReadClient;
}

/**
 * Get CIFER metadata for a data ID
 *
 * Returns the on-chain metadata for an encrypted commitment, including
 * the secret ID, block number, and hashes for integrity verification.
 *
 * @param params - Read parameters
 * @param dataId - The data ID to query
 * @returns CIFER metadata
 * @throws CommitmentNotFoundError if no data exists for the ID
 *
 * @example
 * ```typescript
 * const metadata = await getCIFERMetadata({
 *   chainId: 752025,
 *   contractAddress: '0x...',
 *   readClient,
 * }, dataId);
 *
 * console.log('Secret ID:', metadata.secretId);
 * console.log('Stored at block:', metadata.storedAtBlock);
 * console.log('Cifer hash:', metadata.ciferHash);
 * ```
 */
export async function getCIFERMetadata(
  params: CommitmentReadParams,
  dataId: Bytes32
): Promise<CIFERMetadata> {
  const { chainId, contractAddress, readClient } = params;

  if (!readClient.call) {
    throw new CommitmentsError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeGetCIFERMetadata(dataId);
    const result = await readClient.call(chainId, {
      to: contractAddress,
      data,
    });

    const decoded = decodeGetCIFERMetadata(result);

    // Check if data exists (storedAtBlock is 0 means not found)
    if (decoded.storedAtBlock === 0) {
      throw new CommitmentNotFoundError(dataId);
    }

    return {
      secretId: decoded.secretId,
      storedAtBlock: decoded.storedAtBlock,
      ciferHash: decoded.ciferHash,
      encryptedMessageHash: decoded.encryptedMessageHash,
    };
  } catch (error) {
    if (error instanceof CommitmentNotFoundError) {
      throw error;
    }
    throw new CommitmentsError(
      `Failed to get CIFER metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Check if commitment data exists for a data ID
 *
 * @param params - Read parameters
 * @param dataId - The data ID to check
 * @returns True if data exists
 */
export async function ciferDataExists(
  params: CommitmentReadParams,
  dataId: Bytes32
): Promise<boolean> {
  const { chainId, contractAddress, readClient } = params;

  if (!readClient.call) {
    throw new CommitmentsError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeCiferDataExists(dataId);
    const result = await readClient.call(chainId, {
      to: contractAddress,
      data,
    });

    return decodeCiferDataExists(result);
  } catch (error) {
    throw new CommitmentsError(
      `Failed to check data existence: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Compute a keccak256 hash for integrity verification.
 *
 * Uses `@noble/hashes` (pure JS, no Web Crypto dependency) so it works
 * in Node.js, browsers, and React Native.
 */
export function keccak256(data: Uint8Array): Bytes32 {
  const hashArray = keccak_256(data);
  let hex = '0x';
  for (const byte of hashArray) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex as Bytes32;
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: Hex): Uint8Array {
  const clean = hex.replace('0x', '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): Hex {
  let hex = '0x';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex as Hex;
}
