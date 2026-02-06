/**
 * Remove Delegation — WalletConnect
 * ===================================
 *
 * This component demonstrates the buildRemoveDelegationTx() SDK function:
 *   1. Build a transaction intent via keyManagement.buildRemoveDelegationTx()
 *   2. Send the transaction using the WalletConnect EIP-1193 provider
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
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { keyManagement, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// WalletConnect provider type
// ---------------------------------------------------------------------------
import type EthereumProvider from "@walletconnect/ethereum-provider"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RemoveDelegationProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The connected wallet address (used as `from` in the tx) */
  address: string
  /** The WalletConnect EIP-1193 provider — used to send the tx */
  provider: InstanceType<typeof EthereumProvider>
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function RemoveDelegation({ sdk, chainId, address, provider, log }: RemoveDelegationProps) {
  // ---- Local state ----
  const [secretId, setSecretId] = useState<string>("")
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")

  // =========================================================================
  // Build the TxIntent and send it via WalletConnect
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

      // Step 2: Send via WalletConnect (EIP-1193 — same as MetaMask!)
      log("Sending transaction via WalletConnect (approve in your mobile wallet)...")
      const hash = await provider.request({
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
  }, [sdk, chainId, address, provider, secretId, log])

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
        {`// Send via WalletConnect (same EIP-1193 as MetaMask!)`}
        <br />
        {`const hash = await provider.request({`}
        <br />
        {`  method: 'eth_sendTransaction',`}
        <br />
        {`  params: [{ from, to: txIntent.to, data: txIntent.data }],`}
        <br />
        {`});`}
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
