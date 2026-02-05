/**
 * Transaction intent types for library-neutral transaction building.
 *
 * The SDK uses the "transaction intent" pattern where write operations
 * return data structures describing the transaction rather than executing
 * it directly. This allows apps to use their preferred method for
 * transaction submission.
 *
 * @packageDocumentation
 * @module types/tx-intent
 */

import type { Address, ChainId, Hex } from './common.js';

/**
 * A transaction intent represents a transaction that can be executed
 * by any EIP-1193 compatible wallet or transaction executor.
 *
 * @remarks
 * This is the standard output format for all write operations in the SDK.
 * The app is responsible for broadcasting the transaction using their
 * preferred method (wagmi, ethers, viem, direct RPC, etc.).
 *
 * Transaction intents intentionally do not include:
 * - `from` address (determined by the wallet)
 * - Gas settings (handled by the wallet/provider)
 * - Nonce (managed by the wallet/provider)
 *
 * @example With wagmi
 * ```typescript
 * const intent = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });
 *
 * const hash = await sendTransaction({
 *   to: intent.to,
 *   data: intent.data,
 *   value: intent.value,
 * });
 * ```
 *
 * @example With ethers v6
 * ```typescript
 * const intent = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });
 *
 * const tx = await signer.sendTransaction({
 *   to: intent.to,
 *   data: intent.data,
 *   value: intent.value,
 * });
 * ```
 *
 * @example With EIP-1193 provider directly
 * ```typescript
 * const intent = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });
 *
 * const hash = await provider.request({
 *   method: 'eth_sendTransaction',
 *   params: [{
 *     to: intent.to,
 *     data: intent.data,
 *     value: intent.value ? `0x${intent.value.toString(16)}` : undefined,
 *   }],
 * });
 * ```
 *
 * @public
 */
export interface TxIntent {
  /**
   * The chain ID where this transaction should be executed.
   *
   * @remarks
   * Apps should verify the wallet is connected to the correct chain
   * before submitting the transaction.
   */
  chainId: ChainId;

  /**
   * The recipient address (contract address for contract calls).
   */
  to: Address;

  /**
   * The calldata for the transaction (ABI-encoded function call).
   */
  data: Hex;

  /**
   * The value to send with the transaction (in wei).
   *
   * @remarks
   * Only set for payable functions. For non-payable functions,
   * this will be `undefined`.
   */
  value?: bigint;
}

/**
 * Extended transaction intent with additional metadata useful for UX and debugging.
 *
 * @remarks
 * Transaction builders in the SDK return this extended type which includes
 * human-readable descriptions and decoded arguments for display purposes.
 *
 * @public
 */
export interface TxIntentWithMeta extends TxIntent {
  /**
   * Human-readable description of what this transaction does.
   *
   * @example `'Create a new CIFER secret'`
   */
  description: string;

  /**
   * The function being called (for display purposes).
   *
   * @example `'createSecret'`
   */
  functionName: string;

  /**
   * The decoded arguments (for display purposes).
   *
   * @remarks
   * Arguments are provided as a record for easy display in UIs.
   * BigInt values are converted to strings for JSON serialization.
   */
  args?: Record<string, unknown>;
}

/**
 * Result of executing a transaction intent.
 *
 * @public
 */
export interface TxExecutionResult {
  /**
   * The transaction hash.
   */
  hash: Hex;

  /**
   * Function to wait for the transaction receipt.
   *
   * @returns A promise resolving to the transaction receipt
   */
  waitReceipt: () => Promise<import('./common.js').TransactionReceipt>;
}

/**
 * Callback type for executing transaction intents.
 *
 * @remarks
 * Apps provide this callback to the SDK's flow execution mode to handle
 * transaction submission. The callback receives a transaction intent and
 * should return the hash and a function to wait for the receipt.
 *
 * @example
 * ```typescript
 * const txExecutor: TxExecutor = async (intent) => {
 *   const hash = await wallet.sendTransaction({
 *     to: intent.to,
 *     data: intent.data,
 *     value: intent.value,
 *   });
 *   return {
 *     hash,
 *     waitReceipt: () => provider.waitForTransaction(hash),
 *   };
 * };
 * ```
 *
 * @public
 */
export type TxExecutor = (intent: TxIntent) => Promise<TxExecutionResult>;
