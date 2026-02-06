/**
 * @module internal/config/discovery
 * @description Discovery module for fetching blackbox configuration via /healthz
 */

import type { Address, ChainId } from '../../types/common.js';
import type { ChainConfig, DiscoveryResult } from '../../types/config.js';
import { DiscoveryError } from '../errors/index.js';

/**
 * Raw response shape from /healthz endpoint
 */
interface HealthzResponse {
  status: string;
  enclaveWalletAddress: string;
  supportedChains: number[];
  configurations: {
    chains: Array<{
      chainId: number;
      name?: string;
      rpcUrl: string;
      wsRpcUrl?: string;
      secretsControllerAddress: string;
      blockTimeMs?: number;
    }>;
    ipfsGatewayUrl?: string;
  };
}

/**
 * Discovery cache entry
 */
interface CacheEntry {
  result: DiscoveryResult;
  expiresAt: number;
}

/**
 * In-memory cache for discovery results
 */
const discoveryCache = new Map<string, CacheEntry>();

/**
 * Default cache TTL: 5 minutes
 */
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Discover blackbox configuration by calling /healthz
 *
 * This function fetches runtime configuration from the blackbox service,
 * including supported chains, RPC URLs, and contract addresses.
 *
 * Results are cached in memory with a configurable TTL.
 *
 * @param blackboxUrl - Base URL of the blackbox service
 * @param options - Optional configuration
 * @returns Discovery result with chain configurations
 *
 * @example
 * ```typescript
 * const discovery = await discover('https://cifer-blackbox.ternoa.dev:3010');
 *
 * console.log('Supported chains:', discovery.supportedChains);
 * // [752025, 11155111]
 *
 * const ternoaConfig = discovery.chains.find(c => c.chainId === 752025);
 * console.log('Ternoa RPC:', ternoaConfig?.rpcUrl);
 * ```
 */
export async function discover(
  blackboxUrl: string,
  options?: {
    /** Cache TTL in milliseconds (default: 5 minutes) */
    cacheTtlMs?: number;
    /** Force refresh, bypassing cache */
    forceRefresh?: boolean;
    /** Custom fetch implementation */
    fetch?: typeof fetch;
  }
): Promise<DiscoveryResult> {
  const cacheTtlMs = options?.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  const forceRefresh = options?.forceRefresh ?? false;
  const fetchFn = options?.fetch ?? fetch;

  // Normalize URL (remove trailing slash)
  const normalizedUrl = blackboxUrl.replace(/\/$/, '');
  const cacheKey = normalizedUrl;

  // Check cache
  if (!forceRefresh) {
    const cached = discoveryCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.result;
    }
  }

  // Fetch from blackbox
  const healthzUrl = `${normalizedUrl}/healthz`;

  let response: Response;
  try {
    response = await fetchFn(healthzUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (error) {
    throw new DiscoveryError(
      `Failed to connect to blackbox at ${healthzUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      blackboxUrl,
      error instanceof Error ? error : undefined
    );
  }

  if (!response.ok) {
    throw new DiscoveryError(
      `Discovery failed with status ${response.status}: ${response.statusText}`,
      blackboxUrl
    );
  }

  let data: HealthzResponse;
  try {
    data = (await response.json()) as HealthzResponse;
  } catch (error) {
    throw new DiscoveryError(
      'Failed to parse discovery response as JSON',
      blackboxUrl,
      error instanceof Error ? error : undefined
    );
  }

  // Normalize the response
  const result: DiscoveryResult = {
    status: data.status,
    enclaveWalletAddress: data.enclaveWalletAddress as Address,
    supportedChains: data.supportedChains,
    chains: data.configurations.chains.map(
      (chain): ChainConfig => ({
        chainId: chain.chainId,
        name: chain.name,
        rpcUrl: chain.rpcUrl,
        wsRpcUrl: chain.wsRpcUrl,
        secretsControllerAddress: chain.secretsControllerAddress as Address,
        blockTimeMs: chain.blockTimeMs,
      })
    ),
    ipfsGatewayUrl: data.configurations.ipfsGatewayUrl,
    fetchedAt: Date.now(),
  };

  // Cache the result
  discoveryCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + cacheTtlMs,
  });

  return result;
}

/**
 * Clear the discovery cache
 *
 * @param blackboxUrl - If provided, only clear cache for this URL. Otherwise clear all.
 */
export function clearDiscoveryCache(blackboxUrl?: string): void {
  if (blackboxUrl) {
    const normalizedUrl = blackboxUrl.replace(/\/$/, '');
    discoveryCache.delete(normalizedUrl);
  } else {
    discoveryCache.clear();
  }
}

/**
 * Get supported chain IDs from discovery result
 */
export function getSupportedChainIds(discovery: DiscoveryResult): ChainId[] {
  return [...discovery.supportedChains];
}

/**
 * Check if a chain ID is supported
 */
export function isChainSupported(
  discovery: DiscoveryResult,
  chainId: ChainId
): boolean {
  return discovery.supportedChains.includes(chainId);
}
