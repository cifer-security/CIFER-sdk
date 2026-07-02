## CIFER Blackbox — SDK-focused API notes (Web3 + Web2)

This document covers **all** SDK-relevant endpoints exposed by the CIFER Blackbox, including:

- The original **Web3** endpoints (encrypt/decrypt payloads and files, jobs, etc.)
- The new **Web2** endpoints under `/web2/*` (email-based registration, Ed25519 auth, sessions, secrets, delegates, admin permits)

It is intended to be comprehensive enough that another agent can implement a full SDK for both Web3 and Web2 flows.

---

> ### CHANGES vs. previous `blackbox-info-for-sdk.md`
>
> **None of the changes below are breaking for the current CIFER SDK.** They were evaluated against the SDK source and confirmed safe:
>
> 1. **`POST /decrypt-payload` — server default `inputFormat` changed from `"base64"` to `"hex"`.**
>    ✅ **Not breaking.** The SDK already defaults to `'hex'` and explicitly sends `inputFormat` in every request.
>
> 2. **`POST /encrypt-payload` — server default `outputFormat` changed from `"base64"` to `"hex"`.**
>    ✅ **Not breaking.** The SDK already defaults to `'hex'` and explicitly sends `outputFormat` in every request.
>
> 3. **`GET /healthz` — response `configurations` shape simplified.**
>    `configurations` now only returns `{ chains, ipfsGatewayUrl }`. The following fields have been **removed**: `port`, `enclaveUrl`, `reconcileChunkSize`, `confirmations`, `ipfsApiUrl`, `ipfsApiKey`.
>    ✅ **Not breaking.** The SDK never used any of the removed fields — `HealthzResponse` only reads `chains` and `ipfsGatewayUrl`.
>
> 4. **Rate/limit enforcement added to all encrypt/decrypt endpoints.**
>    All encrypt and decrypt operations (payload and file) may now return **`429`** with `{ error, detail, limitType }` when the user's plan limits are exceeded.
>    ✅ **Not breaking.** The SDK already handles all non-OK responses gracefully via `parseBlackboxErrorResponse`, which throws a `BlackboxError` with the server's error message and HTTP status code. Apps won't crash; the `detail` and `limitType` fields are just not surfaced yet (enhancement opportunity).
>
> 5. **Web2 mode (`chainId=-1`) now supported on all existing Web3 endpoints.**
>    The `/encrypt-payload`, `/decrypt-payload`, `/encrypt-file`, `/decrypt-file`, `/decrypt-existing-file`, `/jobs/*` endpoints now accept `chainId=-1` in the signed `data` string. When `chainId=-1`, the 4th field is a **timestamp** (unix milliseconds) instead of a block number.
>    ✅ **Not breaking.** This is purely additive. Existing Web3 flows (positive `chainId` values) continue to work unchanged.
>
> 6. **`POST /jobs/dataConsumption` — response shape changed.**
>    The `wallet` field has been **removed** and replaced with `user_id`, `user_type`, `plan_id`, `cycle_type`, `period_start`, `period_end`. The `encryption`/`decryption` objects now also include `requestLimit` and `rateLimit`.
>    ⚠️ **Breaking.** The SDK's `DataConsumption` type and `dataConsumption()` function read `result.wallet`, which no longer exists. The SDK has been updated to use `user_id` instead.

---

## Base URL

The server mounts API routes at `/` and Web2 routes at `/web2`:

- API example: `http://localhost:3001/healthz`
- Web2 example: `http://localhost:3001/web2/auth/register`

---

## Endpoint: `GET /healthz`

Health + runtime configuration discovery endpoint. **No signature required.**

### Request

`GET /healthz`

### Response (200)

```json
{
  "status": "ok",
  "serverTime": 1751462400000,
  "enclaveWalletAddress": "0x...",
  "configurations": {
    "chains": [
      {
        "chainId": 752025,
        "name": "Ternoa",
        "rpcUrl": "https://...",
        "wsRpcUrl": "wss://...",
        "secretsControllerAddress": "0x...",
        "clusterRegistryAddress": "0x...",
        "blockTimeMs": 6000,
        "reconciliationStartBlock": 0,
        "reconcileAfterBlocks": 50
      }
    ],
    "ipfsGatewayUrl": "https://.../ipfs/"
  },
  "clusterMap": { "..." : "..." },
  "supportedChains": [752025, 11155111],
  "chainStatus": {
    "752025": {
      "lastReconciledBlock": 0,
      "lastKnownBlockNumber": 0,
      "lastSubscriptionUpdateAgoMS": 1234,
      "isWsLive": true
    }
  }
}
```

> **BREAKING**: `configurations` no longer includes `port`, `enclaveUrl`, `reconcileChunkSize`, `confirmations`, `ipfsApiUrl`, or `ipfsApiKey`. Only `chains` and `ipfsGatewayUrl` are returned.
>
> **NEW (additive, not breaking)**: `serverTime` — Unix epoch ms, the blackbox server's own clock at request time. Added so clients can detect a misconfigured/manipulated device clock (e.g. before trusting a device-side time-based check, such as a time-lock countdown) by comparing `Date.now()` against `serverTime`. The SDK surfaces this as `DiscoveryResult.serverTime` (optional, since older blackbox deployments won't send it).

Notes for SDK authors:

- `supportedChains` is the authoritative list for which `chainId` values this blackbox will accept for Web3 mode.
- `configurations.chains` contains per-chain connection/contract details.
- `enclaveWalletAddress` is the on-chain identity the blackbox uses when interacting with contracts/enclaves.
- Web2 mode uses `chainId = -1` and does **not** appear in `supportedChains`.
- `serverTime` is generated fresh on every request (not cached server-side) — safe to treat as "now" on the blackbox, modulo request latency.

---

## Multichain basics

### Supported chains (hardcoded allowlist)

Currently present in code (`SUPPORTED_CHAINS`):

- **Ternoa mainnet**: `chainId = 752025`
- **Ethereum Sepolia**: `chainId = 11155111`

If a request contains a `chainId` that the server hasn't enabled (or isn't supported), you'll get:

- `400 { "error": "Chain <chainId> is not supported" }`

### Web2 mode: `chainId = -1`

Web2 mode uses a special sentinel value of `chainId = -1`. This value:

- Is **not** in `supportedChains` (it's a virtual chain)
- Uses **timestamps** instead of block numbers for freshness validation
- Uses **session-based EOA signatures** instead of wallet signatures
- Requires a registered principal + active session (see Web2 endpoints below)

All existing Web3 endpoints (`/encrypt-payload`, `/decrypt-payload`, `/encrypt-file`, `/decrypt-file`, `/decrypt-existing-file`, `/jobs/*`) now accept `chainId=-1` in the signed `data` string.

### Where `chainId` is provided

- All endpoints: `chainId` is embedded as the **first field** in the signed `data` string
- For Web3: `chainId` is a positive integer matching a supported chain
- For Web2: `chainId` is `-1`

---

## Signatures & replay protection (critical for SDK)

### Web3 signature scheme

When an endpoint requires auth, the server expects:

- `data`: a **string** containing underscore-delimited fields (format depends on endpoint)
- `signature`: an **EIP-191 personal_sign** signature of the **exact `data` string**

Verification is done with `ethers.verifyMessage(data, signature)` (Ethers v6 semantics).

SDK implication:

- Use `wallet.signMessage(data)` (ethers) or `signMessage({ message: data })` (wagmi/viem).
- **Do not** JSON-stringify, hash, or ABI-encode `data`. Sign the raw string.

### Web3 block freshness window (anti-replay)

Most signed endpoints include `blockNumber` inside `data`. The server checks it against the chain's current block:

- Rejects if `blockNumber` is **too far in the future** (more than `currentBlock + 5`)
- Rejects if `blockNumber` is **too old**: window is roughly **10 minutes**, computed as:

\[
\text{maxBlockDiff} = \left\lceil \frac{10\ \text{minutes}}{\text{chain.blockTimeMs}} \right\rceil
\]

SDK implication:

- Fetch a **fresh** block number from the same chain as `chainId` right before signing.
- If you get "too old", re-fetch block number and re-sign.

### Web2 timestamp freshness window (anti-replay)

When `chainId=-1`, the 4th field in `data` is a **Unix millisecond timestamp** instead of a block number. The server validates:

- `|Date.now() - timestamp| <= 10 minutes (600,000 ms)`

SDK implication:

- Use `Date.now()` right before signing.
- If you get a timestamp nonce error, re-generate the timestamp and re-sign.

### Address casing

The server compares:

- `recoveredSigner` (lowercased) vs `signer` from `data` (lowercased)

So checksum casing is fine, but `signer` must be the same address.

### Underscore-delimited formats (important)

All signed payloads are parsed via `data.split('_')`.

SDK implication:

- Ensure none of the embedded fields contain `_`.
- Wallet addresses and job IDs are safe (no underscores).
- For `/decrypt-payload`, `encryptedMessage` is embedded inside `data` as the last field; base64/hex typically do not include `_`.
- For `/encrypt-payload`, `plainText` is embedded inside `data` as the last field; the server treats **everything after the 4th `_`** as plaintext, so plaintext **may include** underscores and special characters.

---

## Web3 Endpoints

### Endpoint: `POST /encrypt-payload`

Encrypt a short string using a secret's **public key** (fetched via chain state -> IPFS). **Signature required.**

#### Request

`Content-Type: application/json`

Body:

- `data` (string, **required**) with format:
  - `chainId_secretId_signer_blockNumber_plainText`
  - For Web2: `chainId_secretId_sessionAddress_timestamp_plainText` (chainId = `-1`)
- `signature` (string, **required**) = signature of `data`
- `outputFormat` (`"base64"` | `"hex"`, optional; **default = `"hex"`**)

> **BREAKING**: Default `outputFormat` changed from `"base64"` to `"hex"`.

#### Response (200)

```json
{
  "success": true,
  "chainId": 752025,
  "secretId": 123,
  "outputFormat": "hex",
  "cifer": "<hex-or-base64>",
  "encryptedMessage": "<hex-or-base64>"
}
```

Notes:

- `cifer` + `encryptedMessage` are required to decrypt.
- If `outputFormat="hex"`, values are hex strings.

#### Common errors

- `400`: invalid `data` format, unsupported `chainId`, invalid/old block number or timestamp, invalid `outputFormat`
- `403`: invalid signature; signer mismatch; secret is syncing OR `secretType !== 1`
- `404`: secret has no `publicKeyCid`; user not found
- `429`: user limit exceeded (`{ error, detail, limitType }`)
- `503`: IPFS fetch failed, or service not initialized

---

### Endpoint: `POST /decrypt-payload`

Decrypt a short string using a secret's **private key** reconstructed from enclave shards. **Signature required** (must be secret owner or delegate).

#### Request

`Content-Type: application/json`

Body:

- `cifer` (string, **required**; base64 or hex)
- `data` (string, **required**) with format:
  - `chainId_secretId_signer_blockNumber_encryptedMessage`
  - For Web2: `chainId_secretId_sessionAddress_timestamp_encryptedMessage` (chainId = `-1`)
- `signature` (string, **required**) = signature of `data`
- `inputFormat` (`"base64"` | `"hex"`, optional; **default = `"hex"`**)

> **BREAKING**: Default `inputFormat` changed from `"base64"` to `"hex"`.

Important: `encryptedMessage` is not a separate field; it is embedded in `data` as the 5th part. The `data` string must have exactly 5 underscore-separated parts.

#### Response (200)

```json
{
  "success": true,
  "decryptedMessage": "..."
}
```

#### Auth rules

The recovered signer must be:

- `secretState.owner` OR
- `secretState.delegate` (and delegate must not be zero address / null)

Also:

- `secretState.isSyncing` must be false
- `secretState.secretType` must equal `1`

#### Common errors

- `400`: invalid `data` format, unsupported `chainId`, invalid/old block number or timestamp, invalid inputFormat, missing fields
- `403`: invalid signature; signer mismatch; not owner/delegate; secret syncing; wrong secret type
- `404`: user not found
- `429`: user limit exceeded (`{ error, detail, limitType }`)
- `503`: cannot find a suitable PUBLIC cluster / insufficient shards / service not initialized
- `500`: decryption failed

---

### Endpoint: `POST /encrypt-file`

Upload a file for asynchronous encryption. Returns a `jobId` immediately; result is retrieved later via `/jobs/*`.

**Signature is required.**

#### Request

`Content-Type: multipart/form-data`

Form fields:

- `file` (file, **required**) -- max **1GB**
- `secretId` (number|string, **required**)
- `data` (string, **required**) with format:
  - `chainId_secretId_signer_blockNumber`
  - For Web2: `chainId_secretId_sessionAddress_timestamp` (chainId = `-1`)
- `signature` (string, **required**) = signature of `data`

Constraints:

- `secretId` in the form body must match the `secretId` in `data`, else `400`.

#### Response (200)

```json
{
  "success": true,
  "jobId": "....",
  "message": "File encryption job started"
}
```

#### Result format

The encrypt job's downloadable artifact is a ZIP, served with:

- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="<originalName>.cifer"`

The ZIP contains at least:

- `metadata.json`
- `chunk_0.enc`, `chunk_1.enc`, ... (chunked encryption)

#### Common errors

- `400`: missing file; file too large; invalid signed data format; unsupported chain; signature mismatch
- `403`: invalid signature; signer mismatch; block/timestamp window invalid
- `404`: user not found
- `429`: user limit exceeded
- `503`: service not initialized / public key fetch issues inside async processing may surface as job failure

---

### Endpoint: `POST /decrypt-file`

Upload an encrypted `.cifer` (ZIP) file for asynchronous decryption. Returns a `jobId` immediately.

#### Request

`Content-Type: multipart/form-data`

Form fields:

- `file` (file, **required**) -- the encrypted ZIP produced by `/encrypt-file` download
- `data` (string, **required**) with format:
  - `chainId_secretId_signer_blockNumber`
  - For Web2: `chainId_secretId_sessionAddress_timestamp` (chainId = `-1`)
- `signature` (string, **required**) = signature of `data`

#### Response (200)

```json
{
  "success": true,
  "jobId": "....",
  "message": "File decryption job started"
}
```

#### Auth rules

Same as payload decrypt:

- signer must be secret owner or delegate
- block/timestamp window must be valid
- secret must not be syncing; `secretType` must be `1`

#### File validation rules (server parses ZIP before creating job)

The uploaded ZIP must contain:

- `metadata.json`
- `chunk_0.enc...chunk_(N-1).enc`

And `metadata.json.secretId` must match the `secretId` in `data`.

#### Decrypt job downloadable output

When completed, `/jobs/:jobId/download` returns raw bytes:

- `Content-Type: application/octet-stream`
- `Content-Disposition: attachment; filename="<original filename>"`

#### Common errors

- `400`: missing file; file too large; invalid signed data or ZIP format; secretId mismatch; chainId mismatch
- `403`: invalid signature; signer mismatch; not owner/delegate; secret syncing; wrong secret type
- `404`: user not found
- `429`: user limit exceeded
- `503`: service not initialized

---

### Endpoint: `POST /decrypt-existing-file`

Create a new decrypt job **from a previously completed encrypt job** (no file upload; uses server-side stored encrypt result).

#### Request

`Content-Type: application/json`

Body:

- `encryptJobId` (string, **required**) -- an existing encrypt job id
- `data` (string, **required**) format:
  - `chainId_secretId_signer_blockNumber`
  - For Web2: `chainId_secretId_sessionAddress_timestamp` (chainId = `-1`)
- `signature` (string, **required**) = signature of `data`

#### Response (200)

```json
{
  "success": true,
  "jobId": "....",
  "message": "File decryption job started"
}
```

#### Common errors

- `404`: encrypt job not found/expired, or encrypt result file missing; user not found
- `400`: encrypt job not completed; wrong job type; secretId mismatch vs encrypt job; invalid zip format on stored result; chainId mismatch
- `403`: signature invalid; not owner/delegate; block/timestamp window invalid; secret syncing; wrong secret type
- `429`: user limit exceeded

---

## Jobs API (polling + download + deletion)

### `GET /jobs/:jobId/status`

No signature required.

Response (200):

```json
{
  "success": true,
  "job": {
    "id": "....",
    "type": "encrypt",
    "status": "processing",
    "progress": 40,
    "secretId": 123,
    "chainId": 752025,
    "createdAt": 1700000000000,
    "completedAt": 1700000005000,
    "expiredAt": null,
    "error": null,
    "resultFileName": "myfile.pdf.cifer",
    "ttl": 172800000,
    "originalSize": 1048576
  }
}
```

`status` can be: `pending` | `processing` | `completed` | `failed` | `expired`.

### `POST /jobs/:jobId/download`

Download the job output as binary.

- Encrypt job: **no auth**
- Decrypt job: **auth required**

#### Decrypt job auth payload

Body (JSON):

- `data` format:
  - `chainId_secretId_signer_blockNumber_jobId_download`
  - For Web2: `chainId_secretId_sessionAddress_timestamp_jobId_download` (chainId = `-1`)
- `signature` = signature of `data`

Constraints:

- `jobId` in `data` must match URL `:jobId`
- last segment must literally be `download`
- `secretId` must match the job's `secretId`
- signer must be owner/delegate of that secret on the given `chainId`

Response:

- `200` with binary body + headers:
  - `Content-Type`: `application/zip` (encrypt) or `application/octet-stream` (decrypt)
  - `Content-Disposition`: includes filename

### `POST /jobs/:jobId/delete`

Expire a job early (marks it for cleanup). **Auth required**.

Body:

- `data` format:
  - `chainId_secretId_signer_blockNumber_jobId_delete`
  - For Web2: `chainId_secretId_sessionAddress_timestamp_jobId_delete` (chainId = `-1`)
- `signature` = signature of `data`

Constraints:

- last segment must literally be `delete`
- signer must be owner/delegate of the secret on that chain

Response (200):

```json
{ "success": true, "message": "Job has been marked for deletion. Files will be cleaned up shortly." }
```

### `POST /jobs` (list jobs for a wallet)

Auth required.

Body:

- `data` format:
  - `chainId_secretId_signer_blockNumber`
  - For Web2: `chainId_secretId_sessionAddress_timestamp` (chainId = `-1`)
  - note: `secretId` is **ignored**, but must still be present as the 2nd segment
- `signature` = signature of `data`

Query:

- `includeExpired=true|false` (optional; default false)

Response (200):

```json
{
  "success": true,
  "jobs": [
    {
      "id": "...",
      "type": "encrypt",
      "status": "completed",
      "progress": 100,
      "secretId": 123,
      "chainId": 752025,
      "signerWallet": "0x...",
      "secretOwnerWallet": "0x...",
      "signerEmail": "sender@example.com",
      "recipientEmail": "recipient@example.com",
      "isSigner": true,
      "isRecipient": false,
      "createdAt": 1700000000000,
      "completedAt": 1700000005000,
      "expiredAt": null,
      "error": null,
      "resultFileName": "myfile.pdf.cifer",
      "ttl": 172800000,
      "originalSize": 1048576
    }
  ],
  "count": 12,
  "includeExpired": false
}
```

### `POST /jobs/dataConsumption`

Auth required.

Body:

- `data` format:
  - `chainId_secretId_signer_blockNumber` (secretId ignored)
  - For Web2: `chainId_secretId_sessionAddress_timestamp` (chainId = `-1`)
- `signature`

Response (200):

```json
{
  "success": true,
  "user_id": "...",
  "user_type": "web3",
  "plan_id": "free",
  "cycle_type": "monthly",
  "period_start": "2025-01-01T00:00:00.000Z",
  "period_end": "2025-02-01T00:00:00.000Z",
  "encryption": {
    "limit": 1073741824,
    "used": 524288,
    "remaining": 1073217536,
    "count": 5,
    "requestLimit": 1000,
    "rateLimit": 10,
    "limitGB": 1.0,
    "usedGB": 0.0005,
    "remainingGB": 0.9995
  },
  "decryption": {
    "limit": 1073741824,
    "used": 0,
    "remaining": 1073741824,
    "count": 0,
    "requestLimit": 1000,
    "rateLimit": 10,
    "limitGB": 1.0,
    "usedGB": 0.0,
    "remainingGB": 1.0
  }
}
```

---

## Web2 Endpoints

All Web2 endpoints are mounted under the `/web2` prefix.

### Concept overview

Web2 mode (`chainId = -1`) enables users who do not have an on-chain wallet to use CIFER encryption/decryption. Instead of blockchain-based identity, Web2 mode uses:

1. **Email + password registration** with OTP email verification (Phase 1)
2. **Ed25519 public key registration** propagated to cluster nodes (Phase 2)
3. **Session-based auth** where a client-generated EOA address signs `data` strings, and the server resolves the session to a `principalId`
4. **Principal model** -- each Web2 user is identified by a `principalId` (UUID) rather than a wallet address

#### Registration flow (two-phase)

```
Phase 1 (Blackbox-local):
  1. POST /web2/auth/register        { email, password }      -> { principalId }
  2. POST /web2/auth/verify-email    { email, otp }           -> { principalId, emailVerified }

Phase 2 (Propagate to cluster nodes):
  3. POST /web2/auth/register-key    { principalId, password, publicKey, signature }
                                     -> { principalId, emailHex, nodeRegistrationStatus }
```

#### Session flow

Once registered, the client creates a session to authenticate subsequent requests:

```
  1. Generate an ephemeral EOA keypair (sessionAddress + sessionPrivateKey)
  2. Sign "cifer_session:<principalId>:<timestamp>:<sessionAddress>" with Ed25519 private key
  3. POST /web2/session  { principalId, timestamp, signature, sessionAddress }
     -> { sessionToken, sessionAddress, quorumProof, expiresAt }
```

Subsequent requests use the session EOA to sign `data` strings (same format as Web3, but `chainId=-1` and timestamp instead of blockNumber):

```
  data = "-1_<secretId>_<sessionAddress>_<timestamp>"
  signature = sessionPrivateKey.signMessage(data)   // EIP-191
```

The server resolves the session from its cache to get the `principalId`.

#### Using Web2 with existing Web3 endpoints

Once you have a session, you can call the same `/encrypt-payload`, `/decrypt-payload`, `/encrypt-file`, `/decrypt-file`, `/decrypt-existing-file`, and `/jobs/*` endpoints. Just use `chainId=-1` and the session address as the signer, with a timestamp instead of a block number.

---

### `POST /web2/auth/register`

Register a new principal with email + password. Sends an OTP to the email. **No auth required.**

#### Request

`Content-Type: application/json`

```json
{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

- `email` (string, **required**) -- must contain `@`
- `password` (string, **required**) -- minimum 8 characters

#### Response (201 for new, 200 for re-registration of unverified)

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "OTP sent to email"
}
```

#### Behavior

- If the email is **new**: creates a principal, sends OTP, returns `201`.
- If the email exists but is **not verified**: updates the password, resends OTP, returns `200`.
- If the email exists and is **already verified**: returns `409 { error: "A principal with this email already exists" }`.

#### Common errors

- `400`: invalid email format; password too short
- `409`: email already registered and verified

---

### `POST /web2/auth/verify-email`

Verify the email OTP sent during registration. **No auth required.**

#### Request

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Response (200)

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "emailVerified": true
}
```

#### Common errors

- `400`: invalid email; email already verified
- `401`: invalid or expired OTP
- `404`: principal not found

---

### `POST /web2/auth/resend-otp`

Resend the email verification OTP. **No auth required.** Has a **60-second cooldown**.

#### Request

```json
{
  "email": "user@example.com"
}
```

#### Response (200)

```json
{
  "message": "If an account with this email exists and is not yet verified, a new OTP has been sent."
}
```

Note: The response is intentionally generic to avoid leaking whether the email exists.

#### Common errors

- `400`: invalid email; email already verified
- `429`: cooldown not expired (`{ error, retryAfterSeconds }`)

---

### `POST /web2/auth/forgot-password`

Send a password-reset OTP to a verified email. **No auth required.** Has a **60-second cooldown**.

#### Request

```json
{
  "email": "user@example.com"
}
```

#### Response (200)

```json
{
  "message": "If an account with this email exists, a password reset code has been sent."
}
```

Note: The response is intentionally generic to avoid leaking whether the email exists.

#### Common errors

- `400`: invalid email; email not verified
- `429`: cooldown not expired (`{ error, retryAfterSeconds }`)

---

### `POST /web2/auth/reset-password`

Reset a password using the OTP from forgot-password. **No auth required.**

#### Request

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "mynewpassword123"
}
```

- `newPassword` must be at least 8 characters.

#### Response (200)

```json
{
  "message": "Password has been reset successfully"
}
```

#### Common errors

- `400`: invalid email; email not verified; newPassword too short
- `401`: invalid or expired OTP
- `404`: account not found

---

### `POST /web2/auth/register-key`

Phase 2: Register an Ed25519 public key and propagate the principal to cluster nodes. Requires **password verification** and a valid **Ed25519 signature**.

#### Request

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "password": "mypassword123",
  "publicKey": "<32-byte-ed25519-public-key-hex>",
  "signature": "<ed25519-signature-hex>"
}
```

- `publicKey`: Ed25519 public key as a hex-encoded string (64 hex chars = 32 bytes)
- `signature`: Ed25519 signature of the string `"cifer_register:<publicKey>"` (hex-encoded)

#### Response (201)

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "emailHex": "75736572406578616d706c652e636f6d",
  "nodeRegistrationStatus": "complete",
  "failedNodes": [],
  "nodeErrors": []
}
```

`nodeRegistrationStatus` values:

- `"complete"` -- all 5 nodes registered
- `"partial"` -- quorum threshold reached (3+ of 5), can create sessions
- `"pending"` -- some nodes registered but below threshold, need retry
- `"failed"` -- all nodes failed (returns `409`)

If status is `"partial"` or `"pending"`, the response includes `failedNodes` (array of node URLs) and optionally `nodeErrors`.

#### Common errors

- `400`: missing fields
- `401`: invalid password; invalid Ed25519 signature
- `403`: email not verified
- `404`: principal not found
- `409`: all nodes failed to register

---

### `POST /web2/auth/retry-node-registration`

Retry propagation to failed nodes. **No auth required** (the original registration signature is stored server-side).

#### Request

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response (200)

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "nodeRegistrationStatus": "complete",
  "failedNodes": []
}
```

If already complete:

```json
{
  "principalId": "...",
  "nodeRegistrationStatus": "complete",
  "message": "All nodes already registered"
}
```

#### Common errors

- `400`: missing principalId; public key not registered; registration signature not found
- `404`: principal not found

---

### `GET /web2/auth/node-registration-status`

Check node registration status. **No auth required.** Read-only.

#### Request

`GET /web2/auth/node-registration-status?principalId=550e8400-e29b-41d4-a716-446655440000`

#### Response (200)

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "nodeRegistrationStatus": "complete",
  "successNodes": ["http://node1:3100", "http://node2:3100", ...],
  "failedNodes": []
}
```

#### Common errors

- `400`: missing principalId
- `404`: principal not found

---

### `POST /web2/session`

Create a session by proving Ed25519 key ownership. Returns a session token and quorum proof.

#### Request

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "1700000000000",
  "signature": "<ed25519-signature-hex>",
  "sessionAddress": "0x1234...abcd",
  "ttl": 900000
}
```

- `timestamp`: current time as a string of unix milliseconds
- `signature`: Ed25519 signature of `"cifer_session:<principalId>:<timestamp>:<sessionAddress>"` (hex-encoded). If `ttl` is provided, the canonical message is `"cifer_session:<principalId>:<timestamp>:<sessionAddress>:<ttl>"`.
- `sessionAddress`: a client-generated Ethereum EOA address. The client keeps the private key to sign subsequent requests.
- `ttl` (optional, integer): session time-to-live in milliseconds. Min = `60000` (1 minute), Max = `2592000000` (30 days). Defaults to 15 minutes if omitted.

#### Response (201)

```json
{
  "sessionToken": "...",
  "sessionAddress": "0x1234...abcd",
  "quorumProof": [
    { "nodeAddress": "0x...", "signature": "0x..." },
    { "nodeAddress": "0x...", "signature": "0x..." },
    { "nodeAddress": "0x...", "signature": "0x..." }
  ],
  "expiresAt": "2025-01-15T10:30:00.000Z"
}
```

Notes:

- `sessionToken` and `quorumProof` are needed server-side for shard collection; the SDK does **not** need to include them in subsequent requests. The server resolves them from its internal cache based on the session address.
- The `sessionAddress` private key is used to sign `data` strings in subsequent requests (EIP-191).

#### Common errors

- `400`: missing fields; invalid timestamp format; invalid sessionAddress; invalid ttl
- `403`: node registration not sufficient (status is not `complete` or `partial`); quorum error
- `404`: principal not found
- `500`: session creation failed

---

### `GET /web2/principal/byEmail`

Look up a principal by hex-encoded email. **No auth required.**

#### Request

`GET /web2/principal/byEmail?emailHex=75736572406578616d706c652e636f6d`

- `emailHex`: the email address encoded as a hex string (lowercase, trimmed)

#### Response (200)

```json
{
  "principalId": "550e8400-e29b-41d4-a716-446655440000",
  "emailHex": "75736572406578616d706c652e636f6d"
}
```

#### Common errors

- `400`: missing emailHex
- `404`: no principal found for this email

---

### `POST /web2/secret`

Create a new secret (keygen, shard to all nodes, markSynced). **Session auth required.**

#### Request

```json
{
  "data": "-1_0_<sessionAddress>_<timestamp>",
  "signature": "<eip191-signature-of-data>"
}
```

- `secretId` in data is `0` (placeholder for creation)
- The session EOA private key signs the `data` string

#### Response (201)

```json
{
  "success": true,
  "secretId": 42,
  "clusterId": 1,
  "publicKeyCid": "QmXyz...",
  "status": "complete"
}
```

`status` values:

- `"complete"` -- secret fully created and synced
- `"propagating"` -- secret created but still propagating to some nodes (background retry in progress)

#### Common errors

- `400`: invalid data format; chainId not -1; invalid timestamp
- `403`: invalid signature; no active session
- `503`: service not initialized; no available cluster

---

### `POST /web2/secrets`

List all secrets owned by or delegated to the session's principal. **Session auth required.**

#### Request

```json
{
  "data": "-1_<principalId>_<sessionAddress>_<timestamp>",
  "signature": "<eip191-signature-of-data>"
}
```

Note: The 2nd field is the `principalId` (not secretId). It must match the session's principal.

#### Response (200)

```json
{
  "success": true,
  "secrets": [
    {
      "secretId": 42,
      "ownerPrincipalId": "550e8400-...",
      "delegatePrincipalId": null,
      "isSyncing": 0,
      "clusterId": 1,
      "secretType": 1,
      "publicKeyCid": "QmXyz...",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:05.000Z"
    }
  ]
}
```

#### Common errors

- `400`: missing principalId in data; invalid format
- `403`: session principalId does not match principalId in data; invalid signature; no active session
- `503`: failed to list secrets from any node

---

### `POST /web2/setDelegate`

Set or remove a delegate for a secret. **Session auth required.**

#### Request

```json
{
  "data": "-1_<secretId>_<sessionAddress>_<timestamp>_<delegatePrincipalId>",
  "signature": "<eip191-signature-of-data>"
}
```

- `delegatePrincipalId`: the UUID of the delegate principal, or **empty string `""`** to remove the delegate
- The `data` string has 5 underscore-separated parts

#### Response (200)

```json
{
  "success": true,
  "secretId": 42
}
```

#### Common errors

- `400`: invalid secretId in data; invalid data format
- `403`: only the secret owner can set a delegate; owner cannot be the delegate; invalid signature; no active session
- `404`: secret not found
- `503`: failed to set delegate on any node

---

### `POST /web2/permit`

Request an admin action (rotate, transfer, or delegate). The node sends a confirmation email.

Auth depends on the action:

- **`rotate`**: email + password (user may have lost their Ed25519 key)
- **`transfer` / `delegate`**: session-based auth (data + signature)

#### Request (rotate)

```json
{
  "action": "rotate",
  "email": "user@example.com",
  "password": "mypassword123",
  "payload": "{\"newPublicKey\": \"<ed25519-hex>\"}"
}
```

#### Request (transfer / delegate)

```json
{
  "action": "transfer",
  "data": "-1_<secretId>_<sessionAddress>_<timestamp>",
  "signature": "<eip191-signature-of-data>",
  "payload": "{\"newOwnerPrincipalId\": \"<uuid>\"}"
}
```

- `payload`: JSON string with action-specific params:
  - rotate: `{ "newPublicKey": "<ed25519-hex>" }`
  - transfer: `{ "newOwnerPrincipalId": "<uuid>" }`
  - delegate: `{ "delegatePrincipalId": "<uuid>" }`

#### Response (201)

```json
{
  "success": true,
  "permitId": "...",
  "action": "rotate",
  "clusterId": 0,
  "expiresAt": "2025-01-15T10:30:00.000Z",
  "message": "A confirmation email has been sent to confirm key rotation."
}
```

#### Common errors

- `400`: missing fields; invalid action; invalid payload JSON; missing newPublicKey for rotate
- `403`: invalid password; email not verified; not secret owner; invalid signature
- `404`: principal not found; secret not found
- `503`: slot 0 node not available; failed to create permit

---

### `GET /web2/confirmPermit`

Confirm an admin permit by clicking the email link. The blackbox broadcasts the consume action to all cluster nodes.

#### Request (query params from email link)

`GET /web2/confirmPermit?permitId=...&secretId=0&token=...&clusterId=0&signatures=<base64-encoded-json>`

- `permitId` (string, **required**)
- `secretId` (number, **required**)
- `token` (string, **required**) -- the confirmation token
- `clusterId` (number, **required**)
- `signatures` (string, **required**) -- base64-encoded JSON array of node signatures (URL-encoded)

#### Response (200 -- success)

```json
{
  "success": true,
  "permitId": "...",
  "status": "consumed",
  "action": "rotate",
  "result": { ... }
}
```

#### Response (200 -- partial/pending)

```json
{
  "success": false,
  "permitId": "...",
  "status": "pending",
  "message": "Permit action is being propagated to unreachable nodes.",
  "successCount": 2,
  "threshold": 3,
  "nodeErrors": [{ "node": "http://...", "error": "..." }]
}
```

#### Common errors

- `400`: missing params; invalid signatures parameter; insufficient signatures (need at least 3)

---

### `GET /web2/secret-failures`

List all unresolved secret creation failures. **No auth required.** (Monitoring/admin endpoint.)

#### Response (200)

```json
{
  "success": true,
  "failures": [
    {
      "id": 1,
      "secretId": 42,
      "clusterId": 1,
      "ownerPrincipalId": "...",
      "stage": "shard",
      "failedNodeAddresses": ["0x..."],
      "secretType": 1,
      "publicKeyCid": "QmXyz...",
      "retryCount": 2,
      "nextRetryAt": 1700000060000,
      "createdAt": 1700000000000,
      "lastError": "Node unreachable"
    }
  ]
}
```

---

### `POST /web2/secret-failures/:secretId/retry`

Manually trigger a retry for a specific failed secret creation. **No auth required.** (Monitoring/admin endpoint.)

#### Request

`POST /web2/secret-failures/42/retry`

No body required.

#### Response (200)

```json
{
  "success": true,
  "message": "Retry scheduled immediately for secretId 42",
  "stage": "shard",
  "failedNodeAddresses": ["0x..."],
  "retryCount": 2
}
```

#### Common errors

- `400`: invalid secretId
- `404`: no unresolved retry found for this secretId

---

## User Endpoints

These endpoints are mounted under `/user` and are primarily for Web3 user management.

### `POST /user/create`

Create a new user with automatic secret assignment. For invited users (email exists with pending secretId), this completes enrollment.

#### Request

`Content-Type: application/json`

- `data` (string, **required**) format: `emailHex_wallet_blockNumber`
- `signature` (string, **required**) = EIP-191 signature of `data`
- `secretId` (number, optional) -- if provided, manual registration with this secretId (wallet must own it on-chain)

#### Response (200)

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "wallet": "0x...",
    "secretId": 42,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "encryptionLimit": 1073741824,
    "decryptLimit": 1073741824
  }
}
```

### `POST /user/invite`

Invite a user by email for future encryption. Assigns a secretId before the user enrolls.

#### Request

- `data` (string, **required**) format: `emailHex_senderWallet_blockNumber`
- `signature` (string, **required**) = EIP-191 signature of `data`

#### Response (200)

```json
{
  "success": true,
  "user": {
    "id": 2,
    "email": "invited@example.com",
    "wallet": null,
    "secretId": 43,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "encryptionLimit": 1073741824,
    "decryptLimit": 1073741824,
    "isFullyEnrolled": false,
    "invitedByWallet": "0x...",
    "invitedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### `GET /user/getByEmail`

Get user by email address. **No auth required.**

`GET /user/getByEmail?email=user@example.com`

#### Response (200)

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "wallet": "0x...",
    "secretId": 42,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "encryptionLimit": 1073741824,
    "decryptLimit": 1073741824,
    "isFullyEnrolled": true,
    "invitedByWallet": null,
    "invitedAt": null
  }
}
```

---

## SDK implementation hints (recommended)

### Build a single signing helper

For **Web3**:

```
signAuth(chainId, secretId, signer, blockNumber, ...extra) -> { data, signature }
  data = [chainId, secretId, signer, blockNumber, ...extra].join('_')
  signature = wallet.signMessage(data)
```

For **Web2**:

```
signAuth(secretId, sessionAddress, timestamp, ...extra) -> { data, signature }
  data = [-1, secretId, sessionAddress, timestamp, ...extra].join('_')
  signature = sessionWallet.signMessage(data)
```

### Web2 registration helper

```
async register(email, password) {
  1. POST /web2/auth/register { email, password }
  2. (user receives OTP via email)
  3. POST /web2/auth/verify-email { email, otp }
  4. Generate Ed25519 keypair
  5. Sign "cifer_register:<publicKey>" with Ed25519 private key
  6. POST /web2/auth/register-key { principalId, password, publicKey, signature }
  7. If nodeRegistrationStatus !== 'complete':
     POST /web2/auth/retry-node-registration { principalId }
}
```

### Web2 session helper

```
async createSession(principalId, ed25519PrivateKey) {
  1. Generate ephemeral EOA keypair (sessionWallet)
  2. timestamp = Date.now().toString()
  3. message = "cifer_session:<principalId>:<timestamp>:<sessionAddress>"
  4. signature = ed25519Sign(message, ed25519PrivateKey) // hex
  5. POST /web2/session { principalId, timestamp, signature, sessionAddress }
  6. Store sessionWallet privately for signing subsequent requests
}
```

### Recommended polling

- Poll `GET /jobs/:jobId/status` every ~1-2 seconds until:
  - `status === "completed"` -> download
  - `status === "failed"` / `"expired"` -> surface error

### Handle 429 (rate limit)

All encrypt/decrypt endpoints may now return `429`. The response body contains:

```json
{
  "error": "Limit exceeded",
  "detail": "Monthly encryption data limit exceeded (1.00 GB used of 1.00 GB)",
  "limitType": "encryption_data_limit"
}
```

SDK should surface this to the caller and suggest upgrading their plan or waiting for the next billing cycle.
