"use client"

/**
 * SecretDetails Component
 *
 * Displays the full state of a single secret and provides action buttons.
 *
 * Demonstrates the following keyManagement read functions:
 * - getSecret(): Fetches the complete SecretState (owner, delegate, isSyncing, etc.)
 * - getSecretOwner(): Fetches just the owner address
 * - getDelegate(): Fetches just the delegate address
 * - isSecretReady(): Checks if the secret is ready for use
 * - isAuthorized(): Checks if an address is authorized (owner or delegate)
 *
 * For owned secrets, provides action forms:
 * - DelegateForm: Set or remove delegate (buildSetDelegateTx / buildRemoveDelegationTx)
 * - TransferForm: Transfer ownership (buildTransferSecretTx)
 */

import { useState, useEffect, useCallback } from "react"
import type { CiferSdk } from "cifer-sdk"
import type { Account } from "thirdweb/wallets"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DelegateForm } from "@/components/delegate-form"
import { TransferForm } from "@/components/transfer-form"
import { truncateAddress } from "@/lib/utils"
import {
  Loader2,
  CheckCircle,
  Clock,
  Shield,
  User,
  Users,
  Globe,
  RefreshCw,
  XCircle,
} from "lucide-react"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface SecretDetailsProps {
  sdk: CiferSdk
  account: Account
  chainId: number
  secretId: bigint
  /** Whether the connected wallet owns this secret */
  isOwner: boolean
  /** Callback when an action modifies the secret (delegate change, transfer) */
  onUpdated: () => void
}

/**
 * SecretState shape from the SDK
 */
interface SecretState {
  owner: string
  delegate: string
  isSyncing: boolean
  clusterId: number
  secretType: number
  publicKeyCid: string
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function SecretDetails({
  sdk,
  account,
  chainId,
  secretId,
  isOwner,
  onUpdated,
}: SecretDetailsProps) {
  const [state, setState] = useState<SecretState | null>(null)
  const [isReady, setIsReady] = useState<boolean | null>(null)
  const [isAuthorizedResult, setIsAuthorizedResult] = useState<boolean | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDelegateForm, setShowDelegateForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)

  const controllerAddress = sdk.getControllerAddress(chainId)
  const readParams = { chainId, controllerAddress, readClient: sdk.readClient }

  // ------------------------------------------------------------------
  // Fetch full secret details
  // ------------------------------------------------------------------

  const fetchDetails = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all details in parallel to demonstrate multiple read functions:
      //
      // 1. getSecret() - Returns the full SecretState struct
      // 2. isSecretReady() - Convenience check: !isSyncing && publicKeyCid != ""
      // 3. isAuthorized() - Checks if the connected wallet is owner or delegate
      //
      // Note: getSecretOwner() and getDelegate() return individual fields,
      // but we already get them from getSecret(). They're shown here for
      // demonstration purposes in the console logs.

      const [secretState, ready, authorized] = await Promise.all([
        sdk.keyManagement.getSecret(readParams, secretId),
        sdk.keyManagement.isSecretReady(readParams, secretId),
        sdk.keyManagement.isAuthorized(
          readParams,
          secretId,
          account.address as `0x${string}`
        ),
      ])

      // Also call getSecretOwner and getDelegate individually to demonstrate them
      // (the data is the same as in secretState, but these are separate SDK functions)
      const [owner, delegate] = await Promise.all([
        sdk.keyManagement.getSecretOwner(readParams, secretId),
        sdk.keyManagement.getDelegate(readParams, secretId),
      ])

      console.log(`[SecretDetails] Secret #${secretId}:`)
      console.log(`  Owner (getSecretOwner): ${owner}`)
      console.log(`  Delegate (getDelegate): ${delegate}`)
      console.log(`  isSyncing: ${secretState.isSyncing}`)
      console.log(`  isSecretReady: ${ready}`)
      console.log(`  isAuthorized: ${authorized}`)
      console.log(`  publicKeyCid: ${secretState.publicKeyCid}`)

      setState(secretState)
      setIsReady(ready)
      setIsAuthorizedResult(authorized)
    } catch (err) {
      console.error("[SecretDetails] Failed to fetch:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch details")
    } finally {
      setIsLoading(false)
    }
  }, [sdk, chainId, controllerAddress, secretId, account.address])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/30 border-zinc-800/50">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-900/10 border-red-800/30">
        <CardContent>
          <p className="text-sm text-red-300">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!state) return null

  const hasDelegate =
    state.delegate !== "0x0000000000000000000000000000000000000000"

  return (
    <Card className="bg-zinc-900/30 border-zinc-800/50">
      <CardContent className="space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">
            Secret #{secretId.toString()} Details
          </h4>
          <Button variant="ghost" size="sm" onClick={fetchDetails}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Ready/Syncing Badge */}
          {isReady ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d]">
              <CheckCircle className="h-3 w-3" />
              Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-900/20 border border-yellow-800/30 text-yellow-400">
              <Clock className="h-3 w-3" />
              Syncing
            </span>
          )}

          {/* Authorization Badge */}
          {isAuthorizedResult ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d]">
              <Shield className="h-3 w-3" />
              Authorized
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700 text-zinc-500">
              <XCircle className="h-3 w-3" />
              Not Authorized
            </span>
          )}

          {/* Secret Type Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700 text-zinc-400">
            Type: ML-KEM-768
          </span>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Owner */}
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <User className="h-3 w-3 text-zinc-500" />
              <span className="text-xs text-zinc-500">Owner</span>
            </div>
            <p className="text-xs font-mono text-zinc-300">
              {truncateAddress(state.owner, 6)}
            </p>
          </div>

          {/* Delegate */}
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3 w-3 text-zinc-500" />
              <span className="text-xs text-zinc-500">Delegate</span>
            </div>
            <p className="text-xs font-mono text-zinc-300">
              {hasDelegate ? truncateAddress(state.delegate, 6) : "None"}
            </p>
          </div>

          {/* Cluster ID */}
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="h-3 w-3 text-zinc-500" />
              <span className="text-xs text-zinc-500">Cluster ID</span>
            </div>
            <p className="text-xs font-mono text-zinc-300">
              {state.clusterId}
            </p>
          </div>

          {/* Public Key CID */}
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="h-3 w-3 text-zinc-500" />
              <span className="text-xs text-zinc-500">Public Key CID</span>
            </div>
            <p className="text-xs font-mono text-zinc-300 truncate">
              {state.publicKeyCid || "N/A (syncing)"}
            </p>
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="space-y-3 pt-2 border-t border-zinc-800/50">
            <p className="text-xs text-zinc-500 font-medium">Owner Actions</p>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDelegateForm(!showDelegateForm)
                  setShowTransferForm(false)
                }}
              >
                <Users className="h-3 w-3" />
                {hasDelegate ? "Change Delegate" : "Set Delegate"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTransferForm(!showTransferForm)
                  setShowDelegateForm(false)
                }}
              >
                <User className="h-3 w-3" />
                Transfer
              </Button>
            </div>

            {/* Delegate Form */}
            {showDelegateForm && (
              <DelegateForm
                sdk={sdk}
                account={account}
                chainId={chainId}
                secretId={secretId}
                currentDelegate={hasDelegate ? state.delegate : null}
                onSuccess={() => {
                  setShowDelegateForm(false)
                  fetchDetails()
                  onUpdated()
                }}
              />
            )}

            {/* Transfer Form */}
            {showTransferForm && (
              <TransferForm
                sdk={sdk}
                account={account}
                chainId={chainId}
                secretId={secretId}
                onSuccess={() => {
                  setShowTransferForm(false)
                  fetchDetails()
                  onUpdated()
                }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
