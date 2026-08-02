## Web2 v2 Plan — SDK Architecture & Developer Experience (CIFER SDK)

> **Status**: Proposal (v2 refinement)  
> **Created**: 2026-02-19  
> **Targets**: SDK `>= 0.4.0` (or next minor)  

---

### Why this plan exists

The blackbox now supports **Web2 mode** (`chainId = -1`) on the **same** endpoints as Web3 for:

- Payload encryption/decryption (`/encrypt-payload`, `/decrypt-payload`)
- File encryption/decryption (`/encrypt-file`, `/decrypt-file`, `/decrypt-existing-file`)
- Job management (`/jobs/*`)

The only differences are:

- The **freshness nonce**: Web3 uses a **block number**, Web2 uses a **timestamp (ms)**.
- The **signer identity**: Web3 signs with the user’s wallet; Web2 signs with a **session EOA** (created via `/web2/session`).

This plan refines how the SDK should expose Web2 in a way that:

- Maximizes reuse of existing `blackbox.*` code
- Provides a Web2-first DX (auth/session mental model)
- Still feels familiar to Web3 devs (signer + chainId mental model)
- Supports two Web2 security postures:
  - **Managed session** (SDK has Ed25519 → can create/renew sessions)
  - **Existing session key** (SDK only has session EOA private key → cannot create/renew)

---

### Key constraints from the current codebase (what we should align with)

The current `src/blackbox/*` modules already share a single pipeline:

- Data string building: `src/internal/auth/data-string.ts`
- Signing: `src/internal/auth/signer.ts`
- Freshness & retry wrapper: `src/internal/auth/block-freshness.ts`

Every signed blackbox call follows the same structure:

1. Get **freshness** (`blockNumber`) via `withBlockFreshRetry()`
2. Get **signer address** via `SignerAdapter.getAddress()`
3. Build **underscore data string**
4. Sign it with `SignerAdapter.signMessage()` (EIP-191)
5. Call HTTP endpoint, parse errors with `parseBlackboxErrorResponse()`

This is the primary reuse point we should preserve. Web2 should plug into the “freshness” + “signer” pieces, without forking payload/jobs/files implementations.

---

## Design principles

### 1) Web2 is an **auth/bootstrap layer**, not a separate crypto surface

After a session exists, Web2 uses the **same** blackbox endpoints and the **same** request format, with:

- `chainId = -1`
- freshness field = timestamp (ms)
- signer = session EOA address

So the SDK should avoid duplicating “encrypt/decrypt/jobs” logic under `web2.*`. Instead it should:

- Add a Web2 module for **registration/session/secrets/delegates/permits/principal**
- Provide a convenient way to use existing `blackbox.*` with a Web2 session

### 2) One signing pipeline, multiple auth strategies

Web3 and Web2 differ in *how we obtain*:

- the freshness value
- the signer used for EIP-191 signing

Everything else stays shared.

### 3) Make the “existing session key” path explicit and obviously advanced

If the SDK only receives `sessionPrivateKey` (EOA key), it **must not** imply it can create or renew sessions.

Naming and API shape should make it hard to accidentally assume:

- “passing a session key” == “the SDK will create a session”

It won’t; the session must already exist server-side (created elsewhere, e.g. TEE web front).

---

## Proposed SDK architecture (v2)

### A) Add a Web2 sentinel constant

Add a public constant:

- `WEB2_CHAIN_ID = -1`

This helps prevent magic numbers and clarifies intent in code.

### B) Extend freshness handling to support `chainId = -1` (without touching blackbox modules)

Current reality:

- `blackbox.*` modules call `withBlockFreshRetry(..., chainId)`
- `withBlockFreshRetry()` calls `readClient.getBlockNumber(chainId)`

Web2 goal:

- For `chainId === WEB2_CHAIN_ID`, freshness should be `Date.now()` (ms).

**Option B1 (preferred for minimal changes / maximum reuse):**

- Update `RpcReadClient.getBlockNumber(chainId)`:
  - if `chainId === WEB2_CHAIN_ID`, return `Date.now()` (no RPC call)

This makes Web2 “just work” with existing blackbox modules because they already depend on `ReadClient.getBlockNumber`.

**Option B2 (also fine):**

- Update `withBlockFreshRetry()`:
  - if `chainId === WEB2_CHAIN_ID`, execute once and pass `Date.now()` as the freshness value

Either option keeps the endpoint modules unchanged.

### C) Introduce a small internal “auth strategy” concept (optional but recommended)

Even if the public API stays unchanged, it’s useful to standardize internal behavior:

```ts
type BlackboxMode = 'web3' | 'web2';

interface BlackboxAuthStrategy {
  readonly mode: BlackboxMode;
  readonly chainId: number; // WEB2_CHAIN_ID for web2
  getSigner(): Promise<import('../types/adapters.js').SignerAdapter>;
  getFreshness(readClient: import('../types/adapters.js').ReadClient): Promise<number>;
  ensureReady?(): Promise<void>; // web2-managed sessions can auto-renew here
}
```

This strategy can be used in two ways:

- **Internally only**: power “bound” helpers without altering `blackbox.*` signatures.
- **Future refactor**: if you ever want `blackbox.*` to accept a single `ctx` object, this provides the seam.

---

## Public API proposal (DX-first)

### 1) Keep current Web3 API exactly as-is

Web3 devs keep doing:

- `createCiferSdk({ blackboxUrl, signer })`
- `blackbox.payload.encryptPayload({ chainId, secretId, signer, readClient, blackboxUrl })`

No breaking changes.

### 2) Add a `web2` namespace for Web2 lifecycle (auth + session + web2-only endpoints)

Add `src/web2/*` with a barrel `src/web2/index.ts` and submodules:

- `web2.auth.*`: `/web2/auth/register`, `/web2/auth/verify-email`, `/web2/auth/register-key`
- `web2.session.*`: `/web2/session` (create/renew pattern)
- `web2.secret.*`: `/web2/secret`, `/web2/secrets`
- `web2.delegate.*`: `/web2/setDelegate`
- `web2.permit.*`: `/web2/permit` (rotate / transfer / delegate)
- `web2.principal.*`: `/web2/principal/byEmail`, `/web2/auth/node-registration-status`

This matches the Web2 dev mental model: “register → verify → create session → use features”.

### 3) Provide two explicit session modes

#### Mode A (recommended default): SDK-managed sessions (Ed25519 available)

Goal: user gives `principalId` and an Ed25519 private key (or signer callback), and the SDK handles:

- generating (or using provided) session EOA key
- creating a session with `/web2/session`
- caching `expiresAt`
- renewing before expiry (by calling `/web2/session` again)

Proposed shape:

- `web2.session.createManagedSession(params) -> Web2Session`

Where `Web2Session` includes:

- `principalId`
- `sessionAddress`
- `expiresAt`
- `signer: SignerAdapter` (wraps session EOA private key)
- `renew(): Promise<void>`
- `ensureValid(): Promise<void>` (renew if near expiry)

Important behavior:

- The blackbox resolves session context from server-side cache using `sessionAddress`.
- The SDK does **not** need to attach `sessionToken` to subsequent requests.

#### Mode B (advanced): “use existing session key” (Ed25519 not available)

Goal: user provides an EOA private key that is already associated with an existing server-side session (created elsewhere, e.g. a TEE web front). The SDK:

- signs requests using that key
- uses `chainId = -1` and timestamp freshness
- does **not** call `/web2/session`
- cannot renew (no Ed25519)

Proposed shape:

- `web2.session.useExistingSessionKey(params) -> Web2Session`

Where:

- `Web2Session.renew()` throws a clear error (or is absent)
- `ensureValid()` can be a no-op (or can optionally “fail fast” by attempting a lightweight Web2 call)

Naming guidance:

- ✅ `useExistingSessionKey` / `useExistingSession`
- ❌ `connectWithSessionPrivateKey` (sounds like it will create a session)

---

## “Best DX” helpers: bind Web2 session into blackbox calls (without forking blackbox code)

Web2 developers typically don’t want to repeatedly pass:

- `chainId: -1`
- `signer: session.signer`
- `readClient: sdk.readClient`
- `blackboxUrl: sdk.blackboxUrl`

To keep the existing blackbox API (great for power users) while giving Web2 devs a login-style experience, add **thin wrappers**:

### Option 1 (recommended): `web2.blackbox` wrappers

Expose a small wrapper layer under `web2.blackbox.*` that simply fills in defaults from a `Web2Session`:

- `web2.blackbox.payload.encryptPayload({ session, secretId, plaintext, ... })`
- `web2.blackbox.payload.decryptPayload({ session, secretId, encryptedMessage, cifer, ... })`
- `web2.blackbox.files.encryptFile({ session, secretId, file, ... })`
- `web2.blackbox.jobs.download(jobId, { session, secretId, ... })`

Implementation detail:

- These wrappers call existing `blackbox.*` functions internally, using:
  - `chainId: WEB2_CHAIN_ID`
  - `signer: session.signer`
  - `readClient: sdk.readClient` (once it supports `-1`)
  - `blackboxUrl: sdk.blackboxUrl`

Benefit:

- Zero duplication of the HTTP and signing logic in `blackbox/*`
- Great Web2 DX (“session-first”), while keeping the canonical blackbox API intact

### Option 2: `session.bind(sdk)` → returns a “bound client”

Alternative shape:

- `const client = web2.session.bind(session, sdk)`
- `client.payload.encryptPayload({ secretId, plaintext })`

This reads nicely but is more “OO”; the current SDK is mostly module-function oriented, so Option 1 fits better.

---

## Type/system implications (what new types we need)

### Web2 types (new)

Create `src/types/web2.ts` with:

- Registration params/results (`RegisterParams`, `VerifyEmailParams`, `RegisterKeyParams`, …)
- Session params/results (`CreateSessionParams`, `CreateSessionWithExternalKeyParams`, `Web2Session`, …)
- Secret state for Web2 (`Web2SecretState`, `CreateWeb2SecretResult`, …)
- Delegate and permit types (`SetWeb2DelegateParams`, `PermitAction`, `RequestPermitParams`, …)
- Principal lookup types (`PrincipalInfo`, `NodeRegistrationStatus`, …)

### Private key signer adapter (new, optional but strongly recommended for DX)

Today, the SDK only ships:

- `Eip1193SignerAdapter` (wallet providers)

For Web2 “sessionPrivateKey-only” mode, it’s extremely useful to ship a built-in adapter like:

- `PrivateKeySignerAdapter` (EIP-191 `signMessage`, `getAddress`)

This can be implemented with a small, well-scoped dependency decision:

- Either a tiny internal implementation (not recommended; ECDSA + EIP-191 is subtle)
- Or a minimal dependency like `ethers` (but you likely want to remain dependency-light)

If you want to keep zero external deps, you can still support this mode by requiring the user to provide:

- a `SignerAdapter` implementation (backends can wrap their own signer/KMS/TEE)

But from a Web2 DX standpoint, a built-in private key signer is high leverage.

---

## Error handling and renewals (behavioral contract)

### Managed sessions (Ed25519 available)

When `web2.blackbox.*` wrapper runs:

- It should call `await session.ensureValid()` before signing, with a small skew (e.g. renew if expiring within 60s).

If a request fails with “no active session” (server-side cache eviction/expiry), the wrapper can:

- Attempt one renewal + retry once (only in managed mode).

### Existing session key mode

If session is missing/expired server-side:

- SDK should throw a clear error explaining:
  - the session must be created externally (TEE flow)
  - the SDK cannot renew without Ed25519

---

## Suggested implementation sequence (minimal risk)

### Phase 1 — Enable Web2 freshness in core utilities

- Add `WEB2_CHAIN_ID`
- Add Web2 freshness support via **B1** or **B2**
  - Keep `blackbox/*` files unchanged

### Phase 2 — Add Web2 module (auth/session/secrets/etc.)

- Implement `/web2/*` endpoints in `src/web2/*`
- Add Web2 types

### Phase 3 — Add Web2 DX wrappers

- Implement `web2.blackbox.*` wrappers that call existing `blackbox.*`
- Ensure wrapper auto-fills chainId/signers/readClient/blackboxUrl

### Phase 4 — Exports + packaging

- Export `web2` namespace from `src/index.ts`
- Add `./web2` export to `package.json` (subpath export)

---

## Documentation & examples (what to show developers)

### Web2 “login-first” quickstart

Show:

- register → verify email → register key
- create managed session (Ed25519)
- create secret (web2)
- encrypt/decrypt using `web2.blackbox.payload.*` (minimal params)

### Web2 “TEE / existing session key” quickstart

Show:

- how a backend/TEE provides `sessionPrivateKey` (and session already exists)
- `useExistingSessionKey`
- encrypt/decrypt/jobs using `web2.blackbox.*`
- explicitly call out “no renewals possible”

### Web3 docs remain unchanged

Also include one cross-platform note:

- `blackbox.*` works for both Web3 and Web2 once you pass the right `chainId` and signer.

---

## Open decisions (to resolve before implementation)

- **Freshness implementation choice**: B1 (in `RpcReadClient`) vs B2 (in `withBlockFreshRetry`)
  - B1 tends to give maximal reuse across the whole SDK (anything calling `readClient.getBlockNumber(-1)` just works).
- **Private key signer adapter**: ship one or require user-provided `SignerAdapter`
  - Strong DX win if shipped, but depends on dependency philosophy.
- **Wrapper location**: `web2.blackbox.*` vs a “bound client” factory
  - `web2.blackbox.*` aligns best with current module-based style.

