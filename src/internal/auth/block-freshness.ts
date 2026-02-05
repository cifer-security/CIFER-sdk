/**
 * @module internal/auth/block-freshness
 * @description Block freshness management for anti-replay protection
 *
 * The blackbox validates that signed requests include a recent block number
 * to prevent replay attacks. This module handles fetching fresh block numbers
 * and retrying operations when block numbers become stale.
 */

import type { ChainId } from '../../types/common.js';
import type { ReadClient } from '../../types/adapters.js';
import {
  AuthError,
  BlockStaleError,
  isBlockStaleError,
} from '../errors/index.js';

/**
 * Default freshness window: approximately 10 minutes
 * Calculated as: ceil(10 minutes / 6 second block time) = 100 blocks
 */
const DEFAULT_FRESHNESS_WINDOW = 100;

/**
 * Default number of retry attempts for stale block errors
 */
const DEFAULT_MAX_RETRIES = 3;

/**
 * Delay between retries in milliseconds
 */
const DEFAULT_RETRY_DELAY_MS = 1000;

/**
 * Get a fresh block number for signing
 *
 * This should be called immediately before signing to ensure the block
 * number is within the server's freshness window.
 *
 * @param chainId - The chain ID
 * @param readClient - Read client for fetching block number
 * @returns The current block number
 *
 * @example
 * ```typescript
 * const blockNumber = await getFreshBlockNumber(752025, readClient);
 * const dataString = buildEncryptPayloadDataString({
 *   chainId: 752025,
 *   secretId: 123n,
 *   signer: address,
 *   blockNumber,
 *   plaintext: 'secret',
 * });
 * ```
 */
export async function getFreshBlockNumber(
  chainId: ChainId,
  readClient: ReadClient
): Promise<number> {
  try {
    return await readClient.getBlockNumber(chainId);
  } catch (error) {
    throw new AuthError(
      `Failed to fetch block number for chain ${chainId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Options for the retry wrapper
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelayMs?: number;
  /** Callback when a retry is about to happen */
  onRetry?: (attempt: number, error: BlockStaleError) => void;
}

/**
 * Wrap an async function with block freshness retry logic
 *
 * If the function fails with a BlockStaleError, it will be retried
 * with a fresh block number. The callback receives a function to
 * get a fresh block number.
 *
 * @param fn - The function to wrap (receives getFreshBlock callback)
 * @param readClient - Read client for fetching block numbers
 * @param chainId - The chain ID
 * @param options - Retry options
 * @returns The result of the function
 *
 * @example
 * ```typescript
 * const result = await withBlockFreshRetry(
 *   async (getFreshBlock) => {
 *     const blockNumber = await getFreshBlock();
 *     const data = buildEncryptPayloadDataString({
 *       chainId,
 *       secretId,
 *       signer,
 *       blockNumber,
 *       plaintext,
 *     });
 *     const signature = await signer.signMessage(data);
 *     return await callBlackbox({ data, signature });
 *   },
 *   readClient,
 *   chainId,
 *   { maxRetries: 3 }
 * );
 * ```
 */
export async function withBlockFreshRetry<T>(
  fn: (getFreshBlock: () => Promise<number>) => Promise<T>,
  readClient: ReadClient,
  chainId: ChainId,
  options?: RetryOptions
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Provide a fresh block number getter
      const getFreshBlock = () => getFreshBlockNumber(chainId, readClient);
      return await fn(getFreshBlock);
    } catch (error) {
      if (isBlockStaleError(error) && attempt < maxRetries) {
        lastError = error;

        // Call retry callback if provided
        options?.onRetry?.(attempt + 1, error);

        // Wait before retrying
        await sleep(retryDelayMs);
        continue;
      }

      // Not a stale block error or out of retries, rethrow
      throw error;
    }
  }

  // Should not reach here, but TypeScript needs this
  throw lastError ?? new AuthError('Retry logic failed unexpectedly');
}

/**
 * Validate that a block number is within the freshness window
 *
 * This is useful for client-side validation before sending a request.
 *
 * @param blockNumber - The block number to validate
 * @param currentBlock - The current block number
 * @param windowSize - The freshness window size (default: 100 blocks)
 * @returns True if valid
 * @throws BlockStaleError if the block is too old
 */
export function validateBlockFreshness(
  blockNumber: number,
  currentBlock: number,
  windowSize: number = DEFAULT_FRESHNESS_WINDOW
): boolean {
  // Check if too far in the future (> current + 5)
  if (blockNumber > currentBlock + 5) {
    throw new AuthError(
      `Block number ${blockNumber} is in the future (current: ${currentBlock})`
    );
  }

  // Check if too old
  if (currentBlock - blockNumber > windowSize) {
    throw new BlockStaleError(blockNumber, currentBlock, windowSize);
  }

  return true;
}

/**
 * Parse a block freshness error message from the blackbox
 *
 * @param message - Error message from the blackbox
 * @returns Parsed error or null if not a block freshness error
 */
export function parseBlockFreshnessError(
  message: string
): BlockStaleError | null {
  // Pattern: "Block number X is too old (current: Y, max window: Z)"
  const staleMatch = message.match(
    /Block number (\d+) is too old \(current: (\d+), max window: (\d+)\)/
  );
  if (staleMatch) {
    return new BlockStaleError(
      parseInt(staleMatch[1], 10),
      parseInt(staleMatch[2], 10),
      parseInt(staleMatch[3], 10)
    );
  }

  // Pattern: "Block number X is in the future (current: Y)"
  const futureMatch = message.match(
    /Block number (\d+) is in the future \(current: (\d+)\)/
  );
  if (futureMatch) {
    // Use a large window to indicate it's a future block error
    return new BlockStaleError(
      parseInt(futureMatch[1], 10),
      parseInt(futureMatch[2], 10),
      5 // Max future blocks allowed
    );
  }

  return null;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
