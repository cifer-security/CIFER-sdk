/**
 * Payload Encrypt / Decrypt Page
 * ==============================
 *
 * Demonstrates both encrypt and decrypt flows on a single page:
 *
 *   web2.blackbox.payload.encryptPayload(...)
 *   web2.blackbox.payload.decryptPayload(...)
 *
 * After encrypting, the CIFER envelope and encrypted message are
 * automatically populated into the decrypt inputs so you can
 * immediately decrypt without copy-pasting between pages.
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  CheckCircle,
  ArrowDown,
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
// Payload Encrypt / Decrypt Page
// ===========================================================================

export default function PayloadPage() {
  const { sdk, blackboxUrl, session, sessionRef, logs, log } = useWeb2()

  // ---- Encrypt state ----
  const [secretId, setSecretId] = useState("")
  const [plaintext, setPlaintext] = useState("")
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptedMessage, setEncryptedMessage] = useState("")
  const [ciferEnvelope, setCiferEnvelope] = useState("")
  const [encryptError, setEncryptError] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // ---- Decrypt state ----
  const [decSecretId, setDecSecretId] = useState("")
  const [decCifer, setDecCifer] = useState("")
  const [decEncrypted, setDecEncrypted] = useState("")
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decryptedMessage, setDecryptedMessage] = useState("")
  const [decryptError, setDecryptError] = useState("")

  const hasSession = !!session
  const hasReadClient = !!sdk?.readClient

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  // =========================================================================
  // Encrypt
  // =========================================================================
  const handleEncrypt = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !sdk || !secretId || !plaintext) return

    try {
      setIsEncrypting(true)
      setEncryptError("")
      setEncryptedMessage("")
      setCiferEnvelope("")

      log(`Encrypting payload with secret #${secretId}...`)
      log(`  plaintext: "${plaintext}"`)

      const result = await web2.blackbox.payload.encryptPayload({
        session: s,
        secretId: BigInt(secretId),
        plaintext,
        blackboxUrl,
        readClient: sdk.readClient,
      })

      setEncryptedMessage(result.encryptedMessage)
      setCiferEnvelope(result.cifer)

      // Auto-populate decrypt fields
      setDecSecretId(secretId)
      setDecCifer(result.cifer)
      setDecEncrypted(result.encryptedMessage)
      setDecryptedMessage("")

      log("Encrypted successfully!")
      log(`  cifer: ${result.cifer.slice(0, 60)}...`)
      log(`  encryptedMessage: ${result.encryptedMessage.slice(0, 60)}...`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setEncryptError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsEncrypting(false)
    }
  }, [sessionRef, sdk, secretId, plaintext, blackboxUrl, log])

  // =========================================================================
  // Decrypt
  // =========================================================================
  const handleDecrypt = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !sdk || !decSecretId || !decEncrypted || !decCifer) return

    try {
      setIsDecrypting(true)
      setDecryptError("")
      setDecryptedMessage("")

      log(`Decrypting payload with secret #${decSecretId}...`)

      const result = await web2.blackbox.payload.decryptPayload({
        session: s,
        secretId: BigInt(decSecretId),
        encryptedMessage: decEncrypted,
        cifer: decCifer,
        blackboxUrl,
        readClient: sdk.readClient,
      })

      setDecryptedMessage(result.decryptedMessage)
      log("Decrypted successfully!")
      log(`  decryptedMessage: "${result.decryptedMessage}"`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setDecryptError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsDecrypting(false)
    }
  }, [sessionRef, sdk, decSecretId, decEncrypted, decCifer, blackboxUrl, log])

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
                <Lock className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.blackbox.payload
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Payload <span className="text-accent">Encrypt / Decrypt</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Encrypt a plaintext message, then decrypt it — all on one page.
              After encryption the results are auto-populated into the decrypt
              section.
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
                      <p className="text-xs text-zinc-400">
                        {!hasSession
                          ? "Create a session first."
                          : "Wait for SDK initialization."}
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

              {/* ============================================================= */}
              {/* ENCRYPT SECTION                                               */}
              {/* ============================================================= */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Encrypt Payload
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  The web2 wrapper automatically sets{" "}
                  <code className="text-zinc-300 text-xs font-mono">chainId = -1</code>{" "}
                  and uses your session&apos;s signer.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.blackbox.payload.encryptPayload({`}
                  <br />
                  {`  session, secretId: 42n, plaintext: 'Hello',`}
                  <br />
                  {`  blackboxUrl, readClient,`}
                  <br />
                  {`});`}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Secret ID
                    </label>
                    <input
                      type="number"
                      value={secretId}
                      onChange={(e) => setSecretId(e.target.value)}
                      placeholder="e.g. 42"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Plaintext
                    </label>
                    <textarea
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                      placeholder="Enter text to encrypt..."
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors resize-none"
                    />
                  </div>
                </div>

                {encryptError && (
                  <p className="text-xs text-red-400 mb-3">{encryptError}</p>
                )}

                <Button
                  variant="accent"
                  onClick={handleEncrypt}
                  disabled={
                    isEncrypting || !hasSession || !hasReadClient || !secretId || !plaintext
                  }
                >
                  {isEncrypting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Encrypt
                    </>
                  )}
                </Button>
              </div>

              {/* ---- Encryption Result ---- */}
              {(ciferEnvelope || encryptedMessage) && (
                <div className="glow-card p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Encryption Result
                  </h3>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-zinc-500">
                        CIFER Envelope
                      </label>
                      <button
                        onClick={() => copyToClipboard(ciferEnvelope, "cifer")}
                        className="text-xs text-zinc-500 hover:text-[#00ff9d] flex items-center gap-1 transition-colors"
                      >
                        {copiedField === "cifer" ? (
                          <>
                            <Check className="h-3 w-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs font-mono text-zinc-300 break-all max-h-24 overflow-auto">
                        {ciferEnvelope}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-zinc-500">
                        Encrypted Message
                      </label>
                      <button
                        onClick={() =>
                          copyToClipboard(encryptedMessage, "encrypted")
                        }
                        className="text-xs text-zinc-500 hover:text-[#00ff9d] flex items-center gap-1 transition-colors"
                      >
                        {copiedField === "encrypted" ? (
                          <>
                            <Check className="h-3 w-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs font-mono text-zinc-300 break-all max-h-24 overflow-auto">
                        {encryptedMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <ArrowDown className="h-4 w-4 text-[#00ff9d]" />
                    <span>
                      Results auto-populated in the decrypt section below
                    </span>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* DECRYPT SECTION                                               */}
              {/* ============================================================= */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Decrypt Payload
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Provide the secret ID, CIFER envelope, and encrypted message
                  to decrypt. These are auto-filled after encryption, or you can
                  paste values manually.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.blackbox.payload.decryptPayload({`}
                  <br />
                  {`  session, secretId: 42n,`}
                  <br />
                  {`  encryptedMessage: '...', cifer: '...',`}
                  <br />
                  {`  blackboxUrl, readClient,`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.decryptedMessage → original plaintext`}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
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
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      CIFER Envelope
                    </label>
                    <textarea
                      value={decCifer}
                      onChange={(e) => setDecCifer(e.target.value)}
                      placeholder="Paste the cifer envelope here..."
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Encrypted Message
                    </label>
                    <textarea
                      value={decEncrypted}
                      onChange={(e) => setDecEncrypted(e.target.value)}
                      placeholder="Paste the encrypted message here..."
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors resize-none"
                    />
                  </div>
                </div>

                {decryptError && (
                  <p className="text-xs text-red-400 mb-3">{decryptError}</p>
                )}

                <Button
                  variant="accent"
                  onClick={handleDecrypt}
                  disabled={
                    isDecrypting ||
                    !hasSession ||
                    !hasReadClient ||
                    !decSecretId ||
                    !decEncrypted ||
                    !decCifer
                  }
                >
                  {isDecrypting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      Decrypt
                    </>
                  )}
                </Button>
              </div>

              {/* ---- Decryption Result ---- */}
              {decryptedMessage && (
                <div className="glow-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                    <h3 className="text-lg font-semibold text-white">
                      Decrypted Message
                    </h3>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                    <p className="text-sm text-white whitespace-pre-wrap">
                      {decryptedMessage}
                    </p>
                  </div>
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
