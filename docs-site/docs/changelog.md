---
sidebar_position: 6
title: Changelog
description: Version history and release notes for the CIFER SDK.
---

# Changelog

All notable changes to the CIFER SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.5.0] - 2026-06-16

### Added

- **`blackbox.publicKey.getSecretPublicKey()`** — Fetch ML-KEM public keys from the blackbox `POST /secret-public-key` endpoint (Web3 and session-authenticated Web2 via `web2.blackbox.publicKey.getSecretPublicKey()`).
- **`ON_CHAIN_PUBLIC_KEY_PLACEHOLDER`** — Documents the on-chain `publicKeyCid` sentinel (`'cifer'`) used when blackbox stores keys locally instead of IPFS.

### Changed

- **Discovery defaults** — Examples and discovery docs now reference `https://blackbox.cifersecurity.com:3010` and include Base (`8453`) among supported chains.
- **Documentation** — Regenerated API reference, guides, and `llm.txt` for the new public-key flow.

### Deprecated

- **`ipfsGatewayUrl`** in discovery configuration — Blackbox no longer exposes IPFS; use `blackbox.publicKey.getSecretPublicKey()` instead.

## [0.4.0] - 2026-03-09

### ⚠️ Breaking Changes

- **`DataConsumption` type redesigned** — The `wallet` field has been removed. It is replaced by `userId`, `userType`, `planId`, `cycleType`, `periodStart`, and `periodEnd` to align with the updated blackbox `/jobs/dataConsumption` response which now supports both Web3 and Web2 users. The `encryption` and `decryption` objects now also include `requestLimit` and `rateLimit` fields (via the new `UsageStats` interface).

  **Migration:** Replace `usage.wallet` with `usage.userId`. For Web3 users `userId` contains the wallet address; for Web2 users it contains the principal ID. Check `usage.userType` (`'web3'` or `'web2'`) if you need to distinguish.

- **Runtime dependencies added** — The package previously had **zero** runtime dependencies. It now depends on `@noble/secp256k1` (^2.1.0) and `@noble/hashes` (^1.4.0) for the new `PrivateKeySignerAdapter`. Both are audited, tree-shakeable, and add ~8 KB minified+gzipped combined. Existing Web3-only consumers who use `Eip1193SignerAdapter` will still work without changes but will see these packages in their dependency tree.

### Added

#### New `web2` Namespace

Full Web2 (email + password) support for CIFER encryption, accessible via the new `web2` namespace and `cifer-sdk/web2` subpath export.

- **`web2.auth`** — Two-phase registration flow:
  - `register()` — Email + password registration (sends OTP)
  - `verifyEmail()` — Verify email with OTP code
  - `registerKey()` — Register Ed25519 public key and propagate to cluster nodes
  - `resendOtp()` — Resend verification OTP (60s cooldown)
  - `forgotPassword()` / `resetPassword()` — Password reset flow
  - `retryNodeRegistration()` — Retry failed node registrations
  - `nodeRegistrationStatus()` — Check node propagation status

- **`web2.session`** — Session management with two modes:
  - `createManagedSession()` — SDK manages session lifecycle: generates ephemeral EOA keypair, creates session via Ed25519 signature, auto-renews on expiry (with 60s skew)
  - `useExistingSessionKey()` — Wraps a pre-existing session private key (e.g. from a TEE web front); cannot renew

- **`web2.secret`** — Web2 secret operations:
  - `createSecret()` — Create a new secret (data string: `-1_0_<sessionAddress>_<timestamp>`)
  - `listSecrets()` — List all secrets for the principal (data string: `-1_<principalId>_<sessionAddress>_<timestamp>`)

- **`web2.delegate`** — Delegate management:
  - `setDelegate()` — Set or remove a delegate on a secret

- **`web2.permit`** — Permit requests:
  - `requestPermit()` — Request key rotation (email+password auth), ownership transfer, or delegation permits (session auth)

- **`web2.principal`** — Principal lookup:
  - `getByEmail()` — Look up a principal UUID by email address

- **`web2.blackbox`** — Session-first wrappers around existing `blackbox.*` functions:
  - `web2.blackbox.payload.encryptPayload()` / `decryptPayload()`
  - `web2.blackbox.files.encryptFile()` / `decryptFile()` / `decryptExistingFile()`
  - `web2.blackbox.jobs.download()` / `deleteJob()` / `list()` / `dataConsumption()`
  - Also re-exports `getStatus()` and `pollUntilComplete()` (no session required)

  All wrappers automatically set `chainId = -1`, use the session signer, and call `session.ensureValid()` before each request.

#### New `PrivateKeySignerAdapter`

- Implements `SignerAdapter` using a raw secp256k1 private key
- EIP-191 `personal_sign` compatible (same format the blackbox expects)
- `PrivateKeySignerAdapter.generate()` creates a fresh random keypair
- Exported from the main entry point: `import { PrivateKeySignerAdapter } from 'cifer-sdk'`

#### New `WEB2_CHAIN_ID` Constant

- `WEB2_CHAIN_ID = -1` — Sentinel value for Web2 mode
- `RpcReadClient.getBlockNumber(-1)` now returns `Date.now()` (millisecond timestamp) instead of making an RPC call — all existing `blackbox.*` functions work with `chainId = -1` without modification

#### New Error Types

- `Web2Error` (extends `CiferError`, code: `WEB2_ERROR`) — Base class for Web2 errors
- `Web2SessionError` (extends `Web2Error`) — Session expired, missing, or cannot be renewed
- `Web2AuthError` (extends `Web2Error`) — Registration, OTP, or password errors
- `isWeb2Error()` / `isWeb2SessionError()` — Type guard functions

#### New Web2 Types

All types exported from `cifer-sdk` and `cifer-sdk/web2`:

- `Ed25519Signer` — Callback interface for Ed25519 signing (bring-your-own library)
- `Web2Session` — Session object with `signer`, `principalId`, `renew()`, `ensureValid()`
- `RegisterParams` / `RegisterResult`, `VerifyEmailParams` / `VerifyEmailResult`, `RegisterKeyParams` / `RegisterKeyResult`
- `CreateManagedSessionParams`, `CreateSessionResult`, `UseExistingSessionKeyParams`
- `CreateWeb2SecretParams` / `CreateWeb2SecretResult`, `ListWeb2SecretsParams` / `ListWeb2SecretsResult`, `Web2SecretInfo`
- `SetWeb2DelegateParams` / `SetWeb2DelegateResult`
- `RequestPermitParams` / `RequestPermitResult`, `PermitAction`
- `PrincipalByEmailResult`
- `ResendOtpParams`, `ForgotPasswordParams`, `ResetPasswordParams`
- `RetryNodeRegistrationParams` / `RetryNodeRegistrationResult`, `NodeRegistrationStatusResult`

#### New Subpath Export

- `cifer-sdk/web2` — Direct import of the Web2 namespace for tree-shaking

### Unchanged

- All existing Web3 functionality (`keyManagement`, `blackbox`, `commitments`, `flows`) is completely unaffected
- `Eip1193SignerAdapter`, `RpcReadClient`, and all other existing adapters work exactly as before
- All existing tests continue to pass

---

## [0.3.1] — Previous release

_Baseline before Web2 support work began._
