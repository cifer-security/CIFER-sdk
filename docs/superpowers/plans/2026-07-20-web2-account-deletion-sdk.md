# Web2 Account Deletion — CIFER-sdk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two SDK functions — `requestAccountDeletion` and `confirmAccountDeletion` — to `web2.auth`, wrapping the Black Box's `POST /web2/auth/request-deletion` and `POST /web2/auth/confirm-deletion` endpoints. Reactivation needs no new SDK surface (it reuses `register` / `verifyEmail` / `registerKey`).

**Architecture:** Mirror the existing inline-`fetch` pattern in `src/web2/auth.ts` (no shared HTTP wrapper): each function takes a params object with `blackboxUrl` and optional `fetch`, POSTs JSON, calls `handleErrorResponse` on non-2xx, and returns a typed result. Types live in `src/types/web2.ts`; functions auto-export via the existing `export * as auth from './auth.js'` barrel.

**Tech Stack:** TypeScript (ESM + CJS dual build), Vitest. Repo root: `/Users/mohsinriaz/Mohsin/Development/Netick/L2/cifer/CIFER-sdk`.

## Global Constraints

- **Match existing style exactly:** use `params.fetch ?? fetch`, `normalizeUrl(params.blackboxUrl)`, `headers: { 'Content-Type': 'application/json' }`, and `handleErrorResponse(response, '<endpoint>')` on `!response.ok`, exactly like `resetPassword`/`verifyCredentials`.
- **Errors:** throw `Web2AuthError` (already thrown inside `handleErrorResponse`). Do not introduce new error classes.
- **No barrel edits needed for functions** (they re-export via `export * as auth`). New TYPES must be added to `src/types/web2.ts`, which is already re-exported via `export * from './web2.js'`.
- **Anti-enumeration contract:** `request-deletion` returns a generic `{ message }` (BB never reveals whether the account existed). The SDK must surface `message` and NOT throw on a "no such account" — the BB returns 200 generic in that case.
- **Tests:** Vitest with `vi.stubGlobal('fetch', ...)` (see `tests/blackbox-public-key.test.ts`). Run with `npm test`.

---

## Task 1: Add param/result types

**Files:**
- Modify: `CIFER-sdk/src/types/web2.ts` (after `VerifyCredentialsResult`, ~line 200)

**Interfaces:**
- Produces:
```ts
interface RequestAccountDeletionParams { email: string; password: string; principalId: string; blackboxUrl: string; fetch?: typeof fetch; }
interface ConfirmAccountDeletionParams { email: string; otp: string; blackboxUrl: string; fetch?: typeof fetch; }
interface ConfirmAccountDeletionResult { success: true; message: string; }
```
(`requestAccountDeletion` returns `{ message: string }`, reusing the inline shape used by `forgotPassword`/`resetPassword`.)

- [ ] **Step 1: Add the types**

In `src/types/web2.ts`, after the `VerifyCredentialsResult` interface, add:

```ts
export interface RequestAccountDeletionParams {
  /** Account email address. */
  email: string;
  /** Account password (bcrypt-verified server-side). */
  password: string;
  /** The principalId returned at registration (must match server-side). */
  principalId: string;
  /** Blackbox base URL. */
  blackboxUrl: string;
  /** Optional fetch override (for testing / non-global fetch). */
  fetch?: typeof fetch;
}

export interface ConfirmAccountDeletionParams {
  /** Account email address. */
  email: string;
  /** The 6-digit deletion-confirmation OTP emailed to the user. */
  otp: string;
  /** Blackbox base URL. */
  blackboxUrl: string;
  /** Optional fetch override. */
  fetch?: typeof fetch;
}

export interface ConfirmAccountDeletionResult {
  /** Always true on a 2xx response. */
  success: true;
  /** Human-readable confirmation message. */
  message: string;
}
```

- [ ] **Step 2: Typecheck**

Run: `cd CIFER-sdk && npm run build:types`
Expected: type emit succeeds, no errors.

- [ ] **Step 3: Commit**

```bash
cd CIFER-sdk && git add src/types/web2.ts && git commit -m "types(web2): add account-deletion param/result types"
```

---

## Task 2: `requestAccountDeletion` + `confirmAccountDeletion`

**Files:**
- Modify: `CIFER-sdk/src/web2/auth.ts` (add two exports + extend the type import)
- Test: `CIFER-sdk/tests/web2-account-deletion.test.ts`

**Interfaces:**
- Consumes: `normalizeUrl`, `handleErrorResponse` (in-file); `RequestAccountDeletionParams`, `ConfirmAccountDeletionParams`, `ConfirmAccountDeletionResult` (from Task 1).
- Produces:
  - `export async function requestAccountDeletion(params: RequestAccountDeletionParams): Promise<{ message: string }>` → POST `/web2/auth/request-deletion` with `{ email, password, principalId }`.
  - `export async function confirmAccountDeletion(params: ConfirmAccountDeletionParams): Promise<ConfirmAccountDeletionResult>` → POST `/web2/auth/confirm-deletion` with `{ email, otp }`.

- [ ] **Step 1: Write the failing test**

Create `CIFER-sdk/tests/web2-account-deletion.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { requestAccountDeletion, confirmAccountDeletion } from '../src/web2/auth.js';
import { Web2AuthError } from '../src/internal/errors/index.js';

describe('web2.auth account deletion', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requestAccountDeletion POSTs email/password/principalId and returns message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'If the account details match, a confirmation code has been sent.' }), { status: 200 }),
    );

    const result = await requestAccountDeletion({
      email: 'a@b.com',
      password: 'pw',
      principalId: 'p-1',
      blackboxUrl: 'http://localhost:3010/',
    });

    expect(result.message).toContain('confirmation code');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3010/web2/auth/request-deletion',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.com', password: 'pw', principalId: 'p-1' }),
      }),
    );
  });

  it('confirmAccountDeletion POSTs email/otp and returns success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, message: 'Your account has been deleted.' }), { status: 200 }),
    );

    const result = await confirmAccountDeletion({
      email: 'a@b.com',
      otp: '123456',
      blackboxUrl: 'http://localhost:3010',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Your account has been deleted.');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3010/web2/auth/confirm-deletion',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'a@b.com', otp: '123456' }) }),
    );
  });

  it('confirmAccountDeletion throws Web2AuthError on non-2xx', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Invalid or expired confirmation code' }), { status: 401 }),
    );

    await expect(
      confirmAccountDeletion({ email: 'a@b.com', otp: '000000', blackboxUrl: 'http://localhost:3010' }),
    ).rejects.toBeInstanceOf(Web2AuthError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd CIFER-sdk && npx vitest run tests/web2-account-deletion.test.ts`
Expected: FAIL — functions not exported.

- [ ] **Step 3: Implement the two functions**

In `src/web2/auth.ts`, extend the type import block to add `RequestAccountDeletionParams`, `ConfirmAccountDeletionParams`, `ConfirmAccountDeletionResult`. Then add after `verifyCredentials` (~line 371):

```ts
// ============================================================================
// Account deletion (two-step, OTP-gated soft-delete)
// ============================================================================

/**
 * Step 1 of account deletion: request a deletion-confirmation OTP.
 *
 * Requires the account email, password, and the principalId issued at
 * registration. For anti-enumeration the Black Box always responds with a
 * generic success message; an OTP is only emailed when all details match a
 * verified, active account. Does not throw on "no such account".
 */
export async function requestAccountDeletion(
  params: RequestAccountDeletionParams
): Promise<{ message: string }> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/request-deletion`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      principalId: params.principalId,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/request-deletion');
  }

  const result = (await response.json()) as { message: string };
  return { message: result.message };
}

/**
 * Step 2 of account deletion: confirm with the emailed OTP. On success the
 * account is soft-deleted (dormant): hidden from all APIs but retained for
 * legal disclosure. Re-registering later with the same email reactivates the
 * same principalId (old secrets return).
 */
export async function confirmAccountDeletion(
  params: ConfirmAccountDeletionParams
): Promise<ConfirmAccountDeletionResult> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/confirm-deletion`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      otp: params.otp,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/confirm-deletion');
  }

  const result = (await response.json()) as { success: true; message: string };
  return { success: result.success, message: result.message };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd CIFER-sdk && npx vitest run tests/web2-account-deletion.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd CIFER-sdk && git add src/web2/auth.ts tests/web2-account-deletion.test.ts && git commit -m "feat(web2): requestAccountDeletion + confirmAccountDeletion SDK functions"
```

---

## Task 3: Full test + build gate

**Files:** none (verification only)

- [ ] **Step 1: Run the whole suite**

Run: `cd CIFER-sdk && npm test`
Expected: all tests pass, including the new file.

- [ ] **Step 2: Full dual build**

Run: `cd CIFER-sdk && npm run build`
Expected: ESM + CJS + types build with no errors. Confirms the new exports and types compile in all three targets.

- [ ] **Step 3: Confirm the new functions are reachable via the namespace**

Run:
```bash
cd CIFER-sdk && node --input-type=module -e "import('./src/web2/index.js').then(m => console.log(typeof m.auth.requestAccountDeletion, typeof m.auth.confirmAccountDeletion))"
```
Expected: prints `function function`. (If ESM source import fails without build, instead assert via the passing Vitest import in Task 2 — that already proves reachability.)

- [ ] **Step 4: Commit (docs/changelog if the repo keeps one)**

If `CIFER-sdk` maintains a CHANGELOG or the `web2` doc lists auth functions, add `requestAccountDeletion` / `confirmAccountDeletion`. Otherwise skip.

```bash
cd CIFER-sdk && git add -A && git commit -m "docs(web2): note account-deletion SDK functions" || echo "nothing to commit"
```

---

## Self-Review Notes (author)

- Spec §9.1 SDK surface (`requestAccountDeletion`, `confirmAccountDeletion`, barrel via existing `export * as auth`) — Tasks 1-2.
- Reactivation reuses `register`/`verifyEmail`/`registerKey` — no new SDK surface (confirmed, none added).
- Matches existing inline-fetch + `handleErrorResponse` + `Web2AuthError` pattern verbatim.
- Depends on the Black Box plan endpoints existing at runtime; unit tests mock fetch so they are independent.
