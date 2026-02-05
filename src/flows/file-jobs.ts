/**
 * @module flows/file-jobs
 * @description Flows for file encryption/decryption job management
 */

import type { JobInfo } from '../types/common.js';
import type {
  FlowContext,
  FlowOptions,
  FlowResult,
  FlowPlan,
  FlowStep,
} from './types.js';
import {
  DEFAULT_POLLING_STRATEGY,
  sleepWithAbort,
  createStepUpdater,
} from './types.js';
import { encryptFile, decryptFile, decryptExistingFile } from '../blackbox/files.js';
import { getStatus, download, pollUntilComplete } from '../blackbox/jobs.js';
import { FlowError, FlowAbortedError, FlowTimeoutError } from '../internal/errors/index.js';

/**
 * Parameters for file encryption flow
 */
export interface EncryptFileFlowParams {
  /** Secret ID to use for encryption */
  secretId: bigint;
  /** The file to encrypt */
  file: File | Blob;
}

/**
 * Result of file encryption flow
 */
export interface EncryptFileFlowResult {
  /** The job ID */
  jobId: string;
  /** Final job status */
  job: JobInfo;
  /** The encrypted file blob */
  encryptedFile: Blob;
}

/**
 * Encrypt a file and download the result
 *
 * This flow:
 * 1. Uploads the file for encryption
 * 2. Polls until the job completes
 * 3. Downloads the encrypted result
 *
 * @param ctx - Flow context
 * @param params - Encryption parameters
 * @param options - Flow options
 * @returns Flow result with encrypted file
 */
export async function encryptFileJobFlow(
  ctx: FlowContext,
  params: EncryptFileFlowParams,
  options?: FlowOptions
): Promise<FlowResult<EncryptFileFlowResult>> {
  const mode = options?.mode ?? 'execute';
  const pollingStrategy = ctx.pollingStrategy ?? DEFAULT_POLLING_STRATEGY;

  const steps: FlowStep[] = [
    {
      id: 'upload',
      description: 'Upload file for encryption',
      type: 'api_call',
      status: 'pending',
    },
    {
      id: 'poll',
      description: 'Wait for encryption to complete',
      type: 'poll',
      status: 'pending',
    },
    {
      id: 'download',
      description: 'Download encrypted file',
      type: 'api_call',
      status: 'pending',
    },
  ];

  const plan: FlowPlan = {
    name: 'encryptFileJobFlow',
    description: 'Encrypt a file and download the encrypted result',
    steps,
  };

  if (mode === 'plan') {
    return { success: true, plan };
  }

  const updateStep = createStepUpdater(steps, options?.onStepProgress);
  const log = ctx.logger ?? (() => {});

  try {
    // Step 1: Upload
    updateStep('upload', { status: 'in_progress' });
    log('Uploading file for encryption...');

    const jobResult = await encryptFile({
      chainId: ctx.chainId,
      secretId: params.secretId,
      file: params.file,
      signer: ctx.signer,
      readClient: ctx.readClient,
      blackboxUrl: ctx.blackboxUrl,
      fetch: ctx.fetch,
    });

    updateStep('upload', { status: 'completed', result: jobResult });
    log(`Job started: ${jobResult.jobId}`);

    // Step 2: Poll
    updateStep('poll', { status: 'in_progress' });
    log('Waiting for encryption to complete...');

    const finalJob = await pollUntilComplete(jobResult.jobId, ctx.blackboxUrl, {
      intervalMs: pollingStrategy.intervalMs,
      maxAttempts: pollingStrategy.maxAttempts,
      abortSignal: ctx.abortSignal,
      fetch: ctx.fetch,
      onProgress: (job) => log(`Progress: ${job.progress}%`),
    });

    if (finalJob.status === 'failed') {
      throw new FlowError(
        `Encryption job failed: ${finalJob.error}`,
        'encryptFileJobFlow',
        'poll'
      );
    }

    updateStep('poll', { status: 'completed', result: finalJob });
    log('Encryption complete');

    // Step 3: Download
    updateStep('download', { status: 'in_progress' });
    log('Downloading encrypted file...');

    const blob = await download(jobResult.jobId, {
      blackboxUrl: ctx.blackboxUrl,
      fetch: ctx.fetch,
    });

    updateStep('download', { status: 'completed' });
    log('Download complete');

    return {
      success: true,
      plan,
      data: {
        jobId: jobResult.jobId,
        job: finalJob,
        encryptedFile: blob,
      },
    };
  } catch (error) {
    const failedStep = steps.find((s) => s.status === 'in_progress');
    if (failedStep) {
      updateStep(failedStep.id, {
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    return {
      success: false,
      plan,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Parameters for file decryption flow
 */
export interface DecryptFileFlowParams {
  /** Secret ID used for encryption */
  secretId: bigint;
  /** The encrypted .cifer file */
  file: File | Blob;
}

/**
 * Result of file decryption flow
 */
export interface DecryptFileFlowResult {
  /** The job ID */
  jobId: string;
  /** Final job status */
  job: JobInfo;
  /** The decrypted file blob */
  decryptedFile: Blob;
}

/**
 * Decrypt a file and download the result
 *
 * This flow:
 * 1. Uploads the encrypted file for decryption
 * 2. Polls until the job completes
 * 3. Downloads the decrypted result (requires auth)
 *
 * @param ctx - Flow context
 * @param params - Decryption parameters
 * @param options - Flow options
 * @returns Flow result with decrypted file
 */
export async function decryptFileJobFlow(
  ctx: FlowContext,
  params: DecryptFileFlowParams,
  options?: FlowOptions
): Promise<FlowResult<DecryptFileFlowResult>> {
  const mode = options?.mode ?? 'execute';
  const pollingStrategy = ctx.pollingStrategy ?? DEFAULT_POLLING_STRATEGY;

  const steps: FlowStep[] = [
    {
      id: 'upload',
      description: 'Upload encrypted file for decryption',
      type: 'api_call',
      status: 'pending',
    },
    {
      id: 'poll',
      description: 'Wait for decryption to complete',
      type: 'poll',
      status: 'pending',
    },
    {
      id: 'download',
      description: 'Download decrypted file',
      type: 'api_call',
      status: 'pending',
    },
  ];

  const plan: FlowPlan = {
    name: 'decryptFileJobFlow',
    description: 'Decrypt a file and download the decrypted result',
    steps,
  };

  if (mode === 'plan') {
    return { success: true, plan };
  }

  const updateStep = createStepUpdater(steps, options?.onStepProgress);
  const log = ctx.logger ?? (() => {});

  try {
    // Step 1: Upload
    updateStep('upload', { status: 'in_progress' });
    log('Uploading encrypted file for decryption...');

    const jobResult = await decryptFile({
      chainId: ctx.chainId,
      secretId: params.secretId,
      file: params.file,
      signer: ctx.signer,
      readClient: ctx.readClient,
      blackboxUrl: ctx.blackboxUrl,
      fetch: ctx.fetch,
    });

    updateStep('upload', { status: 'completed', result: jobResult });
    log(`Job started: ${jobResult.jobId}`);

    // Step 2: Poll
    updateStep('poll', { status: 'in_progress' });
    log('Waiting for decryption to complete...');

    const finalJob = await pollUntilComplete(jobResult.jobId, ctx.blackboxUrl, {
      intervalMs: pollingStrategy.intervalMs,
      maxAttempts: pollingStrategy.maxAttempts,
      abortSignal: ctx.abortSignal,
      fetch: ctx.fetch,
      onProgress: (job) => log(`Progress: ${job.progress}%`),
    });

    if (finalJob.status === 'failed') {
      throw new FlowError(
        `Decryption job failed: ${finalJob.error}`,
        'decryptFileJobFlow',
        'poll'
      );
    }

    updateStep('poll', { status: 'completed', result: finalJob });
    log('Decryption complete');

    // Step 3: Download (requires auth for decrypt jobs)
    updateStep('download', { status: 'in_progress' });
    log('Downloading decrypted file...');

    const blob = await download(jobResult.jobId, {
      blackboxUrl: ctx.blackboxUrl,
      chainId: ctx.chainId,
      secretId: params.secretId,
      signer: ctx.signer,
      readClient: ctx.readClient,
      fetch: ctx.fetch,
    });

    updateStep('download', { status: 'completed' });
    log('Download complete');

    return {
      success: true,
      plan,
      data: {
        jobId: jobResult.jobId,
        job: finalJob,
        decryptedFile: blob,
      },
    };
  } catch (error) {
    const failedStep = steps.find((s) => s.status === 'in_progress');
    if (failedStep) {
      updateStep(failedStep.id, {
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    return {
      success: false,
      plan,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Parameters for decrypting from an existing encrypt job
 */
export interface DecryptExistingFileFlowParams {
  /** Secret ID used for the original encryption */
  secretId: bigint;
  /** Job ID of the completed encrypt job */
  encryptJobId: string;
}

/**
 * Decrypt from an existing encrypt job and download the result
 *
 * This flow:
 * 1. Creates a decrypt job from the existing encrypt job
 * 2. Polls until the job completes
 * 3. Downloads the decrypted result (requires auth)
 */
export async function decryptExistingFileJobFlow(
  ctx: FlowContext,
  params: DecryptExistingFileFlowParams,
  options?: FlowOptions
): Promise<FlowResult<DecryptFileFlowResult>> {
  const mode = options?.mode ?? 'execute';
  const pollingStrategy = ctx.pollingStrategy ?? DEFAULT_POLLING_STRATEGY;

  const steps: FlowStep[] = [
    {
      id: 'create_job',
      description: 'Create decrypt job from existing encrypt job',
      type: 'api_call',
      status: 'pending',
    },
    {
      id: 'poll',
      description: 'Wait for decryption to complete',
      type: 'poll',
      status: 'pending',
    },
    {
      id: 'download',
      description: 'Download decrypted file',
      type: 'api_call',
      status: 'pending',
    },
  ];

  const plan: FlowPlan = {
    name: 'decryptExistingFileJobFlow',
    description: 'Decrypt from an existing encrypt job without re-uploading',
    steps,
  };

  if (mode === 'plan') {
    return { success: true, plan };
  }

  const updateStep = createStepUpdater(steps, options?.onStepProgress);
  const log = ctx.logger ?? (() => {});

  try {
    // Step 1: Create job
    updateStep('create_job', { status: 'in_progress' });
    log('Creating decrypt job...');

    const jobResult = await decryptExistingFile({
      chainId: ctx.chainId,
      secretId: params.secretId,
      encryptJobId: params.encryptJobId,
      signer: ctx.signer,
      readClient: ctx.readClient,
      blackboxUrl: ctx.blackboxUrl,
      fetch: ctx.fetch,
    });

    updateStep('create_job', { status: 'completed', result: jobResult });
    log(`Job started: ${jobResult.jobId}`);

    // Step 2: Poll
    updateStep('poll', { status: 'in_progress' });
    log('Waiting for decryption to complete...');

    const finalJob = await pollUntilComplete(jobResult.jobId, ctx.blackboxUrl, {
      intervalMs: pollingStrategy.intervalMs,
      maxAttempts: pollingStrategy.maxAttempts,
      abortSignal: ctx.abortSignal,
      fetch: ctx.fetch,
      onProgress: (job) => log(`Progress: ${job.progress}%`),
    });

    if (finalJob.status === 'failed') {
      throw new FlowError(
        `Decryption job failed: ${finalJob.error}`,
        'decryptExistingFileJobFlow',
        'poll'
      );
    }

    updateStep('poll', { status: 'completed', result: finalJob });
    log('Decryption complete');

    // Step 3: Download
    updateStep('download', { status: 'in_progress' });
    log('Downloading decrypted file...');

    const blob = await download(jobResult.jobId, {
      blackboxUrl: ctx.blackboxUrl,
      chainId: ctx.chainId,
      secretId: params.secretId,
      signer: ctx.signer,
      readClient: ctx.readClient,
      fetch: ctx.fetch,
    });

    updateStep('download', { status: 'completed' });
    log('Download complete');

    return {
      success: true,
      plan,
      data: {
        jobId: jobResult.jobId,
        job: finalJob,
        decryptedFile: blob,
      },
    };
  } catch (error) {
    const failedStep = steps.find((s) => s.status === 'in_progress');
    if (failedStep) {
      updateStep(failedStep.id, {
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    return {
      success: false,
      plan,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
