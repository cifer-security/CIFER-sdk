/**
 * @module flows/encrypt-commit
 * @description Flow for encrypting data and preparing a commitment transaction
 */

import type { Bytes32, Hex } from '../types/common.js';
import type { TxIntentWithMeta } from '../types/tx-intent.js';
import type {
  FlowContext,
  FlowOptions,
  FlowResult,
  FlowPlan,
  FlowStep,
} from './types.js';
import { createStepUpdater } from './types.js';
import { encryptPayload } from '../blackbox/payload.js';
import { buildStoreCommitmentTx, type AbiFunction } from '../commitments/tx-builders.js';
import { validateForStorage } from '../commitments/integrity.js';
// FlowError available for future error handling enhancements

/**
 * Parameters for encrypt-then-commit flow
 */
export interface EncryptThenCommitParams {
  /** Secret ID to use for encryption */
  secretId: bigint;
  /** The plaintext to encrypt */
  plaintext: string;
  /** Key for the commitment (bytes32) */
  key: Bytes32;
  /** Contract address for storing the commitment */
  commitmentContract: `0x${string}`;
  /** Store function ABI (optional - uses default if not provided) */
  storeFunction?: AbiFunction;
}

/**
 * Result of encryptThenPrepareCommitTx flow
 */
export interface EncryptThenCommitResult {
  /** The CIFER envelope */
  cifer: Hex;
  /** The encrypted message */
  encryptedMessage: Hex;
  /** The prepared transaction intent */
  txIntent: TxIntentWithMeta;
}

/**
 * Encrypt data and prepare a transaction to store it on-chain
 *
 * This flow:
 * 1. Encrypts the plaintext using the blackbox
 * 2. Validates the encrypted data sizes
 * 3. Builds a transaction intent for storing the commitment
 *
 * Note: This flow returns a transaction intent that you can execute
 * with your own wallet/provider.
 *
 * @param ctx - Flow context
 * @param params - Encryption and commitment parameters
 * @param options - Flow options
 * @returns Flow result with encrypted data and transaction intent
 *
 * @example
 * ```typescript
 * const result = await encryptThenPrepareCommitTx(ctx, {
 *   secretId: 123n,
 *   plaintext: 'My secret data',
 *   key: keccak256('my-key'),
 *   commitmentContract: '0x...',
 * });
 *
 * if (result.success) {
 *   // Execute the transaction
 *   const hash = await wallet.sendTransaction(result.data.txIntent);
 *   console.log('Commitment stored:', hash);
 * }
 * ```
 */
export async function encryptThenPrepareCommitTx(
  ctx: FlowContext,
  params: EncryptThenCommitParams,
  options?: FlowOptions
): Promise<FlowResult<EncryptThenCommitResult>> {
  const mode = options?.mode ?? 'execute';

  // Define the steps
  const steps: FlowStep[] = [
    {
      id: 'encrypt',
      description: 'Encrypt plaintext via blackbox',
      type: 'api_call',
      status: 'pending',
    },
    {
      id: 'validate',
      description: 'Validate encrypted data sizes',
      type: 'compute',
      status: 'pending',
    },
    {
      id: 'build_tx',
      description: 'Build store commitment transaction',
      type: 'compute',
      status: 'pending',
    },
  ];

  const plan: FlowPlan = {
    name: 'encryptThenPrepareCommitTx',
    description: 'Encrypt data and prepare a transaction to store it on-chain',
    steps,
    estimatedDurationMs: 5000, // ~5 seconds for encryption
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
    // Step 1: Encrypt
    updateStep('encrypt', { status: 'in_progress' });
    log('Encrypting data...');

    const encrypted = await encryptPayload({
      chainId: ctx.chainId,
      secretId: params.secretId,
      plaintext: params.plaintext,
      signer: ctx.signer,
      readClient: ctx.readClient,
      blackboxUrl: ctx.blackboxUrl,
      outputFormat: 'hex',
      fetch: ctx.fetch,
    });

    updateStep('encrypt', { status: 'completed', result: encrypted });
    log('Encryption complete');

    // Step 2: Validate
    updateStep('validate', { status: 'in_progress' });
    log('Validating data sizes...');

    validateForStorage(
      encrypted.cifer as Hex,
      encrypted.encryptedMessage as Hex
    );

    updateStep('validate', { status: 'completed' });
    log('Validation passed');

    // Step 3: Build transaction
    updateStep('build_tx', { status: 'in_progress' });
    log('Building transaction...');

    const defaultStoreFunction: AbiFunction = {
      type: 'function',
      name: 'store',
      inputs: [
        { name: 'key', type: 'bytes32' },
        { name: 'encryptedMessage', type: 'bytes' },
        { name: 'cifer', type: 'bytes' },
      ],
    };

    const txIntent = buildStoreCommitmentTx({
      chainId: ctx.chainId,
      contractAddress: params.commitmentContract,
      storeFunction: params.storeFunction ?? defaultStoreFunction,
      args: {
        key: params.key,
        secretId: params.secretId,
        encryptedMessage: encrypted.encryptedMessage as Hex,
        cifer: encrypted.cifer as Hex,
      },
      validate: false, // Already validated
    });

    updateStep('build_tx', { status: 'completed', txIntent, result: txIntent });
    log('Transaction ready');

    return {
      success: true,
      plan,
      data: {
        cifer: encrypted.cifer as Hex,
        encryptedMessage: encrypted.encryptedMessage as Hex,
        txIntent,
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
