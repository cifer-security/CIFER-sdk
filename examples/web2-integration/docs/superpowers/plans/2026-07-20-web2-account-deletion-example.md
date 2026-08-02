# Web2 Account Deletion — Example App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible, working "Delete Account" flow to the `web2-integration` demo (request deletion with email+password+principalId → enter emailed OTP → confirm), so App Store reviewers see a concrete account-deletion path. This is the tangible unblock for the Apple rejection.

**Architecture:** A new client page `app/delete-account/page.tsx` mirroring the existing two-step `reset-password` page, wired to the new SDK functions `web2.auth.requestAccountDeletion` / `web2.auth.confirmAccountDeletion`. State (email, password, principalId, blackboxUrl) comes from the existing in-memory `Web2Provider` context. A nav card is added to the home hub.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind 4, `cifer-sdk` (local `file:../../`). Uses pnpm. Repo path: `/Users/mohsinriaz/Mohsin/Development/Netick/L2/cifer/CIFER-sdk/examples/web2-integration`.

## Global Constraints

- **Depends on the SDK plan:** `web2.auth.requestAccountDeletion` / `confirmAccountDeletion` must exist in the local `cifer-sdk`. Because the dependency is `file:../../`, the example resolves the SDK from source/build. After the SDK plan lands, ensure the SDK is built (`cd ../.. && npm run build`) or that the example imports resolve to the updated source.
- **Follow the established page pattern exactly:** `"use client"`, `useWeb2()` for shared state, a `step` state machine, `ConsoleLog` panel on the right, `glow-card` step cards on the left, a back link to `/`. Mirror `app/reset-password/page.tsx`.
- **State is in-memory only** (React Context, resets on reload). Pre-fill email/principalId from context; let the user override via inputs (so the page also works after a reload, matching how reset-password pre-fills `email`).
- **No backend/API routes** — the page calls the SDK directly in the browser (same as every other demo page).
- **No unit tests** (the example app has none). Verification is lint + build + a manual dev-server walkthrough.

---

## Task 1: Add the Delete Account page

**Files:**
- Create: `examples/web2-integration/app/delete-account/page.tsx`

**Interfaces:**
- Consumes: `useWeb2()` → `{ blackboxUrl, email, password, principalId, log, logs }`; `web2.auth.requestAccountDeletion`, `web2.auth.confirmAccountDeletion`; UI primitives `Container`, `Button`, `ConsoleLog`.

- [ ] **Step 1: Create the page (mirrors reset-password two-step OTP flow)**

Create `examples/web2-integration/app/delete-account/page.tsx`:

```tsx
/**
 * Delete Account Page
 * ===================
 *
 * Demonstrates the Web2 account-deletion flow (two-step, OTP-gated):
 *
 * Step 1: Request Deletion
 *   web2.auth.requestAccountDeletion({ email, password, principalId, blackboxUrl })
 *     → if the details match a verified account, a confirmation OTP is emailed
 *
 * Step 2: Confirm Deletion
 *   web2.auth.confirmAccountDeletion({ email, otp, blackboxUrl })
 *     → soft-deletes (dormant) the account. Re-registering later with the same
 *       email reactivates the SAME principalId, so old secrets return.
 *
 * Email / principalId are pre-filled from the Web2Context when available.
 */

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Trash2, CheckCircle, Loader2, AlertCircle, ShieldAlert } from "lucide-react"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { ConsoleLog } from "@/components/console-log"
import { useWeb2 } from "@/lib/web2-context"

import { web2 } from "cifer-sdk"

export default function DeleteAccountPage() {
  const { blackboxUrl, email, password, principalId, logs, log } = useWeb2()

  const [localEmail, setLocalEmail] = useState(email)
  const [localPassword, setLocalPassword] = useState(password)
  const [localPrincipalId, setLocalPrincipalId] = useState(principalId)
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"request" | "confirm" | "done">("request")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRequest = useCallback(async () => {
    if (!localEmail || !localPassword || !localPrincipalId) return
    try {
      setIsLoading(true)
      setError("")
      log("Requesting account deletion...")
      log(`  email: ${localEmail}`)
      log(`  principalId: ${localPrincipalId}`)

      const result = await web2.auth.requestAccountDeletion({
        email: localEmail,
        password: localPassword,
        principalId: localPrincipalId,
        blackboxUrl,
      })

      log(`  message: ${result.message}`)
      log("If the details match, check your email for the confirmation code.")
      setStep("confirm")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, localPassword, localPrincipalId, blackboxUrl, log])

  const handleConfirm = useCallback(async () => {
    if (!otp) return
    try {
      setIsLoading(true)
      setError("")
      log("Confirming account deletion...")

      const result = await web2.auth.confirmAccountDeletion({
        email: localEmail,
        otp,
        blackboxUrl,
      })

      log(`Account deleted: ${result.message}`)
      log("You can reactivate later by registering again with the same email.")
      setStep("done")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      log(`ERROR: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [localEmail, otp, blackboxUrl, log])

  return (
    <Container>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: steps */}
        <div className="space-y-4">
          <div className="glow-card rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-[#00ff9d]" />
              <h1 className="text-lg font-semibold text-white">Delete Account</h1>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5" />
              <p className="text-xs text-amber-200/90">
                Deletion hides your account from all APIs. Data is retained for legal
                compliance. Re-registering with the same email restores the same account.
              </p>
            </div>

            {step === "request" && (
              <div className="space-y-3">
                <Field label="Email" type="email" value={localEmail} onChange={setLocalEmail} placeholder="user@example.com" />
                <Field label="Password" type="password" value={localPassword} onChange={setLocalPassword} placeholder="securePassword123" />
                <Field label="Principal ID" type="text" value={localPrincipalId} onChange={setLocalPrincipalId} placeholder="uuid from registration" />
                <Button onClick={handleRequest} disabled={isLoading || !localEmail || !localPassword || !localPrincipalId} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Deletion"}
                </Button>
              </div>
            )}

            {step === "confirm" && (
              <div className="space-y-3">
                <Field label="Confirmation Code (OTP)" type="text" value={otp} onChange={setOtp} placeholder="123456" />
                <Button onClick={handleConfirm} disabled={isLoading || !otp} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Deletion"}
                </Button>
              </div>
            )}

            {step === "done" && (
              <div className="flex items-center gap-2 text-[#00ff9d]">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Account deleted. Register again to reactivate.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: console + error */}
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-xs text-red-200/90">{error}</p>
            </div>
          )}
          <ConsoleLog logs={logs} />
        </div>
      </div>
    </Container>
  )
}

function Field({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#00ff9d]/50 focus:outline-none focus:ring-1 focus:ring-[#00ff9d]/30 transition-colors"
      />
    </div>
  )
}
```

> If `Button`/`Container`/`ConsoleLog` prop shapes differ from what is assumed here, open `app/reset-password/page.tsx` and copy its exact usage — this page intentionally mirrors it. The `Field` helper inlines the same input markup used across the existing pages.

- [ ] **Step 2: Verify the page compiles (lint)**

Run: `cd examples/web2-integration && pnpm lint`
Expected: no errors for `app/delete-account/page.tsx`. Fix any import/prop mismatches by aligning with `reset-password/page.tsx`.

- [ ] **Step 3: Commit**

```bash
cd CIFER-sdk && git add examples/web2-integration/app/delete-account/page.tsx && git commit -m "feat(example): add delete-account page"
```

---

## Task 2: Add the home-hub nav card

**Files:**
- Modify: `examples/web2-integration/app/page.tsx` (the `pages` array, ~line 21)

- [ ] **Step 1: Add the card entry**

In `app/page.tsx`, import the `Trash2` icon (add to the existing `lucide-react` import), and add to the `pages` array right after the "Reset Password" entry:

```tsx
  {
    name: "Delete Account",
    description:
      "Delete your account (soft-delete / dormant). Confirm via emailed OTP. Re-register with the same email to reactivate and restore your secrets.",
    href: "/delete-account",
    icon: Trash2,
    tag: "web2.auth",
    functions: ["requestAccountDeletion", "confirmAccountDeletion"],
  },
```

- [ ] **Step 2: Lint**

Run: `cd examples/web2-integration && pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd CIFER-sdk && git add examples/web2-integration/app/page.tsx && git commit -m "feat(example): add delete-account nav card to home hub"
```

---

## Task 3: Build + manual walkthrough gate

**Files:** none (verification only)

- [ ] **Step 1: Ensure the local SDK is current**

Run: `cd CIFER-sdk && npm run build`
Expected: SDK builds with the new `requestAccountDeletion` / `confirmAccountDeletion` exports (from the SDK plan).

- [ ] **Step 2: Build the example app**

Run: `cd CIFER-sdk/examples/web2-integration && pnpm install && pnpm build`
Expected: `next build` succeeds, `/delete-account` appears in the route list.

- [ ] **Step 3: Manual walkthrough (documented, run against a live BB in staging)**

Run: `cd CIFER-sdk/examples/web2-integration && pnpm dev` then in the browser:
1. `/register` → register + verify + register-key (note the `principalId`).
2. `/delete-account` → Request Deletion (email+password+principalId) → enter the OTP (from email or BB staging logs) → Confirm.
3. `/verify-credentials` → login should now fail (account hidden).
4. `/register` again with the same email → verify-email → confirm the SAME `principalId` is returned and `/secrets` shows the old secrets.

Expected: matches the above. This is the reviewer-facing deletion path.

- [ ] **Step 4: Commit any build fixes**

```bash
cd CIFER-sdk && git add -A && git commit -m "chore(example): build fixes for delete-account flow" || echo "nothing to commit"
```

---

## Self-Review Notes (author)

- Spec §9.2 example delete-account screen (request → OTP → confirm) — Tasks 1-2.
- Reuses existing context state + `reset-password` UI pattern; no backend routes (matches app architecture).
- Depends on SDK plan (Task 1-2) for the two `web2.auth` functions; ensure SDK is built before the example build.
