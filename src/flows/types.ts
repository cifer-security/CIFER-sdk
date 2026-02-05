/**
 * @module flows/types
 * @description Types for high-level orchestrated flows
 */

import type { Address, ChainId } from '../types/common.js';
import type { SignerAdapter, ReadClient } from '../types/adapters.js';
import type { TxIntent, TxExecutor } from '../types/tx-intent.js';
import type { TransactionReceipt } from '../types/common.js';

/**
 * Flow execution mode
 */
export type FlowMode = 'plan' | 'execute';

/**
 * Flow step status
 */
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/**
 * A single step in a flow
 */
export interface FlowStep {
  /** Step identifier */
  id: string;
  /** Human-readable description */
  description: string;
  /** Step type */
  type: 'transaction' | 'api_call' | 'poll' | 'read' | 'compute';
  /** Current status */
  status: StepStatus;
  /** Transaction intent (for transaction steps) */
  txIntent?: TxIntent;
  /** Result data (after completion) */
  result?: unknown;
  /** Error (if failed) */
  error?: Error;
}

/**
 * Flow plan returned in plan mode
 */
export interface FlowPlan {
  /** Flow name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Ordered list of steps */
  steps: FlowStep[];
  /** Estimated total duration (if known) */
  estimatedDurationMs?: number;
}

/**
 * Polling strategy configuration
 */
export interface PollingStrategy {
  /** Interval between polls in milliseconds */
  intervalMs: number;
  /** Maximum number of polling attempts */
  maxAttempts: number;
  /** Backoff multiplier (default: 1 = no backoff) */
  backoffMultiplier?: number;
  /** Maximum interval (for exponential backoff) */
  maxIntervalMs?: number;
}

/**
 * Default polling strategy
 */
export const DEFAULT_POLLING_STRATEGY: PollingStrategy = {
  intervalMs: 2000,
  maxAttempts: 60,
  backoffMultiplier: 1,
};

/**
 * Flow context with all dependencies and callbacks
 */
export interface FlowContext {
  /** Signer for authentication */
  signer: SignerAdapter;
  /** Read client for blockchain queries */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Chain ID */
  chainId: ChainId;
  /** SecretsController address (optional - can be resolved from discovery) */
  controllerAddress?: Address;

  // === Execution callbacks (required for execute mode) ===

  /**
   * Transaction executor callback
   *
   * Apps provide this to execute transaction intents.
   * The SDK doesn't handle gas estimation or nonce management.
   */
  txExecutor?: TxExecutor;

  /**
   * Polling strategy for operations that require waiting
   */
  pollingStrategy?: PollingStrategy;

  /**
   * Logger for progress updates
   */
  logger?: (message: string) => void;

  /**
   * Abort signal for cancellation
   */
  abortSignal?: AbortSignal;

  /**
   * Custom fetch implementation
   */
  fetch?: typeof fetch;
}

/**
 * Options for flow execution
 */
export interface FlowOptions {
  /**
   * Execution mode
   * - 'plan': Return a plan without executing
   * - 'execute': Execute the flow (requires txExecutor)
   */
  mode?: FlowMode;

  /**
   * Callback for step progress updates
   */
  onStepProgress?: (step: FlowStep) => void;
}

/**
 * Flow execution result
 */
export interface FlowResult<T> {
  /** Whether the flow completed successfully */
  success: boolean;
  /** The flow plan (steps that were/would be executed) */
  plan: FlowPlan;
  /** Result data (if successful) */
  data?: T;
  /** Error (if failed) */
  error?: Error;
  /** Transaction receipts (for flows that submit transactions) */
  receipts?: TransactionReceipt[];
}

/**
 * Helper to check if flow context is ready for execution
 */
export function validateExecutionContext(ctx: FlowContext): void {
  if (!ctx.txExecutor) {
    throw new Error(
      'txExecutor is required for execute mode. ' +
        'Provide a callback that broadcasts transactions.'
    );
  }
}

/**
 * Sleep with abort signal support
 */
export async function sleepWithAbort(
  ms: number,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Aborted'));
    });
  });
}

/**
 * Create a step updater function
 */
export function createStepUpdater(
  steps: FlowStep[],
  onProgress?: (step: FlowStep) => void
): (stepId: string, update: Partial<FlowStep>) => void {
  return (stepId: string, update: Partial<FlowStep>) => {
    const step = steps.find((s) => s.id === stepId);
    if (step) {
      Object.assign(step, update);
      onProgress?.(step);
    }
  };
}
