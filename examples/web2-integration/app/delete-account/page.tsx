/**
 * Delete Account Page
 * ===================
 *
 * Demonstrates the Web2 account-deletion flow:
 *
 * Step 1: Request Account Deletion
 *   1. web2.auth.requestAccountDeletion({ email, password, principalId, blackboxUrl })
 *      -> sends an account-deletion OTP to the email
 *
 * Step 2: Confirm Account Deletion
 *   2. web2.auth.confirmAccountDeletion({ email, otp, blackboxUrl })
 *      -> makes the account dormant/hidden
 *
 * Re-registering later with the same email reactivates the same principalId,
 * so old secrets return instead of creating a fresh account.
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Mail,
  ShieldAlert,
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
// Delete Account Page
// ===========================================================================

export default function DeleteAccountPage() {
  const { blackboxUrl, email, password, principalId, logs, log } = useWeb2()

  // ---- Local state ----
  const [localEmail, setLocalEmail] = useState(email)
  const [localPassword, setLocalPassword] = useState(password)
  const [localPrincipalId, setLocalPrincipalId] = useState(principalId)
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"request" | "confirm" | "done">("request")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // =========================================================================
  // Step 1: Request account-deletion OTP
  // =========================================================================
  const handleRequestDeletion = useCallback(async () => {
    if (!localEmail || !localPassword || !localPrincipalId) return

    try {
      setIsLoading(true)
      setError("")

      log("Requesting account-deletion OTP...")
      log(`  email: ${localEmail}`)
      log(`  principalId: ${localPrincipalId}`)

      const result = await web2.auth.requestAccountDeletion({
        email: localEmail,
        password: localPassword,
        principalId: localPrincipalId,
        blackboxUrl,
      })

      log(`Deletion OTP requested!`)
      log(`  message: ${result.message}`)
      log("Check your email for the account-deletion OTP code.")

      setStep("confirm")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, localPassword, localPrincipalId, blackboxUrl, log])

  // =========================================================================
  // Step 2: Confirm account deletion with OTP
  // =========================================================================
  const handleConfirmDeletion = useCallback(async () => {
    if (!localEmail || !otp) return

    try {
      setIsLoading(true)
      setError("")

      log("Confirming account deletion...")

      const result = await web2.auth.confirmAccountDeletion({
        email: localEmail,
        otp,
        blackboxUrl,
      })

      log(`Account deletion confirmed!`)
      log(`  success: ${result.success}`)
      log(`  message: ${result.message}`)
      log(
        "The account is now dormant/hidden. Register again with the same email to reactivate the same principalId."
      )

      setStep("done")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, otp, blackboxUrl, log])

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
                <Trash2 className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.auth
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-accent">Delete</span> Account
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Request an emailed OTP, then confirm account deletion. Deletion
              makes the account dormant and hidden; re-registering with the same
              email reactivates the same principalId.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* ---- Left Column: Steps ---- */}
            <div className="space-y-6">
              <div className="glow-card-subtle p-4 border-l-2 border-amber-500/50">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-200/90">
                    This is a soft deletion. The account becomes dormant and
                    hidden from APIs, while compliance-retained data stays on
                    record. Registering again with this email reactivates the
                    same principalId and restores access to existing secrets.
                  </p>
                </div>
              </div>

              {/* Step 1: Request Deletion */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">Step 1</span>
                  {step !== "request" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Request Account-Deletion OTP
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Call{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    web2.auth.requestAccountDeletion()
                  </code>{" "}
                  with the registered email, password, and principalId. If they
                  match a verified account, an OTP will be sent to your inbox.
                </p>

                {/* Code snippet */}
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.auth.requestAccountDeletion({`}
                  <br />
                  {`  email: 'user@example.com',`}
                  <br />
                  {`  password: 'securePassword123',`}
                  <br />
                  {`  principalId,`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.message -> "OTP sent"`}
                </div>

                {step === "request" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={localEmail}
                        onChange={(e) => setLocalEmail(e.target.value)}
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
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                        placeholder="securePassword123"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Principal ID
                      </label>
                      <input
                        type="text"
                        value={localPrincipalId}
                        onChange={(e) => setLocalPrincipalId(e.target.value)}
                        placeholder="uuid from registration"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <Button
                      variant="accent"
                      onClick={handleRequestDeletion}
                      disabled={
                        isLoading ||
                        !localEmail ||
                        !localPassword ||
                        !localPrincipalId
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Requesting OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Request Deletion OTP
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {step !== "request" && (
                  <div className="space-y-3">
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Email</p>
                      <p className="text-xs font-mono text-[#00ff9d] break-all">
                        {localEmail}
                      </p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Principal ID</p>
                      <p className="text-xs font-mono text-[#00ff9d] break-all">
                        {localPrincipalId}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Confirm Deletion */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">Step 2</span>
                  {step === "done" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Enter the OTP from your email. Call{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    web2.auth.confirmAccountDeletion()
                  </code>{" "}
                  to make the account dormant and hidden.
                </p>

                {/* Code snippet */}
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`await web2.auth.confirmAccountDeletion({`}
                  <br />
                  {`  email, otp: '123456',`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`});`}
                  <br />
                  {`// Account becomes dormant/hidden`}
                </div>

                {step === "confirm" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="accent"
                        onClick={handleConfirmDeletion}
                        disabled={isLoading || !otp}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Confirm Deletion
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep("request")
                          setError("")
                        }}
                        disabled={isLoading}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </div>
                )}

                {step === "done" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#00ff9d]">
                      <CheckCircle className="h-4 w-4" />
                      Account deleted. Register again with the same email to
                      reactivate the same principalId.
                    </div>
                    <Link href="/register">
                      <Button variant="outline" size="sm">
                        Register / Reactivate &rarr;
                      </Button>
                    </Link>
                  </div>
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
