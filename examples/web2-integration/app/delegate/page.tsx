/**
 * Delegate Page
 * =============
 *
 * Demonstrates web2.delegate.setDelegate() — setting or removing
 * a delegate for a Web2 secret.
 *
 * A delegate can encrypt/decrypt data using the secret owner's key.
 * Pass an empty string as delegatePrincipalId to remove the delegate.
 *
 * SDK function used:
 *   web2.delegate.setDelegate({
 *     session, secretId, delegatePrincipalId, blackboxUrl
 *   })
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Users, CheckCircle, Loader2, AlertCircle, Send } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"

// ===========================================================================
// Delegate Page
// ===========================================================================

export default function DelegatePage() {
  const { blackboxUrl, session, sessionRef, logs, log } = useWeb2()

  const [secretId, setSecretId] = useState("")
  const [delegatePrincipalId, setDelegatePrincipalId] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState("")

  const hasSession = !!session

  // =========================================================================
  // Set delegate
  // =========================================================================
  const handleSetDelegate = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !secretId) return

    try {
      setIsSending(true)
      setError("")
      setResult(null)

      log(`Setting delegate for secret #${secretId}...`)
      log(`  delegatePrincipalId: ${delegatePrincipalId || "(empty — removes delegate)"}`)

      const res = await web2.delegate.setDelegate({
        session: s,
        secretId: BigInt(secretId),
        delegatePrincipalId,
        blackboxUrl,
      })

      setResult(res as unknown as Record<string, unknown>)
      log(`Delegate set successfully!`)
      log(`  result: ${JSON.stringify(res)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsSending(false)
    }
  }, [sessionRef, secretId, delegatePrincipalId, blackboxUrl, log])

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
                <Users className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.delegate
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Set <span className="text-accent">Delegate</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Set or remove a delegate for a Web2 secret. Delegates can
              encrypt and decrypt data using the secret&apos;s key.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              {!hasSession && (
                <div className="glow-card-subtle p-4 border-l-2 border-yellow-500/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-400 mb-2">Session required</p>
                      <p className="text-xs text-zinc-400">Create a session first.</p>
                      <Link href="/session" className="mt-2 inline-block">
                        <Button variant="outline" size="sm">
                          Go to Session &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    web2.delegate.setDelegate
                  </span>
                  {result ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Set Delegate
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Only the secret owner can set a delegate. Leave the delegate
                  field empty to remove an existing delegate.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`await web2.delegate.setDelegate({`}
                  <br />
                  {`  session,`}
                  <br />
                  {`  secretId: 42n,`}
                  <br />
                  {`  delegatePrincipalId: 'delegate-uuid',`}
                  <br />
                  {`  blackboxUrl,`}
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
                      onChange={(e) => {
                        setSecretId(e.target.value)
                        setResult(null)
                      }}
                      placeholder="e.g. 42"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Delegate Principal ID
                    </label>
                    <input
                      type="text"
                      value={delegatePrincipalId}
                      onChange={(e) => {
                        setDelegatePrincipalId(e.target.value)
                        setResult(null)
                      }}
                      placeholder="delegate-principal-uuid (empty to remove)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

                {result && (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
                    <p className="text-xs text-zinc-500 mb-1">Result</p>
                    <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}

                <Button
                  variant="accent"
                  onClick={handleSetDelegate}
                  disabled={isSending || !hasSession || !secretId}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting Delegate...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Set Delegate
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <ConsoleLog logs={logs} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
