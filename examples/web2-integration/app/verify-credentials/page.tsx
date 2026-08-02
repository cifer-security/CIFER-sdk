/**
 * Verify Credentials Page
 * =====================
 *
 * Demonstrates web2.auth.verifyCredentials() — Web2-only email + password
 * validation against the Blackbox principal store.
 *
 *   web2.auth.verifyCredentials({ email, password, blackboxUrl })
 *     → { valid: true, principalId }
 *
 * Does NOT create a session or return session tokens. Use this when another
 * system needs to confirm credentials before proceeding (e.g. app unlock,
 * key rotation pre-check).
 *
 * Wrong credentials throw Web2AuthError (401/403/404).
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"

// ===========================================================================
// Verify Credentials Page
// ===========================================================================

export default function VerifyCredentialsPage() {
  const { blackboxUrl, email, logs, log } = useWeb2()

  const [localEmail, setLocalEmail] = useState(email)
  const [password, setPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<{ valid: true; principalId: string } | null>(null)
  const [error, setError] = useState("")

  const handleVerify = useCallback(async () => {
    if (!localEmail || !password) return

    try {
      setIsVerifying(true)
      setError("")
      setResult(null)

      log("Verifying Web2 credentials...")
      log(`  email: ${localEmail}`)
      log("  (Web2 only — does not create a session)")

      const res = await web2.auth.verifyCredentials({
        email: localEmail,
        password,
        blackboxUrl,
      })

      setResult(res)
      log("Credentials verified!")
      log(`  valid: ${res.valid}`)
      log(`  principalId: ${res.principalId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsVerifying(false)
    }
  }, [localEmail, password, blackboxUrl, log])

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
                <ShieldCheck className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.auth
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Verify <span className="text-accent">Credentials</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              <strong className="text-zinc-300 font-normal">Web2 only</strong>{" "}
              (<code className="text-zinc-300 font-mono text-sm">chainId = -1</code>
              ). Confirm email + password against the Blackbox principal store.
              Does not create a session — use{" "}
              <code className="text-zinc-300 font-mono text-sm">
                web2.session.createManagedSession()
              </code>{" "}
              separately after credentials are confirmed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    web2.auth.verifyCredentials
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Email + Password Check
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  No session required. Requires a verified email address.
                  Not available for Web3 wallet users.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`// Web2 only — not for Web3 wallet users`}
                  <br />
                  {`const result = await web2.auth.verifyCredentials({`}
                  <br />
                  {`  email: 'user@example.com',`}
                  <br />
                  {`  password: 'securePassword123',`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.valid → true`}
                  <br />
                  {`// result.principalId → UUID`}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={localEmail}
                      onChange={(e) => {
                        setLocalEmail(e.target.value)
                        setResult(null)
                        setError("")
                      }}
                      placeholder="user@example.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setResult(null)
                        setError("")
                      }}
                      placeholder="securePassword123"
                      onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                    />
                  </div>
                </div>

                {result && (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                      <span className="text-sm text-white font-semibold">
                        Credentials Valid
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">valid</p>
                      <p className="text-xs font-mono text-[#00ff9d]">
                        {String(result.valid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Principal ID</p>
                      <p className="text-xs font-mono text-[#00ff9d] break-all">
                        {result.principalId}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  variant="accent"
                  onClick={handleVerify}
                  disabled={isVerifying || !localEmail || !password}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verify Credentials
                    </>
                  )}
                </Button>
              </div>
            </div>

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
