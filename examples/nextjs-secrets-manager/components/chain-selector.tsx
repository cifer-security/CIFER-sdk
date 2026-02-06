"use client"

/**
 * ChainSelector Component
 *
 * Dropdown to select the active blockchain network from the list
 * of chains supported by the CIFER Blackbox.
 *
 * The supported chains come from sdk.getSupportedChainIds(), which
 * are populated during SDK discovery from the Blackbox /healthz endpoint.
 *
 * Each chain has:
 * - A chain ID (e.g. 752025 for Ternoa, 11155111 for Sepolia)
 * - An RPC URL (from discovery)
 * - A SecretsController contract address (from discovery)
 */

import { useMemo } from "react"
import { ChevronDown } from "lucide-react"

// ------------------------------------------------------------------
// Known chain names for display purposes
// ------------------------------------------------------------------

/**
 * Map of chain IDs to human-readable names.
 * Add more chains here as CIFER expands support.
 */
const CHAIN_NAMES: Record<number, string> = {
  752025: "Ternoa",
  11155111: "Sepolia",
  1: "Ethereum",
  137: "Polygon",
  42161: "Arbitrum",
  10: "Optimism",
  8453: "Base",
  43114: "Avalanche",
  56: "BNB Chain",
}

/**
 * Get a display name for a chain ID.
 * Falls back to "Chain <id>" for unknown chains.
 */
function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

interface ChainSelectorProps {
  /** List of supported chain IDs (from sdk.getSupportedChainIds()) */
  chainIds: number[]
  /** Currently selected chain ID */
  selectedChainId: number
  /** Callback when the user selects a different chain */
  onChainChange: (chainId: number) => void
}

export function ChainSelector({
  chainIds,
  selectedChainId,
  onChainChange,
}: ChainSelectorProps) {
  // Sort chains with Ternoa first (primary chain), then alphabetically
  const sortedChains = useMemo(() => {
    return [...chainIds].sort((a, b) => {
      if (a === 752025) return -1
      if (b === 752025) return 1
      return getChainName(a).localeCompare(getChainName(b))
    })
  }, [chainIds])

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-zinc-500 mb-1.5">
        Network
      </label>
      <div className="relative">
        <select
          value={selectedChainId}
          onChange={(e) => onChainChange(Number(e.target.value))}
          className="
            w-full appearance-none
            bg-zinc-900 border border-zinc-800 rounded-lg
            px-3 py-2 pr-8
            text-sm text-white
            hover:border-zinc-600
            focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
            transition-colors cursor-pointer
          "
        >
          {sortedChains.map((chainId) => (
            <option key={chainId} value={chainId}>
              {getChainName(chainId)} ({chainId})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  )
}
