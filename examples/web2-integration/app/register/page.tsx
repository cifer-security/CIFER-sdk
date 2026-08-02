/**
 * Register Page
 * =============
 *
 * Demonstrates the full Web2 registration flow:
 *
 * Phase 1: Email + Password Registration
 *   1. web2.auth.register({ email, password, blackboxUrl })
 *      → sends OTP to email, returns principalId
 *   2. web2.auth.verifyEmail({ email, otp, blackboxUrl })
 *      → confirms email ownership
 *
 * Phase 2: Ed25519 Key Registration
 *   3. Generate Ed25519 keypair (via @noble/ed25519)
 *   4. web2.auth.registerKey({ principalId, password, ed25519Signer, blackboxUrl })
 *      → registers the public key with the cluster nodes
 *
 * Also demonstrates:
 *   - web2.auth.resendOtp({ email, blackboxUrl })
 *
 * After completing registration, the principalId, email, password,
 * and Ed25519 signer are stored in the Web2Context for use on other pages.
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, UserPlus, CheckCircle, Loader2, AlertCircle, Mail, Key } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"
import { generateEd25519Signer, serializeKeys } from "@/lib/ed25519"

// ---------------------------------------------------------------------------
// cifer-sdk imports
// ---------------------------------------------------------------------------
import { web2 } from "cifer-sdk"

// ===========================================================================
// Register Page
// ===========================================================================

export default function RegisterPage() {
  const {
    blackboxUrl,
    principalId,
    setPrincipalId,
    email,
    setEmail,
    password,
    setPassword,
    ed25519Signer,
    setEd25519Signer,
    logs,
    log,
  } = useWeb2()

  // ---- Local state ----
  const [localEmail, setLocalEmail] = useState(email)
  const [localPassword, setLocalPassword] = useState(password)
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"register" | "verify" | "generate-key" | "register-key" | "done">(
    principalId && ed25519Signer ? "done" : principalId ? "verify" : "register"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedSigner, setGeneratedSigner] = useState<ReturnType<typeof generateEd25519Signer> | null>(null)

  // =========================================================================
  // Step 1: Register with email + password
  // =========================================================================
  const handleRegister = useCallback(async () => {
    if (!localEmail || !localPassword) return

    try {
      setIsLoading(true)
      setError("")

      log("Registering with email + password...")
      log(`  email: ${localEmail}`)

      const result = await web2.auth.register({
        email: localEmail,
        password: localPassword,
        blackboxUrl,
      })

      setPrincipalId(result.principalId)
      setEmail(localEmail)
      setPassword(localPassword)

      log(`Registration successful!`)
      log(`  principalId: ${result.principalId}`)
      log(`  message: ${result.message}`)
      log("Check your email for the OTP verification code.")

      setStep("verify")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, localPassword, blackboxUrl, setPrincipalId, setEmail, setPassword, log])

  // =========================================================================
  // Step 2: Verify email with OTP
  // =========================================================================
  const handleVerifyEmail = useCallback(async () => {
    if (!otp) return

    try {
      setIsLoading(true)
      setError("")

      log(`Verifying email with OTP: ${otp}...`)

      const result = await web2.auth.verifyEmail({
        email: localEmail,
        otp,
        blackboxUrl,
      })

      log(`Email verified!`)
      log(`  principalId: ${result.principalId}`)
      log(`  emailVerified: ${result.emailVerified}`)

      setStep("generate-key")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [otp, localEmail, blackboxUrl, log])

  // =========================================================================
  // Resend OTP
  // =========================================================================
  const handleResendOtp = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      log("Resending OTP...")

      const result = await web2.auth.resendOtp({
        email: localEmail,
        blackboxUrl,
      })

      log(`OTP resent: ${result.message}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, blackboxUrl, log])

  // =========================================================================
  // Step 3: Generate Ed25519 keypair
  // =========================================================================
  const handleGenerateKey = useCallback(() => {
    try {
      log("Generating Ed25519 keypair...")
      const signer = generateEd25519Signer()
      const keys = serializeKeys(signer)

      setGeneratedSigner(signer)

      log(`Keypair generated!`)
      log(`  publicKey: ${keys.publicKeyHex}`)
      log(`  privateKey: ${keys.privateKeyHex}`)

      setStep("register-key")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    }
  }, [log])

  // =========================================================================
  // Step 4: Register Ed25519 key
  // =========================================================================
  const handleRegisterKey = useCallback(async () => {
    if (!generatedSigner) return

    try {
      setIsLoading(true)
      setError("")

      // Register the key with the cluster
      log("Registering Ed25519 key with cluster nodes...")

      const result = await web2.auth.registerKey({
        principalId,
        password: localPassword,
        ed25519Signer: generatedSigner,
        blackboxUrl,
      })

      log(`Key registered!`)
      log(`  principalId: ${result.principalId}`)
      log(`  emailHex: ${result.emailHex}`)
      log(`  nodeRegistrationStatus: ${result.nodeRegistrationStatus}`)

      if (result.failedNodes.length > 0) {
        log(`  failedNodes: ${result.failedNodes.join(", ")}`)
      }

      // Store the signer in context
      setEd25519Signer(generatedSigner)

      setStep("done")
      log("Registration complete! You can now create a session.")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [principalId, localPassword, generatedSigner, blackboxUrl, setEd25519Signer, log])

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
                <UserPlus className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.auth
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              <span className="text-accent">Register</span> Account
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Create a new Web2 account with email and password, verify via OTP,
              then register an Ed25519 key for session signing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* ---- Left Column: Steps ---- */}
            <div className="space-y-6">
              {/* Step 1: Register */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">Step 1</span>
                  {step !== "register" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Register with Email
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Call{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    web2.auth.register()
                  </code>{" "}
                  with your email and password. An OTP will be sent to your email.
                </p>

                {/* Code snippet */}
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`const result = await web2.auth.register({`}
                  <br />
                  {`  email: 'user@example.com',`}
                  <br />
                  {`  password: 'securePassword123',`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`});`}
                  <br />
                  {`// result.principalId → UUID`}
                </div>

                {step === "register" && (
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
                    <Button
                      variant="accent"
                      onClick={handleRegister}
                      disabled={isLoading || !localEmail || !localPassword}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Register
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {step !== "register" && principalId && (
                  <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Principal ID</p>
                    <p className="text-xs font-mono text-[#00ff9d] break-all">
                      {principalId}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Verify Email */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">Step 2</span>
                  {step === "generate-key" || step === "register-key" || step === "done" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Verify Email (OTP)
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Enter the OTP sent to your email. Call{" "}
                  <code className="text-zinc-300 font-mono text-xs">
                    web2.auth.verifyEmail()
                  </code>.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`await web2.auth.verifyEmail({`}
                  <br />
                  {`  email, otp: '123456', blackboxUrl,`}
                  <br />
                  {`});`}
                </div>

                {step === "verify" && (
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
                        onClick={handleVerifyEmail}
                        disabled={isLoading || !otp}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Verify
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </div>
                )}

                {(step === "generate-key" || step === "register-key" || step === "done") && (
                  <div className="flex items-center gap-2 text-sm text-[#00ff9d]">
                    <CheckCircle className="h-4 w-4" />
                    Email verified
                  </div>
                )}
              </div>

              {/* Step 3: Generate Ed25519 Key */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">Step 3</span>
                  {step === "register-key" || step === "done" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generate Ed25519 Keypair
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Generate an Ed25519 keypair using @noble/ed25519. The keys will
                  be displayed so you can review them before registration.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`// Generate keypair with @noble/ed25519`}
                  <br />
                  {`const signer = generateEd25519Signer();`}
                  <br />
                  {`const keys = serializeKeys(signer);`}
                  <br />
                  {`// keys.publicKeyHex → hex string`}
                  <br />
                  {`// keys.privateKeyHex → hex string`}
                </div>

                {step === "generate-key" && (
                  <Button
                    variant="accent"
                    onClick={handleGenerateKey}
                    disabled={isLoading}
                  >
                    <Key className="h-4 w-4" />
                    Generate Keypair
                  </Button>
                )}

                {generatedSigner && (step === "register-key" || step === "done") && (
                  <div className="space-y-3">
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Public Key</p>
                      <p className="text-xs font-mono text-[#00ff9d] break-all">
                        {serializeKeys(generatedSigner).publicKeyHex}
                      </p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Private Key</p>
                      <p className="text-xs font-mono text-zinc-400 break-all">
                        {serializeKeys(generatedSigner).privateKeyHex}
                      </p>
                    </div>
                    {step === "register-key" && (
                      <p className="text-xs text-zinc-500">
                        Keypair generated. Proceed to Step 4 to register it.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Register Ed25519 Key */}
              <div className="glow-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-zinc-500">Step 4</span>
                  {step === "done" ? (
                    <CheckCircle className="h-4 w-4 text-[#00ff9d]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-700" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Register Ed25519 Key
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Register the generated Ed25519 keypair with the cluster nodes.
                  This key will be used to create sessions.
                </p>

                <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                  {`await web2.auth.registerKey({`}
                  <br />
                  {`  principalId, password,`}
                  <br />
                  {`  ed25519Signer: signer,`}
                  <br />
                  {`  blackboxUrl,`}
                  <br />
                  {`});`}
                </div>

                {step === "register-key" && (
                  <Button
                    variant="accent"
                    onClick={handleRegisterKey}
                    disabled={isLoading || !generatedSigner}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Registering Key...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Register Key
                      </>
                    )}
                  </Button>
                )}

                {step === "done" && ed25519Signer && (
                  <div className="space-y-3">
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-1">Public Key</p>
                      <p className="text-xs font-mono text-[#00ff9d] break-all">
                        {serializeKeys(ed25519Signer).publicKeyHex}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#00ff9d]">
                      <CheckCircle className="h-4 w-4" />
                      Registration complete! Go to Session to create a session.
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
