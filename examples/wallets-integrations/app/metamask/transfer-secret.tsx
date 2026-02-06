/**
 * Transfer Secret — MetaMask
 * ===========================
 *
 * This component demonstrates the buildTransferSecretTx() SDK function:
 *   1. Build a transaction intent via keyManagement.buildTransferSecretTx()
 *   2. Send the transaction using MetaMask's window.ethereum (EIP-1193)
 *
 * Transferring a secret changes its owner. If the secret has a delegate,
 * the delegation is cleared upon transfer.
 *
 * Only the current owner can transfer a secret.
 *
 * SDK function used:
 *   keyManagement.buildTransferSecretTx({ chainId, controllerAddress, secretId, newOwner })
 */

"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Loader2, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { truncateAddress } from "@/lib/utils"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { keyManagement, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TransferSecretProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The connected wallet address (used as `from` in the tx) */
  address: string
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function TransferSecret({ sdk, chainId, address, log }: TransferSecretProps) {
  // ---- Local state ----
  const [secretId, setSecretId] = useState<string>("")
  const [newOwner, setNewOwner] = useState<string>("")
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")

  // =========================================================================
  // Build the TxIntent and send it via MetaMask
  //
  // keyManagement.buildTransferSecretTx() returns a TxIntent that calls
  // transferSecret(secretId, newOwner) on the SecretsController.
  //
  // The delegation is cleared upon transfer.
  // =========================================================================
  const handleTransfer = useCallback(async () => {
    if (!secretId || !newOwner) return
    if (!window.ethereum) {
      setError("MetaMask not found")
      return
    }

    try {
      setIsSending(true)
      setError("")
      setTxHash("")

      log(`Building transferSecret tx: secret #${secretId} → ${truncateAddress(newOwner)}`)

      // Step 1: Build the transaction intent using the SDK
      const controllerAddress = sdk.getControllerAddress(chainId)
      const txIntent = keyManagement.buildTransferSecretTx({
        chainId,
        controllerAddress,
        secretId: BigInt(secretId),
        newOwner: newOwner as `0x${string}`,
      })

      log(`TxIntent built: ${txIntent.description}`)
      log(`  to: ${txIntent.to}`)
      log(`  data: ${txIntent.data.slice(0, 20)}...`)

      // Step 2: Send the transaction via MetaMask (EIP-1193)
      const hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: txIntent.to,
            data: txIntent.data,
            ...(txIntent.value
              ? { value: `0x${txIntent.value.toString(16)}` }
              : {}),
          },
        ],
      })

      setTxHash(hash as string)
      log(`Transaction sent! Hash: ${hash}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsSending(false)
    }
  }, [sdk, chainId, address, secretId, newOwner, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          buildTransferSecretTx
        </span>
        {txHash ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Transfer Secret
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Transfer ownership of a secret to a new address.
        Delegation is cleared upon transfer.
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`const txIntent = keyManagement.buildTransferSecretTx({`}
        <br />
        {`  chainId, controllerAddress, secretId, newOwner,`}
        <br />
        {`});`}
        <br />
        <br />
        {`// Send via MetaMask (EIP-1193)`}
        <br />
        {`const hash = await window.ethereum.request({`}
        <br />
        {`  method: 'eth_sendTransaction',`}
        <br />
        {`  params: [{ from, to: txIntent.to, data: txIntent.data }],`}
        <br />
        {`});`}
      </div>

      {/* Form inputs */}
      <div className="space-y-3 mb-4">
        <div>
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
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            New Owner Address
          </label>
          <input
            type="text"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            placeholder="0x..."
            className="
              w-full bg-zinc-900 border border-zinc-800 rounded-lg
              px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono
              focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
              transition-colors
            "
          />
        </div>
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
        onClick={handleTransfer}
        disabled={isSending || !secretId || !newOwner}
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <ArrowRightLeft className="h-4 w-4" />
            Transfer Ownership
          </>
        )}
      </Button>
    </div>
  )
}
