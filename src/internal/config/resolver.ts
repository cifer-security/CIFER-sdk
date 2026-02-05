/**
 * @module internal/config/resolver
 * @description Chain configuration resolver with override support
 */

import type { ChainId } from '../../types/common.js';
import type {
  ChainConfig,
  DiscoveryResult,
  ResolvedChainConfig,
} from '../../types/config.js';
import { ChainNotSupportedError, ConfigError } from '../errors/index.js';

/**
 * Resolve chain configuration by merging discovery with overrides
 *
 * Resolution priority (highest to lowest):
 * 1. Explicit overrides
 * 2. Discovery result
 *
 * @param chainId - The chain ID to resolve configuration for
 * @param discovery - Discovery result (can be null for override-only mode)
 * @param overrides - Optional chain configuration overrides
 * @returns Resolved chain configuration
 *
 * @example
 * ```typescript
 * // With discovery
 * const config = resolveChain(752025, discovery);
 *
 * // With overrides
 * const config = resolveChain(752025, discovery, {
 *   rpcUrl: 'https://my-private-rpc.example.com',
 * });
 *
 * // Override-only (no discovery)
 * const config = resolveChain(752025, null, {
 *   rpcUrl: 'https://my-rpc.example.com',
 *   secretsControllerAddress: '0x...',
 * });
 * ```
 */
export function resolveChain(
  chainId: ChainId,
  discovery: DiscoveryResult | null,
  overrides?: Partial<ChainConfig>
): ResolvedChainConfig {
  // Find chain in discovery
  const discoveryChain = discovery?.chains.find((c) => c.chainId === chainId);

  // If no discovery and no complete overrides, error
  if (!discoveryChain && !overrides) {
    throw new ChainNotSupportedError(chainId);
  }

  // Start with discovery or empty base
  const base: Partial<ChainConfig> = discoveryChain ?? { chainId };

  // Merge with overrides
  const merged: Partial<ChainConfig> = {
    ...base,
    ...overrides,
    chainId, // Always use the requested chainId
  };

  // Validate required fields
  if (!merged.rpcUrl) {
    throw new ConfigError(
      `No RPC URL configured for chain ${chainId}. ` +
        'Either provide via discovery or chainOverrides.'
    );
  }

  if (!merged.secretsControllerAddress) {
    throw new ConfigError(
      `No SecretsController address configured for chain ${chainId}. ` +
        'Either provide via discovery or chainOverrides.'
    );
  }

  return {
    chainId,
    name: merged.name,
    rpcUrl: merged.rpcUrl,
    wsRpcUrl: merged.wsRpcUrl,
    secretsControllerAddress: merged.secretsControllerAddress,
    blockTimeMs: merged.blockTimeMs,
    fromDiscovery: !!discoveryChain,
  };
}

/**
 * Resolve all chains from discovery, applying overrides
 */
export function resolveAllChains(
  discovery: DiscoveryResult,
  overrides?: Record<ChainId, Partial<ChainConfig>>
): Map<ChainId, ResolvedChainConfig> {
  const result = new Map<ChainId, ResolvedChainConfig>();

  // Add all discovery chains
  for (const chainId of discovery.supportedChains) {
    const override = overrides?.[chainId];
    result.set(chainId, resolveChain(chainId, discovery, override));
  }

  // Add any override-only chains
  if (overrides) {
    for (const [chainIdStr, override] of Object.entries(overrides)) {
      const chainId = parseInt(chainIdStr, 10);
      if (!result.has(chainId) && override.rpcUrl && override.secretsControllerAddress) {
        result.set(chainId, {
          chainId,
          name: override.name,
          rpcUrl: override.rpcUrl,
          wsRpcUrl: override.wsRpcUrl,
          secretsControllerAddress: override.secretsControllerAddress,
          blockTimeMs: override.blockTimeMs,
          fromDiscovery: false,
        });
      }
    }
  }

  return result;
}

/**
 * Get the RPC URL for a chain
 */
export function getRpcUrl(
  chainId: ChainId,
  discovery: DiscoveryResult | null,
  overrides?: Record<ChainId, Partial<ChainConfig>>
): string {
  const config = resolveChain(chainId, discovery, overrides?.[chainId]);
  return config.rpcUrl;
}

/**
 * Get the SecretsController address for a chain
 */
export function getSecretsControllerAddress(
  chainId: ChainId,
  discovery: DiscoveryResult | null,
  overrides?: Record<ChainId, Partial<ChainConfig>>
): string {
  const config = resolveChain(chainId, discovery, overrides?.[chainId]);
  return config.secretsControllerAddress;
}

/**
 * Estimate block freshness window based on block time
 * Default: 10 minutes worth of blocks
 */
export function estimateBlockFreshnessWindow(
  blockTimeMs: number = 6000
): number {
  const tenMinutesMs = 10 * 60 * 1000;
  return Math.ceil(tenMinutesMs / blockTimeMs);
}
