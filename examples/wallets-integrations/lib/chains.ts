/**
 * Chain metadata for display purposes.
 *
 * The CIFER SDK's discovery does not include native currency information,
 * so we maintain a hardcoded map of chain IDs to their human-readable
 * name and native token symbol.
 *
 * Add more chains here as CIFER expands support.
 */

// ---------------------------------------------------------------------------
// Chain metadata map: chainId → { name, currency }
// ---------------------------------------------------------------------------

export const CHAIN_META: Record<number, { name: string; currency: string }> = {
  1:        { name: "Ethereum",   currency: "ETH"  },
  11155111: { name: "Sepolia",    currency: "ETH"  },
  752025:   { name: "Ternoa",     currency: "CAPS" },
  137:      { name: "Polygon",    currency: "POL"  },
  42161:    { name: "Arbitrum",   currency: "ETH"  },
  10:       { name: "Optimism",   currency: "ETH"  },
  8453:     { name: "Base",       currency: "ETH"  },
  43114:    { name: "Avalanche",  currency: "AVAX" },
  56:       { name: "BNB Chain",  currency: "BNB"  },
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Get the display name for a chain ID.
 * Falls back to "Chain <id>" for unknown chains.
 */
export function getChainName(chainId: number): string {
  return CHAIN_META[chainId]?.name ?? `Chain ${chainId}`
}

/**
 * Get the native currency symbol for a chain ID.
 * Falls back to "ETH" for unknown chains (most common default).
 */
export function getChainCurrency(chainId: number): string {
  return CHAIN_META[chainId]?.currency ?? "ETH"
}
