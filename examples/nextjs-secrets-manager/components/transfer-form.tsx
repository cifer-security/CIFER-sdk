"use client"

/**
 * TransferForm Component
 *
 * Allows the owner of a secret to transfer ownership to a new address.
 *
 * This is an irreversible action — once transferred, the original owner
 * loses all control over the secret.
 *
 * Demonstrates the keyManagement function:
 * - buildTransferSecretTx(secretId, newOwnerAddress): Builds a TxIntent
 *   that calls the contract's transferSecret() function.
 *
 * The new owner will be able to:
 * - Set/remove delegates
 * - Transfer ownership again
 * - Encrypt/decrypt using the secret's key pair
 */

import { useState } from "react"
import type { CiferSdk } from "cifer-sdk"
import type { Account } from "thirdweb/wallets"
import { Button } from "@/components/ui/button"
import { thirdwebClient } from "@/lib/thirdweb-client"
import { executeTxIntent } from "@/lib/tx-executor"
import { Loader2, ArrowRight, AlertTriangle } from "lucide-react"

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface TransferFormProps {
  sdk: CiferSdk
  account: Account
  chainId: number
  secretId: bigint
  /** Callback after successful transfer */
  onSuccess: () => void
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function TransferForm({
  sdk,
  account,
  chainId,
  secretId,
  onSuccess,
}: TransferFormProps) {
  const [newOwner, setNewOwner] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const controllerAddress = sdk.getControllerAddress(chainId)

  // ------------------------------------------------------------------
  // Transfer Ownership
  // ------------------------------------------------------------------

  /**
   * Transfer the secret to a new owner.
   *
   * buildTransferSecretTx() creates a TxIntent that calls the contract's
   * transferSecret(secretId, newOwner) function.
   *
   * Important: This action is irreversible. The original owner will
   * lose all control over the secret.
   */
  const handleTransfer = async () => {
    if (!newOwner || !confirmed) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Build the transfer transaction intent
      // All tx-builders take a single params object
      const txIntent = sdk.keyManagement.buildTransferSecretTx({
        chainId,
        controllerAddress,
        secretId,
        newOwner: newOwner as `0x${string}`,
      })

      console.log("[TransferForm] Transferring secret to:", newOwner)
      console.log("[TransferForm] TxIntent:", txIntent.description)

      // Execute the transaction via Thirdweb
      const receipt = await executeTxIntent(account, txIntent, thirdwebClient)
      console.log(
        "[TransferForm] Transfer complete! Tx:",
        receipt.transactionHash
      )

      setNewOwner("")
      setConfirmed(false)
      onSuccess()
    } catch (err) {
      console.error("[TransferForm] Transfer failed:", err)
      setError(err instanceof Error ? err.message : "Failed to transfer")
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
        Transfer Ownership — Secret #{secretId.toString()}
      </h5>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-yellow-900/10 border border-yellow-800/30 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300/80 leading-relaxed">
          Transferring ownership is <strong>irreversible</strong>. You will lose
          all control over this secret, including the ability to set delegates
          or transfer it again.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-900/10 p-2 rounded">
          {error}
        </p>
      )}

      {/* New Owner Address */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">
          New Owner Address (0x...)
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={newOwner}
          onChange={(e) => {
            setNewOwner(e.target.value)
            setConfirmed(false)
          }}
          className="
            w-full bg-zinc-900 border border-zinc-800 rounded-lg
            px-3 py-2 text-sm text-white font-mono
            placeholder:text-zinc-600
            focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
            transition-colors
          "
          disabled={isSubmitting}
        />
      </div>

      {/* Confirmation Checkbox */}
      {newOwner && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-900 text-[#00ff9d] focus:ring-[#00ff9d]/30"
          />
          <span className="text-xs text-zinc-400">
            I understand this action is irreversible
          </span>
        </label>
      )}

      {/* Transfer Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={handleTransfer}
        disabled={!newOwner || !confirmed || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Transferring...
          </>
        ) : (
          <>
            <ArrowRight className="h-3 w-3" />
            Transfer Ownership
          </>
        )}
      </Button>

      {/* Code hint */}
      <div className="p-2 bg-zinc-950 rounded border border-zinc-800/50">
        <p className="text-[10px] text-zinc-600 font-mono">
          {`// Transfer ownership:`}
          <br />
          {`keyManagement.buildTransferSecretTx({chainId, controllerAddress}, secretId, newOwner)`}
        </p>
      </div>
    </div>
  )
}
