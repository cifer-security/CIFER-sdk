/**
 * @module flows
 * @description High-level orchestrated flows for common CIFER operations
 *
 * Flows combine multiple primitives into complete operations. They support
 * two modes:
 * - **Plan mode**: Returns a plan with the steps that would be executed
 * - **Execute mode**: Executes the flow using provided callbacks
 *
 * @example
 * ```typescript
 * import { flows } from 'cifer-sdk';
 *
 * // Create a flow context
 * const ctx = {
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://blackbox.cifer.network',
 *   chainId: 752025,
 *   controllerAddress: '0x...',
 *   txExecutor: async (intent) => {
 *     const hash = await wallet.sendTransaction(intent);
 *     return { hash, waitReceipt: () => provider.waitForTransaction(hash) };
 *   },
 *   logger: console.log,
 * };
 *
 * // Create a secret and wait for it to be ready
 * const result = await flows.createSecretAndWaitReady(ctx);
 *
 * if (result.success) {
 *   console.log('Secret ID:', result.data.secretId);
 * }
 * ```
 */

// Types
export {
  type FlowMode,
  type StepStatus,
  type FlowStep,
  type FlowPlan,
  type PollingStrategy,
  type FlowContext,
  type FlowOptions,
  type FlowResult,
  DEFAULT_POLLING_STRATEGY,
} from './types.js';

// Create secret flow
export {
  createSecretAndWaitReady,
  type CreateSecretResult,
} from './create-secret.js';

// Encrypt-then-commit flow
export {
  encryptThenPrepareCommitTx,
  type EncryptThenCommitParams,
  type EncryptThenCommitResult,
} from './encrypt-commit.js';

// Retrieve-and-decrypt flow
export {
  retrieveFromLogsThenDecrypt,
  type RetrieveAndDecryptParams,
  type RetrieveAndDecryptResult,
} from './decrypt-from-logs.js';

// File job flows
export {
  encryptFileJobFlow,
  decryptFileJobFlow,
  decryptExistingFileJobFlow,
  type EncryptFileFlowParams,
  type EncryptFileFlowResult,
  type DecryptFileFlowParams,
  type DecryptFileFlowResult,
  type DecryptExistingFileFlowParams,
} from './file-jobs.js';
