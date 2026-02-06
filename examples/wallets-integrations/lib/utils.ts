import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to merge Tailwind CSS class names with conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncate an Ethereum address for display (e.g. 0x1234...abcd)
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ""
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format a bigint wei value to a human-readable string with units.
 * Shows value in ETH/CAPS with up to 6 decimal places.
 */
export function formatWei(wei: bigint): string {
  const eth = Number(wei) / 1e18
  if (eth === 0) return "0"
  if (eth < 0.000001) return `${wei.toString()} wei`
  return `${eth.toFixed(6).replace(/\.?0+$/, "")}`
}
