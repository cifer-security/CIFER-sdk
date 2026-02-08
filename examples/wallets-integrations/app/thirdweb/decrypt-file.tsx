/**
 * Decrypt File — Thirdweb
 * ========================
 *
 * This component demonstrates flows.decryptFileJobFlow() —
 * decrypting a .cifer.zip file using a CIFER secret via the Blackbox API.
 *
 * The flow has 3 steps:
 *   1. Upload — sends the encrypted file to the Blackbox for decryption
 *   2. Poll   — waits for the decryption job to complete
 *   3. Download — fetches the decrypted result (requires auth)
 *
 * For Thirdweb, we build a custom signer adapter from the Account object:
 *   { getAddress() → account.address, signMessage(msg) → account.signMessage({ message: msg }) }
 *
 * SDK function used:
 *   flows.decryptFileJobFlow(ctx, { secretId, file }, options)
 *
 * Returns:
 *   { jobId, job, decryptedFile: Blob }
 */

"use client"

import { useState, useCallback, useRef } from "react"
import { CheckCircle, Loader2, Unlock, Upload, FileUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Thirdweb Account type
// ---------------------------------------------------------------------------
import type { Account } from "thirdweb/wallets"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { flows, type CiferSdk, type SignerAdapter } from "cifer-sdk"

// ---------------------------------------------------------------------------
// Custom signer adapter: Thirdweb Account → cifer-sdk SignerAdapter
// ---------------------------------------------------------------------------

function createThirdwebSigner(account: Account): SignerAdapter {
  return {
    async getAddress() {
      return account.address as `0x${string}`
    },
    async signMessage(message: string) {
      return await account.signMessage({ message }) as `0x${string}`
    },
  }
}

// ---------------------------------------------------------------------------
// Upload progress tracking
// ---------------------------------------------------------------------------

/**
 * Create a fetch wrapper that reports upload progress for POST+FormData
 * requests. Uses XMLHttpRequest under the hood for upload.onprogress support.
 * All other requests fall through to native fetch.
 */
function createTrackedFetch(
  onProgress: (loaded: number, total: number) => void
): typeof fetch {
  return ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (init?.method?.toUpperCase() === "POST" && init?.body instanceof FormData) {
      return new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : (input as Request).url
        xhr.open("POST", url)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(e.loaded, e.total)
        }

        xhr.onload = () => {
          resolve(
            new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
            })
          )
        }

        xhr.onerror = () => reject(new TypeError("Network request failed"))
        xhr.send(init.body)
      })
    }
    return fetch(input, init)
  }) as typeof fetch
}

/** Format bytes-per-second into a human-readable speed string */
function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
}

// ---------------------------------------------------------------------------
// Step type for progress display
// ---------------------------------------------------------------------------
interface StepInfo {
  id: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed"
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DecryptFileProps {
  /** The initialized CIFER SDK instance */
  sdk: CiferSdk
  /** The selected chain ID */
  chainId: number
  /** The Thirdweb Account (from useActiveAccount) */
  account: Account
  /** Shared logger — writes to the parent page's console output */
  log: (message: string) => void
}

// ===========================================================================
// Component
// ===========================================================================

export function DecryptFile({ sdk, chainId, account, log }: DecryptFileProps) {
  // ---- Local state ----
  const [secretId, setSecretId] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [steps, setSteps] = useState<StepInfo[]>([])
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadSpeed, setUploadSpeed] = useState<string>("")
  const uploadStartRef = useRef<number>(0)

  // =========================================================================
  // Validate that file has .cifer.zip extension
  // =========================================================================
  const validateFile = useCallback((f: File): boolean => {
    if (!f.name.endsWith(".cifer.zip")) {
      setError("Only .cifer.zip files can be decrypted")
      return false
    }
    return true
  }, [])

  // =========================================================================
  // File drop handlers
  // =========================================================================
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setError("")
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
        setDone(false)
      }
    }
  }, [validateFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setError("")
      if (validateFile(selected)) {
        setFile(selected)
        setDone(false)
      }
    }
  }, [validateFile])

  // =========================================================================
  // Decrypt file via the SDK flow
  //
  // We create a custom signer from the Thirdweb Account to authenticate.
  // =========================================================================
  const handleDecrypt = useCallback(async () => {
    if (!secretId || !file) return

    try {
      setIsProcessing(true)
      setError("")
      setDone(false)
      setProgress(0)
      setUploadProgress(0)
      setUploadSpeed("")
      setSteps([
        { id: "upload", description: "Upload encrypted file for decryption", status: "pending" },
        { id: "poll", description: "Wait for decryption to complete", status: "pending" },
        { id: "download", description: "Download decrypted file", status: "pending" },
      ])

      log(`Decrypting file "${file.name}" (${(file.size / 1024).toFixed(1)} KB) with secret #${secretId}...`)

      // Create a cifer-sdk compatible signer from the Thirdweb Account
      const signer = createThirdwebSigner(account)

      // Build the flow context with upload progress tracking
      uploadStartRef.current = Date.now()

      const ctx: flows.FlowContext = {
        signer,
        readClient: sdk.readClient,
        blackboxUrl: sdk.blackboxUrl,
        chainId,
        logger: (msg) => {
          log(msg)
          const match = msg.match(/Progress: (\d+)%/)
          if (match) setProgress(Number(match[1]))
        },
        fetch: createTrackedFetch((loaded, total) => {
          const pct = Math.round((loaded / total) * 100)
          setUploadProgress(pct)
          const elapsed = (Date.now() - uploadStartRef.current) / 1000
          if (elapsed > 0.3) {
            setUploadSpeed(formatSpeed(loaded / elapsed))
          }
        }),
      }

      const result = await flows.decryptFileJobFlow(
        ctx,
        { secretId: BigInt(secretId), file },
        {
          onStepProgress: (step) => {
            setSteps((prev) =>
              prev.map((s) =>
                s.id === step.id
                  ? { ...s, status: step.status as StepInfo["status"] }
                  : s
              )
            )
          },
        }
      )

      if (!result.success || !result.data) {
        throw result.error ?? new Error("Decryption flow failed")
      }

      // Auto-download — use server-provided filename (has correct extension),
      // falling back to stripping .cifer.zip from the input name.
      const outputName = result.data.job.resultFileName
        ?? file.name.replace(/\.cifer\.zip$/, "")
      const url = URL.createObjectURL(result.data.decryptedFile)
      const a = document.createElement("a")
      a.href = url
      a.download = outputName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDone(true)
      log(`Decrypted file downloaded as "${outputName}"`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsProcessing(false)
    }
  }, [sdk, chainId, account, secretId, file, log])

  // =========================================================================
  // Reset
  // =========================================================================
  const handleReset = useCallback(() => {
    setFile(null)
    setDone(false)
    setError("")
    setProgress(0)
    setUploadProgress(0)
    setUploadSpeed("")
    setSteps([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  // =========================================================================
  // Helper: format file size
  // =========================================================================
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="glow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-zinc-500">
          flows.decryptFileJobFlow
        </span>
        {done ? (
          <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-zinc-700" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Decrypt File
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        Decrypt a <code className="text-zinc-300 font-mono text-xs">.cifer.zip</code> file
        using the secret that encrypted it. Requires authentication (owner or delegate).
      </p>

      {/* Code snippet */}
      <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
        {`const signer = createThirdwebSigner(account);`}
        <br />
        {`const ctx = { signer, readClient, blackboxUrl, chainId };`}
        <br />
        <br />
        {`const result = await flows.decryptFileJobFlow(`}
        <br />
        {`  ctx, { secretId, file }`}
        <br />
        {`);`}
        <br />
        {`// result.data.decryptedFile → Blob`}
      </div>

      {/* Secret ID input */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Secret ID
        </label>
        <input
          type="number"
          value={secretId}
          onChange={(e) => {
            setSecretId(e.target.value)
            setDone(false)
          }}
          placeholder="e.g. 123"
          disabled={isProcessing}
          className="
            w-full bg-zinc-900 border border-zinc-800 rounded-lg
            px-3 py-2 text-sm text-white placeholder-zinc-600
            focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30
            transition-colors disabled:opacity-50
          "
        />
      </div>

      {/* Drop zone */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Encrypted File
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${isDragging
              ? "border-[#00ff9d]/50 bg-[#00ff9d]/5"
              : file
                ? "border-zinc-700 bg-zinc-900/50"
                : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/30"
            }
            ${isProcessing ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileUp className="h-5 w-5 text-[#00ff9d]" />
              <div className="text-left">
                <p className="text-sm text-white truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-zinc-500">{formatSize(file.size)}</p>
              </div>
              {!isProcessing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReset()
                  }}
                  className="ml-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div>
              <Upload className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">
                Drop a <span className="text-[#00ff9d]">.cifer.zip</span> file here or <span className="text-[#00ff9d]">browse</span>
              </p>
              <p className="text-xs text-zinc-600 mt-1">Only .cifer.zip files</p>
            </div>
          )}
        </div>
      </div>

      {/* Step progress */}
      {steps.length > 0 && (
        <div className="mb-4 space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              {step.status === "completed" ? (
                <CheckCircle className="h-3.5 w-3.5 text-[#00ff9d] shrink-0" />
              ) : step.status === "in_progress" ? (
                <Loader2 className="h-3.5 w-3.5 text-[#00ff9d] animate-spin shrink-0" />
              ) : step.status === "failed" ? (
                <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border border-zinc-700 shrink-0" />
              )}
              <span
                className={`text-xs ${
                  step.status === "completed"
                    ? "text-[#00ff9d]"
                    : step.status === "in_progress"
                      ? "text-white"
                      : step.status === "failed"
                        ? "text-red-400"
                        : "text-zinc-600"
                }`}
              >
                {step.description}
              </span>
            </div>
          ))}
          {/* Upload progress bar */}
          {steps.some((s) => s.id === "upload" && s.status === "in_progress") && uploadProgress > 0 && (
            <div className="mt-1 ml-5">
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ff9d] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-zinc-500">{uploadProgress}%</p>
                {uploadSpeed && <p className="text-xs text-zinc-500">{uploadSpeed}</p>}
              </div>
            </div>
          )}
          {/* Progress bar during polling */}
          {steps.some((s) => s.id === "poll" && s.status === "in_progress") && (
            <div className="mt-1 ml-5">
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ff9d] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">{progress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {/* Action buttons */}
      {done ? (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Decrypt Another File
        </Button>
      ) : (
        <Button
          variant="accent"
          onClick={handleDecrypt}
          disabled={isProcessing || !secretId || !file}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Decrypting...
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Decrypt File
            </>
          )}
        </Button>
      )}
    </div>
  )
}
