/**
 * CIFER SDK - Cryptographic Infrastructure for Encrypted Records.
 *
 * This SDK provides a complete toolkit for working with the CIFER encryption
 * system, which offers quantum-resistant encryption using ML-KEM-768 key
 * encapsulation and AES-GCM symmetric encryption.
 *
 * ## Main Features
 *
 * - **keyManagement**: Secret creation, delegation, and ownership management
 * - **blackbox**: Payload and file encryption/decryption via the blackbox API
 * - **commitments**: On-chain encrypted data storage and retrieval
 * - **flows**: High-level orchestrated operations
 *
 * ## Getting Started
 *
 * @example Basic usage with discovery
 * ```typescript
 * import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';
 *
 * // Create the SDK instance with auto-discovery
 * const sdk = await createCiferSdk({
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 *
 * // Connect any EIP-1193 wallet
 * const signer = new Eip1193SignerAdapter(window.ethereum);
 *
 * // Get chain configuration
 * const chainId = 752025;
 * const controllerAddress = sdk.getControllerAddress(chainId);
 *
 * // Read operations
 * const fee = await sdk.keyManagement.getSecretCreationFee({
 *   chainId,
 *   controllerAddress,
 *   readClient: sdk.readClient,
 * });
 *
 * // Build transactions (execute with your wallet)
 * const txIntent = sdk.keyManagement.buildCreateSecretTx({
 *   chainId,
 *   controllerAddress,
 *   fee,
 * });
 *
 * // Execute with your preferred method
 * const hash = await wallet.sendTransaction(txIntent);
 * ```
 *
 * @example Encrypt and decrypt data
 * ```typescript
 * import { blackbox } from 'cifer-sdk';
 *
 * // Encrypt a payload
 * const encrypted = await blackbox.payload.encryptPayload({
 *   chainId: 752025,
 *   secretId: 123n,
 *   plaintext: 'My secret message',
 *   signer,
 *   readClient: sdk.readClient,
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 *
 * // Decrypt the payload
 * const decrypted = await blackbox.payload.decryptPayload({
 *   chainId: 752025,
 *   secretId: 123n,
 *   encryptedMessage: encrypted.encryptedMessage,
 *   cifer: encrypted.cifer,
 *   signer,
 *   readClient: sdk.readClient,
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 *
 * console.log(decrypted.decryptedMessage); // 'My secret message'
 * ```
 *
 * @packageDocumentation
 * @module cifer-sdk
 */

// ============================================================================
// Types
// ============================================================================

export * from './types/index.js';

// ============================================================================
// Domain Namespaces
// ============================================================================

/**
 * Key management operations for the SecretsController contract.
 *
 * @remarks
 * This namespace provides functions for:
 * - Reading secret state and fees
 * - Building transaction intents for secret creation and management
 * - Parsing events from transaction receipts
 *
 * @public
 */
export * as keyManagement from './keyManagement/index.js';

/**
 * Blackbox API operations for encryption and decryption.
 *
 * @remarks
 * This namespace is organized into sub-namespaces:
 * - `payload`: Short message encryption/decryption (synchronous)
 * - `files`: File encryption/decryption (asynchronous via jobs)
 * - `jobs`: Job management (status, download, delete, list)
 *
 * @public
 */
export * as blackbox from './blackbox/index.js';

/**
 * On-chain commitment operations for encrypted data storage.
 *
 * @remarks
 * This namespace provides functions for:
 * - Reading commitment metadata from contracts
 * - Fetching encrypted data from event logs
 * - Verifying data integrity
 * - Building store transactions
 *
 * @public
 */
export * as commitments from './commitments/index.js';

/**
 * High-level orchestrated flows for common operations.
 *
 * @remarks
 * Flows combine multiple primitives into complete operations and support
 * two modes:
 * - **Plan mode**: Returns a plan with steps that would be executed
 * - **Execute mode**: Executes the flow using provided callbacks
 *
 * @public
 */
export * as flows from './flows/index.js';

// ============================================================================
// Internal Utilities (exported for advanced usage)
// ============================================================================

// Config & Discovery
export {
  discover,
  clearDiscoveryCache,
  getSupportedChainIds,
  isChainSupported,
  resolveChain,
  resolveAllChains,
  getRpcUrl,
  getSecretsControllerAddress,
} from './internal/config/index.js';

// Auth (for custom integrations)
export {
  buildDataString,
  buildEncryptPayloadDataString,
  buildDecryptPayloadDataString,
  buildFileOperationDataString,
  buildJobDownloadDataString,
  buildJobDeleteDataString,
  buildJobsListDataString,
  getFreshBlockNumber,
  withBlockFreshRetry,
  signDataString,
} from './internal/auth/index.js';

// Adapters
export {
  Eip1193SignerAdapter,
  RpcReadClient,
  createReadClientFromDiscovery,
} from './internal/adapters/index.js';

// Errors
export * from './internal/errors/index.js';

// ABIs (for advanced usage)
export {
  SECRETS_CONTROLLER_ABI,
  CIFER_ENCRYPTED_ABI,
  CIFER_ENVELOPE_BYTES,
  MAX_PAYLOAD_BYTES,
} from './internal/abi/index.js';

// ============================================================================
// SDK Factory
// ============================================================================

import type { ChainId, Address } from './types/common.js';
import type { CiferSdkConfig, DiscoveryResult } from './types/config.js';
import type { SignerAdapter, ReadClient } from './types/adapters.js';
import { discover, resolveChain } from './internal/config/index.js';
import { RpcReadClient, createReadClientFromDiscovery } from './internal/adapters/index.js';
import { ConfigError } from './internal/errors/index.js';

import * as keyManagementNs from './keyManagement/index.js';
import * as blackboxNs from './blackbox/index.js';
import * as commitmentsNs from './commitments/index.js';
import * as flowsNs from './flows/index.js';

/**
 * CIFER SDK instance.
 *
 * Provides access to all SDK functionality through organized namespaces
 * and helper methods for chain configuration.
 *
 * @remarks
 * Create an instance using {@link createCiferSdk} (async with discovery)
 * or {@link createCiferSdkSync} (sync without discovery).
 *
 * @public
 */
export interface CiferSdk {
  /**
   * Key management operations (SecretsController).
   *
   * @remarks
   * Provides functions for reading secret state, building transaction
   * intents, and parsing events.
   */
  readonly keyManagement: typeof keyManagementNs;

  /**
   * Blackbox API operations (encryption/decryption).
   *
   * @remarks
   * Provides namespaces for payload, file, and job operations.
   */
  readonly blackbox: typeof blackboxNs;

  /**
   * On-chain commitment operations.
   *
   * @remarks
   * Provides functions for reading, storing, and verifying encrypted
   * commitments on-chain.
   */
  readonly commitments: typeof commitmentsNs;

  /**
   * High-level orchestrated flows.
   *
   * @remarks
   * Provides complete workflows for common operations like creating
   * secrets, encrypting data, and decrypting from logs.
   */
  readonly flows: typeof flowsNs;

  /**
   * The configured blackbox URL.
   */
  readonly blackboxUrl: string;

  /**
   * The discovery result (null if discovery was not performed).
   */
  readonly discovery: DiscoveryResult | null;

  /**
   * The default signer (if configured).
   */
  readonly signer?: SignerAdapter;

  /**
   * The default read client.
   */
  readonly readClient: ReadClient;

  /**
   * Get the SecretsController address for a chain.
   *
   * @param chainId - The chain ID
   * @returns The SecretsController contract address
   * @throws {@link ConfigError} When no address is configured for the chain
   */
  getControllerAddress(chainId: ChainId): Address;

  /**
   * Get the RPC URL for a chain.
   *
   * @param chainId - The chain ID
   * @returns The RPC URL
   * @throws {@link ConfigError} When no RPC URL is configured for the chain
   */
  getRpcUrl(chainId: ChainId): string;

  /**
   * Get supported chain IDs.
   *
   * @returns Array of supported chain IDs
   */
  getSupportedChainIds(): ChainId[];

  /**
   * Refresh discovery (re-fetch /healthz).
   *
   * @remarks
   * Call this to update chain configuration after changes on the server.
   *
   * @throws {@link ConfigError} When called on an SDK created without blackboxUrl
   * @throws {@link DiscoveryError} When the discovery request fails
   */
  refreshDiscovery(): Promise<void>;
}

/**
 * Create a CIFER SDK instance with automatic discovery.
 *
 * This is the main entry point for the SDK. It performs discovery
 * (if blackboxUrl is provided) and sets up the default read client.
 *
 * @param config - SDK configuration options
 * @returns A promise resolving to the configured SDK instance
 *
 * @throws {@link ConfigError} When neither blackboxUrl nor readClient is provided
 * @throws {@link DiscoveryError} When discovery fails
 *
 * @example Basic usage with discovery
 * ```typescript
 * const sdk = await createCiferSdk({
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 * ```
 *
 * @example With signer and custom overrides
 * ```typescript
 * const sdk = await createCiferSdk({
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   signer: new Eip1193SignerAdapter(window.ethereum),
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
export async function createCiferSdk(config: CiferSdkConfig): Promise<CiferSdk> {
  const fetchFn = config.fetch ?? fetch;
  const log = config.logger ?? (() => {});

  let discovery: DiscoveryResult | null = null;
  let readClient: ReadClient;

  // Perform discovery if blackboxUrl is provided
  if (config.blackboxUrl) {
    log('Performing discovery...');
    discovery = await discover(config.blackboxUrl, {
      cacheTtlMs: config.discoveryCacheTtlMs,
      fetch: fetchFn,
    });
    log(`Discovery complete. Supported chains: ${discovery.supportedChains.join(', ')}`);

    // Create read client from discovery if not provided
    if (!config.readClient) {
      readClient = createReadClientFromDiscovery(discovery.chains);
    } else {
      readClient = config.readClient;
    }
  } else if (config.readClient) {
    readClient = config.readClient;
  } else {
    throw new ConfigError(
      'Either blackboxUrl (for discovery) or readClient must be provided'
    );
  }

  // Apply chain overrides to read client if it's an RpcReadClient
  if (config.chainOverrides && readClient instanceof RpcReadClient) {
    for (const [chainIdStr, override] of Object.entries(config.chainOverrides)) {
      if (override.rpcUrl) {
        readClient.setRpcUrl(parseInt(chainIdStr, 10), override.rpcUrl);
      }
    }
  }

  const blackboxUrl = config.blackboxUrl ?? '';

  // Build the SDK instance
  const sdk: CiferSdk = {
    keyManagement: keyManagementNs,
    blackbox: blackboxNs,
    commitments: commitmentsNs,
    flows: flowsNs,

    blackboxUrl,
    discovery,
    signer: config.signer,
    readClient,

    getControllerAddress(chainId: ChainId): Address {
      const resolved = resolveChain(chainId, discovery, config.chainOverrides?.[chainId]);
      return resolved.secretsControllerAddress;
    },

    getRpcUrl(chainId: ChainId): string {
      const resolved = resolveChain(chainId, discovery, config.chainOverrides?.[chainId]);
      return resolved.rpcUrl;
    },

    getSupportedChainIds(): ChainId[] {
      if (discovery) {
        return [...discovery.supportedChains];
      }
      if (config.chainOverrides) {
        return Object.keys(config.chainOverrides).map((k) => parseInt(k, 10));
      }
      return [];
    },

    async refreshDiscovery(): Promise<void> {
      if (!blackboxUrl) {
        throw new ConfigError('Cannot refresh discovery: no blackboxUrl configured');
      }
      discovery = await discover(blackboxUrl, {
        cacheTtlMs: config.discoveryCacheTtlMs,
        forceRefresh: true,
        fetch: fetchFn,
      });
      log('Discovery refreshed');
    },
  };

  return sdk;
}

/**
 * Create a CIFER SDK instance synchronously (without discovery).
 *
 * Use this when you have all configuration available and don't need
 * to fetch from /healthz. Requires explicit chain configuration.
 *
 * @param config - SDK configuration (must include readClient)
 * @returns The configured SDK instance
 *
 * @throws {@link ConfigError} When required configuration is missing
 *
 * @example
 * ```typescript
 * const sdk = createCiferSdkSync({
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   readClient: myReadClient,
 *   chainOverrides: {
 *     752025: {
 *       rpcUrl: 'https://mainnet.ternoa.network',
 *       secretsControllerAddress: '0x...',
 *     },
 *   },
 * });
 * ```
 *
 * @public
 */
export function createCiferSdkSync(
  config: CiferSdkConfig & {
    readClient: ReadClient;
  }
): CiferSdk {
  const sdk: CiferSdk = {
    keyManagement: keyManagementNs,
    blackbox: blackboxNs,
    commitments: commitmentsNs,
    flows: flowsNs,

    blackboxUrl: config.blackboxUrl ?? '',
    discovery: null,
    signer: config.signer,
    readClient: config.readClient,

    getControllerAddress(chainId: ChainId): Address {
      const override = config.chainOverrides?.[chainId];
      if (!override?.secretsControllerAddress) {
        throw new ConfigError(
          `No SecretsController address configured for chain ${chainId}`
        );
      }
      return override.secretsControllerAddress;
    },

    getRpcUrl(chainId: ChainId): string {
      const override = config.chainOverrides?.[chainId];
      if (!override?.rpcUrl) {
        throw new ConfigError(`No RPC URL configured for chain ${chainId}`);
      }
      return override.rpcUrl;
    },

    getSupportedChainIds(): ChainId[] {
      if (config.chainOverrides) {
        return Object.keys(config.chainOverrides).map((k) => parseInt(k, 10));
      }
      return [];
    },

    async refreshDiscovery(): Promise<void> {
      throw new ConfigError(
        'Cannot refresh discovery: SDK was created synchronously without blackboxUrl'
      );
    },
  };

  return sdk;
}
