/**
 * @module commitments
 * @description Encrypted commitments namespace for on-chain data operations
 *
 * This module provides functions for:
 * - Reading commitment metadata from contracts implementing ICiferEncrypted
 * - Fetching encrypted data from event logs
 * - Verifying data integrity
 * - Building store transactions (requires app-specific ABI)
 *
 * The SDK is contract-implementation agnostic - it works with any contract
 * that implements the ICiferEncrypted interface.
 *
 * @example
 * ```typescript
 * import { commitments } from 'cifer-sdk';
 *
 * // Check if data exists
 * const exists = await commitments.ciferDataExists({
 *   chainId: 752025,
 *   contractAddress: '0x...',
 *   readClient,
 * }, dataId);
 *
 * // Get metadata
 * const metadata = await commitments.getCIFERMetadata({ ... }, dataId);
 *
 * // Fetch encrypted data from logs
 * const data = await commitments.fetchCommitmentFromLogs({
 *   chainId,
 *   contractAddress,
 *   dataId,
 *   storedAtBlock: metadata.storedAtBlock,
 *   readClient,
 * });
 *
 * // Verify integrity
 * commitments.assertCommitmentIntegrity(data, metadata);
 * ```
 */

// Metadata reads
export {
  getCIFERMetadata,
  ciferDataExists,
  CIFER_ENVELOPE_BYTES,
  MAX_PAYLOAD_BYTES,
  hexToBytes,
  bytesToHex,
  type CommitmentReadParams,
} from './metadata.js';

// Log retrieval
export {
  fetchCommitmentFromLogs,
  fetchCommitmentWithRetry,
  parseCommitmentLog,
  isCIFERDataEvent,
  type FetchCommitmentParams,
} from './logs.js';

// Integrity verification
export {
  verifyCommitmentIntegrity,
  assertCommitmentIntegrity,
  validateForStorage,
  type IntegrityResult,
} from './integrity.js';

// Transaction builders
export {
  buildStoreCommitmentTx,
  COMMON_STORE_FUNCTIONS,
  type BuildStoreCommitmentParams,
  type AbiFunction,
} from './tx-builders.js';
