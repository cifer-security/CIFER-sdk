/**
 * Usage Stats — Wallet (Web3)
 * ===========================
 *
 * Shared glow-card that calls blackbox.jobs.dataConsumption() for the
 * connected wallet. Shows plan info plus encryption/decryption quota bars.
 *
 * SDK function used:
 *   blackbox.jobs.dataConsumption({
 *     chainId, signer, readClient, blackboxUrl
 *   })
 */

"use client"

import { useState, useCallback } from "react"
import { BarChart3, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  blackbox,
  type CiferSdk,
  type DataConsumption,
  type SignerAdapter,
  type UsageStats,
} from "cifer-sdk"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

function usagePercent(used: number, limit: number): number {
  if (limit === 0) return 0
  return Math.min((used / limit) * 100, 100)
}

function formatPeriodMs(value: string): string {
  const ms = Number(value)
  if (!Number.isFinite(ms) || ms <= 0) return value
  return new Date(ms).toLocaleString()
}

function UsageBar({
  label,
  stats,
}: {
  label: string
  stats: UsageStats
}) {
  const pct = usagePercent(stats.used, stats.limit)
  const barColor =
    pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-[#00ff9d]"

  return (
    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{label}</h4>
        <span className="text-xs font-mono text-zinc-400">
          {pct.toFixed(1)}% used
        </span>
      </div>

      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Used</p>
          <p className="text-sm font-mono text-white">{formatBytes(stats.used)}</p>
          <p className="text-[10px] text-zinc-600">{stats.usedGB.toFixed(4)} GB</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Limit</p>
          <p className="text-sm font-mono text-white">{formatBytes(stats.limit)}</p>
          <p className="text-[10px] text-zinc-600">{stats.limitGB} GB</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Remaining</p>
          <p className="text-sm font-mono text-[#00ff9d]">
            {formatBytes(stats.remaining)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Operations</p>
          <p className="text-sm font-mono text-white">{stats.count}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Request Limit</p>
          <p className="text-sm font-mono text-white">
            {stats.requestLimit.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Rate Limit</p>
          <p className="text-sm font-mono text-white">{stats.rateLimit} req/s</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UsageStatsBoxProps {
  /** Initialized CIFER SDK instance */
  sdk: CiferSdk
  /** Selected chain ID (used for auth freshness / data string) */
  chainId: number
  /**
   * Build a SignerAdapter for the connected wallet.
   * Called on each fetch so MetaMask / WC / Thirdweb can supply their adapter.
   */
  getSigner: () => Promise<SignerAdapter> | SignerAdapter
  /** Shared logger */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function UsageStatsBox({
  sdk,
  chainId,
  getSigner,
  log,
}: UsageStatsBoxProps) {
  const [data, setData] = useState<DataConsumption | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")

      log(`Fetching wallet usage stats (chain ${chainId})...`)
      const signer = await getSigner()

      const result = await blackbox.jobs.dataConsumption({
        chainId,
        signer,
        readClient: sdk.readClient,
        blackboxUrl: sdk.blackboxUrl,
      })

      setData(result)
      log("Usage stats retrieved!")
      log(`  userId: ${result.userId} (${result.userType})`)
      log(`  plan: ${result.planId} — ${result.cycleType}`)
      log(
        `  encryption: ${result.encryption.usedGB.toFixed(4)} / ${result.encryption.limitGB} GB (${result.encryption.count} ops)`,
      )
      log(
        `  decryption: ${result.decryption.usedGB.toFixed(4)} / ${result.decryption.limitGB} GB (${result.decryption.count} ops)`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [sdk, chainId, getSigner, log])

  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          blackbox.jobs.dataConsumption
        </span>
        {data ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>

      <div className="flex items-start gap-3 mb-2">
        <BarChart3 className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Wallet Usage Stats
          </h3>
          <p className="text-sm text-zinc-400">
            Encryption and decryption quota for the connected wallet on the
            current billing period.
          </p>
        </div>
      </div>

      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`const usage = await blackbox.jobs.dataConsumption({`}
        <br />
        {`  chainId, signer, readClient, blackboxUrl,`}
        <br />
        {`});`}
      </div>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      {data ? (
        <div className="space-y-3 mb-4">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase text-zinc-500 mb-0.5">User</p>
                <p className="text-xs font-mono text-white break-all">
                  {data.userId}
                </p>
                <p className="text-[10px] text-zinc-600">{data.userType}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Plan</p>
                <p className="text-sm font-mono text-white">{data.planId}</p>
                <p className="text-[10px] text-zinc-600">{data.cycleType}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Period</p>
              <p className="text-xs font-mono text-zinc-300">
                {formatPeriodMs(data.periodStart)} →{" "}
                {formatPeriodMs(data.periodEnd)}
              </p>
            </div>
          </div>

          <UsageBar label="Encryption" stats={data.encryption} />
          <UsageBar label="Decryption" stats={data.decryption} />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFetch}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                Refresh
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={handleFetch} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              Fetch Usage Stats
            </>
          )}
        </Button>
      )}
    </div>
  )
}
