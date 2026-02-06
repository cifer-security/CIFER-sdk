/**
 * Get Secrets By Wallet — Thirdweb
 * ==================================
 *
 * This component calls keyManagement.getSecretsByWallet() to read all
 * secrets owned by or delegated to the connected wallet address.
 *
 * This is a READ-ONLY call — no wallet signer is needed.
 *
 * SDK function used:
 *   keyManagement.getSecretsByWallet(
 *     { chainId, controllerAddress, readClient },
 *     walletAddress
 *   )
 *
 * Returns:
 *   { owned: bigint[], delegated: bigint[] }
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
// Props
// ---------------------------------------------------------------------------

interface GetSecretsProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The connected wallet address */
  address: string
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function GetSecrets({ sdk, chainId, address, log }: GetSecretsProps) {
  // ---- Local state ----
  const [owned, setOwned] = useState<bigint[] | null>(null)
  const [delegated, setDelegated] = useState<bigint[] | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string>("")

  // ---- Reset when chainId changes ----
  const [prevChainId, setPrevChainId] = useState(chainId)
  if (chainId !== prevChainId) {
    setPrevChainId(chainId)
    setOwned(null)
    setDelegated(null)
    setError("")
  }

  const hasFetched = owned !== null

  // =========================================================================
  // Fetch secrets owned by / delegated to the connected wallet
  //
  // keyManagement.getSecretsByWallet() reads from the SecretsController.
  // It takes the standard read params plus the wallet address:
  //   - { chainId, controllerAddress, readClient }
  //   - walletAddress
  //
  // Returns { owned: bigint[], delegated: bigint[] }
  // =========================================================================
  const fetchSecrets = useCallback(async () => {
    try {
      setIsFetching(true)
      setError("")
      log(`Fetching secrets for ${truncateAddress(address)} on chain ${chainId}...`)

      const controllerAddress = sdk.getControllerAddress(chainId)

      const result = await keyManagement.getSecretsByWallet(
        {
          chainId,
          controllerAddress,
          readClient: sdk.readClient,
        },
        address as `0x${string}`
      )

      setOwned(result.owned)
      setDelegated(result.delegated)
      log(`Found ${result.owned.length} owned, ${result.delegated.length} delegated secrets`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsFetching(false)
    }
  }, [sdk, chainId, address, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          getSecretsByWallet
        </span>
        {hasFetched ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Get Secrets by Wallet
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Query all secrets owned by or delegated to the connected wallet.
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`const secrets = await keyManagement.getSecretsByWallet(`}
        <br />
        {`  { chainId, controllerAddress, readClient },`}
        <br />
        {`  walletAddress`}
        <br />
        {`);`}
        <br />
        {`// secrets.owned: bigint[]`}
        <br />
        {`// secrets.delegated: bigint[]`}
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {hasFetched ? (
        <div className="space-y-3">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">
              Owned Secrets ({owned!.length})
            </p>
            {owned!.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {owned!.map((id) => (
                  <span
                    key={id.toString()}
                    className="text-xs font-mono text-white bg-zinc-800 px-2 py-1 rounded"
                  >
                    #{id.toString()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">No owned secrets</p>
            )}
          </div>

          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">
              Delegated Secrets ({delegated!.length})
            </p>
            {delegated!.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {delegated!.map((id) => (
                  <span
                    key={id.toString()}
                    className="text-xs font-mono text-white bg-zinc-800 px-2 py-1 rounded"
                  >
                    #{id.toString()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">No delegated secrets</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSecrets}
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
          onClick={fetchSecrets}
          disabled={isFetching}
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading contract...
            </>
          ) : (
            "Fetch Secrets"
          )}
        </Button>
      )}
    </div>
  )
}
