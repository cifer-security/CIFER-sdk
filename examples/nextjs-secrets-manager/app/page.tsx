"use client"

/**
 * Main page of the Secrets Manager example.
 *
 * This is a single-page app with two states:
 * 1. Disconnected: Shows the ConnectWallet landing screen
 * 2. Connected: Shows the SecretsManager dashboard
 *
 * The page uses Thirdweb hooks to detect wallet connection status
 * and the CIFER SDK context for chain/secret management.
 */

import { useActiveAccount } from "thirdweb/react"
import { ConnectWallet } from "@/components/connect-wallet"
import { SecretsManager } from "@/components/secrets-manager"
import { useCiferSdk } from "@/lib/cifer-sdk-context"

export default function HomePage() {
  // Get the currently connected Thirdweb account (null if disconnected)
  const account = useActiveAccount()

  // Get the CIFER SDK instance and its loading state
  const { sdk, isLoading: sdkLoading, error: sdkError } = useCiferSdk()

  // ------------------------------------------------------------------
  // State 1: SDK is loading (performing discovery)
  // ------------------------------------------------------------------
  if (sdkLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff9d] mx-auto" />
          <p className="text-sm text-zinc-400">Initializing CIFER SDK...</p>
          <p className="text-xs text-zinc-600">
            Discovering supported chains...
          </p>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // State 2: SDK failed to initialize
  // ------------------------------------------------------------------
  if (sdkError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-full bg-red-900/20 border border-red-800 flex items-center justify-center mx-auto">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            SDK Initialization Failed
          </h2>
          <p className="text-sm text-zinc-400">{sdkError.message}</p>
          <p className="text-xs text-zinc-600">
            Check that the Blackbox URL is correct and reachable.
          </p>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // State 3: No wallet connected — show connect screen
  // ------------------------------------------------------------------
  if (!account) {
    return <ConnectWallet />
  }

  // ------------------------------------------------------------------
  // State 4: Wallet connected + SDK ready — show secrets manager
  // ------------------------------------------------------------------
  return <SecretsManager account={account} sdk={sdk!} />
}
