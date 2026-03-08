/**
 * Principal Lookup Page
 * =====================
 *
 * Demonstrates web2.principal.getByEmail() — looking up a principal
 * by their email address.
 *
 * Returns:
 *   - principalId (UUID)
 *   - emailHex (hex-encoded email)
 *
 * This is useful for finding other users' principal IDs when you
 * want to set them as delegates or transfer secrets.
 *
 * SDK function used:
 *   web2.principal.getByEmail(email, blackboxUrl, { fetch? })
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Loader2, User } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"

// ===========================================================================
// Principal Lookup Page
// ===========================================================================

export default function PrincipalPage() {
  const { blackboxUrl, logs, log } = useWeb2()

  const [lookupEmail, setLookupEmail] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<{ principalId: string; emailHex: string } | null>(null)
  const [error, setError] = useState("")

  // =========================================================================
  // Lookup principal by email
  // =========================================================================
  const handleLookup = useCallback(async () => {
    if (!lookupEmail) return

    try {
      setIsSearching(true)
      setError("")
      setResult(null)

      log(`Looking up principal by email: ${lookupEmail}...`)

      const res = await web2.principal.getByEmail(lookupEmail, blackboxUrl)

      setResult(res)
      log("Principal found!")
      log(`  principalId: ${res.principalId}`)
      log(`  emailHex: ${res.emailHex}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsSearching(false)
    }
  }, [lookupEmail, blackboxUrl, log])

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
                <Search className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.principal
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Principal <span className="text-accent">Lookup</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Look up a principal by email address. Useful for finding other
              users&apos; IDs when setting delegates or transferring secrets.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">
                    web2.principal.getByEmail
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Lookup by Email
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  No session required. Enter any registered email to get the
                  principal&apos;s UUID and email hex.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.principal.getByEmail(`}
                  <br />
                  {`  'user@example.com',`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`);`}
                  <br />
                  {`// result.principalId → UUID`}
                  <br />
                  {`// result.emailHex → hex-encoded email`}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={lookupEmail}
                      onChange={(e) => {
                        setLookupEmail(e.target.value)
                        setResult(null)
                        setError("")
                      }}
                      placeholder="user@example.com"
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 mb-3">{error}</p>
                )}

                {result && (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-[#00ff9d]" />
                      <span className="text-sm text-white font-semibold">Principal Found</span>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Principal ID</p>
                      <p className="text-xs font-mono text-[#00ff9d] break-all">
                        {result.principalId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Email Hex</p>
                      <p className="text-xs font-mono text-zinc-300 break-all">
                        {result.emailHex}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  variant="accent"
                  onClick={handleLookup}
                  disabled={isSearching || !lookupEmail}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Lookup Principal
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
