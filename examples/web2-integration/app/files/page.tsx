/**
 * File Encrypt / Decrypt Page
 * ===========================
 *
 * Demonstrates both file encryption and decryption flows on a single page:
 *
 *   Encrypt: web2.blackbox.files.encryptFile → pollUntilComplete → download
 *   Decrypt: web2.blackbox.files.decryptFile → pollUntilComplete → download
 *
 * Each section includes drag-and-drop file upload, job progress, and
 * one-click download of the result.
 */

"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  FileUp,
  FileDown,
  Loader2,
  AlertCircle,
  Upload,
  Download,
  CheckCircle,
  File as FileIcon,
  X,
} from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"

// ===========================================================================
// File Encrypt / Decrypt Page
// ===========================================================================

export default function FilesPage() {
  const { sdk, blackboxUrl, session, sessionRef, logs, log } = useWeb2()

  // ---- Encrypt state ----
  const encFileInputRef = useRef<HTMLInputElement>(null)
  const [encSecretId, setEncSecretId] = useState("")
  const [encFile, setEncFile] = useState<File | null>(null)
  const [encDragOver, setEncDragOver] = useState(false)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encJobId, setEncJobId] = useState("")
  const [encJobStatus, setEncJobStatus] = useState("")
  const [encDownloadUrl, setEncDownloadUrl] = useState("")
  const [encError, setEncError] = useState("")

  // ---- Decrypt state ----
  const decFileInputRef = useRef<HTMLInputElement>(null)
  const [decSecretId, setDecSecretId] = useState("")
  const [decFile, setDecFile] = useState<File | null>(null)
  const [decDragOver, setDecDragOver] = useState(false)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decJobId, setDecJobId] = useState("")
  const [decJobStatus, setDecJobStatus] = useState("")
  const [decDownloadUrl, setDecDownloadUrl] = useState("")
  const [decOriginalFilename, setDecOriginalFilename] = useState("")
  const [decError, setDecError] = useState("")

  const hasSession = !!session
  const hasReadClient = !!sdk?.readClient

  // =========================================================================
  // Encrypt helpers
  // =========================================================================
  const handleEncFileSelect = useCallback((f: File) => {
    setEncFile(f)
    setEncJobId("")
    setEncJobStatus("")
    setEncDownloadUrl("")
    setEncError("")
  }, [])

  const handleEncDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setEncDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleEncFileSelect(dropped)
    },
    [handleEncFileSelect]
  )

  // =========================================================================
  // Decrypt helpers
  // =========================================================================
  const handleDecFileSelect = useCallback((f: File) => {
    setDecFile(f)
    setDecJobId("")
    setDecJobStatus("")
    setDecDownloadUrl("")
    setDecOriginalFilename("")
    setDecError("")
  }, [])

  const handleDecDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDecDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) handleDecFileSelect(dropped)
    },
    [handleDecFileSelect]
  )

  // =========================================================================
  // Encrypt flow
  // =========================================================================
  const handleEncrypt = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !sdk || !encSecretId || !encFile) return

    try {
      setIsEncrypting(true)
      setEncError("")
      setEncJobId("")
      setEncJobStatus("")
      setEncDownloadUrl("")

      log(`Encrypting file "${encFile.name}" (${(encFile.size / 1024).toFixed(1)} KB)...`)
      log(`  secretId: ${encSecretId}`)

      setEncJobStatus("Uploading...")

      const result = await web2.blackbox.files.encryptFile({
        session: s,
        secretId: BigInt(encSecretId),
        file: encFile,
        blackboxUrl,
        readClient: sdk.readClient,
      })

      const jid = result.jobId
      setEncJobId(jid)
      log(`File submitted — jobId: ${jid}`)

      setEncJobStatus("Processing...")
      log("Polling for job completion...")

      await web2.blackbox.jobs.pollUntilComplete(jid, blackboxUrl)

      setEncJobStatus("Completed")
      log("Job completed! Downloading encrypted file...")

      // Re-read session from ref in case it was renewed during polling
      const latestSession = sessionRef.current ?? s
      const blob = await web2.blackbox.jobs.download(jid, {
        session: latestSession,
        secretId: BigInt(encSecretId),
        blackboxUrl,
        readClient: sdk.readClient,
      })

      const url = URL.createObjectURL(blob)
      setEncDownloadUrl(url)
      log(`Encrypted file ready for download (${(blob.size / 1024).toFixed(1)} KB)`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setEncError(message)
      setEncJobStatus("Failed")
      log(`ERROR: ${message}`)
    } finally {
      setIsEncrypting(false)
    }
  }, [sessionRef, sdk, encSecretId, encFile, blackboxUrl, log])

  const triggerEncDownload = useCallback(() => {
    if (!encDownloadUrl || !encFile) return
    const a = document.createElement("a")
    a.href = encDownloadUrl
    a.download = `${encFile.name}.cifer.zip`
    a.click()
  }, [encDownloadUrl, encFile])

  // =========================================================================
  // Decrypt flow
  // =========================================================================
  const handleDecrypt = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !sdk || !decSecretId || !decFile) return

    try {
      setIsDecrypting(true)
      setDecError("")
      setDecJobId("")
      setDecJobStatus("")
      setDecDownloadUrl("")
      setDecOriginalFilename("")

      log(`Decrypting file "${decFile.name}" (${(decFile.size / 1024).toFixed(1)} KB)...`)
      log(`  secretId: ${decSecretId}`)

      setDecJobStatus("Uploading...")

      const result = await web2.blackbox.files.decryptFile({
        session: s,
        secretId: BigInt(decSecretId),
        file: decFile,
        blackboxUrl,
        readClient: sdk.readClient,
      })

      const jid = result.jobId
      setDecJobId(jid)
      log(`File submitted — jobId: ${jid}`)

      setDecJobStatus("Processing...")
      log("Polling for job completion...")

      await web2.blackbox.jobs.pollUntilComplete(jid, blackboxUrl)

      setDecJobStatus("Completed")
      log("Job completed! Downloading decrypted file...")

      // Re-read session from ref in case it was renewed during polling
      const latestSession = sessionRef.current ?? s
      const blob = await web2.blackbox.jobs.download(jid, {
        session: latestSession,
        secretId: BigInt(decSecretId),
        blackboxUrl,
        readClient: sdk.readClient,
      })

      const url = URL.createObjectURL(blob)
      setDecDownloadUrl(url)

      const decryptedName = decFile.name
        .replace(/\.cifer\.zip$/i, "")
        .replace(/\.cifer$/i, "")
      setDecOriginalFilename(decryptedName || "decrypted-file")

      log(`Decrypted file ready for download (${(blob.size / 1024).toFixed(1)} KB)`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setDecError(message)
      setDecJobStatus("Failed")
      log(`ERROR: ${message}`)
    } finally {
      setIsDecrypting(false)
    }
  }, [sessionRef, sdk, decSecretId, decFile, blackboxUrl, log])

  const triggerDecDownload = useCallback(() => {
    if (!decDownloadUrl) return
    const a = document.createElement("a")
    a.href = decDownloadUrl
    a.download = decOriginalFilename || "decrypted-file"
    a.click()
  }, [decDownloadUrl, decOriginalFilename])

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
                <FileUp className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.blackbox.files
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              File <span className="text-accent">Encrypt / Decrypt</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Encrypt a file into a .cifer.zip archive, then decrypt it back —
              all on one page. Each operation runs as a background job.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* ---- Left Column: Encrypt + Decrypt ---- */}
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

              {/* =========================================================== */}
              {/* ENCRYPT FILE                                                 */}
              {/* =========================================================== */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileUp className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Encrypt File
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Select a file and secret ID. The flow calls{" "}
                  <code className="text-xs font-mono text-zinc-300">encryptFile</code>
                  {" → "}
                  <code className="text-xs font-mono text-zinc-300">pollUntilComplete</code>
                  {" → "}
                  <code className="text-xs font-mono text-zinc-300">download</code>.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const job = await web2.blackbox.files.encryptFile({`}
                  <br />
                  {`  session, secretId: 42n, file, blackboxUrl, readClient,`}
                  <br />
                  {`});`}
                  <br />
                  {`await web2.blackbox.jobs.pollUntilComplete(job.jobId, blackboxUrl);`}
                  <br />
                  {`const blob = await web2.blackbox.jobs.download(job.jobId, { ... });`}
                </div>

                {/* Secret ID */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Secret ID
                  </label>
                  <input
                    type="number"
                    value={encSecretId}
                    onChange={(e) => setEncSecretId(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                  />
                </div>

                {/* Drop zone */}
                <div
                  onDrop={handleEncDrop}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setEncDragOver(true)
                  }}
                  onDragLeave={() => setEncDragOver(false)}
                  onClick={() => encFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all mb-4 ${
                    encDragOver
                      ? "border-[#00ff9d]/60 bg-[rgba(0,255,157,0.05)]"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <input
                    ref={encFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleEncFileSelect(f)
                    }}
                  />
                  {encFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileIcon className="h-5 w-5 text-[#00ff9d]" />
                      <div className="text-left">
                        <p className="text-sm text-white font-medium">
                          {encFile.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {(encFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEncFile(null)
                        }}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">
                        Drop a file here or click to browse
                      </p>
                    </>
                  )}
                </div>

                {encError && (
                  <p className="text-xs text-red-400 mb-3">{encError}</p>
                )}

                {/* Job status */}
                {encJobId && (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-4 space-y-2">
                    <div>
                      <p className="text-xs text-zinc-500">Job ID</p>
                      <p className="text-xs font-mono text-zinc-300 break-all">
                        {encJobId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-zinc-500">Status:</p>
                      <p
                        className={`text-xs font-mono ${
                          encJobStatus === "Completed"
                            ? "text-[#00ff9d]"
                            : encJobStatus === "Failed"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {encJobStatus}
                      </p>
                      {encJobStatus === "Processing..." && (
                        <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="accent"
                    onClick={handleEncrypt}
                    disabled={
                      isEncrypting ||
                      !hasSession ||
                      !hasReadClient ||
                      !encSecretId ||
                      !encFile
                    }
                  >
                    {isEncrypting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {encJobStatus || "Encrypting..."}
                      </>
                    ) : (
                      <>
                        <FileUp className="h-4 w-4" />
                        Encrypt File
                      </>
                    )}
                  </Button>

                  {encDownloadUrl && (
                    <Button variant="outline" onClick={triggerEncDownload}>
                      <Download className="h-4 w-4" />
                      Download .cifer.zip
                    </Button>
                  )}
                </div>
              </div>

              {/* Encrypt success */}
              {encDownloadUrl && (
                <div className="glow-card p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#00ff9d]" />
                    <p className="text-sm text-[#00ff9d] font-semibold">
                      File encrypted successfully!
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    Download the .cifer.zip, then use the decrypt section below
                    to decrypt it back.
                  </p>
                </div>
              )}

              {/* =========================================================== */}
              {/* DECRYPT FILE                                                 */}
              {/* =========================================================== */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileDown className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Decrypt File
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Upload a .cifer.zip file. The flow calls{" "}
                  <code className="text-xs font-mono text-zinc-300">decryptFile</code>
                  {" → "}
                  <code className="text-xs font-mono text-zinc-300">pollUntilComplete</code>
                  {" → "}
                  <code className="text-xs font-mono text-zinc-300">download</code>.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const job = await web2.blackbox.files.decryptFile({`}
                  <br />
                  {`  session, secretId: 42n, file, blackboxUrl, readClient,`}
                  <br />
                  {`});`}
                  <br />
                  {`await web2.blackbox.jobs.pollUntilComplete(job.jobId, blackboxUrl);`}
                  <br />
                  {`const blob = await web2.blackbox.jobs.download(job.jobId, { ... });`}
                </div>

                {/* Secret ID */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Secret ID
                  </label>
                  <input
                    type="number"
                    value={decSecretId}
                    onChange={(e) => setDecSecretId(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                  />
                </div>

                {/* Drop zone */}
                <div
                  onDrop={handleDecDrop}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDecDragOver(true)
                  }}
                  onDragLeave={() => setDecDragOver(false)}
                  onClick={() => decFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all mb-4 ${
                    decDragOver
                      ? "border-[#00ff9d]/60 bg-[rgba(0,255,157,0.05)]"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <input
                    ref={decFileInputRef}
                    type="file"
                    accept=".cifer,.zip,.cifer.zip"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleDecFileSelect(f)
                    }}
                  />
                  {decFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileIcon className="h-5 w-5 text-[#00ff9d]" />
                      <div className="text-left">
                        <p className="text-sm text-white font-medium">
                          {decFile.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {(decFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDecFile(null)
                        }}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">
                        Drop a .cifer.zip file here or click to browse
                      </p>
                    </>
                  )}
                </div>

                {decError && (
                  <p className="text-xs text-red-400 mb-3">{decError}</p>
                )}

                {/* Job status */}
                {decJobId && (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-4 space-y-2">
                    <div>
                      <p className="text-xs text-zinc-500">Job ID</p>
                      <p className="text-xs font-mono text-zinc-300 break-all">
                        {decJobId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-zinc-500">Status:</p>
                      <p
                        className={`text-xs font-mono ${
                          decJobStatus === "Completed"
                            ? "text-[#00ff9d]"
                            : decJobStatus === "Failed"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {decJobStatus}
                      </p>
                      {decJobStatus === "Processing..." && (
                        <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="accent"
                    onClick={handleDecrypt}
                    disabled={
                      isDecrypting ||
                      !hasSession ||
                      !hasReadClient ||
                      !decSecretId ||
                      !decFile
                    }
                  >
                    {isDecrypting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {decJobStatus || "Decrypting..."}
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        Decrypt File
                      </>
                    )}
                  </Button>

                  {decDownloadUrl && (
                    <Button variant="outline" onClick={triggerDecDownload}>
                      <Download className="h-4 w-4" />
                      Download Decrypted
                    </Button>
                  )}
                </div>
              </div>

              {/* Decrypt success */}
              {decDownloadUrl && (
                <div className="glow-card p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#00ff9d]" />
                    <p className="text-sm text-[#00ff9d] font-semibold">
                      File decrypted successfully!
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    Download filename:{" "}
                    <code className="font-mono text-zinc-300">
                      {decOriginalFilename}
                    </code>
                  </p>
                </div>
              )}
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
