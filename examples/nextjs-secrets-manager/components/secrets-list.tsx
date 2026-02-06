"use client"

/**
 * SecretsList Component
 *
 * Displays all secrets owned by or delegated to the connected wallet.
 *
 * Uses keyManagement.getSecretsByWallet() to fetch:
 * - owned[]: Secret IDs where the wallet is the owner
 * - delegated[]: Secret IDs where the wallet is set as delegate
 *
 * Also uses keyManagement.getSecretsCountByWallet() to show counts
 * in the tab badges (more gas-efficient than fetching full arrays
 * when you only need counts).
 *
 * Each secret in the list can be expanded to show full details
 * via the SecretDetails component.
 */

import { useState, useEffect, useCallback } from "react"
import type { CiferSdk } from "cifer-sdk"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SecretDetails } from "@/components/secret-details"
import type { Account } from "thirdweb/wallets"
import {
  RefreshCw,
  Key,
  Users,
  Loader2,
  ChevronRight,
  Inbox,
} from "lucide-react"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface SecretsListProps {
  sdk: CiferSdk
  account: Account
  chainId: number
  /** Increment this to trigger a refresh from parent */
  refreshTrigger: number
}

type TabType = "owned" | "delegated"

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function SecretsList({
  sdk,
  account,
  chainId,
  refreshTrigger,
}: SecretsListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("owned")
  const [ownedSecrets, setOwnedSecrets] = useState<bigint[]>([])
  const [delegatedSecrets, setDelegatedSecrets] = useState<bigint[]>([])
  const [ownedCount, setOwnedCount] = useState<bigint>(0n)
  const [delegatedCount, setDelegatedCount] = useState<bigint>(0n)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSecretId, setExpandedSecretId] = useState<bigint | null>(null)

  const controllerAddress = sdk.getControllerAddress(chainId)
  const walletAddress = account.address

  // ------------------------------------------------------------------
  // Fetch secrets owned/delegated to this wallet
  // ------------------------------------------------------------------

  const fetchSecrets = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch both the full list and counts in parallel.
      // getSecretsCountByWallet is shown here to demonstrate the function,
      // even though getSecretsByWallet already gives us the arrays.
      const [secrets, counts] = await Promise.all([
        // getSecretsByWallet returns { owned: bigint[], delegated: bigint[] }
        sdk.keyManagement.getSecretsByWallet(
          { chainId, controllerAddress, readClient: sdk.readClient },
          walletAddress as `0x${string}`
        ),
        // getSecretsCountByWallet returns { ownedCount: bigint, delegatedCount: bigint }
        // This is more gas-efficient when you only need counts.
        sdk.keyManagement.getSecretsCountByWallet(
          { chainId, controllerAddress, readClient: sdk.readClient },
          walletAddress as `0x${string}`
        ),
      ])

      setOwnedSecrets(secrets.owned)
      setDelegatedSecrets(secrets.delegated)
      setOwnedCount(counts.ownedCount)
      setDelegatedCount(counts.delegatedCount)

      console.log(
        `[SecretsList] Owned: ${secrets.owned.length}, Delegated: ${secrets.delegated.length}`
      )
    } catch (err) {
      console.error("[SecretsList] Failed to fetch secrets:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch secrets")
    } finally {
      setIsLoading(false)
    }
  }, [sdk, chainId, controllerAddress, walletAddress])

  // Fetch on mount and when chain or refresh trigger changes
  useEffect(() => {
    fetchSecrets()
  }, [fetchSecrets, refreshTrigger])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  const activeSecrets =
    activeTab === "owned" ? ownedSecrets : delegatedSecrets

  return (
    <div className="space-y-4">
      {/* Tab Header with counts */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("owned")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeTab === "owned"
                ? "bg-[#00ff9d] text-zinc-950 font-medium"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            Owned
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "owned"
                  ? "bg-zinc-900/30 text-zinc-950"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {ownedCount.toString()}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("delegated")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeTab === "delegated"
                ? "bg-[#00ff9d] text-zinc-950 font-medium"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Delegated
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "delegated"
                  ? "bg-zinc-900/30 text-zinc-950"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {delegatedCount.toString()}
            </span>
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSecrets}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activeSecrets.length === 0 && (
        <Card className="bg-zinc-900/30 border-zinc-800/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-10 w-10 text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">
              {activeTab === "owned"
                ? "No secrets owned on this chain."
                : "No secrets delegated to you on this chain."}
            </p>
            {activeTab === "owned" && (
              <p className="text-xs text-zinc-600 mt-1">
                Create your first secret above.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Secrets List */}
      {!isLoading &&
        activeSecrets.map((secretId) => (
          <div key={secretId.toString()}>
            {/* Collapsed row */}
            <button
              onClick={() =>
                setExpandedSecretId(
                  expandedSecretId === secretId ? null : secretId
                )
              }
              className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Key className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">
                    Secret #{secretId.toString()}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {activeTab === "owned" ? "Owner" : "Delegate"}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`h-4 w-4 text-zinc-500 transition-transform ${
                  expandedSecretId === secretId ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Expanded details */}
            {expandedSecretId === secretId && (
              <div className="mt-2 ml-4">
                <SecretDetails
                  sdk={sdk}
                  account={account}
                  chainId={chainId}
                  secretId={secretId}
                  isOwner={activeTab === "owned"}
                  onUpdated={fetchSecrets}
                />
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
