/**
 * Secrets Page
 * ============
 *
 * Demonstrates Web2 secret creation and listing:
 *
 *   web2.secret.createSecret({ session, blackboxUrl })
 *     → creates a new secret, returns secretId
 *
 *   web2.secret.listSecrets({ session, blackboxUrl })
 *     → lists all secrets for the current principal
 *
 * Requires an active session (from the Session page).
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Loader2,
  AlertCircle,
  Plus,
  List,
  Lock,
  FileUp,
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
// Secrets Page
// ===========================================================================

export default function SecretsPage() {
  const { blackboxUrl, session, sessionRef, logs, log } = useWeb2()

  // Create secret state
  const [isCreating, setIsCreating] = useState(false)
  const [createdSecretId, setCreatedSecretId] = useState<string>("")
  const [createError, setCreateError] = useState("")

  // List secrets state
  const [isListing, setIsListing] = useState(false)
  const [secrets, setSecrets] = useState<Array<{ secretId: number; owner: string; delegate: string }> | null>(null)
  const [listError, setListError] = useState("")

  const hasSession = !!session

  // =========================================================================
  // Create a new secret
  // =========================================================================
  const handleCreateSecret = useCallback(async () => {
    const s = sessionRef.current
    if (!s) return

    try {
      setIsCreating(true)
      setCreateError("")

      log("Creating new Web2 secret...")

      const result = await web2.secret.createSecret({
        session: s,
        blackboxUrl,
      })

      setCreatedSecretId(String(result.secretId))
      log(`Secret created successfully!`)
      log(`  secretId: ${result.secretId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setCreateError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsCreating(false)
    }
  }, [sessionRef, blackboxUrl, log])

  // =========================================================================
  // List all secrets
  // =========================================================================
  const handleListSecrets = useCallback(async () => {
    const s = sessionRef.current
    if (!s) return

    try {
      setIsListing(true)
      setListError("")

      log("Listing Web2 secrets...")

      const result = await web2.secret.listSecrets({
        session: s,
        blackboxUrl,
      })

      setSecrets(result.secrets)
      log(`Found ${result.secrets.length} secret(s)`)
      for (const sec of result.secrets) {
        log(`  #${sec.secretId} — owner: ${sec.owner}, delegate: ${sec.delegate || "none"}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setListError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsListing(false)
    }
  }, [sessionRef, blackboxUrl, log])

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
                <Shield className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.secret
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-accent">Secrets</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Create new Web2 secrets and list all secrets owned by your principal.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              {/* Prerequisites */}
              {!hasSession && (
                <div className="glow-card-subtle p-4 border-l-2 border-yellow-500/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-400 mb-2">Session required</p>
                      <p className="text-xs text-zinc-400">
                        Create a session first before managing secrets.
                      </p>
                      <Link href="/session" className="mt-2 inline-block">
                        <Button variant="outline" size="sm">
                          Go to Session &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Secret */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    web2.secret.createSecret
                  </span>
                  {createdSecretId ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Create Secret
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Create a new Web2 secret. The session signs the request
                  to authenticate you as the principal.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.secret.createSecret({`}
                  <br />
                  {`  session,`}
                  <br />
                  {`  blackboxUrl: '${blackboxUrl}',`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.secretId → number`}
                </div>

                {createError && (
                  <p className="text-xs text-red-400 mb-3">{createError}</p>
                )}

                {createdSecretId && (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
                    <p className="text-xs text-zinc-500 mb-1">Created Secret ID</p>
                    <p className="text-2xl font-bold text-white">#{createdSecretId}</p>
                  </div>
                )}

                {createdSecretId && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Link href="/payload">
                      <Button variant="outline" size="sm">
                        <Lock className="h-3.5 w-3.5" />
                        Encrypt / Decrypt Payload &rarr;
                      </Button>
                    </Link>
                    <Link href="/files">
                      <Button variant="outline" size="sm">
                        <FileUp className="h-3.5 w-3.5" />
                        Encrypt / Decrypt File &rarr;
                      </Button>
                    </Link>
                  </div>
                )}

                <Button
                  variant="accent"
                  onClick={handleCreateSecret}
                  disabled={isCreating || !hasSession}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Secret
                    </>
                  )}
                </Button>
              </div>

              {/* List Secrets */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    web2.secret.listSecrets
                  </span>
                  {secrets !== null ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  List Secrets
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  List all Web2 secrets owned by the current principal.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.secret.listSecrets({`}
                  <br />
                  {`  session, blackboxUrl,`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.secrets → [{ secretId, owner, delegate }]`}
                </div>

                {listError && (
                  <p className="text-xs text-red-400 mb-3">{listError}</p>
                )}

                {secrets !== null && (
                  <div className="space-y-2 mb-3">
                    {secrets.length === 0 ? (
                      <p className="text-xs text-zinc-600">No secrets found</p>
                    ) : (
                      secrets.map((s) => (
                        <div
                          key={s.secretId}
                          className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-white">
                              #{s.secretId}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            owner: <span className="text-zinc-400 font-mono">{s.owner}</span>
                          </p>
                          {s.delegate && (
                            <p className="text-xs text-zinc-500">
                              delegate: <span className="text-zinc-400 font-mono">{s.delegate}</span>
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {secrets !== null && secrets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Link href="/payload">
                      <Button variant="outline" size="sm">
                        <Lock className="h-3.5 w-3.5" />
                        Encrypt / Decrypt Payload &rarr;
                      </Button>
                    </Link>
                    <Link href="/files">
                      <Button variant="outline" size="sm">
                        <FileUp className="h-3.5 w-3.5" />
                        Encrypt / Decrypt File &rarr;
                      </Button>
                    </Link>
                  </div>
                )}

                <Button
                  variant={secrets !== null ? "ghost" : "outline"}
                  size={secrets !== null ? "sm" : "default"}
                  onClick={handleListSecrets}
                  disabled={isListing || !hasSession}
                >
                  {isListing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <List className="h-4 w-4" />
                      {secrets !== null ? "Refresh" : "List Secrets"}
                    </>
                  )}
                </Button>
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
