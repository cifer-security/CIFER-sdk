/**
 * @module internal/config
 * @description Configuration and discovery module
 */

export {
  discover,
  clearDiscoveryCache,
  getSupportedChainIds,
  isChainSupported,
} from './discovery.js';

export {
  resolveChain,
  resolveAllChains,
  getRpcUrl,
  getSecretsControllerAddress,
  estimateBlockFreshnessWindow,
} from './resolver.js';
