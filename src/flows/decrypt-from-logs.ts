/**
 * @module flows/decrypt-from-logs
 * @description Flow for retrieving and decrypting data from on-chain logs
 */

import type { Address, Bytes32 } from '../types/common.js';
import type {
  FlowContext,
  FlowOptions,
  FlowResult,
  FlowPlan,
  FlowStep,
} from './types.js';
import { createStepUpdater } from './types.js';
import { getCIFERMetadata } from '../commitments/metadata.js';
import { fetchCommitmentFromLogs } from '../commitments/logs.js';
import { assertCommitmentIntegrity } from '../commitments/integrity.js';
import { decryptPayload } from '../blackbox/payload.js';
import { FlowError } from '../internal/errors/index.js';

/**
 * Parameters for retrieve-and-decrypt flow
 */
export interface RetrieveAndDecryptParams {
  /** Secret ID used for encryption */
  secretId: bigint;
  /** Data ID to retrieve */
  dataId: Bytes32;
  /** Contract address where the commitment is stored */
  commitmentContract: Address;
  /** Block number where the data was stored (optional - fetched if not provided) */
  storedAtBlock?: number;
  /** Skip integrity verification (default: false) */
  skipIntegrityCheck?: boolean;
}

/**
 * Result of retrieveFromLogsThenDecrypt flow
 */
export interface RetrieveAndDecryptResult {
  /** The decrypted plaintext */
  decryptedMessage: string;
  /** The secret ID used */
  secretId: bigint;
  /** Block where the commitment was stored */
  storedAtBlock: number;
}

/**
 * Retrieve encrypted data from on-chain logs and decrypt it
 *
 * This flow:
 * 1. Fetches commitment metadata (if block not provided)
 * 2. Retrieves cifer and encryptedMessage from event logs
 * 3. Verifies data integrity (optional)
 * 4. Decrypts the data using the blackbox
 *
 * @param ctx - Flow context
 * @param params - Retrieval and decryption parameters
 * @param options - Flow options
 * @returns Flow result with decrypted message
 *
 * @example
 * ```typescript
 * const result = await retrieveFromLogsThenDecrypt(ctx, {
 *   secretId: 123n,
 *   dataId: '0x...',
 *   commitmentContract: '0x...',
 * });
 *
 * if (result.success) {
 *   console.log('Decrypted:', result.data.decryptedMessage);
 * }
 * ```
 */
export async function retrieveFromLogsThenDecrypt(
  ctx: FlowContext,
  params: RetrieveAndDecryptParams,
  options?: FlowOptions
): Promise<FlowResult<RetrieveAndDecryptResult>> {
  const mode = options?.mode ?? 'execute';
  const skipIntegrity = params.skipIntegrityCheck ?? false;

  // Define the steps
  const steps: FlowStep[] = [];

  if (!params.storedAtBlock) {
    steps.push({
      id: 'read_metadata',
      description: 'Read commitment metadata',
      type: 'read',
      status: 'pending',
    });
  }

  steps.push(
    {
      id: 'fetch_logs',
      description: 'Fetch encrypted data from logs',
      type: 'read',
      status: 'pending',
    },
    ...(skipIntegrity
      ? []
      : [
          {
            id: 'verify_integrity',
            description: 'Verify data integrity',
            type: 'compute' as const,
            status: 'pending' as const,
          },
        ]),
    {
      id: 'decrypt',
      description: 'Decrypt data via blackbox',
      type: 'api_call',
      status: 'pending',
    }
  );

  const plan: FlowPlan = {
    name: 'retrieveFromLogsThenDecrypt',
    description: 'Retrieve encrypted data from on-chain logs and decrypt it',
    steps,
    estimatedDurationMs: 10000, // ~10 seconds
  };

  // Plan mode - just return the plan
  if (mode === 'plan') {
    return {
      success: true,
      plan,
    };
  }

  const updateStep = createStepUpdater(steps, options?.onStepProgress);
  const log = ctx.logger ?? (() => {});

  try {
    let storedAtBlock = params.storedAtBlock;
    let metadata;

    // Step 1: Read metadata (if block not provided)
    if (!storedAtBlock) {
      updateStep('read_metadata', { status: 'in_progress' });
      log('Reading commitment metadata...');

      metadata = await getCIFERMetadata(
        {
          chainId: ctx.chainId,
          contractAddress: params.commitmentContract,
          readClient: ctx.readClient,
        },
        params.dataId
      );

      storedAtBlock = metadata.storedAtBlock;
      updateStep('read_metadata', { status: 'completed', result: metadata });
      log(`Found at block ${storedAtBlock}`);
    }

    // Step 2: Fetch logs
    updateStep('fetch_logs', { status: 'in_progress' });
    log('Fetching encrypted data from logs...');

    const commitment = await fetchCommitmentFromLogs({
      chainId: ctx.chainId,
      contractAddress: params.commitmentContract,
      dataId: params.dataId,
      storedAtBlock,
      readClient: ctx.readClient,
    });

    updateStep('fetch_logs', { status: 'completed', result: commitment });
    log('Encrypted data retrieved');

    // Step 3: Verify integrity (if not skipped)
    if (!skipIntegrity) {
      updateStep('verify_integrity', { status: 'in_progress' });
      log('Verifying data integrity...');

      // Get metadata if we don't have it
      if (!metadata) {
        metadata = await getCIFERMetadata(
          {
            chainId: ctx.chainId,
            contractAddress: params.commitmentContract,
            readClient: ctx.readClient,
          },
          params.dataId
        );
      }

      assertCommitmentIntegrity(commitment, metadata);

      updateStep('verify_integrity', { status: 'completed' });
      log('Integrity verified');
    }

    // Step 4: Decrypt
    updateStep('decrypt', { status: 'in_progress' });
    log('Decrypting data...');

    const decrypted = await decryptPayload({
      chainId: ctx.chainId,
      secretId: params.secretId,
      encryptedMessage: commitment.encryptedMessage,
      cifer: commitment.cifer,
      signer: ctx.signer,
      readClient: ctx.readClient,
      blackboxUrl: ctx.blackboxUrl,
      inputFormat: 'hex',
      fetch: ctx.fetch,
    });

    updateStep('decrypt', { status: 'completed', result: decrypted });
    log('Decryption complete');

    return {
      success: true,
      plan,
      data: {
        decryptedMessage: decrypted.decryptedMessage,
        secretId: params.secretId,
        storedAtBlock,
      },
    };
  } catch (error) {
    // Mark current step as failed
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
