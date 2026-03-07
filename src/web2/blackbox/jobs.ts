/**
 * @module web2/blackbox/jobs
 * @description Web2 wrappers for job management
 *
 * Thin wrappers around the core `blackbox.jobs.*` functions that
 * automatically fill in Web2-specific values (chainId, signer, etc.).
 *
 * Also re-exports `getStatus` and `pollUntilComplete` directly since
 * they don't require session authentication.
 */

import { WEB2_CHAIN_ID } from '../../types/common.js';
import type { ReadClient } from '../../types/adapters.js';
import type { Web2Session } from '../../types/web2.js';
import {
  getStatus,
  download as coreDownload,
  deleteJob as coreDeleteJob,
  list as coreList,
  dataConsumption as coreDataConsumption,
  pollUntilComplete,
  type ListJobsResult,
} from '../../blackbox/jobs.js';
import type { DataConsumption } from '../../types/common.js';

// Re-export functions that don't need session wrapping
export { getStatus, pollUntilComplete };

/**
 * Parameters for Web2 job download (decrypt jobs).
 *
 * @public
 */
export interface Web2DownloadParams {
  /** Active Web2 session (required for decrypt job downloads) */
  session: Web2Session;
  /** Secret ID (required for decrypt job downloads) */
  secretId: bigint | number;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Download a completed job result using a Web2 session.
 *
 * For encrypt jobs, authentication is not required — you can use
 * `blackbox.jobs.download` directly. This wrapper is for decrypt
 * jobs that need session-based auth.
 *
 * @param jobId - The job ID
 * @param params - Download parameters
 * @returns The file as a Blob
 */
export async function download(
  jobId: string,
  params: Web2DownloadParams
): Promise<Blob> {
  await params.session.ensureValid();

  return coreDownload(jobId, {
    blackboxUrl: params.blackboxUrl,
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    signer: params.session.signer,
    readClient: params.readClient,
    fetch: params.fetch,
  });
}

/**
 * Parameters for Web2 job deletion.
 *
 * @public
 */
export interface Web2DeleteJobParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID */
  secretId: bigint | number;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Delete a job using a Web2 session.
 *
 * @param jobId - The job ID to delete
 * @param params - Delete parameters
 */
export async function deleteJob(
  jobId: string,
  params: Web2DeleteJobParams
): Promise<void> {
  await params.session.ensureValid();

  return coreDeleteJob(jobId, {
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    fetch: params.fetch,
  });
}

/**
 * Parameters for Web2 job listing.
 *
 * @public
 */
export interface Web2ListJobsParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Include expired jobs (default: false) */
  includeExpired?: boolean;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * List all jobs for the authenticated Web2 principal.
 *
 * @param params - List parameters
 * @returns Array of job info
 */
export async function list(
  params: Web2ListJobsParams
): Promise<ListJobsResult> {
  await params.session.ensureValid();

  return coreList({
    chainId: WEB2_CHAIN_ID,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    includeExpired: params.includeExpired,
    fetch: params.fetch,
  });
}

/**
 * Parameters for Web2 data consumption query.
 *
 * @public
 */
export interface Web2DataConsumptionParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Get data consumption/usage statistics for the authenticated Web2 principal.
 *
 * @param params - Query parameters
 * @returns Usage statistics
 */
export async function dataConsumption(
  params: Web2DataConsumptionParams
): Promise<DataConsumption> {
  await params.session.ensureValid();

  return coreDataConsumption({
    chainId: WEB2_CHAIN_ID,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    fetch: params.fetch,
  });
}
