/**
 * @module flows/create-secret
 * @description Flow for creating a secret and waiting until it's ready
 */

import type { SecretState } from '../types/common.js';
import type {
  FlowContext,
  FlowOptions,
  FlowResult,
  FlowPlan,
  FlowStep,
} from './types.js';
import {
  DEFAULT_POLLING_STRATEGY,
  validateExecutionContext,
  sleepWithAbort,
  createStepUpdater,
} from './types.js';
import { getSecretCreationFee, getSecret, buildCreateSecretTx } from '../keyManagement/index.js';
import { extractSecretIdFromReceipt } from '../keyManagement/events.js';
import { FlowError, FlowAbortedError, FlowTimeoutError } from '../internal/errors/index.js';

/**
 * Result of createSecretAndWaitReady flow
 */
export interface CreateSecretResult {
  /** The new secret ID */
  secretId: bigint;
  /** The final secret state */
  state: SecretState;
}

/**
 * Create a new secret and wait until it's ready for use
 *
 * This flow:
 * 1. Reads the secret creation fee
 * 2. Builds and executes the createSecret transaction
 * 3. Extracts the secret ID from the receipt
 * 4. Polls until isSyncing becomes false
 *
 * @param ctx - Flow context
 * @param options - Flow options
 * @returns Flow result with secret ID and state
 *
 * @example
 * ```typescript
 * // Plan mode - see what will happen
 * const plan = await createSecretAndWaitReady(ctx, { mode: 'plan' });
 * console.log('Steps:', plan.plan.steps.map(s => s.description));
 *
 * // Execute mode - actually create the secret
 * const result = await createSecretAndWaitReady({
 *   ...ctx,
 *   txExecutor: async (intent) => {
 *     const hash = await wallet.sendTransaction(intent);
 *     return { hash, waitReceipt: () => provider.waitForTransaction(hash) };
 *   },
 * }, { mode: 'execute' });
 *
 * console.log('Secret ID:', result.data.secretId);
 * console.log('Public key CID:', result.data.state.publicKeyCid);
 * ```
 */
export async function createSecretAndWaitReady(
  ctx: FlowContext,
  options?: FlowOptions
): Promise<FlowResult<CreateSecretResult>> {
  const mode = options?.mode ?? 'execute';
  const pollingStrategy = ctx.pollingStrategy ?? DEFAULT_POLLING_STRATEGY;

  // Define the steps
  const steps: FlowStep[] = [
    {
      id: 'read_fee',
      description: 'Read secret creation fee',
      type: 'read',
      status: 'pending',
    },
    {
      id: 'create_secret_tx',
      description: 'Create secret transaction',
      type: 'transaction',
      status: 'pending',
    },
    {
      id: 'wait_sync',
      description: 'Wait for secret to sync',
      type: 'poll',
      status: 'pending',
    },
  ];

  const plan: FlowPlan = {
    name: 'createSecretAndWaitReady',
    description: 'Create a new CIFER secret and wait until it is ready for encryption/decryption',
    steps,
    estimatedDurationMs: 60000, // ~1 minute typical
  };

  // Plan mode - just return the plan
  if (mode === 'plan') {
    return {
      success: true,
      plan,
    };
  }

  // Execute mode
  validateExecutionContext(ctx);

  const updateStep = createStepUpdater(steps, options?.onStepProgress);
  const log = ctx.logger ?? (() => {});

  try {
    // Step 1: Read fee
    updateStep('read_fee', { status: 'in_progress' });
    log('Reading secret creation fee...');

    const fee = await getSecretCreationFee({
      chainId: ctx.chainId,
      controllerAddress: ctx.controllerAddress!,
      readClient: ctx.readClient,
    });

    updateStep('read_fee', { status: 'completed', result: fee });
    log(`Fee: ${fee} wei`);

    // Step 2: Create secret transaction
    updateStep('create_secret_tx', { status: 'in_progress' });
    log('Creating secret...');

    const txIntent = buildCreateSecretTx({
      chainId: ctx.chainId,
      controllerAddress: ctx.controllerAddress!,
      fee,
    });

    updateStep('create_secret_tx', { txIntent });

    const txResult = await ctx.txExecutor!(txIntent);
    log(`Transaction submitted: ${txResult.hash}`);

    const receipt = await txResult.waitReceipt();
    if (receipt.status !== 1) {
      throw new FlowError(
        'Create secret transaction failed',
        'createSecretAndWaitReady',
        'create_secret_tx'
      );
    }

    const secretId = extractSecretIdFromReceipt(receipt.logs);
    updateStep('create_secret_tx', { status: 'completed', result: { secretId, receipt } });
    log(`Secret created: ${secretId}`);

    // Step 3: Wait for sync
    updateStep('wait_sync', { status: 'in_progress' });
    log('Waiting for secret to sync...');

    let state: SecretState | null = null;
    let attempts = 0;

    while (attempts < pollingStrategy.maxAttempts) {
      if (ctx.abortSignal?.aborted) {
        throw new FlowAbortedError('createSecretAndWaitReady', 'wait_sync');
      }

      state = await getSecret(
        {
          chainId: ctx.chainId,
          controllerAddress: ctx.controllerAddress!,
          readClient: ctx.readClient,
        },
        secretId
      );

      if (!state.isSyncing) {
        break;
      }

      attempts++;
      log(`Waiting... (attempt ${attempts}/${pollingStrategy.maxAttempts})`);

      await sleepWithAbort(pollingStrategy.intervalMs, ctx.abortSignal);
    }

    if (!state || state.isSyncing) {
      throw new FlowTimeoutError(
        'createSecretAndWaitReady',
        pollingStrategy.maxAttempts * pollingStrategy.intervalMs,
        'wait_sync'
      );
    }

    updateStep('wait_sync', { status: 'completed', result: state });
    log('Secret is ready!');

    return {
      success: true,
      plan,
      data: {
        secretId,
        state,
      },
      receipts: [receipt],
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
