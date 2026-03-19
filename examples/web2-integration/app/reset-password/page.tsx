/**
 * Reset Password Page
 * ===================
 *
 * Demonstrates the Web2 password reset flow:
 *
 * Step 1: Forgot Password
 *   1. web2.auth.forgotPassword({ email, blackboxUrl })
 *      → sends a password-reset OTP to the email
 *
 * Step 2: Reset Password
 *   2. web2.auth.resetPassword({ email, otp, newPassword, blackboxUrl })
 *      → verifies the OTP and sets the new password
 *
 * The email is pre-filled from the Web2Context if the user has already
 * registered in this session.
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, KeyRound, CheckCircle, Loader2, AlertCircle, Mail } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"

// ===========================================================================
// Reset Password Page
// ===========================================================================

export default function ResetPasswordPage() {
  const { blackboxUrl, email, logs, log } = useWeb2()

  // ---- Local state ----
  const [localEmail, setLocalEmail] = useState(email)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState<"forgot" | "reset" | "done">("forgot")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // =========================================================================
  // Step 1: Send password-reset OTP
  // =========================================================================
  const handleForgotPassword = useCallback(async () => {
    if (!localEmail) return

    try {
      setIsLoading(true)
      setError("")

      log("Sending password-reset OTP...")
      log(`  email: ${localEmail}`)

      const result = await web2.auth.forgotPassword({
        email: localEmail,
        blackboxUrl,
      })

      log(`OTP sent!`)
      log(`  message: ${result.message}`)
      log("Check your email for the password-reset OTP code.")

      setStep("reset")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, blackboxUrl, log])

  // =========================================================================
  // Step 2: Reset password with OTP
  // =========================================================================
  const handleResetPassword = useCallback(async () => {
    if (!otp || !newPassword) return

    try {
      setIsLoading(true)
      setError("")

      log("Resetting password...")

      const result = await web2.auth.resetPassword({
        email: localEmail,
        otp,
        newPassword,
        blackboxUrl,
      })

      log(`Password reset successful!`)
      log(`  message: ${result.message}`)

      setStep("done")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, otp, newPassword, blackboxUrl, log])

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
                <KeyRound className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.auth
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-accent">Reset</span> Password
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Forgot your password? Request a password-reset OTP, then set a new
              password. Requires a verified email address.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* ---- Left Column: Steps ---- */}
            <div className="space-y-6">
              {/* Step 1: Forgot Password */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">Step 1</span>
                  {step !== "forgot" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Request Password-Reset OTP
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Call{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    web2.auth.forgotPassword()
                  </code>{" "}
                  with your registered email. A password-reset OTP will be sent
                  to your inbox. Has a 60-second cooldown between requests.
                </p>

                {/* Code snippet */}
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.auth.forgotPassword({`}
                  <br />
                  {`  email: 'user@example.com',`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.message → "OTP sent"`}
                </div>

                {step === "forgot" && (
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
                    <Button
                      variant="accent"
                      onClick={handleForgotPassword}
                      disabled={isLoading || !localEmail}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Send Reset OTP
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {step !== "forgot" && (
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Email</p>
                    <p className="text-xs font-mono text-[#00ff9d] break-all">
                      {localEmail}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Reset Password */}
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
                  Reset Password
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Enter the OTP from your email and your new password. Call{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    web2.auth.resetPassword()
                  </code>.
                </p>

                {/* Code snippet */}
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`await web2.auth.resetPassword({`}
                  <br />
                  {`  email, otp: '123456',`}
                  <br />
                  {`  newPassword: 'newSecurePassword',`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`});`}
                </div>

                {step === "reset" && (
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
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="newSecurePassword123"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="accent"
                        onClick={handleResetPassword}
                        disabled={isLoading || !otp || !newPassword}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-4 w-4" />
                            Reset Password
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setStep("forgot"); setError("") }}
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
                      Password reset successfully! You can now create a session with your new password.
                    </div>
                    <Link href="/session">
                      <Button variant="outline" size="sm">
                        Create Session &rarr;
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
