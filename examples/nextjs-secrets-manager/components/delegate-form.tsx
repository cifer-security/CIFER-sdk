"use client"

/**
 * DelegateForm Component
 *
 * Allows the owner of a secret to set or remove a delegate.
 *
 * A delegate is an address that is authorized to encrypt/decrypt
 * with the secret's key pair, but cannot transfer ownership or
 * modify the delegate themselves.
 *
 * Demonstrates two keyManagement functions:
 * - buildSetDelegateTx(secretId, delegateAddress): Sets a new delegate
 * - buildRemoveDelegationTx(secretId): Removes the current delegate
 *
 * Both return TxIntent objects that are executed via Thirdweb.
 */

import { useState } from "react"
import type { CiferSdk } from "cifer-sdk"
import type { Account } from "thirdweb/wallets"
import { Button } from "@/components/ui/button"
import { thirdwebClient } from "@/lib/thirdweb-client"
import { executeTxIntent } from "@/lib/tx-executor"
import { Loader2, UserPlus, UserMinus } from "lucide-react"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface DelegateFormProps {
  sdk: CiferSdk
  account: Account
  chainId: number
  secretId: bigint
  /** Current delegate address, or null if none is set */
  currentDelegate: string | null
  /** Callback after successful delegate change */
  onSuccess: () => void
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function DelegateForm({
  sdk,
  account,
  chainId,
  secretId,
  currentDelegate,
  onSuccess,
}: DelegateFormProps) {
  const [delegateAddress, setDelegateAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const controllerAddress = sdk.getControllerAddress(chainId)

  // ------------------------------------------------------------------
  // Set Delegate
  // ------------------------------------------------------------------

  /**
   * Set a new delegate for the secret.
   *
   * buildSetDelegateTx() creates a TxIntent that calls the contract's
   * setDelegate(secretId, delegateAddress) function.
   */
  const handleSetDelegate = async () => {
    if (!delegateAddress) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Build the setDelegate transaction intent
      // All tx-builders take a single params object
      const txIntent = sdk.keyManagement.buildSetDelegateTx({
        chainId,
        controllerAddress,
        secretId,
        newDelegate: delegateAddress as `0x${string}`,
      })

      console.log("[DelegateForm] Setting delegate:", delegateAddress)
      console.log("[DelegateForm] TxIntent:", txIntent.description)

      // Execute the transaction via Thirdweb
      const receipt = await executeTxIntent(account, txIntent, thirdwebClient)
      console.log("[DelegateForm] Delegate set! Tx:", receipt.transactionHash)

      setDelegateAddress("")
      onSuccess()
    } catch (err) {
      console.error("[DelegateForm] Failed to set delegate:", err)
      setError(err instanceof Error ? err.message : "Failed to set delegate")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ------------------------------------------------------------------
  // Remove Delegate
  // ------------------------------------------------------------------

  /**
   * Remove the current delegate from the secret.
   *
   * buildRemoveDelegationTx() creates a TxIntent that calls the contract's
   * removeDelegate(secretId) function, setting the delegate to address(0).
   */
  const handleRemoveDelegate = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Build the removeDelegate transaction intent
      // Sets the delegate to address(0), effectively removing delegation
      const txIntent = sdk.keyManagement.buildRemoveDelegationTx({
        chainId,
        controllerAddress,
        secretId,
      })

      console.log("[DelegateForm] Removing delegate...")
      console.log("[DelegateForm] TxIntent:", txIntent.description)

      // Execute the transaction via Thirdweb
      const receipt = await executeTxIntent(account, txIntent, thirdwebClient)
      console.log(
        "[DelegateForm] Delegate removed! Tx:",
        receipt.transactionHash
      )

      onSuccess()
    } catch (err) {
      console.error("[DelegateForm] Failed to remove delegate:", err)
      setError(
        err instanceof Error ? err.message : "Failed to remove delegate"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="space-y-3 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
      <h5 className="text-xs font-medium text-zinc-400">
        Manage Delegate — Secret #{secretId.toString()}
      </h5>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-900/10 p-2 rounded">
          {error}
        </p>
      )}

      {/* Set Delegate */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">
          Delegate Address (0x...)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="0x..."
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
            className="
              flex-1 bg-zinc-900 border border-zinc-800 rounded-lg
              px-3 py-2 text-sm text-white font-mono
              placeholder:text-zinc-600
              focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
              transition-colors
            "
            disabled={isSubmitting}
          />
          <Button
            variant="accent"
            size="sm"
            onClick={handleSetDelegate}
            disabled={!delegateAddress || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-3 w-3" />
                Set
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Remove Delegate */}
      {currentDelegate && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <p className="text-xs text-zinc-500">
            Current: <code className="text-zinc-400">{currentDelegate}</code>
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveDelegate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <UserMinus className="h-3 w-3" />
                Remove
              </>
            )}
          </Button>
        </div>
      )}

      {/* Code hint */}
      <div className="p-2 bg-zinc-950 rounded border border-zinc-800/50">
        <p className="text-[10px] text-zinc-600 font-mono">
          {`// Set delegate:`}
          <br />
          {`keyManagement.buildSetDelegateTx({chainId, controllerAddress}, secretId, delegateAddr)`}
          <br />
          {`// Remove delegate:`}
          <br />
          {`keyManagement.buildRemoveDelegationTx({chainId, controllerAddress}, secretId)`}
        </p>
      </div>
    </div>
  )
}
