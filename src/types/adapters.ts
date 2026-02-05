/**
 * Adapter interfaces for wallet and RPC abstraction.
 *
 * This module defines the core interfaces that allow the SDK to work with
 * any wallet or RPC provider without direct dependencies on specific libraries.
 *
 * @remarks
 * The SDK is designed to be wallet-agnostic. Instead of depending on ethers,
 * viem, wagmi, or other libraries directly, it uses these minimal interfaces
 * that can be implemented by any provider.
 *
 * Built-in implementations:
 * - {@link Eip1193SignerAdapter} - For browser wallets (MetaMask, WalletConnect, etc.)
 * - {@link RpcReadClient} - For JSON-RPC providers
 *
 * @packageDocumentation
 * @module types/adapters
 */

import type { Address, ChainId, Hex, Log, LogFilter } from './common.js';
import type { TxIntent, TxExecutionResult } from './tx-intent.js';

/**
 * Minimal signer adapter interface for wallet abstraction.
 *
 * This interface abstracts away the wallet implementation, allowing the SDK
 * to work with any EIP-1193 compatible wallet (MetaMask, WalletConnect, etc.)
 * as well as server-side signers.
 *
 * @remarks
 * The SDK provides a built-in {@link Eip1193SignerAdapter} that implements this
 * interface for standard EIP-1193 providers.
 *
 * @example Using the built-in EIP-1193 adapter
 * ```typescript
 * import { Eip1193SignerAdapter } from 'cifer-sdk/adapters';
 *
 * const signer = new Eip1193SignerAdapter(window.ethereum);
 * const address = await signer.getAddress();
 * const signature = await signer.signMessage('Hello, CIFER!');
 * ```
 *
 * @example Custom signer implementation
 * ```typescript
 * const customSigner: SignerAdapter = {
 *   async getAddress() {
 *     return myWallet.address;
 *   },
 *   async signMessage(message) {
 *     return myWallet.personalSign(message);
 *   },
 * };
 * ```
 *
 * @public
 */
export interface SignerAdapter {
  /**
   * Get the address of the signer.
   *
   * @returns A promise resolving to the checksummed Ethereum address
   *
   * @throws {@link AuthError} When the wallet is not connected or no accounts are available
   */
  getAddress(): Promise<Address>;

  /**
   * Sign a message using EIP-191 personal_sign semantics.
   *
   * @remarks
   * This is used for blackbox authentication where the server expects
   * signatures that can be verified with standard `ecrecover` after
   * applying the EIP-191 prefix.
   *
   * The message should NOT be pre-hashed or prefixed by the caller.
   *
   * @param message - The raw message string to sign (NOT hashed or prefixed)
   * @returns A promise resolving to the signature as a hex string
   *
   * @throws {@link AuthError} When signing fails or is rejected by the user
   */
  signMessage(message: string): Promise<Hex>;

  /**
   * Optional: Send a transaction.
   *
   * @remarks
   * This is an opt-in convenience method. Core SDK flows work without it
   * by returning {@link TxIntent} objects that the app broadcasts themselves.
   *
   * Implementing this allows the SDK's flow execution mode to submit
   * transactions directly.
   *
   * @param txRequest - The transaction intent to send
   * @returns A promise resolving to the transaction hash and a wait function
   *
   * @throws {@link AuthError} When the transaction fails to submit
   */
  sendTransaction?(txRequest: TxIntent): Promise<TxExecutionResult>;
}

/**
 * Call request for making eth_call.
 *
 * @public
 */
export interface CallRequest {
  /** Contract address to call */
  to: Address;
  /** Encoded calldata */
  data: Hex;
  /** Block tag or number (default: 'latest') */
  blockTag?: 'latest' | 'pending' | number;
}

/**
 * Minimal read client interface for RPC abstraction.
 *
 * This interface abstracts away the RPC implementation, allowing the SDK
 * to work with any RPC provider or custom implementations.
 *
 * @remarks
 * The SDK provides a built-in {@link RpcReadClient} that implements this
 * interface using standard JSON-RPC calls.
 *
 * @example Using the built-in RPC read client
 * ```typescript
 * import { RpcReadClient } from 'cifer-sdk/adapters';
 *
 * const readClient = new RpcReadClient({
 *   rpcUrlByChainId: {
 *     752025: 'https://mainnet.ternoa.network',
 *     11155111: 'https://eth-sepolia.g.alchemy.com/v2/...',
 *   },
 * });
 *
 * const blockNumber = await readClient.getBlockNumber(752025);
 * ```
 *
 * @public
 */
export interface ReadClient {
  /**
   * Get the current block number for a chain.
   *
   * @param chainId - The chain ID to query
   * @returns A promise resolving to the current block number
   *
   * @throws {@link AuthError} When the RPC call fails
   */
  getBlockNumber(chainId: ChainId): Promise<number>;

  /**
   * Get logs matching a filter.
   *
   * @param chainId - The chain ID to query
   * @param filter - The log filter criteria
   * @returns A promise resolving to an array of matching logs
   *
   * @throws {@link CommitmentsError} When the RPC call fails
   */
  getLogs(chainId: ChainId, filter: LogFilter): Promise<Log[]>;

  /**
   * Optional: Make an eth_call for reading contract state.
   *
   * @remarks
   * Used for reading contract state. If not provided, operations that
   * require contract reads will fail with an error indicating the
   * method is not available.
   *
   * @param chainId - The chain ID to query
   * @param callRequest - The call request with target address and calldata
   * @returns A promise resolving to the return data as a hex string
   *
   * @throws {@link KeyManagementError} or {@link CommitmentsError} When the call fails
   */
  call?(chainId: ChainId, callRequest: CallRequest): Promise<Hex>;
}

/**
 * EIP-1193 provider interface (minimal subset).
 *
 * @remarks
 * This is the standard interface for Ethereum providers as specified in EIP-1193.
 * Most wallets (MetaMask, WalletConnect, Coinbase Wallet, etc.) implement this.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-1193 | EIP-1193 Specification}
 *
 * @public
 */
export interface Eip1193Provider {
  /**
   * Make a JSON-RPC request.
   *
   * @param args - The request arguments including method and params
   * @returns A promise resolving to the response
   */
  request(args: {
    method: string;
    params?: unknown[];
  }): Promise<unknown>;
}

/**
 * Configuration for the RpcReadClient.
 *
 * @public
 */
export interface RpcReadClientConfig {
  /**
   * Map of chain IDs to RPC URLs.
   *
   * @example
   * ```typescript
   * {
   *   752025: 'https://mainnet.ternoa.network',
   *   11155111: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
   * }
   * ```
   */
  rpcUrlByChainId: Record<ChainId, string>;

  /**
   * Optional: Custom fetch implementation.
   *
   * @remarks
   * Useful for testing or environments without native fetch.
   */
  fetch?: typeof fetch;
}
