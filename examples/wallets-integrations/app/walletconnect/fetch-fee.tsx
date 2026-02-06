/**
 * Fetch Secret Creation Fee — WalletConnect
 * ===========================================
 *
 * This component calls keyManagement.getSecretCreationFee() to read the
 * on-chain fee (in wei) required to create a new CIFER secret.
 *
 * This is a READ-ONLY call — no wallet signer is needed, only the SDK's
 * readClient which was set up during auto-discovery.
 *
 * SDK function used:
 *   keyManagement.getSecretCreationFee({ chainId, controllerAddress, readClient })
 */

"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatWei } from "@/lib/utils"
import { getChainCurrency } from "@/lib/chains"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { keyManagement, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FetchFeeProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function FetchFee({ sdk, chainId, log }: FetchFeeProps) {
  // ---- Local state ----
  const [fee, setFee] = useState<bigint | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string>("")

  // ---- Reset fee when chainId changes ----
  const [prevChainId, setPrevChainId] = useState(chainId)
  if (chainId !== prevChainId) {
    setPrevChainId(chainId)
    setFee(null)
    setError("")
  }

  // =========================================================================
  // Fetch the fee from the SecretsController contract
  //
  // keyManagement.getSecretCreationFee() reads the secretCreationFee()
  // view function on the SecretsController. It requires:
  //   - chainId: which chain to query
  //   - controllerAddress: the contract address (auto-discovered by SDK)
  //   - readClient: the RPC client (auto-created by SDK during discovery)
  // =========================================================================
  const fetchFee = useCallback(async () => {
    try {
      setIsFetching(true)
      setError("")
      log(`Reading secret creation fee on chain ${chainId}...`)

      const controllerAddress = sdk.getControllerAddress(chainId)
      log(`Controller address: ${controllerAddress}`)

      const creationFee = await keyManagement.getSecretCreationFee({
        chainId,
        controllerAddress,
        readClient: sdk.readClient,
      })

      setFee(creationFee)
      const currency = getChainCurrency(chainId)
      log(`Secret creation fee: ${creationFee} wei (${formatWei(creationFee)} ${currency})`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsFetching(false)
    }
  }, [sdk, chainId, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          getSecretCreationFee
        </span>
        {fee !== null ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Get Secret Creation Fee
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Read the on-chain fee required to create a new CIFER secret.
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`const fee = await keyManagement.getSecretCreationFee({`}
        <br />
        {`  chainId,`}
        <br />
        {`  controllerAddress: sdk.getControllerAddress(chainId),`}
        <br />
        {`  readClient: sdk.readClient,`}
        <br />
        {`});`}
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {fee !== null ? (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Creation Fee</p>
          <p className="text-2xl font-bold text-white">
            {formatWei(fee)}{" "}
            <span className="text-sm text-zinc-400 font-normal">
              {getChainCurrency(chainId)}
            </span>
          </p>
          <p className="text-xs text-zinc-600 font-mono mt-1">
            {fee.toString()} wei
          </p>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={fetchFee}
          disabled={isFetching}
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading contract...
            </>
          ) : (
            "Fetch Fee"
          )}
        </Button>
      )}
    </div>
  )
}
