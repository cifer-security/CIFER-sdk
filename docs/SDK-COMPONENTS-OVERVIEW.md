# CIFER SDK docs — how the components fit together (Blackbox ↔ SecretsController ↔ On-chain Encrypted Commitments)

This file is a **high-level glue doc** that explains how the three SDK-reference documents in this folder relate, and how data moves through the CIFER ecosystem.

It intentionally does **not** prescribe SDK architecture/design; it just links the already-documented surfaces so another agent can understand dependencies.

---

## The three “SDK surfaces”

### 1) Secrets registry + authorization (on-chain)

**Doc**: `controller-info-for-sdk.md`  
**Contract**: `CiferSecretsControllerMultichain`

What it provides:

- A canonical on-chain mapping `secretId -> SecretState` including:
  - `owner` / `delegate` (authorization)
  - `isSyncing` (readiness)
  - `secretType` (algorithm/type gate)
  - `publicKeyCid` (where the public key is stored on IPFS once ready)

Why it matters to SDK agents:

- The **blackbox** checks this contract to decide whether a caller may decrypt (owner/delegate) and whether a secret is usable (`isSyncing == false`, `secretType == 1`).

---

### 2) Encryption/decryption service + async jobs (off-chain HTTP)

**Doc**: `blackbox-info-for-sdk.md`  
**Service**: “CIFER blackbox”

What it provides (SDK scope is restricted to the endpoints listed in that doc):

- **Payload encryption** using a secret’s public key (from chain state → IPFS)
- **Payload decryption** using a secret’s private key reconstructed from enclave shards (requires signature proving owner/delegate)
- **File encryption/decryption** via an async job system (upload → poll → download)

Why it matters to SDK agents:

- It’s the bridge between:
  - on-chain **secret authorization/state**
  - off-chain **crypto operations** and **job artifacts**

---

### 3) On-chain encrypted commitments (storage-by-event pattern)

**Doc**: `SC-data-encryption-info-for-sdk.md`  
**Contracts**: `ICiferEncrypted` + `CiferEncryptedBase` (implemented by child contracts)

What it provides:

- A stable interface for storing/verifying **encrypted bytes commitments** on-chain:
  - commits only hashes + metadata in storage
  - emits the actual `cifer` + `encryptedMessage` bytes in events

Why it matters to SDK agents:

- It defines the on-chain **wire format constraints** for encrypted material:
  - `cifer` must be exactly **1104 bytes**
  - `encryptedMessage` must be non-empty and ≤ **MAX_PAYLOAD_BYTES**

---

## Key data mapping: Blackbox output ↔ On-chain commitment inputs

When the blackbox encrypts a payload, it returns two values:

- `cifer` — fixed-size crypto overhead (ML‑KEM ciphertext + AES‑GCM tag)
- `encryptedMessage` — the AES-encrypted bytes for the actual plaintext (variable size)

When a child contract using `CiferEncryptedBase` stores encrypted data, it expects:

- `cifer: bytes` — fixed-size (1104 bytes)
- `encryptedMessage: bytes` — variable-size (≤ MAX)

**Mapping:**

- `cifer` (on-chain) corresponds to **decoded** blackbox `cifer`
- `encryptedMessage` (on-chain) corresponds to **decoded** blackbox `encryptedMessage`

So, if an SDK integrates both components:

- Convert blackbox `cifer` from base64/hex into raw bytes and pass as on-chain `cifer`
- Convert blackbox `encryptedMessage` from base64/hex into raw bytes and pass as on-chain `encryptedMessage`
- Enforce the on-chain size rules from `SC-data-encryption-info-for-sdk.md`

---

## Typical end-to-end flows (conceptual)

### A) Create a secret (on-chain) → wait until usable

1. User calls `createSecret()` on `CiferSecretsControllerMultichain` (paying `secretCreationFee()`).
2. Secret starts as `isSyncing = true`.
3. A whitelisted blackbox later calls `markSecretSynced(...)` on-chain, which sets:
   - `isSyncing = false`
   - `publicKeyCid = <cid>`
4. App detects readiness by either:
   - polling `getSecretState(secretId)` until `isSyncing == false`, or
   - watching for `SecretSynced(secretId, ...)`.

### B) Encrypt a short payload (blackbox) using a secret

1. App builds `data = chainId_secretId_signer_blockNumber_plainText` and signs it (EIP-191).
2. App calls `POST /encrypt-payload` with `data`, `signature`.
3. Blackbox reads `getSecretState(secretId)` on the target chain to get `publicKeyCid`.
3. Blackbox fetches the public key from IPFS via `publicKeyCid`.
4. Blackbox returns `cifer` + `encryptedMessage`.

### C) Decrypt a short payload (blackbox) with on-chain authorization

1. App builds `data = chainId_secretId_signer_blockNumber_encryptedMessage` and signs it (EIP-191).
2. App calls `POST /decrypt-payload` with `cifer`, `data`, `signature`.
3. Blackbox verifies:
   - signature recovers `signer`
   - block window is fresh on `chainId`
   - signer is `owner` or `delegate` in `getSecretState(secretId)`
4. Blackbox reconstructs private key shards (enclave cluster) and returns plaintext.

### D) Encrypt/decrypt a file (blackbox async jobs)

1. Upload to `/encrypt-file` or `/decrypt-file` → receive `jobId`.
2. Poll `GET /jobs/:jobId/status` until `completed|failed|expired`.
3. Download via `POST /jobs/:jobId/download`:
   - encrypt job: no auth
   - decrypt job: signed auth payload required (owner/delegate rules)

---

## Where to discover chain + contract configuration

The blackbox exposes `GET /healthz`, which returns (among other things):

- `supportedChains` (authoritative allowlist for the blackbox instance)
- `configurations.chains[*].secretsControllerAddress` (per-chain controller address)
- `configurations.chains[*].rpcUrl` / `wsRpcUrl` (per-chain connectivity metadata)

An SDK can use this as a runtime discovery mechanism (instead of hardcoding chainIds and addresses).

