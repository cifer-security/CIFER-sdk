/**
 * Get Secret — MetaMask
 * =====================
 *
 * This component calls keyManagement.getSecret() to read the full state
 * of a specific secret by its ID.
 *
 * This is a READ-ONLY call — no wallet signer is needed.
 *
 * SDK function used:
 *   keyManagement.getSecret(
 *     { chainId, controllerAddress, readClient },
 *     secretId
 *   )
 *
 * Returns:
 *   SecretState { owner, delegate, isSyncing, clusterId, secretType, publicKeyCid }
 */

"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { truncateAddress } from "@/lib/utils"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { keyManagement, type CiferSdk } from "cifer-sdk"

// ---------------------------------------------------------------------------
// SecretState type (mirrors the SDK's SecretState interface)
// ---------------------------------------------------------------------------

interface SecretState {
  owner: string
  delegate: string
  isSyncing: boolean
  clusterId: number
  secretType: number
  publicKeyCid: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GetSecretProps {
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

export function GetSecret({ sdk, chainId, log }: GetSecretProps) {
  // ---- Local state ----
  const [secretId, setSecretId] = useState<string>("")
  const [secretState, setSecretState] = useState<SecretState | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string>("")

  // ---- Reset when chainId changes ----
  const [prevChainId, setPrevChainId] = useState(chainId)
  if (chainId !== prevChainId) {
    setPrevChainId(chainId)
    setSecretState(null)
    setError("")
  }

  // =========================================================================
  // Fetch the full secret state from the SecretsController
  //
  // keyManagement.getSecret() reads the getSecretState() view function.
  // It requires:
  //   - chainId, controllerAddress, readClient (standard ReadParams)
  //   - secretId (bigint)
  //
  // Returns SecretState with all on-chain fields:
  //   { owner, delegate, isSyncing, clusterId, secretType, publicKeyCid }
  //
  // Throws SecretNotFoundError if the secret doesn't exist.
  // =========================================================================
  const fetchSecret = useCallback(async () => {
    if (!secretId) return

    try {
      setIsFetching(true)
      setError("")
      log(`Fetching state for secret #${secretId} on chain ${chainId}...`)

      const controllerAddress = sdk.getControllerAddress(chainId)

      // Call the SDK — read-only on-chain call
      const state = await keyManagement.getSecret(
        {
          chainId,
          controllerAddress,
          readClient: sdk.readClient,
        },
        BigInt(secretId)
      )

      setSecretState(state as SecretState)
      log(`Secret #${secretId}: owner=${truncateAddress(state.owner)}, syncing=${state.isSyncing}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsFetching(false)
    }
  }, [sdk, chainId, secretId, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          getSecret
        </span>
        {secretState ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Get Secret State
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Query the full on-chain state of a secret by its ID.
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`const state = await keyManagement.getSecret(`}
        <br />
        {`  { chainId, controllerAddress, readClient },`}
        <br />
        {`  secretId`}
        <br />
        {`);`}
        <br />
        {`// state.owner, state.delegate, state.isSyncing, ...`}
      </div>

      {/* Secret ID input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Secret ID
        </label>
        <input
          type="number"
          value={secretId}
          onChange={(e) => {
            setSecretId(e.target.value)
            setSecretState(null)
            setError("")
          }}
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

      {/* Results */}
      {secretState ? (
        <div className="space-y-2 mb-3">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-2">
            <div>
              <p className="text-xs text-zinc-500">Owner</p>
              <p className="text-xs font-mono text-white break-all">{secretState.owner}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Delegate</p>
              <p className="text-xs font-mono text-white break-all">
                {secretState.delegate === "0x0000000000000000000000000000000000000000"
                  ? "None (zero address)"
                  : secretState.delegate}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-zinc-500">Syncing</p>
                <p className={`text-xs font-mono ${secretState.isSyncing ? "text-amber-400" : "text-[#00ff9d]"}`}>
                  {secretState.isSyncing ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Cluster</p>
                <p className="text-xs font-mono text-white">{secretState.clusterId}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Type</p>
                <p className="text-xs font-mono text-white">{secretState.secretType}</p>
              </div>
            </div>
            {secretState.publicKeyCid && (
              <div>
                <p className="text-xs text-zinc-500">Public Key CID</p>
                <p className="text-xs font-mono text-white break-all">{secretState.publicKeyCid}</p>
              </div>
            )}
          </div>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSecret}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={fetchSecret}
          disabled={isFetching || !secretId}
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading contract...
            </>
          ) : (
            "Fetch Secret"
          )}
        </Button>
      )}
    </div>
  )
}
