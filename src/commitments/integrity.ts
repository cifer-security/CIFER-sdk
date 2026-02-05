/**
 * @module commitments/integrity
 * @description Integrity verification for encrypted commitments
 */

import type { Hex, CommitmentData, CIFERMetadata } from '../types/common.js';
import { 
  CIFER_ENVELOPE_BYTES,
  MAX_PAYLOAD_BYTES,
} from '../internal/abi/cifer-encrypted.js';
import {
  CommitmentsError,
  IntegrityError,
  InvalidCiferSizeError,
  PayloadTooLargeError,
} from '../internal/errors/index.js';
import { hexToBytes } from './metadata.js';

/**
 * Result of integrity verification
 */
export interface IntegrityResult {
  /** Whether all checks passed */
  valid: boolean;
  /** Detailed results per check */
  checks: {
    /** Cifer size check */
    ciferSize: { valid: boolean; actual: number; expected: number };
    /** Encrypted message size check */
    payloadSize: { valid: boolean; actual: number; max: number };
    /** Cifer hash matches (if metadata provided) */
    ciferHash?: { valid: boolean; expected?: string; actual?: string };
    /** Encrypted message hash matches (if metadata provided) */
    encryptedMessageHash?: { valid: boolean; expected?: string; actual?: string };
  };
}

/**
 * Verify the integrity of commitment data
 *
 * This performs several checks:
 * 1. Cifer size is exactly 1104 bytes
 * 2. Encrypted message size is within limits (≤ 16KB, > 0)
 * 3. If metadata is provided, hashes match
 *
 * @param data - The commitment data to verify
 * @param metadata - Optional metadata for hash verification
 * @returns Integrity check result
 *
 * @example
 * ```typescript
 * // Verify data retrieved from logs
 * const commitment = await fetchCommitmentFromLogs({ ... });
 * const metadata = await getCIFERMetadata({ ... }, dataId);
 *
 * const result = verifyCommitmentIntegrity(commitment, metadata);
 *
 * if (!result.valid) {
 *   console.error('Integrity check failed:', result.checks);
 * }
 * ```
 */
export function verifyCommitmentIntegrity(
  data: CommitmentData,
  metadata?: CIFERMetadata
): IntegrityResult {
  const ciferBytes = hexToBytes(data.cifer);
  const encryptedMessageBytes = hexToBytes(data.encryptedMessage);

  const result: IntegrityResult = {
    valid: true,
    checks: {
      ciferSize: {
        valid: ciferBytes.length === CIFER_ENVELOPE_BYTES,
        actual: ciferBytes.length,
        expected: CIFER_ENVELOPE_BYTES,
      },
      payloadSize: {
        valid: encryptedMessageBytes.length > 0 && encryptedMessageBytes.length <= MAX_PAYLOAD_BYTES,
        actual: encryptedMessageBytes.length,
        max: MAX_PAYLOAD_BYTES,
      },
    },
  };

  // Update overall validity
  if (!result.checks.ciferSize.valid || !result.checks.payloadSize.valid) {
    result.valid = false;
  }

  // Check hashes if metadata provided
  if (metadata) {
    // Compare hashes from the event data with metadata
    result.checks.ciferHash = {
      valid: data.ciferHash.toLowerCase() === metadata.ciferHash.toLowerCase(),
      expected: metadata.ciferHash,
      actual: data.ciferHash,
    };

    result.checks.encryptedMessageHash = {
      valid: data.encryptedMessageHash.toLowerCase() === metadata.encryptedMessageHash.toLowerCase(),
      expected: metadata.encryptedMessageHash,
      actual: data.encryptedMessageHash,
    };

    if (!result.checks.ciferHash.valid || !result.checks.encryptedMessageHash.valid) {
      result.valid = false;
    }
  }

  return result;
}

/**
 * Verify commitment integrity and throw on failure
 *
 * @param data - The commitment data to verify
 * @param metadata - Optional metadata for hash verification
 * @throws InvalidCiferSizeError if cifer size is wrong
 * @throws PayloadTooLargeError if payload is too large
 * @throws IntegrityError if hash verification fails
 */
export function assertCommitmentIntegrity(
  data: CommitmentData,
  metadata?: CIFERMetadata
): void {
  const result = verifyCommitmentIntegrity(data, metadata);

  if (!result.checks.ciferSize.valid) {
    throw new InvalidCiferSizeError(
      result.checks.ciferSize.actual,
      result.checks.ciferSize.expected
    );
  }

  if (!result.checks.payloadSize.valid) {
    if (result.checks.payloadSize.actual === 0) {
      throw new CommitmentsError('Encrypted message is empty');
    }
    throw new PayloadTooLargeError(
      result.checks.payloadSize.actual,
      result.checks.payloadSize.max
    );
  }

  if (result.checks.ciferHash && !result.checks.ciferHash.valid) {
    throw new IntegrityError(
      'cifer',
      result.checks.ciferHash.expected!,
      result.checks.ciferHash.actual!
    );
  }

  if (result.checks.encryptedMessageHash && !result.checks.encryptedMessageHash.valid) {
    throw new IntegrityError(
      'encryptedMessage',
      result.checks.encryptedMessageHash.expected!,
      result.checks.encryptedMessageHash.actual!
    );
  }
}

/**
 * Validate cifer and encrypted message sizes before storing
 *
 * Call this before submitting a store transaction to catch
 * size errors early.
 *
 * @param cifer - The cifer bytes (hex or Uint8Array)
 * @param encryptedMessage - The encrypted message bytes (hex or Uint8Array)
 * @throws InvalidCiferSizeError if cifer size is wrong
 * @throws PayloadTooLargeError if payload is too large
 * @throws CommitmentsError if payload is empty
 */
export function validateForStorage(
  cifer: Hex | Uint8Array,
  encryptedMessage: Hex | Uint8Array
): void {
  const ciferBytes = typeof cifer === 'string' ? hexToBytes(cifer as Hex) : cifer;
  const msgBytes = typeof encryptedMessage === 'string' ? hexToBytes(encryptedMessage as Hex) : encryptedMessage;

  if (ciferBytes.length !== CIFER_ENVELOPE_BYTES) {
    throw new InvalidCiferSizeError(ciferBytes.length, CIFER_ENVELOPE_BYTES);
  }

  if (msgBytes.length === 0) {
    throw new CommitmentsError('Encrypted message cannot be empty');
  }

  if (msgBytes.length > MAX_PAYLOAD_BYTES) {
    throw new PayloadTooLargeError(msgBytes.length, MAX_PAYLOAD_BYTES);
  }
}
