/**
 * Configuration types for the CIFER SDK.
 *
 * This module contains types related to SDK configuration, discovery,
 * and chain-specific settings.
 *
 * @packageDocumentation
 * @module types/config
 */

import type { Address, ChainId } from './common.js';
import type { SignerAdapter, ReadClient } from './adapters.js';

/**
 * Per-chain configuration from discovery or overrides.
 *
 * @remarks
 * Chain configuration can come from:
 * 1. Discovery (fetched from blackbox `/healthz` endpoint)
 * 2. Explicit overrides provided in SDK configuration
 *
 * Overrides take precedence over discovery values.
 *
 * @public
 */
export interface ChainConfig {
  /** Chain ID */
  chainId: ChainId;
  /** Human-readable chain name (e.g., 'Ternoa Mainnet') */
  name?: string;
  /** HTTP RPC URL for this chain */
  rpcUrl: string;
  /** WebSocket RPC URL for this chain (optional, for subscriptions) */
  wsRpcUrl?: string;
  /** SecretsController contract address on this chain */
  secretsControllerAddress: Address;
  /** Block time in milliseconds (used for timeout calculations) */
  blockTimeMs?: number;
}

/**
 * Result of calling the blackbox /healthz endpoint.
 *
 * @remarks
 * Discovery provides runtime configuration including:
 * - Supported chains and their RPC URLs
 * - Contract addresses
 * - Service status
 *
 * This allows the SDK to work without hardcoded configuration.
 *
 * @public
 */
export interface DiscoveryResult {
  /** Status of the blackbox service ('ok' when healthy) */
  status: 'ok' | string;
  /** Enclave wallet address used by the blackbox for on-chain verification */
  enclaveWalletAddress: Address;
  /** List of supported chain IDs */
  supportedChains: ChainId[];
  /** Per-chain configuration */
  chains: ChainConfig[];
  /** IPFS gateway URL for fetching public keys */
  ipfsGatewayUrl?: string;
  /** Unix timestamp (ms) when this discovery result was fetched */
  fetchedAt: number;
}

/**
 * SDK configuration options.
 *
 * @remarks
 * The SDK can be configured in several ways:
 *
 * 1. **Discovery mode** (recommended): Provide `blackboxUrl` and the SDK
 *    will fetch configuration from the `/healthz` endpoint.
 *
 * 2. **Manual mode**: Provide `chainOverrides` with explicit configuration
 *    for each chain you want to use.
 *
 * 3. **Hybrid mode**: Use discovery with selective overrides for specific
 *    chains (e.g., custom RPC URLs).
 *
 * @example Discovery mode
 * ```typescript
 * const sdk = await createCiferSdk({
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 * ```
 *
 * @example With overrides
 * ```typescript
 * const sdk = await createCiferSdk({
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   chainOverrides: {
 *     752025: {
 *       rpcUrl: 'https://my-private-rpc.example.com',
 *     },
 *   },
 * });
 * ```
 *
 * @public
 */
export interface CiferSdkConfig {
  /**
   * Blackbox URL (e.g., 'https://cifer-blackbox.ternoa.dev:3010').
   *
   * @remarks
   * If provided, the SDK will perform discovery by calling the `/healthz`
   * endpoint to fetch chain configurations automatically.
   *
   * If not provided, the SDK will require explicit chain configs
   * via `chainOverrides` for all operations.
   */
  blackboxUrl?: string;

  /**
   * Default signer adapter to use for signing operations.
   *
   * @remarks
   * Can be overridden per-call. If not provided, each operation
   * that requires signing must receive a signer explicitly.
   */
  signer?: SignerAdapter;

  /**
   * Default read client for RPC operations.
   *
   * @remarks
   * Can be overridden per-call. If not provided, the SDK will
   * create a read client using RPC URLs from discovery.
   */
  readClient?: ReadClient;

  /**
   * Chain configuration overrides.
   *
   * @remarks
   * Use this to override discovery results or provide configuration
   * for private deployments / offline usage.
   *
   * Override values are merged with discovery values, with overrides
   * taking precedence.
   *
   * @example
   * ```typescript
   * {
   *   chainOverrides: {
   *     752025: {
   *       rpcUrl: 'https://my-private-rpc.example.com',
   *       secretsControllerAddress: '0x...',
   *     },
   *   },
   * }
   * ```
   */
  chainOverrides?: Record<ChainId, Partial<ChainConfig>>;

  /**
   * Discovery cache TTL in milliseconds.
   *
   * @remarks
   * Discovery results are cached in memory to avoid repeated network calls.
   *
   * @defaultValue 300000 (5 minutes)
   */
  discoveryCacheTtlMs?: number;

  /**
   * Custom fetch implementation.
   *
   * @remarks
   * Useful for testing or environments without native fetch.
   */
  fetch?: typeof fetch;

  /**
   * Logger function for debugging.
   *
   * @remarks
   * Called with progress messages during SDK operations.
   *
   * @example
   * ```typescript
   * {
   *   logger: console.log,
   * }
   * ```
   */
  logger?: (message: string) => void;
}

/**
 * Resolved configuration for a specific chain.
 *
 * @remarks
 * This extends {@link ChainConfig} with metadata about the configuration source.
 *
 * @public
 */
export interface ResolvedChainConfig extends ChainConfig {
  /** Whether this config came from discovery (true) or overrides only (false) */
  fromDiscovery: boolean;
}

/**
 * Internal SDK context passed to domain modules.
 *
 * @remarks
 * This is an internal type used to pass configuration and dependencies
 * between SDK modules. It should not be used directly by SDK consumers.
 *
 * @internal
 */
export interface SdkContext {
  /** Blackbox base URL */
  blackboxUrl: string;
  /** Discovery result (may be null if not yet fetched) */
  discovery: DiscoveryResult | null;
  /** Chain configuration overrides */
  chainOverrides: Record<ChainId, Partial<ChainConfig>>;
  /** Default signer */
  signer?: SignerAdapter;
  /** Default read client */
  readClient?: ReadClient;
  /** Fetch implementation */
  fetch: typeof fetch;
  /** Logger */
  logger: (message: string) => void;
}
