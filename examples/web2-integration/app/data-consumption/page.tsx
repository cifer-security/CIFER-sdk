/**
 * Data Consumption Page
 * =====================
 *
 * Demonstrates:
 *   web2.blackbox.jobs.dataConsumption() — usage statistics
 *   web2.blackbox.jobs.list()            — active file jobs
 *
 * Displays:
 *   - Plan info (planId, cycleType, period)
 *   - Encryption usage (limit, used, remaining, count, rateLimit)
 *   - Decryption usage (limit, used, remaining, count, rateLimit)
 *   - Non-expired file jobs with status, type, and download links
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileUp,
  FileDown,
  Clock,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"
import type { DataConsumption, JobInfo } from "cifer-sdk"

// ===========================================================================
// Helpers
// ===========================================================================

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

// ===========================================================================
// Data Consumption Page
// ===========================================================================

export default function DataConsumptionPage() {
  const { sdk, blackboxUrl, session, sessionRef, logs, log } = useWeb2()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<DataConsumption | null>(null)

  // Jobs state
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [jobs, setJobs] = useState<JobInfo[] | null>(null)
  const [jobsError, setJobsError] = useState("")

  const hasSession = !!session
  const hasReadClient = !!sdk?.readClient

  // =========================================================================
  // Fetch data consumption
  // =========================================================================
  const handleFetch = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !sdk) return

    try {
      setIsLoading(true)
      setError("")

      log("Fetching data consumption stats...")

      const result = await web2.blackbox.jobs.dataConsumption({
        session: s,
        blackboxUrl,
        readClient: sdk.readClient,
      })

      setData(result)

      log("Data consumption retrieved!")
      log(`  userId: ${result.userId}`)
      log(`  plan: ${result.planId} (${result.cycleType})`)
      log(`  period: ${result.periodStart} → ${result.periodEnd}`)
      log(`  encryption: ${result.encryption.usedGB.toFixed(4)} / ${result.encryption.limitGB} GB (${result.encryption.count} ops)`)
      log(`  decryption: ${result.decryption.usedGB.toFixed(4)} / ${result.decryption.limitGB} GB (${result.decryption.count} ops)`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [sessionRef, sdk, blackboxUrl, log])

  // =========================================================================
  // Fetch non-expired file jobs
  // =========================================================================
  const handleFetchJobs = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !sdk) return

    try {
      setIsLoadingJobs(true)
      setJobsError("")

      log("Fetching non-expired file jobs...")

      const result = await web2.blackbox.jobs.list({
        session: s,
        blackboxUrl,
        readClient: sdk.readClient,
        includeExpired: false,
      })

      setJobs(result.jobs)

      log(`Found ${result.jobs.length} active job(s)`)
      for (const job of result.jobs) {
        log(`  ${job.id.slice(0, 8)}... — ${job.type} — ${job.status} — secret #${job.secretId}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setJobsError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoadingJobs(false)
    }
  }, [sessionRef, sdk, blackboxUrl, log])

  // =========================================================================
  // Download a completed job
  // =========================================================================
  const handleDownloadJob = useCallback(
    async (job: JobInfo) => {
      const s = sessionRef.current
      if (!s || !sdk) return

      try {
        log(`Downloading job ${job.id.slice(0, 8)}...`)

        const blob = await web2.blackbox.jobs.download(job.id, {
          session: s,
          secretId: BigInt(job.secretId),
          blackboxUrl,
          readClient: sdk.readClient,
        })

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = job.resultFileName || `${job.type}-${job.id.slice(0, 8)}`
        a.click()
        URL.revokeObjectURL(url)

        log(`Downloaded ${(blob.size / 1024).toFixed(1)} KB`)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        log(`ERROR downloading: ${message}`)
      }
    },
    [sessionRef, sdk, blackboxUrl, log]
  )

  // =========================================================================
  // Usage bar component
  // =========================================================================
  const UsageBar = ({
    label,
    used,
    limit,
    usedGB,
    limitGB,
    count,
    requestLimit,
    rateLimit,
  }: {
    label: string
    used: number
    limit: number
    usedGB: number
    limitGB: number
    count: number
    requestLimit: number
    rateLimit: number
  }) => {
    const pct = usagePercent(used, limit)
    const barColor =
      pct > 90
        ? "bg-red-500"
        : pct > 70
          ? "bg-yellow-500"
          : "bg-[#00ff9d]"

    return (
      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">{label}</h4>
          <span className="text-xs font-mono text-zinc-400">
            {pct.toFixed(1)}% used
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Used</p>
            <p className="text-sm font-mono text-white">
              {formatBytes(used)}
            </p>
            <p className="text-[10px] text-zinc-600">{usedGB.toFixed(4)} GB</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500 mb-0.5">Limit</p>
            <p className="text-sm font-mono text-white">
              {formatBytes(limit)}
            </p>
            <p className="text-[10px] text-zinc-600">{limitGB} GB</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
              Remaining
            </p>
            <p className="text-sm font-mono text-[#00ff9d]">
              {formatBytes(limit - used)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
              Operations
            </p>
            <p className="text-sm font-mono text-white">{count}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
              Request Limit
            </p>
            <p className="text-sm font-mono text-white">
              {requestLimit.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
              Rate Limit
            </p>
            <p className="text-sm font-mono text-white">{rateLimit} req/s</p>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="page-bg min-h-screen">
      <div className="py-12">
        <Container>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#00ff9d] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.blackbox.jobs
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Data <span className="text-accent">Consumption</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              View your encryption and decryption usage statistics, plan limits,
              and remaining quota for the current billing period.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* ---- Left Column ---- */}
            <div className="space-y-6">
              {/* Prerequisites */}
              {(!hasSession || !hasReadClient) && (
                <div className="glow-card-subtle p-4 border-l-2 border-yellow-500/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-400 mb-2">
                        {!hasSession ? "Session required" : "SDK not initialized"}
                      </p>
                      {!hasSession && (
                        <Link href="/session" className="mt-2 inline-block">
                          <Button variant="outline" size="sm">
                            Go to Session &rarr;
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Fetch card */}
              <div className="glow-card p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Query Usage
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Fetch your current billing cycle&apos;s data consumption
                  statistics from the blackbox.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const stats = await web2.blackbox.jobs.dataConsumption({`}
                  <br />
                  {`  session,`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`  readClient,`}
                  <br />
                  {`});`}
                  <br />
                  <br />
                  {`// stats.encryption → { limit, used, remaining, count, ... }`}
                  <br />
                  {`// stats.decryption → { limit, used, remaining, count, ... }`}
                </div>

                {error && (
                  <p className="text-xs text-red-400 mb-3">{error}</p>
                )}

                <Button
                  variant="accent"
                  onClick={handleFetch}
                  disabled={isLoading || !hasSession || !hasReadClient}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : data ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" />
                      Fetch Usage Stats
                    </>
                  )}
                </Button>
              </div>

              {/* Results */}
              {data && (
                <>
                  {/* Plan info */}
                  <div className="glow-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Plan Info
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
                          User ID
                        </p>
                        <p className="text-xs font-mono text-zinc-300 break-all">
                          {data.userId}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
                          User Type
                        </p>
                        <p className="text-sm font-mono text-white">
                          {data.userType}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
                          Plan
                        </p>
                        <p className="text-sm font-mono text-[#00ff9d]">
                          {data.planId}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
                          Cycle Type
                        </p>
                        <p className="text-sm font-mono text-white">
                          {data.cycleType}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
                          Period Start
                        </p>
                        <p className="text-xs font-mono text-zinc-300">
                          {data.periodStart}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500 mb-0.5">
                          Period End
                        </p>
                        <p className="text-xs font-mono text-zinc-300">
                          {data.periodEnd}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Encryption usage */}
                  <UsageBar
                    label="Encryption"
                    used={data.encryption.used}
                    limit={data.encryption.limit}
                    usedGB={data.encryption.usedGB}
                    limitGB={data.encryption.limitGB}
                    count={data.encryption.count}
                    requestLimit={data.encryption.requestLimit}
                    rateLimit={data.encryption.rateLimit}
                  />

                  {/* Decryption usage */}
                  <UsageBar
                    label="Decryption"
                    used={data.decryption.used}
                    limit={data.decryption.limit}
                    usedGB={data.decryption.usedGB}
                    limitGB={data.decryption.limitGB}
                    count={data.decryption.count}
                    requestLimit={data.decryption.requestLimit}
                    rateLimit={data.decryption.rateLimit}
                  />
                </>
              )}

              {/* =========================================================== */}
              {/* FILE JOBS                                                    */}
              {/* =========================================================== */}
              <div className="glow-card p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Active File Jobs
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  List non-expired file jobs (encrypt &amp; decrypt) for your
                  principal. Completed jobs can be downloaded.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.blackbox.jobs.list({`}
                  <br />
                  {`  session, blackboxUrl, readClient,`}
                  <br />
                  {`  includeExpired: false,`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.jobs → [{ id, type, status, secretId, ... }]`}
                </div>

                {jobsError && (
                  <p className="text-xs text-red-400 mb-3">{jobsError}</p>
                )}

                <Button
                  variant={jobs !== null ? "ghost" : "outline"}
                  size={jobs !== null ? "sm" : "default"}
                  onClick={handleFetchJobs}
                  disabled={isLoadingJobs || !hasSession || !hasReadClient}
                  className="mb-4"
                >
                  {isLoadingJobs ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : jobs !== null ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh Jobs
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" />
                      Fetch Jobs
                    </>
                  )}
                </Button>

                {jobs !== null && (
                  <div className="space-y-3">
                    {jobs.length === 0 ? (
                      <p className="text-xs text-zinc-600">
                        No active jobs found.
                      </p>
                    ) : (
                      jobs.map((job) => (
                        <div
                          key={job.id}
                          className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-2"
                        >
                          {/* Header row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {job.type === "encrypt" ? (
                                <FileUp className="h-4 w-4 text-blue-400" />
                              ) : (
                                <FileDown className="h-4 w-4 text-purple-400" />
                              )}
                              <span className="text-xs font-mono text-white">
                                {job.type.toUpperCase()}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                                secret #{job.secretId}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {job.status === "completed" ? (
                                <CheckCircle className="h-3.5 w-3.5 text-[#00ff9d]" />
                              ) : job.status === "failed" ? (
                                <XCircle className="h-3.5 w-3.5 text-red-400" />
                              ) : job.status === "processing" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-400" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                              )}
                              <span
                                className={`text-xs font-mono ${
                                  job.status === "completed"
                                    ? "text-[#00ff9d]"
                                    : job.status === "failed"
                                      ? "text-red-400"
                                      : job.status === "processing"
                                        ? "text-yellow-400"
                                        : "text-zinc-500"
                                }`}
                              >
                                {job.status}
                              </span>
                            </div>
                          </div>

                          {/* Job ID */}
                          <p className="text-[10px] font-mono text-zinc-600 break-all">
                            {job.id}
                          </p>

                          {/* Details row */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500">
                            <span>
                              Created:{" "}
                              <span className="text-zinc-400">
                                {new Date(job.createdAt).toLocaleString()}
                              </span>
                            </span>
                            {job.completedAt && (
                              <span>
                                Completed:{" "}
                                <span className="text-zinc-400">
                                  {new Date(job.completedAt).toLocaleString()}
                                </span>
                              </span>
                            )}
                            {job.expiredAt && (
                              <span>
                                Expires:{" "}
                                <span className="text-zinc-400">
                                  {new Date(job.expiredAt).toLocaleString()}
                                </span>
                              </span>
                            )}
                            {job.originalSize != null && (
                              <span>
                                Size:{" "}
                                <span className="text-zinc-400">
                                  {formatBytes(job.originalSize)}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Progress bar for non-completed jobs */}
                          {job.status === "processing" && (
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-yellow-500 transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          )}

                          {/* Error message */}
                          {job.error && (
                            <p className="text-xs text-red-400">{job.error}</p>
                          )}

                          {/* Download button for completed jobs */}
                          {job.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadJob(job)}
                            >
                              <Download className="h-3.5 w-3.5" />
                              {job.resultFileName || "Download"}
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ---- Right Column: Logs ---- */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <ConsoleLog logs={logs} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
