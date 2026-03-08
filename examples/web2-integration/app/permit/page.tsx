/**
 * Permit Page
 * ===========
 *
 * Demonstrates web2.permit.requestPermit() for the three permit types:
 *
 *   1. Rotate — email+password auth, payload: { newPublicKey }
 *   2. Transfer — session-based auth, payload: { newOwnerPrincipalId }
 *   3. Delegate — session-based auth, payload: { delegatePrincipalId }
 *
 * Each tab shows the corresponding form and SDK call.
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  FileCheck,
  Loader2,
  AlertCircle,
  RotateCw,
  ArrowRightLeft,
  Users,
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
// Permit Page
// ===========================================================================

type Tab = "rotate" | "transfer" | "delegate"

export default function PermitPage() {
  const { blackboxUrl, session, sessionRef, email: ctxEmail, password: ctxPassword, logs, log } = useWeb2()

  const [tab, setTab] = useState<Tab>("rotate")

  // Rotate state — email/password are editable, pre-filled from context
  const [rotateEmail, setRotateEmail] = useState(ctxEmail ?? "")
  const [rotatePassword, setRotatePassword] = useState(ctxPassword ?? "")
  const [newPublicKey, setNewPublicKey] = useState("")
  const [rotateResult, setRotateResult] = useState<Record<string, unknown> | null>(null)
  const [rotateLoading, setRotateLoading] = useState(false)
  const [rotateError, setRotateError] = useState("")

  // Transfer state
  const [transferSecretId, setTransferSecretId] = useState("")
  const [newOwnerPrincipalId, setNewOwnerPrincipalId] = useState("")
  const [transferResult, setTransferResult] = useState<Record<string, unknown> | null>(null)
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState("")

  // Delegate state
  const [delegateSecretId, setDelegateSecretId] = useState("")
  const [delegatePrincipalId, setDelegatePrincipalId] = useState("")
  const [delegateResult, setDelegateResult] = useState<Record<string, unknown> | null>(null)
  const [delegateLoading, setDelegateLoading] = useState(false)
  const [delegateError, setDelegateError] = useState("")

  // =========================================================================
  // Rotate permit
  // =========================================================================
  const handleRotate = useCallback(async () => {
    if (!rotateEmail || !rotatePassword || !newPublicKey) return
    try {
      setRotateLoading(true)
      setRotateError("")
      setRotateResult(null)

      log("Requesting rotate permit...")
      log(`  email: ${rotateEmail}`)
      log(`  newPublicKey: ${newPublicKey.slice(0, 20)}...`)

      const result = await web2.permit.requestPermit({
        action: "rotate",
        email: rotateEmail,
        password: rotatePassword,
        payload: { newPublicKey },
        blackboxUrl,
      })

      setRotateResult(result as unknown as Record<string, unknown>)
      log("Rotate permit issued!")
      log(`  result: ${JSON.stringify(result)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setRotateError(message)
      log(`ERROR: ${message}`)
    } finally {
      setRotateLoading(false)
    }
  }, [rotateEmail, rotatePassword, newPublicKey, blackboxUrl, log])

  // =========================================================================
  // Transfer permit
  // =========================================================================
  const handleTransfer = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !transferSecretId || !newOwnerPrincipalId) return
    try {
      setTransferLoading(true)
      setTransferError("")
      setTransferResult(null)

      log("Requesting transfer permit...")
      log(`  secretId: ${transferSecretId}`)
      log(`  newOwnerPrincipalId: ${newOwnerPrincipalId}`)

      const result = await web2.permit.requestPermit({
        action: "transfer",
        session: s,
        secretId: Number(transferSecretId),
        payload: { newOwnerPrincipalId },
        blackboxUrl,
      })

      setTransferResult(result as unknown as Record<string, unknown>)
      log("Transfer permit issued!")
      log(`  result: ${JSON.stringify(result)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setTransferError(message)
      log(`ERROR: ${message}`)
    } finally {
      setTransferLoading(false)
    }
  }, [sessionRef, transferSecretId, newOwnerPrincipalId, blackboxUrl, log])

  // =========================================================================
  // Delegate permit
  // =========================================================================
  const handleDelegate = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !delegateSecretId || !delegatePrincipalId) return
    try {
      setDelegateLoading(true)
      setDelegateError("")
      setDelegateResult(null)

      log("Requesting delegate permit...")
      log(`  secretId: ${delegateSecretId}`)
      log(`  delegatePrincipalId: ${delegatePrincipalId}`)

      const result = await web2.permit.requestPermit({
        action: "delegate",
        session: s,
        secretId: Number(delegateSecretId),
        payload: { delegatePrincipalId },
        blackboxUrl,
      })

      setDelegateResult(result as unknown as Record<string, unknown>)
      log("Delegate permit issued!")
      log(`  result: ${JSON.stringify(result)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setDelegateError(message)
      log(`ERROR: ${message}`)
    } finally {
      setDelegateLoading(false)
    }
  }, [sessionRef, delegateSecretId, delegatePrincipalId, blackboxUrl, log])

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
                <FileCheck className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                web2.permit
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Request <span className="text-accent">Permit</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Request permits for key rotation, secret transfer, or delegation operations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex gap-1 bg-zinc-900/50 rounded-lg p-1">
                {(
                  [
                    { id: "rotate" as Tab, label: "Rotate", icon: RotateCw },
                    { id: "transfer" as Tab, label: "Transfer", icon: ArrowRightLeft },
                    { id: "delegate" as Tab, label: "Delegate", icon: Users },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-md transition-all ${
                      tab === id
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* --- Rotate Tab --- */}
              {tab === "rotate" && (
                <div className="glow-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Rotate Key Permit
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Uses email+password authentication (no session required).
                    Provide a new Ed25519 public key to rotate to.
                  </p>

                  <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                    {`await web2.permit.requestPermit({`}
                    <br />
                    {`  action: 'rotate',`}
                    <br />
                    {`  email, password,`}
                    <br />
                    {`  payload: { newPublicKey },`}
                    <br />
                    {`  blackboxUrl,`}
                    <br />
                    {`});`}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={rotateEmail}
                        onChange={(e) => setRotateEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={rotatePassword}
                        onChange={(e) => setRotatePassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        New Public Key (hex)
                      </label>
                      <input
                        type="text"
                        value={newPublicKey}
                        onChange={(e) => setNewPublicKey(e.target.value)}
                        placeholder="e.g. ab12cd34..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                  </div>

                  {rotateError && <p className="text-xs text-red-400 mb-3">{rotateError}</p>}
                  {rotateResult && (
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
                      <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(rotateResult, null, 2)}
                      </pre>
                    </div>
                  )}

                  <Button
                    variant="accent"
                    onClick={handleRotate}
                    disabled={rotateLoading || !rotateEmail || !rotatePassword || !newPublicKey}
                  >
                    {rotateLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Requesting...</>
                    ) : (
                      <><RotateCw className="h-4 w-4" /> Request Rotate Permit</>
                    )}
                  </Button>
                </div>
              )}

              {/* --- Transfer Tab --- */}
              {tab === "transfer" && (
                <div className="glow-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Transfer Ownership Permit
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Uses session-based signing. Transfers ownership of a secret
                    to a new principal.
                  </p>

                  <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                    {`await web2.permit.requestPermit({`}
                    <br />
                    {`  action: 'transfer',`}
                    <br />
                    {`  session,`}
                    <br />
                    {`  secretId: 42,`}
                    <br />
                    {`  payload: { newOwnerPrincipalId },`}
                    <br />
                    {`  blackboxUrl,`}
                    <br />
                    {`});`}
                  </div>

                  {!session && (
                    <div className="text-xs text-yellow-400 mb-3 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Session required for transfer permits
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Secret ID
                      </label>
                      <input
                        type="number"
                        value={transferSecretId}
                        onChange={(e) => setTransferSecretId(e.target.value)}
                        placeholder="e.g. 42"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        New Owner Principal ID
                      </label>
                      <input
                        type="text"
                        value={newOwnerPrincipalId}
                        onChange={(e) => setNewOwnerPrincipalId(e.target.value)}
                        placeholder="new-owner-uuid"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                  </div>

                  {transferError && <p className="text-xs text-red-400 mb-3">{transferError}</p>}
                  {transferResult && (
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
                      <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(transferResult, null, 2)}
                      </pre>
                    </div>
                  )}

                  <Button
                    variant="accent"
                    onClick={handleTransfer}
                    disabled={transferLoading || !session || !transferSecretId || !newOwnerPrincipalId}
                  >
                    {transferLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Requesting...</>
                    ) : (
                      <><ArrowRightLeft className="h-4 w-4" /> Request Transfer Permit</>
                    )}
                  </Button>
                </div>
              )}

              {/* --- Delegate Tab --- */}
              {tab === "delegate" && (
                <div className="glow-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Delegate Permit
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Uses session-based signing. Grants delegation permission for a secret.
                  </p>

                  <div className="text-xs font-mono text-zinc-600 bg-zinc-900/50 rounded p-3 mb-4">
                    {`await web2.permit.requestPermit({`}
                    <br />
                    {`  action: 'delegate',`}
                    <br />
                    {`  session,`}
                    <br />
                    {`  secretId: 42,`}
                    <br />
                    {`  payload: { delegatePrincipalId },`}
                    <br />
                    {`  blackboxUrl,`}
                    <br />
                    {`});`}
                  </div>

                  {!session && (
                    <div className="text-xs text-yellow-400 mb-3 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Session required for delegate permits
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">
                        Secret ID
                      </label>
                      <input
                        type="number"
                        value={delegateSecretId}
                        onChange={(e) => setDelegateSecretId(e.target.value)}
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
                        onChange={(e) => setDelegatePrincipalId(e.target.value)}
                        placeholder="delegate-uuid"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 font-mono focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                  </div>

                  {delegateError && <p className="text-xs text-red-400 mb-3">{delegateError}</p>}
                  {delegateResult && (
                    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3">
                      <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(delegateResult, null, 2)}
                      </pre>
                    </div>
                  )}

                  <Button
                    variant="accent"
                    onClick={handleDelegate}
                    disabled={delegateLoading || !session || !delegateSecretId || !delegatePrincipalId}
                  >
                    {delegateLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Requesting...</>
                    ) : (
                      <><Users className="h-4 w-4" /> Request Delegate Permit</>
                    )}
                  </Button>
                </div>
              )}
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
