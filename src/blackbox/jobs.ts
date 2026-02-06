/**
 * @module blackbox/jobs
 * @description Job management for asynchronous file operations
 */

import type { ChainId, JobInfo, JobStatus, DataConsumption } from '../types/common.js';
import type { SignerAdapter, ReadClient } from '../types/adapters.js';
import {
  buildJobDownloadDataString,
  buildJobDeleteDataString,
  buildJobsListDataString,
} from '../internal/auth/data-string.js';
import { withBlockFreshRetry } from '../internal/auth/block-freshness.js';
import { signDataString } from '../internal/auth/signer.js';
import {
  JobError,
  parseBlackboxErrorResponse,
} from '../internal/errors/index.js';

/**
 * Get the status of a job
 *
 * This endpoint does not require authentication.
 *
 * @param jobId - The job ID to check
 * @param blackboxUrl - Blackbox URL
 * @param options - Optional configuration
 * @returns Job status information
 *
 * @example
 * ```typescript
 * const status = await getStatus('job-id', 'https://cifer-blackbox.ternoa.dev:3010');
 *
 * if (status.status === 'completed') {
 *   console.log('Job complete! Progress:', status.progress);
 * } else if (status.status === 'failed') {
 *   console.error('Job failed:', status.error);
 * }
 * ```
 */
export async function getStatus(
  jobId: string,
  blackboxUrl: string,
  options?: { fetch?: typeof fetch }
): Promise<JobInfo> {
  const fetchFn = options?.fetch ?? fetch;

  const url = `${blackboxUrl.replace(/\/$/, '')}/jobs/${encodeURIComponent(jobId)}/status`;
  const response = await fetchFn(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new JobError(`Job not found: ${jobId}`, jobId);
    }
    const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw parseBlackboxErrorResponse(
      errorBody as { error?: string; message?: string },
      response.status,
      `/jobs/${jobId}/status`
    );
  }

  const result = (await response.json()) as {
    success: boolean;
    job: {
      id: string;
      type: 'encrypt' | 'decrypt';
      status: JobStatus;
      progress: number;
      secretId: number;
      chainId: number;
      createdAt: number;
      completedAt?: number;
      expiredAt?: number;
      error?: string;
      resultFileName?: string;
      ttl: number;
      originalSize?: number;
    };
  };

  return {
    id: result.job.id,
    type: result.job.type,
    status: result.job.status,
    progress: result.job.progress,
    secretId: result.job.secretId,
    chainId: result.job.chainId,
    createdAt: result.job.createdAt,
    completedAt: result.job.completedAt,
    expiredAt: result.job.expiredAt,
    error: result.job.error,
    resultFileName: result.job.resultFileName,
    ttl: result.job.ttl,
    originalSize: result.job.originalSize,
  };
}

/**
 * Parameters for job download
 */
export interface DownloadParams {
  /** Blackbox URL */
  blackboxUrl: string;
  /** Chain ID (required for decrypt jobs) */
  chainId?: ChainId;
  /** Secret ID (required for decrypt jobs) */
  secretId?: bigint | number;
  /** Signer (required for decrypt jobs) */
  signer?: SignerAdapter;
  /** Read client (required for decrypt jobs) */
  readClient?: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Download the result of a completed job
 *
 * For encrypt jobs, no authentication is required.
 * For decrypt jobs, the signer must be the owner or delegate.
 *
 * @param jobId - The job ID to download
 * @param params - Download parameters
 * @returns The file as a Blob
 *
 * @example
 * ```typescript
 * // Encrypt job (no auth)
 * const encryptedBlob = await download(encryptJobId, {
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 *
 * // Decrypt job (auth required)
 * const decryptedBlob = await download(decryptJobId, {
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   chainId: 752025,
 *   secretId: 123n,
 *   signer,
 *   readClient,
 * });
 * ```
 */
export async function download(
  jobId: string,
  params: DownloadParams
): Promise<Blob> {
  const { blackboxUrl, chainId, secretId, signer, readClient } = params;
  const fetchFn = params.fetch ?? fetch;

  const url = `${blackboxUrl.replace(/\/$/, '')}/jobs/${encodeURIComponent(jobId)}/download`;

  // Check if this is a decrypt job (needs auth)
  const needsAuth = signer && readClient && chainId !== undefined && secretId !== undefined;

  if (needsAuth) {
    const secretIdBigInt = BigInt(secretId!);

    return withBlockFreshRetry(
      async (getFreshBlock) => {
        const blockNumber = await getFreshBlock();
        const signerAddress = await signer!.getAddress();

        const dataString = buildJobDownloadDataString({
          chainId: chainId!,
          secretId: secretIdBigInt,
          signer: signerAddress,
          blockNumber,
          jobId,
        });

        const signed = await signDataString(dataString, signer!);

        const response = await fetchFn(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: signed.data,
            signature: signed.signature,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
          throw parseBlackboxErrorResponse(
            errorBody as { error?: string; message?: string },
            response.status,
            `/jobs/${jobId}/download`
          );
        }

        return response.blob();
      },
      readClient!,
      chainId!,
      { maxRetries: 3 }
    );
  } else {
    // No auth needed (encrypt job)
    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new JobError(
          'Authentication required for decrypt job download. Provide chainId, secretId, signer, and readClient.',
          jobId
        );
      }
      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      throw parseBlackboxErrorResponse(
        errorBody as { error?: string; message?: string },
        response.status,
        `/jobs/${jobId}/download`
      );
    }

    return response.blob();
  }
}

/**
 * Parameters for job deletion
 */
export interface DeleteParams {
  /** Chain ID */
  chainId: ChainId;
  /** Secret ID */
  secretId: bigint | number;
  /** Signer (must be owner or delegate) */
  signer: SignerAdapter;
  /** Read client */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Delete a job (mark for cleanup)
 *
 * @param jobId - The job ID to delete
 * @param params - Delete parameters
 *
 * @example
 * ```typescript
 * await deleteJob('job-id', {
 *   chainId: 752025,
 *   secretId: 123n,
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 * ```
 */
export async function deleteJob(
  jobId: string,
  params: DeleteParams
): Promise<void> {
  const { chainId, secretId, signer, readClient, blackboxUrl } = params;
  const fetchFn = params.fetch ?? fetch;

  const secretIdBigInt = BigInt(secretId);

  await withBlockFreshRetry(
    async (getFreshBlock) => {
      const blockNumber = await getFreshBlock();
      const signerAddress = await signer.getAddress();

      const dataString = buildJobDeleteDataString({
        chainId,
        secretId: secretIdBigInt,
        signer: signerAddress,
        blockNumber,
        jobId,
      });

      const signed = await signDataString(dataString, signer);

      const url = `${blackboxUrl.replace(/\/$/, '')}/jobs/${encodeURIComponent(jobId)}/delete`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: signed.data,
          signature: signed.signature,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          `/jobs/${jobId}/delete`
        );
      }
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}

/**
 * Parameters for listing jobs
 */
export interface ListJobsParams {
  /** Chain ID */
  chainId: ChainId;
  /** Signer */
  signer: SignerAdapter;
  /** Read client */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Include expired jobs (default: false) */
  includeExpired?: boolean;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of listing jobs
 */
export interface ListJobsResult {
  /** Array of jobs */
  jobs: JobInfo[];
  /** Total count */
  count: number;
  /** Whether expired jobs were included */
  includeExpired: boolean;
}

/**
 * List all jobs for the authenticated wallet
 *
 * @param params - List parameters
 * @returns Array of job info
 *
 * @example
 * ```typescript
 * const result = await list({
 *   chainId: 752025,
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   includeExpired: false,
 * });
 *
 * for (const job of result.jobs) {
 *   console.log(`${job.id}: ${job.status}`);
 * }
 * ```
 */
export async function list(params: ListJobsParams): Promise<ListJobsResult> {
  const {
    chainId,
    signer,
    readClient,
    blackboxUrl,
    includeExpired = false,
  } = params;
  const fetchFn = params.fetch ?? fetch;

  // secretId is ignored by the server but required in the data string format
  const dummySecretId = 0n;

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      const blockNumber = await getFreshBlock();
      const signerAddress = await signer.getAddress();

      const dataString = buildJobsListDataString({
        chainId,
        secretId: dummySecretId,
        signer: signerAddress,
        blockNumber,
      });

      const signed = await signDataString(dataString, signer);

      const url = `${blackboxUrl.replace(/\/$/, '')}/jobs?includeExpired=${includeExpired}`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: signed.data,
          signature: signed.signature,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/jobs'
        );
      }

      const result = (await response.json()) as {
        success: boolean;
        jobs: Array<{
          id: string;
          type: 'encrypt' | 'decrypt';
          status: JobStatus;
          progress: number;
          secretId: number;
          chainId: number;
          createdAt: number;
          completedAt?: number;
          expiredAt?: number;
          error?: string;
          resultFileName?: string;
          ttl: number;
          originalSize?: number;
        }>;
        count: number;
        includeExpired: boolean;
      };

      return {
        jobs: result.jobs.map((job) => ({
          id: job.id,
          type: job.type,
          status: job.status,
          progress: job.progress,
          secretId: job.secretId,
          chainId: job.chainId,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          expiredAt: job.expiredAt,
          error: job.error,
          resultFileName: job.resultFileName,
          ttl: job.ttl,
          originalSize: job.originalSize,
        })),
        count: result.count,
        includeExpired: result.includeExpired,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}

/**
 * Parameters for data consumption query
 */
export interface DataConsumptionParams {
  /** Chain ID */
  chainId: ChainId;
  /** Signer */
  signer: SignerAdapter;
  /** Read client */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Get data consumption/usage statistics for the authenticated wallet
 *
 * @param params - Query parameters
 * @returns Usage statistics
 *
 * @example
 * ```typescript
 * const usage = await dataConsumption({
 *   chainId: 752025,
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 *
 * console.log('Encryption used:', usage.encryption.usedGB, 'GB');
 * console.log('Encryption remaining:', usage.encryption.remainingGB, 'GB');
 * ```
 */
export async function dataConsumption(
  params: DataConsumptionParams
): Promise<DataConsumption> {
  const { chainId, signer, readClient, blackboxUrl } = params;
  const fetchFn = params.fetch ?? fetch;

  // secretId is ignored by the server but required in the data string format
  const dummySecretId = 0n;

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      const blockNumber = await getFreshBlock();
      const signerAddress = await signer.getAddress();

      const dataString = buildJobsListDataString({
        chainId,
        secretId: dummySecretId,
        signer: signerAddress,
        blockNumber,
      });

      const signed = await signDataString(dataString, signer);

      const url = `${blackboxUrl.replace(/\/$/, '')}/jobs/dataConsumption`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: signed.data,
          signature: signed.signature,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/jobs/dataConsumption'
        );
      }

      const result = (await response.json()) as {
        success: boolean;
        wallet: string;
        encryption: {
          limit: number;
          used: number;
          remaining: number;
          count: number;
          limitGB: number;
          usedGB: number;
          remainingGB: number;
        };
        decryption: {
          limit: number;
          used: number;
          remaining: number;
          count: number;
          limitGB: number;
          usedGB: number;
          remainingGB: number;
        };
      };

      return {
        wallet: result.wallet as `0x${string}`,
        encryption: result.encryption,
        decryption: result.decryption,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}

/**
 * Poll for job completion
 *
 * This is a convenience helper that polls getStatus until the job
 * reaches a terminal state (completed, failed, or expired).
 *
 * @param jobId - The job ID to poll
 * @param blackboxUrl - Blackbox URL
 * @param options - Polling options
 * @returns Final job status
 *
 * @example
 * ```typescript
 * const finalStatus = await pollUntilComplete('job-id', blackboxUrl, {
 *   intervalMs: 2000,
 *   maxAttempts: 60,
 *   onProgress: (job) => console.log(`Progress: ${job.progress}%`),
 * });
 *
 * if (finalStatus.status === 'completed') {
 *   console.log('Job completed successfully!');
 * }
 * ```
 */
export async function pollUntilComplete(
  jobId: string,
  blackboxUrl: string,
  options?: {
    /** Polling interval in milliseconds (default: 2000) */
    intervalMs?: number;
    /** Maximum polling attempts (default: 60) */
    maxAttempts?: number;
    /** Progress callback */
    onProgress?: (job: JobInfo) => void;
    /** Abort signal */
    abortSignal?: AbortSignal;
    /** Custom fetch implementation */
    fetch?: typeof fetch;
  }
): Promise<JobInfo> {
  const intervalMs = options?.intervalMs ?? 2000;
  const maxAttempts = options?.maxAttempts ?? 60;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (options?.abortSignal?.aborted) {
      throw new JobError('Job polling aborted', jobId);
    }

    const status = await getStatus(jobId, blackboxUrl, { fetch: options?.fetch });

    options?.onProgress?.(status);

    if (
      status.status === 'completed' ||
      status.status === 'failed' ||
      status.status === 'expired'
    ) {
      return status;
    }

    await sleep(intervalMs);
  }

  throw new JobError(
    `Job polling timed out after ${maxAttempts * intervalMs / 1000} seconds`,
    jobId
  );
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
