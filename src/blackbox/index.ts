/**
 * @module blackbox
 * @description Blackbox API namespace for encryption/decryption operations
 *
 * The blackbox provides:
 * - Payload encryption/decryption for short messages
 * - File encryption/decryption for larger files (async via jobs)
 * - Job management for async operations
 *
 * @example
 * ```typescript
 * import { blackbox } from 'cifer-sdk';
 *
 * // Encrypt a payload
 * const encrypted = await blackbox.payload.encryptPayload({
 *   chainId: 752025,
 *   secretId: 123n,
 *   plaintext: 'secret message',
 *   signer,
 *   readClient,
 *   blackboxUrl,
 * });
 *
 * // Decrypt a payload
 * const decrypted = await blackbox.payload.decryptPayload({
 *   chainId: 752025,
 *   secretId: 123n,
 *   encryptedMessage: encrypted.encryptedMessage,
 *   cifer: encrypted.cifer,
 *   signer,
 *   readClient,
 *   blackboxUrl,
 * });
 *
 * // File operations
 * const job = await blackbox.files.encryptFile({ ... });
 * const status = await blackbox.jobs.pollUntilComplete(job.jobId, blackboxUrl);
 * const blob = await blackbox.jobs.download(job.jobId, { blackboxUrl });
 * ```
 */

// Payload operations
export * as payload from './payload.js';

// File operations
export * as files from './files.js';

// Job operations
export * as jobs from './jobs.js';

// Re-export commonly used types
export type {
  EncryptPayloadParams,
  EncryptPayloadResult,
  DecryptPayloadParams,
  DecryptPayloadResult,
} from './payload.js';

export type {
  FileOperationParams,
  FileJobResult,
  DecryptExistingFileParams,
} from './files.js';

export type {
  DownloadParams,
  DeleteParams,
  ListJobsParams,
  ListJobsResult,
  DataConsumptionParams,
} from './jobs.js';
