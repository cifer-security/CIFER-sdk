/**
 * Remove Delegation — Thirdweb
 * =============================
 *
 * This component demonstrates the buildRemoveDelegationTx() SDK function:
 *   1. Build a transaction intent via keyManagement.buildRemoveDelegationTx()
 *   2. Send the transaction using Thirdweb's Account
 *
 * buildRemoveDelegationTx is a convenience wrapper around buildSetDelegateTx
 * that sets the delegate to the zero address (0x000...000), effectively
 * removing any existing delegation.
 *
 * SDK function used:
 *   keyManagement.buildRemoveDelegationTx({ chainId, controllerAddress, secretId })
 */

"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Loader2, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Thirdweb imports — used to send the transaction
// ---------------------------------------------------------------------------
import {
  createThirdwebClient,
  prepareTransaction,
  sendTransaction,
  waitForReceipt,
} from "thirdweb"
import { defineChain } from "thirdweb/chains"
import type { Account } from "thirdweb/wallets"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { keyManagement, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// Thirdweb client (reuse the same client ID as the page)
// ---------------------------------------------------------------------------
const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
})

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RemoveDelegationProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The Thirdweb Account (from useActiveAccount) — used to send the tx */
  account: Account
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function RemoveDelegation({ sdk, chainId, account, log }: RemoveDelegationProps) {
  // ---- Local state ----
  const [secretId, setSecretId] = useState<string>("")
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")

  // =========================================================================
  // Build the TxIntent and send it via Thirdweb
  // =========================================================================
  const handleRemove = useCallback(async () => {
    if (!secretId) return

    try {
      setIsSending(true)
      setError("")
      setTxHash("")

      log(`Building removeDelegation tx for secret #${secretId}...`)

      // Step 1: Build the transaction intent using the SDK
      const controllerAddress = sdk.getControllerAddress(chainId)
      const txIntent = keyManagement.buildRemoveDelegationTx({
        chainId,
        controllerAddress,
        secretId: BigInt(secretId),
      })

      log(`TxIntent built: ${txIntent.description}`)
      log(`  to: ${txIntent.to}`)

      // Step 2: Send via Thirdweb
      const chain = defineChain(chainId)
      const tx = prepareTransaction({
        to: txIntent.to as `0x${string}`,
        data: txIntent.data as `0x${string}`,
        value: txIntent.value ?? 0n,
        chain,
        client: thirdwebClient,
      })

      log("Sending transaction via Thirdweb...")
      const result = await sendTransaction({ transaction: tx, account })

      log(`Transaction sent! Hash: ${result.transactionHash}`)

      // Wait for confirmation
      log("Waiting for confirmation...")
      const receipt = await waitForReceipt({
        transactionHash: result.transactionHash,
        chain,
        client: thirdwebClient,
      })

      setTxHash(receipt.transactionHash)
      log(`Transaction confirmed! Status: ${receipt.status}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsSending(false)
    }
  }, [sdk, chainId, account, secretId, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          buildRemoveDelegationTx
        </span>
        {txHash ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Remove Delegation
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Remove the delegate from a secret by setting it to the zero address.
        Convenience wrapper around{" "}
        <code className="text-zinc-300 font-mono text-xs">buildSetDelegateTx</code>.
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`const txIntent = keyManagement.buildRemoveDelegationTx({`}
        <br />
        {`  chainId, controllerAddress, secretId,`}
        <br />
        {`});`}
        <br />
        <br />
        {`// Send via Thirdweb`}
        <br />
        {`const tx = prepareTransaction({`}
        <br />
        {`  to: txIntent.to, data: txIntent.data, chain, client,`}
        <br />
        {`});`}
        <br />
        {`const result = await sendTransaction({ transaction: tx, account });`}
      </div>

      {/* Form input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Secret ID
        </label>
        <input
          type="number"
          value={secretId}
          onChange={(e) => setSecretId(e.target.value)}
          placeholder="e.g. 123"
          className="
            w-full bg-zinc-900 border border-zinc-800 rounded-lg
            px-3 py-2 text-sm text-white placeholder-zinc-600
            focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
            transition-colors
          "
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {/* Tx result */}
      {txHash ? (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
          <p className="text-xs text-zinc-500 mb-1">Transaction Hash</p>
          <p className="text-xs font-mono text-[#00ff9d] break-all">
            {txHash}
          </p>
        </div>
      ) : null}

      {/* Send button */}
      <Button
        variant="accent"
        onClick={handleRemove}
        disabled={isSending || !secretId}
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <UserMinus className="h-4 w-4" />
            Remove Delegation
          </>
        )}
      </Button>
    </div>
  )
}
