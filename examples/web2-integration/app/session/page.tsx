/**
 * Session Page
 * ============
 *
 * Demonstrates web2.session.createManagedSession() — creating a
 * managed session using the Ed25519 key registered during the
 * registration flow.
 *
 * A managed session:
 *   - Generates an ephemeral EOA keypair
 *   - Authenticates with the blackbox using the Ed25519 signer
 *   - Auto-renews when close to expiry (via session.ensureValid())
 *
 * After session creation, the session is stored in the Web2Context
 * and used by all subsequent operations (secrets, encryption, etc.).
 *
 * SDK function used:
 *   web2.session.createManagedSession({
 *     principalId, ed25519Signer, blackboxUrl, ttl?
 *   })
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Key, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"
import { restoreEd25519Signer, serializeKeys } from "@/lib/ed25519"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"

// ===========================================================================
// Session Page
// ===========================================================================

export default function SessionPage() {
  const {
    blackboxUrl,
    principalId,
    setPrincipalId,
    ed25519Signer,
    setEd25519Signer,
    session,
    setSession,
    sessionRef,
    logs,
    log,
  } = useWeb2()

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  
  // Manual entry state (for users who already registered)
  const [manualPrincipalId, setManualPrincipalId] = useState("")
  const [manualPrivateKey, setManualPrivateKey] = useState("")
  const [isRestoring, setIsRestoring] = useState(false)

  const hasPrerequisites = !!principalId && !!ed25519Signer

  // =========================================================================
  // Restore signer from private key
  // =========================================================================
  const handleRestoreSigner = useCallback(() => {
    if (!manualPrincipalId || !manualPrivateKey) return

    try {
      setIsRestoring(true)
      setError("")

      log("Restoring Ed25519 signer from private key...")
      
      const signer = restoreEd25519Signer(manualPrivateKey.trim())
      const keys = serializeKeys(signer)
      
      setEd25519Signer(signer)
      setPrincipalId(manualPrincipalId.trim())

      log("Signer restored successfully!")
      log(`  principalId: ${manualPrincipalId.trim()}`)
      log(`  publicKey: ${keys.publicKeyHex}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsRestoring(false)
    }
  }, [manualPrincipalId, manualPrivateKey, setEd25519Signer, setPrincipalId, log])

  // =========================================================================
  // Create a managed session
  // =========================================================================
  const handleCreateSession = useCallback(async () => {
    // Use context values or manual values
    const effectivePrincipalId = principalId || manualPrincipalId.trim()
    const effectiveSigner = ed25519Signer

    if (!effectivePrincipalId || !effectiveSigner) return

    try {
      setIsCreating(true)
      setError("")

      // Log the old session address if we're recreating
      const oldSession = sessionRef.current
      if (oldSession) {
        log(`Recreating session (old address: ${oldSession.sessionAddress})...`)
      } else {
        log("Creating managed session...")
      }
      log(`  principalId: ${effectivePrincipalId}`)

      const newSession = await web2.session.createManagedSession({
        principalId: effectivePrincipalId,
        ed25519Signer: effectiveSigner,
        blackboxUrl,
      })

      setSession(newSession)

      log("Session created successfully!")
      log(`  sessionAddress: ${newSession.sessionAddress}`)
      log(`  expiresAt: ${newSession.expiresAt}`)
      log(`  isManaged: ${newSession.isManaged}`)
      if (oldSession) {
        log(`  (replaced old session ${oldSession.sessionAddress.slice(0, 10)}…)`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsCreating(false)
    }
  }, [principalId, manualPrincipalId, ed25519Signer, blackboxUrl, sessionRef, setSession, log])

  // =========================================================================
  // UI
  // =========================================================================
  return (
    <div className="page-bg min-h-screen">
      <div className="py-12">
        <Container>
          {/* ---- Back Navigation ---- */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#00ff9d] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* ---- Page Header ---- */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Key className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.session
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Create <span className="text-accent">Session</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Create a managed session using your Ed25519 key. The session is
              required for all authenticated operations (secrets, encryption, etc.).
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              {/* Prerequisites check */}
              {!hasPrerequisites && (
                <div className="glow-card p-6">
                  <div className="flex items-start gap-2 mb-4">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-400 mb-1">
                        Prerequisites missing
                      </p>
                      <p className="text-xs text-zinc-400">
                        If you haven&apos;t registered yet, you can register first. If you
                        already registered, enter your principalId and Ed25519 private key below.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Principal ID
                      </label>
                      <input
                        type="text"
                        value={manualPrincipalId}
                        onChange={(e) => setManualPrincipalId(e.target.value)}
                        placeholder="your-principal-uuid"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Ed25519 Private Key (hex)
                      </label>
                      <textarea
                        value={manualPrivateKey}
                        onChange={(e) => setManualPrivateKey(e.target.value)}
                        placeholder="ab12cd34..."
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="accent"
                      onClick={handleRestoreSigner}
                      disabled={isRestoring || !manualPrincipalId || !manualPrivateKey}
                    >
                      {isRestoring ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4" />
                          Restore &amp; Continue
                        </>
                      )}
                    </Button>
                    <Link href="/register">
                      <Button variant="outline">
                        Register First &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Create Session Card */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    createManagedSession
                  </span>
                  {session ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Create Managed Session
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Generates an ephemeral EOA keypair, authenticates with the
                  blackbox using your Ed25519 signer, and creates a session
                  that auto-renews.
                </p>

                {/* Code snippet */}
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const session = await web2.session.createManagedSession({`}
                  <br />
                  {`  principalId: '${principalId || manualPrincipalId || "<enter principalId>"}',`}
                  <br />
                  {`  ed25519Signer,`}
                  <br />
                  {`  blackboxUrl: '${blackboxUrl}',`}
                  <br />
                  {`});`}
                  <br />
                  <br />
                  {`// session.sessionAddress → ephemeral EOA`}
                  <br />
                  {`// session.expiresAt → ISO timestamp`}
                  <br />
                  {`// session.ensureValid() → auto-renew`}
                </div>

                {/* Current state */}
                {(principalId || manualPrincipalId) && (
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 mb-4">
                    <p className="text-xs text-zinc-500 mb-1">Principal ID</p>
                    <p className="text-xs font-mono text-zinc-300 break-all">
                      {principalId || manualPrincipalId}
                    </p>
                  </div>
                )}

                {session ? (
                  <div className="space-y-3">
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 space-y-3">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Session Address</p>
                        <p className="text-xs font-mono text-[#00ff9d] break-all">
                          {session.sessionAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Expires At</p>
                        <p className="text-xs font-mono text-zinc-300">
                          {session.expiresAt}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Managed</p>
                        <p className="text-xs font-mono text-zinc-300">
                          {session.isManaged ? "Yes (auto-renewable)" : "No"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCreateSession}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Recreate Session"
                        )}
                      </Button>
                      <Link href="/secrets">
                        <Button variant="outline" size="sm">
                          Go to Secrets &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="accent"
                    onClick={handleCreateSession}
                    disabled={isCreating || (!hasPrerequisites && !ed25519Signer)}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Session...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Create Session
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* ---- Right Column: Logs + Error ---- */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {error && (
                <div className="glow-card-subtle p-4 border-l-2 border-red-500/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}
              <ConsoleLog logs={logs} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
