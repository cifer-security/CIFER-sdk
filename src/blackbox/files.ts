/**
 * @module blackbox/files
 * @description File encryption and decryption via the blackbox API
 *
 * File operations are asynchronous - they return a job ID that can be
 * polled for status and downloaded when complete.
 */

import type { ChainId } from '../types/common.js';
import type { SignerAdapter, ReadClient } from '../types/adapters.js';
import { buildFileOperationDataString } from '../internal/auth/data-string.js';
import { withBlockFreshRetry } from '../internal/auth/block-freshness.js';
import { signDataString } from '../internal/auth/signer.js';
import {
  BlackboxError,
  EncryptionError,
  DecryptionError,
  parseBlackboxErrorResponse,
} from '../internal/errors/index.js';

/**
 * Result of starting a file encryption/decryption job
 */
export interface FileJobResult {
  /** The job ID for polling and download */
  jobId: string;
  /** Success message */
  message: string;
}

/**
 * Parameters for file operations
 */
export interface FileOperationParams {
  /** Chain ID where the secret exists */
  chainId: ChainId;
  /** Secret ID to use */
  secretId: bigint | number;
  /** The file to process */
  file: File | Blob;
  /** Signer for authentication */
  signer: SignerAdapter;
  /** Read client for fetching block numbers */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Encrypt a file using the blackbox API
 *
 * This is an asynchronous operation. The function returns a job ID
 * that can be used to poll for status and download the encrypted file
 * when complete.
 *
 * The encrypted file is a .cifer ZIP containing encrypted chunks and metadata.
 *
 * @param params - File encryption parameters
 * @returns Job ID for polling and download
 *
 * @example
 * ```typescript
 * // Start encryption job
 * const job = await encryptFile({
 *   chainId: 752025,
 *   secretId: 123n,
 *   file: myFile,
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://blackbox.cifer.network',
 * });
 *
 * console.log('Job ID:', job.jobId);
 *
 * // Poll for completion
 * let status = await getStatus(job.jobId, blackboxUrl);
 * while (status.status !== 'completed') {
 *   await sleep(2000);
 *   status = await getStatus(job.jobId, blackboxUrl);
 * }
 *
 * // Download encrypted file (no auth required for encrypt jobs)
 * const encryptedBlob = await download(job.jobId, { blackboxUrl });
 * ```
 */
export async function encryptFile(
  params: FileOperationParams
): Promise<FileJobResult> {
  const {
    chainId,
    secretId,
    file,
    signer,
    readClient,
    blackboxUrl,
  } = params;
  const fetchFn = params.fetch ?? fetch;

  const secretIdBigInt = BigInt(secretId);

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      // Get fresh block number
      const blockNumber = await getFreshBlock();

      // Get signer address
      const signerAddress = await signer.getAddress();

      // Build the data string
      const dataString = buildFileOperationDataString({
        chainId,
        secretId: secretIdBigInt,
        signer: signerAddress,
        blockNumber,
      });

      // Sign the data string
      const signed = await signDataString(dataString, signer);

      // Build form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('secretId', secretIdBigInt.toString());
      formData.append('data', signed.data);
      formData.append('signature', signed.signature);

      // Make the API call
      const url = `${blackboxUrl.replace(/\/$/, '')}/encrypt-file`;
      const response = await fetchFn(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/encrypt-file'
        );
      }

      const result = (await response.json()) as {
        success: boolean;
        jobId: string;
        message: string;
      };

      if (!result.success) {
        throw new EncryptionError('File encryption failed: server returned success=false');
      }

      return {
        jobId: result.jobId,
        message: result.message,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}

/**
 * Decrypt a file using the blackbox API
 *
 * This accepts a .cifer file (encrypted ZIP) and starts a decryption job.
 * The signer must be the secret owner or delegate.
 *
 * @param params - File decryption parameters
 * @returns Job ID for polling and download
 *
 * @example
 * ```typescript
 * // Upload encrypted file for decryption
 * const job = await decryptFile({
 *   chainId: 752025,
 *   secretId: 123n,
 *   file: encryptedCiferFile,
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://blackbox.cifer.network',
 * });
 *
 * // Poll and download (auth required for decrypt jobs)
 * // ...
 * ```
 */
export async function decryptFile(
  params: FileOperationParams
): Promise<FileJobResult> {
  const {
    chainId,
    secretId,
    file,
    signer,
    readClient,
    blackboxUrl,
  } = params;
  const fetchFn = params.fetch ?? fetch;

  const secretIdBigInt = BigInt(secretId);

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      // Get fresh block number
      const blockNumber = await getFreshBlock();

      // Get signer address
      const signerAddress = await signer.getAddress();

      // Build the data string
      const dataString = buildFileOperationDataString({
        chainId,
        secretId: secretIdBigInt,
        signer: signerAddress,
        blockNumber,
      });

      // Sign the data string
      const signed = await signDataString(dataString, signer);

      // Build form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', signed.data);
      formData.append('signature', signed.signature);

      // Make the API call
      const url = `${blackboxUrl.replace(/\/$/, '')}/decrypt-file`;
      const response = await fetchFn(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/decrypt-file'
        );
      }

      const result = (await response.json()) as {
        success: boolean;
        jobId: string;
        message: string;
      };

      if (!result.success) {
        throw new DecryptionError('File decryption failed: server returned success=false');
      }

      return {
        jobId: result.jobId,
        message: result.message,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}

/**
 * Parameters for decrypting an existing encrypted file
 */
export interface DecryptExistingFileParams {
  /** Chain ID where the secret exists */
  chainId: ChainId;
  /** Secret ID used for the original encryption */
  secretId: bigint | number;
  /** Job ID of the completed encrypt job */
  encryptJobId: string;
  /** Signer for authentication (must be owner or delegate) */
  signer: SignerAdapter;
  /** Read client for fetching block numbers */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Decrypt an existing encrypted file without re-uploading
 *
 * This creates a new decrypt job from a previously completed encrypt job.
 * The encrypted file is already stored on the blackbox server.
 *
 * @param params - Decryption parameters
 * @returns Job ID for polling and download
 *
 * @example
 * ```typescript
 * // Decrypt from an existing encrypt job
 * const job = await decryptExistingFile({
 *   chainId: 752025,
 *   secretId: 123n,
 *   encryptJobId: 'previous-encrypt-job-id',
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://blackbox.cifer.network',
 * });
 * ```
 */
export async function decryptExistingFile(
  params: DecryptExistingFileParams
): Promise<FileJobResult> {
  const {
    chainId,
    secretId,
    encryptJobId,
    signer,
    readClient,
    blackboxUrl,
  } = params;
  const fetchFn = params.fetch ?? fetch;

  const secretIdBigInt = BigInt(secretId);

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      // Get fresh block number
      const blockNumber = await getFreshBlock();

      // Get signer address
      const signerAddress = await signer.getAddress();

      // Build the data string
      const dataString = buildFileOperationDataString({
        chainId,
        secretId: secretIdBigInt,
        signer: signerAddress,
        blockNumber,
      });

      // Sign the data string
      const signed = await signDataString(dataString, signer);

      // Make the API call
      const url = `${blackboxUrl.replace(/\/$/, '')}/decrypt-existing-file`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptJobId,
          data: signed.data,
          signature: signed.signature,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/decrypt-existing-file'
        );
      }

      const result = (await response.json()) as {
        success: boolean;
        jobId: string;
        message: string;
      };

      if (!result.success) {
        throw new DecryptionError(
          'Decrypt existing file failed: server returned success=false'
        );
      }

      return {
        jobId: result.jobId,
        message: result.message,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}
