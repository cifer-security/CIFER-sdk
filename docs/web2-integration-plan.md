# Web2 Integration Plan — CIFER SDK

> **Status**: Draft  
> **Created**: 2026-02-19  
> **SDK Version**: 0.3.1 → 0.4.0  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Decision](#2-architecture-decision)
3. [Phase 1 — Core Infrastructure Changes](#3-phase-1--core-infrastructure-changes)
4. [Phase 2 — Web2 Types & Interfaces](#4-phase-2--web2-types--interfaces)
5. [Phase 3 — Web2 Module Implementation](#5-phase-3--web2-module-implementation)
6. [Phase 4 — SDK Factory & Exports](#6-phase-4--sdk-factory--exports)
7. [Phase 5 — JSDoc & TypeDoc Documentation](#7-phase-5--jsdoc--typedoc-documentation)
8. [Phase 6 — Docusaurus Site Updates](#8-phase-6--docusaurus-site-updates)
9. [Phase 7 — LLM.txt & generate-llm-txt.js Updates](#9-phase-7--llmtxt--generate-llm-txtjs-updates)
10. [Phase 8 — CHANGELOG & Release Notes](#10-phase-8--changelog--release-notes)
11. [Phase 9 — Tests](#11-phase-9--tests)
12. [File Inventory](#12-file-inventory)
13. [JSDoc Comment Standards](#13-jsdoc-comment-standards)
14. [DX Examples (Target API)](#14-dx-examples-target-api)

---

## 1. Overview

### Goal

Add Web2 (email-based, Ed25519 authentication) support to the CIFER SDK alongside existing Web3 (wallet-based, EVM chain) support. The key design principle is **maximum code reuse** — the existing `blackbox.*` functions already work for Web2 by passing `chainId = -1` and a timestamp instead of a block number.

### What Changes

| Area | Change |
|------|--------|
| `RpcReadClient.getBlockNumber()` | Return `Date.now()` when `chainId === -1` |
| `withBlockFreshRetry` | Skip retry logic when `chainId === -1` (timestamps don't go stale) |
| New `web2` module | Auth, session, keys, secrets, delegates, permits, principal lookup |
| New types | `Web2Auth`, `Web2Session`, `Ed25519KeyPair`, `Web2Secret`, etc. |
| `package.json` exports | Add `./web2` subpath |
| Docusaurus site | New guide pages, updated intro, updated API reference sidebar |
| `llm.txt` generator | Add Web2 sections |
| CHANGELOG | Document all changes |

### What Does NOT Change

| Area | Reason |
|------|--------|
| `blackbox.payload.*` | Works as-is with `chainId = -1` + Web2 signer |
| `blackbox.files.*` | Works as-is with `chainId = -1` + Web2 signer |
| `blackbox.jobs.*` | Works as-is with `chainId = -1` + Web2 signer |
| `keyManagement.*` | Web3-only (on-chain SecretsController); Web2 has its own secret management |
| `commitments.*` | Web3-only (on-chain data); not applicable to Web2 |
| `flows.*` | Existing flows are Web3-only; Web2 flows added separately |

---

## 2. Architecture Decision

### Approach: Thin Adapter Layer + Dedicated Module

```
cifer-sdk/
├── blackbox/              # UNCHANGED — works for both Web3 and Web2
│   ├── payload.ts         #   Pass chainId=-1 + sessionSigner for Web2
│   ├── files.ts
│   └── jobs.ts
├── web2/                  # NEW — Web2-specific endpoints
│   ├── index.ts           #   Barrel export
│   ├── auth.ts            #   Registration, email verification, key registration
│   ├── session.ts         #   Session creation, renewal, management
│   ├── keys.ts            #   Ed25519 keypair generation, helpers
│   ├── secret.ts          #   Web2 secret CRUD (create, list)
│   ├── delegate.ts        #   Web2 delegate management
│   ├── permit.ts          #   Admin permits (rotate, transfer, delegate)
│   └── principal.ts       #   Principal lookup by email
├── internal/
│   └── adapters/
│       └── rpc-read-client.ts  # MODIFIED — Date.now() for chainId=-1
│   └── auth/
│       └── block-freshness.ts  # MODIFIED — skip retry for chainId=-1
```

### Why This Approach

1. **Zero duplication** for encrypt/decrypt/jobs — existing `blackbox.*` functions are reused directly
2. **Clean separation** — Web2-specific endpoints (auth, session, keys, permits) live in their own module
3. **Familiar DX** — Web2 users call `blackbox.payload.encryptPayload({ chainId: -1, ... })` just like Web3 users
4. **The `SignerAdapter` interface already supports Web2** — an EOA private key wallet (session key) implements `getAddress()` + `signMessage()` identically to a Web3 wallet

---

## 3. Phase 1 — Core Infrastructure Changes

### 3.1 Modify `RpcReadClient.getBlockNumber()`

**File**: `src/internal/adapters/rpc-read-client.ts`

```typescript
/**
 * Get the current block number for a chain.
 *
 * @remarks
 * For Web2 mode (`chainId === -1`), returns the current timestamp in
 * milliseconds (`Date.now()`) instead of querying an RPC endpoint.
 * The blackbox accepts timestamps in the freshness field for Web2 requests.
 *
 * @param chainId - The chain ID. Use `-1` for Web2 mode.
 * @returns The current block number, or current timestamp (ms) for Web2
 *
 * @platform web3, web2
 * @since 0.4.0
 */
async getBlockNumber(chainId: ChainId): Promise<number> {
  // Web2 mode: return current timestamp instead of block number
  if (chainId === -1) {
    return Date.now();
  }

  const result = await this.rpcCall<Hex>(chainId, 'eth_blockNumber', []);
  return parseInt(result, 16);
}
```

**Also update** `getRpcUrl()` to not throw for chainId=-1 (no RPC needed):

```typescript
private getRpcUrl(chainId: ChainId): string {
  if (chainId === -1) {
    throw new ConfigError(
      'Web2 mode (chainId=-1) does not use RPC. ' +
      'Only getBlockNumber() is supported for chainId=-1.'
    );
  }
  // ... existing logic
}
```

### 3.2 Modify `withBlockFreshRetry`

**File**: `src/internal/auth/block-freshness.ts`

The `withBlockFreshRetry` wrapper retries operations when the blackbox returns a "block too old" error. For Web2 (`chainId === -1`), timestamps are always fresh (they come from `Date.now()`), so retry logic should be skipped.

```typescript
/**
 * Retry an operation if the block number becomes stale.
 *
 * @remarks
 * For Web2 mode (`chainId === -1`), the operation is executed exactly once
 * without retries, since timestamps from `Date.now()` are always fresh.
 *
 * @platform web3, web2
 * @since 0.4.0 — Added Web2 (chainId=-1) bypass
 */
export async function withBlockFreshRetry<T>(
  chainId: ChainId,
  readClient: ReadClient,
  operation: (blockNumber: number) => Promise<T>,
  options?: BlockFreshRetryOptions
): Promise<T> {
  // Web2 mode: execute once, no retry needed
  if (chainId === -1) {
    const timestamp = Date.now();
    return operation(timestamp);
  }

  // ... existing retry logic for Web3
}
```

### 3.3 Export `WEB2_CHAIN_ID` Constant

**File**: `src/types/common.ts`

```typescript
/**
 * Sentinel chain ID for Web2 mode.
 *
 * @remarks
 * When passed to blackbox functions, this signals that the request uses
 * Web2 authentication (session-based) instead of Web3 (wallet-based).
 * The freshness field becomes a timestamp (ms) instead of a block number.
 *
 * @example
 * ```typescript
 * import { WEB2_CHAIN_ID, blackbox } from 'cifer-sdk';
 *
 * await blackbox.payload.encryptPayload({
 *   chainId: WEB2_CHAIN_ID,
 *   secretId: 42,
 *   plaintext: 'Hello Web2!',
 *   signer: sessionSigner,
 *   readClient: sdk.readClient,
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export const WEB2_CHAIN_ID = -1 as const;
```

---

## 4. Phase 2 — Web2 Types & Interfaces

### 4.1 New File: `src/types/web2.ts`

Create all Web2-specific types here. Every type/interface **must** have full JSDoc with `@remarks`, `@example`, and `@public` tags.

```typescript
/**
 * Web2 authentication and session types for email-based access.
 *
 * @remarks
 * Web2 mode allows users to access CIFER encryption without a blockchain
 * wallet. Authentication is based on email + password with Ed25519 key
 * registration and EOA session keys for request signing.
 *
 * @platform web2
 * @packageDocumentation
 * @module types/web2
 */

// --- Registration & Auth ---

/** Parameters for registering a new Web2 user. @platform web2 */
export interface RegisterParams { ... }

/** Result of email registration. @platform web2 */
export interface RegisterResult { ... }

/** Parameters for verifying email with OTP. @platform web2 */
export interface VerifyEmailParams { ... }

/** Result of email verification. @platform web2 */
export interface VerifyEmailResult { ... }

/** Parameters for registering an Ed25519 public key. @platform web2 */
export interface RegisterKeyParams { ... }

/** Result of key registration including node status. @platform web2 */
export interface RegisterKeyResult { ... }

// --- Session ---

/** Parameters for creating a Web2 session. @platform web2 */
export interface CreateSessionParams { ... }

/** Active Web2 session with signing capability. @platform web2 */
export interface Web2Session { ... }

/** Session creation result from the blackbox. @platform web2 */
export interface CreateSessionResult { ... }

// --- Keys ---

/** Ed25519 key pair for Web2 authentication. @platform web2 */
export interface Ed25519KeyPair { ... }

// --- Secrets ---

/** Web2 secret state (differs from on-chain SecretState). @platform web2 */
export interface Web2SecretState { ... }

/** Parameters for creating a Web2 secret. @platform web2 */
export interface CreateWeb2SecretParams { ... }

/** Result of Web2 secret creation. @platform web2 */
export interface CreateWeb2SecretResult { ... }

// --- Delegates ---

/** Parameters for setting a Web2 delegate. @platform web2 */
export interface SetWeb2DelegateParams { ... }

// --- Permits ---

/** Permit action types. @platform web2 */
export type PermitAction = 'rotate' | 'transfer' | 'delegate';

/** Parameters for requesting a permit. @platform web2 */
export interface RequestPermitParams { ... }

/** Permit request result. @platform web2 */
export interface RequestPermitResult { ... }

// --- Principal ---

/** Principal lookup result. @platform web2 */
export interface PrincipalInfo { ... }
```

### 4.2 Update `src/types/index.ts`

Add the new Web2 types to the barrel export:

```typescript
export * from './web2.js';
```

---

## 5. Phase 3 — Web2 Module Implementation

### 5.1 Module Structure

```
src/web2/
├── index.ts          # Barrel: export * as auth, session, keys, secret, delegate, permit, principal
├── auth.ts           # register, verifyEmail, registerKey
├── session.ts        # createSession, renewSession, Web2SessionManager class
├── keys.ts           # generateEd25519KeyPair, signEd25519, hexEncodeEmail
├── secret.ts         # createSecret, listSecrets
├── delegate.ts       # setDelegate, removeDelegate
├── permit.ts         # requestPermit (rotate/transfer/delegate)
├── principal.ts      # lookupByEmail, getNodeRegistrationStatus
```

### 5.2 `web2/auth.ts` — Registration Flow

Endpoints covered:
- `POST /web2/auth/register`
- `POST /web2/auth/verify-email`
- `POST /web2/auth/register-key`

> **Note:** `/web2/auth/retry-node-registration` is intentionally **excluded** from the SDK. Node registration retries are an infrastructure concern handled server-side. If a client needs to check registration status, they can use `web2.principal.getNodeRegistrationStatus()`.

Each function must:
1. Accept a typed params object
2. Return a typed result
3. Use `parseBlackboxErrorResponse` for error handling (reuse from `internal/errors`)
4. Include full JSDoc (see [Section 13](#13-jsdoc-comment-standards))

```typescript
/**
 * Register a new Web2 user with email and password.
 *
 * @remarks
 * This is the first step of Web2 onboarding. After registration,
 * the user must verify their email via {@link verifyEmail} and then
 * register an Ed25519 key via {@link registerKey}.
 *
 * The full registration flow is:
 * 1. `register()` → sends OTP to email
 * 2. `verifyEmail()` → confirms OTP
 * 3. `registerKey()` → registers Ed25519 public key with enclave nodes
 *
 * @param params - Registration parameters (email, password, blackboxUrl)
 * @returns Registration result with principalId
 *
 * @throws {@link BlackboxError} When the server rejects the registration
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 *
 * const result = await web2.auth.register({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 *
 * console.log('Principal ID:', result.principalId);
 * // Now verify email with OTP...
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function register(params: RegisterParams): Promise<RegisterResult> { ... }
```

### 5.3 `web2/session.ts` — Session Management

Two modes of session management:

#### Mode A: SDK-Managed Session (recommended)

The SDK generates the EOA keypair internally and manages the session lifecycle.

```typescript
/**
 * Create and manage a Web2 session.
 *
 * @remarks
 * The SDK generates an ephemeral EOA keypair for signing requests.
 * The session wallet's private key never leaves the SDK.
 *
 * The returned `Web2Session` object contains:
 * - A `signer` (implements {@link SignerAdapter}) for use with `blackbox.*` functions
 * - Session metadata (expiresAt, principalId)
 * - A `renew()` method to extend the session
 *
 * @param params - Session creation parameters
 * @returns Active Web2 session with signer
 *
 * @throws {@link BlackboxError} When session creation fails
 * @throws {@link AuthError} When Ed25519 signature verification fails
 *
 * @example
 * ```typescript
 * import { web2, blackbox, WEB2_CHAIN_ID } from 'cifer-sdk';
 *
 * // Create a session (SDK manages the EOA keypair)
 * const session = await web2.session.createSession({
 *   principalId: '550e8400-...',
 *   ed25519PrivateKey: myEd25519PrivateKey,
 *   blackboxUrl: sdk.blackboxUrl,
 *   ttl: 900000, // 15 minutes
 * });
 *
 * // Use the session signer with existing blackbox functions
 * const encrypted = await blackbox.payload.encryptPayload({
 *   chainId: WEB2_CHAIN_ID,
 *   secretId: 42,
 *   plaintext: 'Hello Web2!',
 *   signer: session.signer,
 *   readClient: sdk.readClient,
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function createSession(params: CreateSessionParams): Promise<Web2Session> { ... }
```

#### Mode B: External Session Key

The user provides their own EOA private key (e.g., pre-existing key stored in their backend).

```typescript
/**
 * Create a Web2 session using an externally provided EOA private key.
 *
 * @remarks
 * Use this when you already have an EOA private key for signing
 * (e.g., stored in a backend KMS). The SDK will not generate a new keypair.
 *
 * @param params - Session parameters including the external EOA private key
 * @returns Active Web2 session with signer wrapping the provided key
 *
 * @example
 * ```typescript
 * const session = await web2.session.createSessionWithExternalKey({
 *   principalId: '550e8400-...',
 *   ed25519PrivateKey: myEd25519Key,
 *   sessionPrivateKey: '0xabc...', // Your existing EOA key
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function createSessionWithExternalKey(
  params: CreateSessionWithExternalKeyParams
): Promise<Web2Session> { ... }
```

### 5.4 `web2/keys.ts` — Ed25519 Key Utilities

```typescript
/**
 * Generate a new Ed25519 key pair for Web2 authentication.
 *
 * @remarks
 * Ed25519 keys are used to prove ownership during session creation.
 * The public key is registered with the blackbox during onboarding;
 * the private key must be stored securely by the user/application.
 *
 * Uses the Web Crypto API (`crypto.subtle`) when available,
 * falling back to Node.js `crypto` module.
 *
 * @returns A new Ed25519 key pair (public key hex, private key hex)
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 *
 * const keyPair = await web2.keys.generateEd25519KeyPair();
 * console.log('Public key:', keyPair.publicKey);  // hex string
 * console.log('Private key:', keyPair.privateKey); // hex string — store securely!
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function generateEd25519KeyPair(): Promise<Ed25519KeyPair> { ... }

/**
 * Hex-encode an email address for API calls.
 *
 * @remarks
 * Several Web2 endpoints require the email as a hex-encoded string.
 * This helper normalizes (lowercase, trim) and encodes the email.
 *
 * @param email - The email address to encode
 * @returns Hex-encoded email string (no 0x prefix)
 *
 * @example
 * ```typescript
 * const hex = web2.keys.hexEncodeEmail('User@Example.com');
 * // '75736572406578616d706c652e636f6d'
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export function hexEncodeEmail(email: string): string { ... }
```

### 5.5 `web2/secret.ts` — Secret Management

```typescript
/**
 * Create a new Web2 secret.
 *
 * @remarks
 * Web2 secrets are managed by the blackbox (not on-chain).
 * The secret goes through keygen → shard → markSynced in a single call.
 *
 * Unlike Web3 secrets, Web2 secrets:
 * - Don't require a creation fee
 * - Don't need a separate transaction
 * - Are usually ready immediately (or within seconds)
 *
 * @param params - Secret creation parameters
 * @returns The created secret details (secretId, publicKeyCid, status)
 *
 * @throws {@link BlackboxError} When secret creation fails
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 *
 * const secret = await web2.secret.createSecret({
 *   session,
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 *
 * console.log('Secret ID:', secret.secretId);
 * console.log('Status:', secret.status); // 'complete' or 'propagating'
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function createSecret(params: CreateWeb2SecretParams): Promise<CreateWeb2SecretResult> { ... }
```

### 5.6 `web2/delegate.ts` — Delegate Management

```typescript
/**
 * Set or update a delegate for a Web2 secret.
 *
 * @remarks
 * In Web2 mode, delegates are identified by their `principalId` (UUID),
 * not by an Ethereum address as in Web3.
 *
 * To remove a delegate, pass an empty string as `delegatePrincipalId`.
 *
 * @param params - Delegate parameters
 * @returns Success confirmation with secretId
 *
 * @example
 * ```typescript
 * await web2.delegate.setDelegate({
 *   secretId: 42,
 *   delegatePrincipalId: 'recipient-uuid-...',
 *   session,
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function setDelegate(params: SetWeb2DelegateParams): Promise<SetWeb2DelegateResult> { ... }
```

### 5.7 `web2/permit.ts` — Admin Permits

```typescript
/**
 * Request an admin permit for key rotation, ownership transfer, or delegation.
 *
 * @remarks
 * Permits require email confirmation. The blackbox sends a confirmation
 * email with a link. The permit is consumed when the user clicks the link.
 *
 * Three permit actions:
 * - **`rotate`**: Replace the Ed25519 key (uses email+password auth, not session)
 * - **`transfer`**: Transfer secret ownership to another principal (session auth)
 * - **`delegate`**: Set a delegate via permit flow (session auth)
 *
 * @param params - Permit request parameters
 * @returns Permit ID and confirmation details
 *
 * @example
 * ```typescript
 * // Key rotation (when user lost their Ed25519 key)
 * const permit = await web2.permit.requestPermit({
 *   action: 'rotate',
 *   email: 'user@example.com',
 *   password: 'mypassword',
 *   payload: { newPublicKey: newKeyPair.publicKey },
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 * // User receives confirmation email...
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function requestPermit(params: RequestPermitParams): Promise<RequestPermitResult> { ... }
```

### 5.8 `web2/principal.ts` — Principal Lookup

```typescript
/**
 * Look up a Web2 principal by email address.
 *
 * @remarks
 * This is a public endpoint — no authentication required.
 * Useful for checking if a user is already registered before
 * starting the registration flow.
 *
 * @param params - Lookup parameters (email, blackboxUrl)
 * @returns Principal info (principalId, emailHex) or null if not found
 *
 * @example
 * ```typescript
 * const principal = await web2.principal.lookupByEmail({
 *   email: 'user@example.com',
 *   blackboxUrl: sdk.blackboxUrl,
 * });
 *
 * if (principal) {
 *   console.log('Already registered:', principal.principalId);
 * }
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export async function lookupByEmail(params: LookupByEmailParams): Promise<PrincipalInfo | null> { ... }
```

### 5.9 `web2/index.ts` — Barrel Export

```typescript
/**
 * Web2 namespace for email-based authentication and session management.
 *
 * @remarks
 * Web2 mode allows users to access CIFER encryption without a blockchain
 * wallet. Instead of on-chain transactions, Web2 uses:
 *
 * - **Email + password** for registration
 * - **Ed25519 keys** for identity verification
 * - **EOA session keys** for signing blackbox requests
 *
 * For encryption/decryption operations, use the standard `blackbox.*`
 * functions with `chainId = -1` (or {@link WEB2_CHAIN_ID}) and the
 * session's signer.
 *
 * @example Full Web2 flow
 * ```typescript
 * import { web2, blackbox, WEB2_CHAIN_ID } from 'cifer-sdk';
 *
 * // 1. Register
 * await web2.auth.register({ email, password, blackboxUrl });
 * await web2.auth.verifyEmail({ email, otp, blackboxUrl });
 *
 * // 2. Generate and register Ed25519 key
 * const keyPair = await web2.keys.generateEd25519KeyPair();
 * await web2.auth.registerKey({ principalId, password, ...keyPair, blackboxUrl });
 *
 * // 3. Create session
 * const session = await web2.session.createSession({
 *   principalId,
 *   ed25519PrivateKey: keyPair.privateKey,
 *   blackboxUrl,
 * });
 *
 * // 4. Create a secret
 * const secret = await web2.secret.createSecret({ session, blackboxUrl });
 *
 * // 5. Encrypt using existing blackbox functions
 * const encrypted = await blackbox.payload.encryptPayload({
 *   chainId: WEB2_CHAIN_ID,
 *   secretId: secret.secretId,
 *   plaintext: 'Hello from Web2!',
 *   signer: session.signer,
 *   readClient: sdk.readClient,
 *   blackboxUrl,
 * });
 * ```
 *
 * @platform web2
 * @module web2
 * @public
 * @since 0.4.0
 */

export * as auth from './auth.js';
export * as session from './session.js';
export * as keys from './keys.js';
export * as secret from './secret.js';
export * as delegate from './delegate.js';
export * as permit from './permit.js';
export * as principal from './principal.js';
```

---

## 6. Phase 4 — SDK Factory & Exports

### 6.1 Update `src/index.ts`

Add the new `web2` namespace export alongside existing namespaces:

```typescript
/**
 * Web2 operations for email-based authentication and session management.
 *
 * @remarks
 * This namespace provides functions for:
 * - User registration and email verification
 * - Ed25519 key management
 * - Session creation and management
 * - Web2 secret and delegate management
 * - Admin permits (key rotation, transfers)
 *
 * For encryption/decryption, use the standard `blackbox.*` functions
 * with `chainId = -1`.
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export * as web2 from './web2/index.js';
```

Also export `WEB2_CHAIN_ID` from the types re-export section.

### 6.2 Update `package.json` Exports

Add the `./web2` subpath export:

```json
"./web2": {
  "import": {
    "types": "./dist/types/web2/index.d.ts",
    "default": "./dist/esm/web2/index.js"
  },
  "require": {
    "types": "./dist/types/web2/index.d.ts",
    "default": "./dist/cjs/web2/index.js"
  }
}
```

### 6.3 Update `CiferSdk` Interface

Add the `web2` namespace to the SDK instance:

```typescript
export interface CiferSdk {
  // ... existing members ...

  /**
   * Web2 operations (email-based auth, sessions, secrets).
   *
   * @remarks
   * For encryption/decryption in Web2 mode, use `blackbox.*` with
   * `chainId = -1` and the session's signer.
   *
   * @platform web2
   * @since 0.4.0
   */
  readonly web2: typeof web2Ns;
}
```

---

## 7. Phase 5 — JSDoc & TypeDoc Documentation

> **This is the most critical phase for documentation quality.**  
> TypeDoc generates API reference pages from JSDoc comments. Every public symbol must be documented.

### 7.1 Documentation Pipeline Recap

The docs pipeline (from `package.json`) is:

```
npm run docs:build
  ├── npm run build:types         # TypeScript → .d.ts
  ├── npm run docs:api-report     # API Extractor → etc/cifer-sdk.api.md
  ├── npm run docs:typedoc        # TypeDoc → docs-site/docs/api/**/*.md
  ├── npm run docs:llm            # LLM script → docs-site/static/llm.txt
  └── cd docs-site && npm run build  # Docusaurus → build/
```

TypeDoc reads JSDoc comments from **source files** (`src/**/*.ts`) and generates markdown pages in `docs-site/docs/api/`. Docusaurus then renders these as the API Reference section.

### 7.2 `@platform` Tag — Compatibility Identifiers

> **This is a new convention introduced with Web2 support.**

Every public function, interface, type, and class must declare which platform(s) it supports using the custom `@platform` block tag. TypeDoc renders block tags as labeled sections in the generated markdown, so developers immediately see which platform a symbol works with.

#### Tag Values

| Tag | Meaning | Example Symbols |
|-----|---------|-----------------|
| `@platform web3` | Web3 only (requires blockchain wallet + chain) | `keyManagement.*`, `commitments.*` |
| `@platform web2` | Web2 only (requires email auth + session) | `web2.auth.*`, `web2.session.*`, `web2.secret.*` |
| `@platform web3, web2` | Works on both platforms | `blackbox.payload.*`, `blackbox.files.*`, `blackbox.jobs.*` |

#### How It Works

1. **In source code** — add `@platform` to every public JSDoc comment:

```typescript
/**
 * Encrypt a payload using the blackbox API.
 *
 * @platform web3, web2
 * @public
 * @since 0.4.0
 */
```

2. **TypeDoc renders it** — the `@platform` block tag appears as a "Platform" section in the generated API reference markdown:

```markdown
### encryptPayload()

Encrypt a payload using the blackbox API.

#### Platform

web3, web2

#### Parameters
...
```

3. **Docusaurus displays it** — developers see the platform compatibility in the API docs. Custom CSS can be added later to render these as colored badges (see the optional Docusaurus CSS enhancement below).

#### Configuration Change: `typedoc.json`

Add `@platform` to the `blockTags` array:

```json
"blockTags": [
  "@param",
  "@returns",
  "@throws",
  "@example",
  "@remarks",
  "@see",
  "@since",
  "@deprecated",
  "@default",
  "@defaultValue",
  "@typeParam",
  "@module",
  "@description",
  "@platform"
]
```

Also add `@platform` to `api-extractor.json` TSDoc config to suppress warnings (the `tsdoc-undefined-tag` rule is already set to `"none"`, so this is just for documentation):

```json
// No change needed — tsdoc-undefined-tag is already suppressed
```

#### Platform Tag Assignment Reference

| Module / Symbol | `@platform` Value |
|----------------|-------------------|
| **`keyManagement.*`** (all functions) | `web3` |
| **`blackbox.payload.encryptPayload`** | `web3, web2` |
| **`blackbox.payload.decryptPayload`** | `web3, web2` |
| **`blackbox.files.encryptFile`** | `web3, web2` |
| **`blackbox.files.decryptFile`** | `web3, web2` |
| **`blackbox.files.decryptExistingFile`** | `web3, web2` |
| **`blackbox.jobs.*`** (all functions) | `web3, web2` |
| **`commitments.*`** (all functions) | `web3` |
| **`flows.createSecretAndWaitReady`** | `web3` |
| **`flows.encryptThenPrepareCommitTx`** | `web3` |
| **`flows.retrieveFromLogsThenDecrypt`** | `web3` |
| **`flows.encryptFileJobFlow`** | `web3, web2` |
| **`flows.decryptFileJobFlow`** | `web3, web2` |
| **`flows.decryptExistingFileJobFlow`** | `web3, web2` |
| **`web2.auth.*`** (all functions) | `web2` |
| **`web2.session.*`** (all functions) | `web2` |
| **`web2.keys.*`** (all functions) | `web2` |
| **`web2.secret.*`** (all functions) | `web2` |
| **`web2.delegate.*`** (all functions) | `web2` |
| **`web2.permit.*`** (all functions) | `web2` |
| **`web2.principal.*`** (all functions) | `web2` |
| **`createCiferSdk`** | `web3, web2` |
| **`createCiferSdkSync`** | `web3, web2` |
| **`Eip1193SignerAdapter`** | `web3` |
| **`RpcReadClient`** | `web3, web2` |
| **`WEB2_CHAIN_ID`** | `web2` |
| **`SignerAdapter`** (interface) | `web3, web2` |
| **`ReadClient`** (interface) | `web3, web2` |
| **`DataConsumption`** | `web3, web2` |
| **`SecretState`** | `web3` |
| **`Web2SecretState`** | `web2` |

#### (Optional) Docusaurus CSS Enhancement

To render `@platform` values as colored badges in the docs site, add to `docs-site/src/css/custom.css`:

```css
/* Platform compatibility badges */
h4:has(+ p) + p:where(:is([class*="platform"])) {
  /* Future: style as badges */
}

/* Manual approach: remark plugin or MDX component */
/* For now, the plain text "web3, web2" under a "Platform" heading is sufficient */
/* A custom remark plugin can be added later to transform these into badge components */
```

A more robust approach for badge rendering can be implemented later via a custom Docusaurus remark plugin that transforms the TypeDoc-generated `#### Platform\n\nweb3, web2` patterns into `<span class="platform-badge platform-web3">web3</span>` elements.

### 7.3 JSDoc Tags Reference (Supported by Our Config)

From `typedoc.json`, the following tags are configured:

**Block tags** (use in JSDoc blocks):
- `@param` — parameter description
- `@returns` — return value description
- `@throws` — error conditions (use `{@link ErrorClass}` syntax)
- `@example` — code examples (wrap in triple-backtick typescript blocks)
- `@remarks` — additional details, caveats, related info
- `@see` — references to related symbols
- `@since` — version when introduced (use `0.4.0` for all new Web2 code)
- `@deprecated` — mark deprecated symbols
- `@default` / `@defaultValue` — default parameter values
- `@typeParam` — generic type parameter description
- `@module` — module-level documentation (at top of file)
- `@description` — main description (alternative to first paragraph)
- `@platform` — **NEW** — platform compatibility (`web3`, `web2`, or `web3, web2`)

**Inline tags** (use within text):
- `{@link SymbolName}` — link to another symbol
- `{@inheritDoc}` — inherit documentation from another symbol
- `{@label}` — label for overloads

**Modifier tags**:
- `@public` — mark as part of public API (shown in docs)
- `@internal` — excluded from public API docs
- `@experimental` — mark as experimental/beta
- `@since` — version introduced

### 7.4 Required JSDoc for Every New Symbol

#### Every exported function MUST have:

```typescript
/**
 * One-line summary of what the function does.
 *
 * @remarks
 * Longer description explaining behavior, edge cases, and context.
 * Reference related functions with {@link otherFunction}.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 *
 * @throws {@link ErrorClass} When X happens
 * @throws {@link OtherError} When Y happens
 *
 * @example Basic usage
 * ```typescript
 * // Complete, runnable example
 * const result = await web2.auth.register({
 *   email: 'user@example.com',
 *   password: 'secret',
 *   blackboxUrl: 'https://...',
 * });
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
```

#### Every exported interface MUST have:

```typescript
/**
 * One-line summary.
 *
 * @remarks
 * Explain the purpose, when this type is used, and any constraints.
 *
 * @example
 * ```typescript
 * const params: RegisterParams = {
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * };
 * ```
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export interface RegisterParams {
  /** The user's email address. Must be valid and deliverable. */
  email: string;
  /** Password for the account. Minimum 8 characters recommended. */
  password: string;
  /** Blackbox API URL */
  blackboxUrl: string;
  /** Optional: Custom fetch implementation */
  fetch?: typeof fetch;
}
```

#### Every exported type alias MUST have:

```typescript
/**
 * Summary of the type.
 *
 * @remarks
 * When and why to use this type.
 *
 * @platform web2
 * @public
 * @since 0.4.0
 */
export type PermitAction = 'rotate' | 'transfer' | 'delegate';
```

#### Every module barrel file (`index.ts`) MUST have a file-level doc:

```typescript
/**
 * Module description for TypeDoc.
 *
 * @remarks
 * Extended description with usage patterns.
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 * // ... usage
 * ```
 *
 * @platform web2
 * @module web2
 * @packageDocumentation
 */
```

### 7.5 Update Existing JSDoc Comments

The following existing files need JSDoc updates to reflect Web2 support. **Add `@platform` tags to all existing public symbols as part of this work.**

#### `src/types/common.ts` — Update `ChainId` docs:

```typescript
/**
 * Chain ID as a number.
 *
 * @remarks
 * Common chain IDs used with CIFER:
 * - `752025` - Ternoa Mainnet
 * - `11155111` - Ethereum Sepolia (testnet)
 * - `-1` - Web2 mode (no blockchain, uses timestamps)
 *
 * Use the {@link WEB2_CHAIN_ID} constant for Web2 mode.
 *
 * @platform web3, web2
 * @public
 */
export type ChainId = number;
```

#### `src/blackbox/payload.ts` — Update `EncryptPayloadParams.chainId` and function docs:

```typescript
/** 
 * Chain ID where the secret exists. 
 * Use `-1` (or {@link WEB2_CHAIN_ID}) for Web2 mode.
 * @since 0.4.0 — Added Web2 support
 */
chainId: ChainId;
```

Add `@platform` to both `encryptPayload` and `decryptPayload`:

```typescript
/**
 * Encrypt a payload using the blackbox API.
 * ...existing docs...
 *
 * @platform web3, web2
 * @public
 */
```

#### `src/blackbox/files.ts` — Add `@platform` to all functions:

```typescript
/**
 * @platform web3, web2
 */
```

#### `src/blackbox/jobs.ts` — Add `@platform` to all functions:

```typescript
/**
 * @platform web3, web2
 */
```

#### `src/keyManagement/**` — Add `@platform web3` to all functions:

```typescript
/**
 * @platform web3
 */
```

#### `src/commitments/**` — Add `@platform web3` to all functions:

```typescript
/**
 * @platform web3
 */
```

#### `src/flows/**` — Add platform tags per function (see tag assignment table in 7.2):

- `createSecretAndWaitReady`: `@platform web3`
- `encryptThenPrepareCommitTx`: `@platform web3`
- `retrieveFromLogsThenDecrypt`: `@platform web3`
- `encryptFileJobFlow`: `@platform web3, web2`
- `decryptFileJobFlow`: `@platform web3, web2`
- `decryptExistingFileJobFlow`: `@platform web3, web2`

#### `src/internal/auth/block-freshness.ts` — Update module doc:

```typescript
/**
 * @module internal/auth/block-freshness
 * @description Block freshness management for anti-replay protection
 *
 * For Web3: validates requests include a recent block number.
 * For Web2 (chainId=-1): uses current timestamp; no retry needed.
 *
 * @platform web3, web2
 */
```

#### `src/internal/adapters/rpc-read-client.ts` — Update class doc:

```typescript
/**
 * RPC read client for making blockchain queries.
 *
 * @remarks
 * This client makes standard JSON-RPC calls to Ethereum-compatible nodes.
 * It supports multiple chains by mapping chain IDs to RPC URLs.
 *
 * For Web2 mode (`chainId = -1`), the client returns `Date.now()` from
 * `getBlockNumber()` without making any RPC calls.
 *
 * @platform web3, web2
 * @since 0.4.0 — Added Web2 (chainId=-1) support
 */
```

### 7.6 TypeDoc Category Configuration

Update `typedoc.json` to add the Web2 category:

```json
"categoryOrder": [
  "SDK Factory",
  "Adapters",
  "Key Management",
  "Blackbox",
  "Web2",
  "Commitments",
  "Flows",
  "Types",
  "Errors",
  "Internal",
  "*"
]
```

Also add the `@category Web2` tag to the `web2` namespace export in `src/index.ts`:

```typescript
/**
 * Web2 operations for email-based authentication and session management.
 *
 * @category Web2
 * @public
 * @since 0.4.0
 */
export * as web2 from './web2/index.js';
```

---

## 8. Phase 6 — Docusaurus Site Updates

### 8.1 New Guide Pages

Create the following new pages in `docs-site/docs/`:

#### `docs-site/docs/getting-started/web2-quickstart.md`

```markdown
---
sidebar_position: 5
---

# Web2 Quick Start

Get started with CIFER encryption without a blockchain wallet.

## Overview
## Registration Flow
## Session Management
## Encrypt & Decrypt
## Full Example
```

#### `docs-site/docs/guides/web2.md`

```markdown
---
sidebar_position: 5
---

# Web2 Guide

In-depth guide for Web2 (email-based) integration.

## Authentication Model
  - Email + Password registration
  - Ed25519 key for identity
  - EOA session keys for signing

## Session Modes
  - SDK-managed sessions
  - External session keys

## Secret Management
  - Creating secrets
  - Listing secrets
  - Delegating access

## Admin Permits
  - Key rotation
  - Ownership transfer

## Using with Blackbox
  - Payload encryption/decryption
  - File encryption/decryption
  - Job management
```

### 8.2 Update Existing Pages

#### `docs-site/docs/intro.md`

- Add Web2 to the features table
- Add Web2 to the architecture diagram (show email → blackbox → enclave path)
- Add Web2 to the "Next Steps" links

#### `docs-site/docs/getting-started/concepts.md`

- Add a "Web2 vs Web3" section explaining the differences
- Explain that encryption/decryption uses the same blackbox API

#### `docs-site/docs/guides/encryption.md`

- Add a "Web2 Encryption" section showing how to use `chainId = -1`

### 8.3 Update Sidebar

**File**: `docs-site/sidebars.js`

```javascript
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      // ...existing items...
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/web2-quickstart', // NEW
        'getting-started/wallet-integration',
        'getting-started/concepts',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      // ...existing items...
      items: [
        'guides/key-management',
        'guides/encryption',
        'guides/web2',          // NEW
        'guides/commitments',
        'guides/flows',
      ],
    },
    // ... API Reference category stays autogenerated
  ],
};
```

---

## 9. Phase 7 — LLM.txt & generate-llm-txt.js Updates

### 9.1 Update `scripts/generate-llm-txt.js`

Add new sections to the LLM text generator:

```javascript
// Add to TABLE OF CONTENTS:
// 10. WEB2 INTEGRATION
//     - Registration & Onboarding
//     - Session Management
//     - Web2 Secrets & Delegates
//     - Admin Permits
//     - Using Blackbox with Web2

// Add new generator functions:
function generateWeb2Reference() { ... }
function generateWeb2Examples() { ... }

// Add to sections array:
const sections = [
  // ... existing sections ...
  generateWeb2Reference(),     // NEW
  generateWeb2Examples(),      // NEW
  generateFooter(),
];
```

### 9.2 Sections to Add

1. **Web2 Overview**: What Web2 mode is, how it differs from Web3
2. **Registration Flow**: Step-by-step registration API calls
3. **Session Management**: Both SDK-managed and external key modes
4. **web2.auth Namespace**: All auth functions
5. **web2.session Namespace**: Session functions
6. **web2.keys Namespace**: Key generation helpers
7. **web2.secret Namespace**: Secret management
8. **web2.delegate Namespace**: Delegate management
9. **web2.permit Namespace**: Admin permits
10. **web2.principal Namespace**: Principal lookup
11. **Web2 + Blackbox Examples**: Show reuse of `blackbox.*` with `chainId = -1`
12. **Updated Type Definitions**: Add Web2 types

---

## 10. Phase 8 — CHANGELOG & Release Notes

### 10.1 Update `CHANGELOG.md`

Every code change must have a corresponding CHANGELOG entry. Maintain entries under `[Unreleased]` during development:

```markdown
## [Unreleased]

### Added

- **Web2 module** (`web2.*`) — Email-based authentication and session management for CIFER encryption without a blockchain wallet.
  - `web2.auth` — Registration, email verification, Ed25519 key registration
  - `web2.session` — Session creation (SDK-managed and external key modes)
  - `web2.keys` — Ed25519 keypair generation, email hex encoding
  - `web2.secret` — Web2 secret creation and listing
  - `web2.delegate` — Web2 delegate management
  - `web2.permit` — Admin permits (key rotation, ownership transfer)
  - `web2.principal` — Principal lookup by email

- **`WEB2_CHAIN_ID` constant** — Sentinel value (`-1`) for Web2 mode. Use with `blackbox.*` functions.

- **Web2 support in `RpcReadClient.getBlockNumber()`** — Returns `Date.now()` when `chainId === -1`.

- **Web2 support in `withBlockFreshRetry()`** — Skips retry logic for `chainId === -1` (timestamps are always fresh).

### Breaking Changes

- **`DataConsumption` type redesigned** — (already documented from previous work)

### Changed

- Updated `ChainId` docs to mention Web2 mode (`-1`).
- Updated `EncryptPayloadParams` docs to mention Web2 support.
```

### 10.2 When to Update

- After every PR merge that touches the SDK source
- Before every release, move `[Unreleased]` items to a versioned section

---

## 11. Phase 9 — Tests

### 11.1 Unit Tests

Create test files mirroring the module structure:

```
tests/
├── web2/
│   ├── auth.test.ts          # Mock fetch, test register/verify/registerKey
│   ├── session.test.ts       # Test session creation, signer interface
│   ├── keys.test.ts          # Test Ed25519 generation, hex encoding
│   ├── secret.test.ts        # Test create/list
│   ├── delegate.test.ts      # Test set/remove delegate
│   ├── permit.test.ts        # Test permit request
│   └── principal.test.ts     # Test lookup
├── internal/
│   └── adapters/
│       └── rpc-read-client.test.ts  # Test chainId=-1 returns Date.now()
│   └── auth/
│       └── block-freshness.test.ts  # Test chainId=-1 skips retry
```

### 11.2 Integration Tests

- Full Web2 registration → session → encrypt → decrypt flow (against mock server)
- Verify `blackbox.payload.encryptPayload` works with `chainId = -1`
- Verify `blackbox.files.encryptFile` works with `chainId = -1`

---

## 12. File Inventory

### New Files

| File | Purpose |
|------|---------|
| `src/web2/index.ts` | Barrel export for web2 module |
| `src/web2/auth.ts` | Registration, email verification, Ed25519 key registration |
| `src/web2/session.ts` | Session creation and management |
| `src/web2/keys.ts` | Ed25519 key generation and helpers |
| `src/web2/secret.ts` | Web2 secret CRUD |
| `src/web2/delegate.ts` | Web2 delegate management |
| `src/web2/permit.ts` | Admin permit operations |
| `src/web2/principal.ts` | Principal lookup |
| `src/types/web2.ts` | All Web2 type definitions |
| `docs-site/docs/getting-started/web2-quickstart.md` | Web2 getting started guide |
| `docs-site/docs/guides/web2.md` | In-depth Web2 guide |
| `tests/web2/*.test.ts` | Unit tests for web2 module |

### Modified Files

| File | Change |
|------|--------|
| `src/internal/adapters/rpc-read-client.ts` | `getBlockNumber()` returns `Date.now()` for chainId=-1 |
| `src/internal/auth/block-freshness.ts` | `withBlockFreshRetry()` skips retry for chainId=-1 |
| `src/types/common.ts` | Add `WEB2_CHAIN_ID` constant; update `ChainId` docs |
| `src/types/index.ts` | Re-export web2 types |
| `src/index.ts` | Add `web2` namespace export; update `CiferSdk` interface |
| `src/blackbox/payload.ts` | Update JSDoc to mention Web2 support |
| `src/blackbox/files.ts` | Update JSDoc to mention Web2 support |
| `src/blackbox/jobs.ts` | Update JSDoc to mention Web2 support |
| `package.json` | Add `./web2` export path |
| `typedoc.json` | Add `Web2` to `categoryOrder`; add `@platform` to `blockTags` |
| `scripts/generate-llm-txt.js` | Add Web2 sections |
| `docs-site/sidebars.js` | Add web2 guide entries |
| `docs-site/docs/intro.md` | Mention Web2 support |
| `docs-site/docs/getting-started/concepts.md` | Add Web2 vs Web3 section |
| `docs-site/docs/guides/encryption.md` | Add Web2 encryption example |
| `CHANGELOG.md` | Document all changes |

---

## 13. JSDoc Comment Standards

### Checklist for Every New Public Symbol

- [ ] **Summary line**: First line is a concise one-sentence description
- [ ] **`@remarks`**: Extended explanation with context, edge cases, and related symbols
- [ ] **`@param`**: Every parameter documented with a dash-separated description
- [ ] **`@returns`**: Return value documented
- [ ] **`@throws`**: All possible error types listed with `{@link ErrorClass}`
- [ ] **`@example`**: At least one complete, runnable code example in a TS code block
- [ ] **`@platform`**: One of `web3`, `web2`, or `web3, web2` (see [Section 7.2](#72-platform-tag--compatibility-identifiers))
- [ ] **`@public`**: Present on all exported symbols
- [ ] **`@since 0.4.0`**: Present on all new symbols
- [ ] **`{@link}`**: Used for cross-references to related types and functions
- [ ] **Interface properties**: Every property has a `/** ... */` single-line doc comment

### Common Patterns

**Function with multiple examples:**
```typescript
/**
 * Summary.
 *
 * @example Basic usage
 * ```typescript
 * // Example 1
 * ```
 *
 * @example With custom options
 * ```typescript
 * // Example 2
 * ```
 */
```

**Referencing other symbols:**
```typescript
/**
 * Creates a session. Use the returned signer with {@link blackbox.payload.encryptPayload}.
 *
 * @see {@link createSessionWithExternalKey} for externally managed keys
 * @see {@link Web2Session} for the session interface
 * @platform web2
 */
```

**Cross-platform function (both tags):**
```typescript
/**
 * Encrypt a payload using the blackbox API.
 *
 * @remarks
 * Works for both Web3 (chainId > 0, wallet signer) and Web2
 * (chainId = -1, session signer). See {@link WEB2_CHAIN_ID}.
 *
 * @platform web3, web2
 * @public
 */
```

**Web3-only function:**
```typescript
/**
 * Build transaction to create a new on-chain secret.
 *
 * @remarks
 * Web2 secrets are created via {@link web2.secret.createSecret} instead.
 *
 * @platform web3
 * @public
 */
```

**Deprecated symbol:**
```typescript
/**
 * @deprecated Use {@link newFunction} instead. Will be removed in 1.0.0.
 */
```

---

## 14. DX Examples (Target API)

### 14.1 Web2 Full Flow (SDK-Managed Session)

```typescript
import { createCiferSdk, web2, blackbox, WEB2_CHAIN_ID } from 'cifer-sdk';

// 1. Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// 2. Register (one-time)
const reg = await web2.auth.register({
  email: 'alice@example.com',
  password: 'secureP@ss123',
  blackboxUrl: sdk.blackboxUrl,
});

// 3. Verify email (user receives OTP)
await web2.auth.verifyEmail({
  email: 'alice@example.com',
  otp: '123456', // From email
  blackboxUrl: sdk.blackboxUrl,
});

// 4. Generate and register Ed25519 key
const keyPair = await web2.keys.generateEd25519KeyPair();
await web2.auth.registerKey({
  principalId: reg.principalId,
  password: 'secureP@ss123',
  publicKey: keyPair.publicKey,
  blackboxUrl: sdk.blackboxUrl,
});
// IMPORTANT: Store keyPair.privateKey securely!

// 5. Create session
const session = await web2.session.createSession({
  principalId: reg.principalId,
  ed25519PrivateKey: keyPair.privateKey,
  blackboxUrl: sdk.blackboxUrl,
  ttl: 900_000, // 15 minutes
});

// 6. Create a secret
const secret = await web2.secret.createSecret({
  session,
  blackboxUrl: sdk.blackboxUrl,
});

// 7. Encrypt — reuses existing blackbox functions!
const encrypted = await blackbox.payload.encryptPayload({
  chainId: WEB2_CHAIN_ID,  // -1
  secretId: secret.secretId,
  plaintext: 'Hello from Web2!',
  signer: session.signer,         // Session provides a SignerAdapter
  readClient: sdk.readClient,     // Returns Date.now() for chainId=-1
  blackboxUrl: sdk.blackboxUrl,
});

// 8. Decrypt — same pattern
const decrypted = await blackbox.payload.decryptPayload({
  chainId: WEB2_CHAIN_ID,
  secretId: secret.secretId,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  signer: session.signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

console.log(decrypted.decryptedMessage); // 'Hello from Web2!'
```

### 14.2 Web2 with External Session Key

```typescript
import { web2, blackbox, WEB2_CHAIN_ID } from 'cifer-sdk';

// User already has an EOA private key (e.g., from backend KMS)
const session = await web2.session.createSessionWithExternalKey({
  principalId: 'known-principal-id',
  ed25519PrivateKey: storedEd25519Key,
  sessionPrivateKey: '0xmyExistingEOAPrivateKey...',
  blackboxUrl: sdk.blackboxUrl,
});

// Use session.signer with blackbox functions
const encrypted = await blackbox.payload.encryptPayload({
  chainId: WEB2_CHAIN_ID,
  secretId: 42,
  plaintext: 'External key session!',
  signer: session.signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});
```

### 14.3 File Encryption (Web2)

```typescript
import { blackbox, WEB2_CHAIN_ID } from 'cifer-sdk';

// Start file encryption job (same API as Web3, just different chainId)
const job = await blackbox.files.encryptFile({
  chainId: WEB2_CHAIN_ID,
  secretId: secret.secretId,
  file: myFile,
  signer: session.signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

// Poll until complete (unchanged)
const finalStatus = await blackbox.jobs.pollUntilComplete(
  job.jobId,
  sdk.blackboxUrl,
  { onProgress: (s) => console.log(`${s.progress}%`) }
);

// Download result (unchanged)
const blob = await blackbox.jobs.download(job.jobId, {
  blackboxUrl: sdk.blackboxUrl,
  chainId: WEB2_CHAIN_ID,
  secretId: secret.secretId,
  signer: session.signer,
  readClient: sdk.readClient,
});
```

---

## Implementation Order

| Order | Phase | Effort | Dependencies |
|-------|-------|--------|-------------|
| 1 | Phase 2: Types (`src/types/web2.ts`) | Small | None |
| 2 | Phase 1: Core infra (`rpc-read-client`, `block-freshness`, `WEB2_CHAIN_ID`) | Small | Types |
| 3 | Phase 3: Web2 module (`src/web2/*`) | Large | Types, Core infra |
| 4 | Phase 4: SDK factory & exports | Small | Web2 module |
| 5 | Phase 5: JSDoc & TypeDoc | Medium | All code complete |
| 6 | Phase 9: Tests | Medium | All code complete |
| 7 | Phase 6: Docusaurus site | Medium | JSDoc complete (for API ref) |
| 8 | Phase 7: LLM.txt updates | Small | All code + docs complete |
| 9 | Phase 8: CHANGELOG finalization | Small | All phases complete |

---

## Notes

- The `@platform` tag is **mandatory** on every public symbol. See the assignment table in [Section 7.2](#72-platform-tag--compatibility-identifiers). When adding `@platform` tags to **existing** symbols (backfill), no `@since` tag is needed for the platform annotation itself — only new symbols get `@since 0.4.0`.
- The `@since 0.4.0` tag should be added to **every** new public symbol to help users identify what's new.
- JSDoc `@example` blocks must be complete and runnable — TypeDoc renders them as code blocks in the generated docs.
- Use `{@link SymbolName}` liberally to create hyperlinks between API reference pages.
- The `@module` tag at the top of barrel files (`index.ts`) controls the page title in generated docs.
- Keep the CHANGELOG updated as each phase is completed, not just at the end.
- `/web2/auth/retry-node-registration` is intentionally **excluded** from the SDK. Node registration retries are an infrastructure concern handled server-side.
