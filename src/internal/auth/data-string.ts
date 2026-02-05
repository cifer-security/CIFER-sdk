/**
 * @module internal/auth/data-string
 * @description Data string construction for blackbox authentication
 *
 * The blackbox uses underscore-delimited strings as the signing payload.
 * Different endpoints require different data string formats.
 */

import type { ChainId } from '../../types/common.js';

/**
 * Build an underscore-delimited data string from parts
 *
 * This is the core function for constructing blackbox auth payloads.
 * The exact format depends on the endpoint being called.
 *
 * @param parts - Array of string parts to join
 * @returns Underscore-delimited string
 *
 * @example
 * ```typescript
 * // Encrypt payload: chainId_secretId_signer_blockNumber_plainText
 * const data = buildDataString(['752025', '123', '0xabc...', '4200000', 'my secret']);
 * // '752025_123_0xabc..._4200000_my secret'
 * ```
 */
export function buildDataString(parts: string[]): string {
  return parts.join('_');
}

/**
 * Build data string for encrypt-payload endpoint
 *
 * Format: `chainId_secretId_signer_blockNumber_plainText`
 *
 * Note: plainText may contain underscores - the server reconstructs it
 * by joining everything after the 4th underscore.
 *
 * @param params - Parameters for the data string
 * @returns The data string to be signed
 */
export function buildEncryptPayloadDataString(params: {
  chainId: ChainId;
  secretId: bigint | number;
  signer: string;
  blockNumber: number;
  plaintext: string;
}): string {
  return buildDataString([
    params.chainId.toString(),
    params.secretId.toString(),
    params.signer,
    params.blockNumber.toString(),
    params.plaintext,
  ]);
}

/**
 * Build data string for decrypt-payload endpoint
 *
 * Format: `chainId_secretId_signer_blockNumber_encryptedMessage`
 *
 * @param params - Parameters for the data string
 * @returns The data string to be signed
 */
export function buildDecryptPayloadDataString(params: {
  chainId: ChainId;
  secretId: bigint | number;
  signer: string;
  blockNumber: number;
  encryptedMessage: string;
}): string {
  return buildDataString([
    params.chainId.toString(),
    params.secretId.toString(),
    params.signer,
    params.blockNumber.toString(),
    params.encryptedMessage,
  ]);
}

/**
 * Build data string for file operations (encrypt-file, decrypt-file, decrypt-existing-file)
 *
 * Format: `chainId_secretId_signer_blockNumber`
 *
 * @param params - Parameters for the data string
 * @returns The data string to be signed
 */
export function buildFileOperationDataString(params: {
  chainId: ChainId;
  secretId: bigint | number;
  signer: string;
  blockNumber: number;
}): string {
  return buildDataString([
    params.chainId.toString(),
    params.secretId.toString(),
    params.signer,
    params.blockNumber.toString(),
  ]);
}

/**
 * Build data string for job download
 *
 * Format: `chainId_secretId_signer_blockNumber_jobId_download`
 *
 * @param params - Parameters for the data string
 * @returns The data string to be signed
 */
export function buildJobDownloadDataString(params: {
  chainId: ChainId;
  secretId: bigint | number;
  signer: string;
  blockNumber: number;
  jobId: string;
}): string {
  return buildDataString([
    params.chainId.toString(),
    params.secretId.toString(),
    params.signer,
    params.blockNumber.toString(),
    params.jobId,
    'download',
  ]);
}

/**
 * Build data string for job delete
 *
 * Format: `chainId_secretId_signer_blockNumber_jobId_delete`
 *
 * @param params - Parameters for the data string
 * @returns The data string to be signed
 */
export function buildJobDeleteDataString(params: {
  chainId: ChainId;
  secretId: bigint | number;
  signer: string;
  blockNumber: number;
  jobId: string;
}): string {
  return buildDataString([
    params.chainId.toString(),
    params.secretId.toString(),
    params.signer,
    params.blockNumber.toString(),
    params.jobId,
    'delete',
  ]);
}

/**
 * Build data string for jobs list and data consumption
 *
 * Format: `chainId_secretId_signer_blockNumber`
 * (secretId is required in the format but ignored by the server for these endpoints)
 *
 * @param params - Parameters for the data string
 * @returns The data string to be signed
 */
export function buildJobsListDataString(params: {
  chainId: ChainId;
  secretId: bigint | number;
  signer: string;
  blockNumber: number;
}): string {
  return buildDataString([
    params.chainId.toString(),
    params.secretId.toString(),
    params.signer,
    params.blockNumber.toString(),
  ]);
}
