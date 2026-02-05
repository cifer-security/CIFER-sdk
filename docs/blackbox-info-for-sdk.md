## CIFER Blackbox — SDK-focused API notes (selected endpoints)

This document describes **only** the endpoints referenced in `app/src/api/router.ts` lines **53–72**:

- `POST /decrypt-payload`
- `POST /encrypt-payload`
- `POST /encrypt-file`
- `POST /decrypt-file`
- `POST /decrypt-existing-file`
- `GET /jobs/:jobId/status`
- `POST /jobs/:jobId/download`
- `POST /jobs/:jobId/delete`
- `POST /jobs`
- `POST /jobs/dataConsumption`

The goal is to be explicit enough that another agent can implement an SDK (request/response shapes, signature rules, chainId behavior, and gotchas).

---

## Base URL

The server mounts routes at `/` (`app/index.ts`), so these are **root** paths:

- Example local: `http://localhost:3001`

---

## Endpoint: `GET /healthz`

Health + runtime configuration discovery endpoint. **No signature required.**

This is the best way for an SDK (or agent) to discover:

- Which chains are currently enabled on this blackbox instance (`supportedChains`)
- Per-chain config details (RPC URLs, WS URLs, `secretsControllerAddress`, etc.) via `configurations.chains`
- Per-chain ingestion/status telemetry (`chainStatus`)

### Request

`GET /healthz`

### Response (200)

```json
{
  "status": "ok",
  "enclaveWalletAddress": "0x...",
  "configurations": {
    "port": 3001,
    "enclaveUrl": "...",
    "reconcileChunkSize": 1000,
    "confirmations": 2,
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
    "ipfsGatewayUrl": "https://.../ipfs/",
    "ipfsApiUrl": "https://.../api/v0/add",
    "ipfsApiKey": "..."
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

Notes for SDK authors:

- `supportedChains` is the authoritative list for which `chainId` values this blackbox will accept.
- `configurations.chains` contains the per-chain connection/contract details an SDK may want to surface (not strictly required to call the blackbox APIs, but useful for diagnostics, UX, and “auto-select chain” behavior).
- `enclaveWalletAddress` is the on-chain identity the blackbox uses when interacting with contracts/enclaves (mostly useful for ops/diagnostics).

---

## Multichain basics

### Supported chains (hardcoded allowlist)

Chains are enabled at runtime, but they must be present in a hardcoded allowlist.

Currently present in code (`SUPPORTED_CHAINS`):

- **Ternoa mainnet**: `chainId = 752025`
- **Ethereum Sepolia**: `chainId = 11155111`

If a request contains a `chainId` that the server hasn’t enabled (or isn’t supported), you’ll get:

- `400 { "error": "Chain <chainId> is not supported" }`

If you don’t want to hardcode chain info in your SDK, call `GET /healthz` and use:

- `supportedChains` for allowed `chainId`s
- `configurations.chains` for per-chain `rpcUrl`, `wsRpcUrl`, `secretsControllerAddress`, and other metadata

### Where `chainId` is provided

- `POST /encrypt-payload`: `chainId` is part of the **signed `data` string** (see below).
- Everything else in this doc: `chainId` is part of the **signed `data` string**.

### `chainId` type rules (important)

- The server parses `chainId` via `parseInt(..., 10)`.
- SDKs should send `chainId` as a **number** or a **decimal string** (e.g. `"11155111"`), not hex strings.

---

## Signatures & replay protection (critical for SDK)

### Signature scheme

When an endpoint requires auth, the server expects:

- `data`: a **string** containing underscore-delimited fields (format depends on endpoint)
- `signature`: an **EIP-191 personal_sign** signature of the **exact `data` string**

Verification is done with `ethers.verifyMessage(data, signature)` (Ethers v6 semantics).

SDK implication:

- Use `wallet.signMessage(data)` (ethers) or `signMessage({ message: data })` (wagmi/viem).
- **Do not** JSON-stringify, hash, or ABI-encode `data`. Sign the raw string.

### Block freshness window (anti-replay)

Most signed endpoints include `blockNumber` inside `data`. The server checks it against the chain’s current block:

- Rejects if `blockNumber` is **too far in the future** (more than `currentBlock + 5`)
- Rejects if `blockNumber` is **too old**: window is roughly **10 minutes**, computed as:

\[
\text{maxBlockDiff} = \left\lceil \frac{10\ \text{minutes}}{\text{chain.blockTimeMs}} \right\rceil
\]

SDK implication:

- Fetch a **fresh** block number from the same chain as `chainId` right before signing.
- If you get “too old”, re-fetch block number and re-sign.

### Exact block-window error messages (useful for SDK UX)

When block freshness validation fails, the server responds `400` with one of these messages:

- `Block number <blockNumber> is in the future (current: <currentBlock>)`
- `Block number <blockNumber> is too old (current: <currentBlock>, max window: <maxWindow>)`

### Address casing

The server compares:

- `recoveredSigner` (lowercased) vs `signer` from `data` (lowercased)

So checksum casing is fine, but `signer` must be the same address.

### Underscore-delimited formats (important)

All signed payloads are parsed via `data.split('_')`.

SDK implication:

- For most endpoints, the server expects an **exact number of underscore-delimited parts** (e.g. 4, 5, or 6). In those cases, embedded fields should not contain `_`.
- Wallet addresses and job IDs are safe (no underscores).
- For `/decrypt-payload`, `encryptedMessage` is embedded as the 5th part; base64/hex typically do not include `_`.
- For `/encrypt-payload`, the server treats everything **after** the 4th underscore as plaintext (so plaintext **may** contain `_`).

### Hex/base64 handling rules (for endpoints that support it)

- When a request/response field is documented as `"hex"`, the server uses `0x`-prefixed hex for outputs.
- For `"hex"` inputs, the server accepts hex strings **with or without** a `0x` prefix.

---

## Endpoint: `POST /encrypt-payload`

Encrypt a short string using a secret’s **public key** (fetched via chain state → IPFS). **Signature required.**

### Request

`Content-Type: application/json`

Body:

- `data` (string, **required**) with format:
  - `chainId_secretId_signer_blockNumber_plainText`
- `signature` (string, **required**) = signature of `data`
- `outputFormat` (`"base64"` | `"hex"`, optional; default = `"hex"`)

Notes on `plainText` inside `data`:

- The server parses the signed payload using `data.split('_')` and reconstructs plaintext as:
  - `plainText = parts.slice(4).join('_')`
- Therefore, `plainText` **may contain `_`** and other characters; only the first 4 underscore-separated segments are structural.

### Response (200)

```json
{
  "success": true,
  "chainId": 752025,
  "secretId": 123,
  "outputFormat": "base64",
  "cifer": "<base64-or-hex>",
  "encryptedMessage": "<base64-or-hex>"
}
```

Notes:

- `cifer` + `encryptedMessage` are required to decrypt.
- If `outputFormat="hex"`, values are hex strings (server emits `0x...`).

### Common errors

- `400`: invalid `data` format, unsupported `chainId`, invalid/old block number, invalid `outputFormat`
- `403`: invalid signature; signer mismatch; secret is syncing OR `secretType !== 1`
- `404`: secret has no `publicKeyCid`
- `503`: IPFS fetch failed, or service not initialized

---

## Endpoint: `POST /decrypt-payload`

Decrypt a short string using a secret’s **private key** reconstructed from enclave shards. **Signature required** (must be secret owner or delegate on-chain).

### Request

`Content-Type: application/json`

Body:

- `cifer` (string, **required**; base64 or hex)
- `data` (string, **required**) with format:

  - `chainId_secretId_signer_blockNumber_encryptedMessage`

- `signature` (string, **required**) = signature of `data`
- `inputFormat` (`"base64"` | `"hex"`, optional; default = `"hex"`)

Important: `encryptedMessage` is not a separate field; it is embedded in `data` as the 5th part.

### Response (200)

```json
{
  "success": true,
  "decryptedMessage": "..."
}
```

### Auth rules

The recovered signer must be:

- `secretState.owner` OR
- `secretState.delegate` (and delegate must not be zero address)

Also:

- `secretState.isSyncing` must be false
- `secretState.secretType` must equal `1`

### Common errors

- `400`: invalid `data` format, unsupported `chainId`, invalid/old block number, invalid inputFormat, missing fields
- `403`: invalid signature; signer mismatch; not owner/delegate; secret syncing; wrong secret type
- `503`: cannot find a suitable PUBLIC cluster / insufficient shards / service not initialized
- `500`: decryption failed

---

## Endpoint: `POST /encrypt-file`

Upload a file for asynchronous encryption. Returns a `jobId` immediately; result is retrieved later via `/jobs/*`.

**Signature is required**. (Note: there are older comments in the router suggesting otherwise; the handler enforces signature.)

### Request

`Content-Type: multipart/form-data`

Form fields:

- `file` (file, **required**) — max **1GB**
- `secretId` (number|string, **required**)
- `data` (string, **required**) with format:
  - `chainId_secretId_signer_blockNumber`
- `signature` (string, **required**) = signature of `data`

Constraints:

- `secretId` in the form body must match the `secretId` in `data`, else `400`.

### Response (200)

```json
{
  "success": true,
  "jobId": "....",
  "message": "File encryption job started"
}
```

### Result format

The encrypt job’s downloadable artifact is a ZIP, served with:

- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="<originalName>.cifer"`

The ZIP contains at least:

- `metadata.json`
- `chunk_0.enc`, `chunk_1.enc`, ... (chunked encryption)

### Notes: job TTLs (helps SDK UX)

Jobs have a TTL (time-to-live) after completion; expired jobs can no longer be downloaded.

- Encrypt job default TTL: **2 days**
- Decrypt job default TTL: **3 hours**
- Failed job TTL: **5 minutes**

### Common errors

- `400`: missing file; file too large; invalid signed data format; unsupported chain; signature mismatch
- `403`: invalid signature; signer mismatch; block window invalid
- `503`: service not initialized / public key fetch issues inside async processing may surface as job failure

---

## Endpoint: `POST /decrypt-file`

Upload an encrypted `.cifer` (ZIP) file for asynchronous decryption. Returns a `jobId` immediately.

### Request

`Content-Type: multipart/form-data`

Form fields:

- `file` (file, **required**) — the encrypted ZIP produced by `/encrypt-file` download
- `data` (string, **required**) with format:
  - `chainId_secretId_signer_blockNumber`
- `signature` (string, **required**) = signature of `data`

### Response (200)

```json
{
  "success": true,
  "jobId": "....",
  "message": "File decryption job started"
}
```

### Auth rules

Same as payload decrypt:

- signer must be secret owner or delegate on `chainId`
- block window must be valid on `chainId`
- secret must not be syncing; `secretType` must be `1`

### File validation rules (server parses ZIP before creating job)

The uploaded ZIP must contain:

- `metadata.json`
- `chunk_0.enc...chunk_(N-1).enc`

And `metadata.json.secretId` must match the `secretId` in `data`.

#### `metadata.json` required fields (as validated by the server)

The decrypt endpoint validates (at minimum):

- `cifers` (array, non-empty) — array of CIFER strings (one per chunk)
- `secretId` (number)
- `originalHash` (string)

It also uses (optional but commonly present):

- `chunkCount` (number) — if omitted, server uses `cifers.length`
- `originalName` (string) — used for the decrypted download filename

Chunk validation behavior:

- The server expects files named `chunk_0.enc`, `chunk_1.enc`, ..., `chunk_(chunkCount-1).enc`.
- If any chunk is missing, it returns `400` with error like `Invalid ZIP format: missing chunk_<i>.enc`.

### Decrypt job downloadable output

When completed, `/jobs/:jobId/download` returns raw bytes:

- `Content-Type: application/octet-stream`
- `Content-Disposition: attachment; filename="<original filename>"`

---

## Endpoint: `POST /decrypt-existing-file`

Create a new decrypt job **from a previously completed encrypt job** (no file upload; uses server-side stored encrypt result).

### Request

`Content-Type: application/json`

Body:

- `encryptJobId` (string, **required**) — an existing encrypt job id
- `data` (string, **required**) format:
  - `chainId_secretId_signer_blockNumber`
- `signature` (string, **required**) = signature of `data`

### Response (200)

```json
{
  "success": true,
  "jobId": "....",
  "message": "File decryption job started"
}
```

### Common errors

- `404`: encrypt job not found/expired, or encrypt result file missing
- `400`: encrypt job not completed; wrong job type; secretId mismatch vs encrypt job; invalid zip format on stored result
- `403`: signature invalid; not owner/delegate; block window invalid

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

#### Decrypt download missing-auth behavior

If the job is a decrypt job and `data`/`signature` are missing, the server responds `401` with:

- `Authentication required: data is required (format: chainId_secretId_signer_blockNumber_jobId_download)` OR
- `Authentication required: signature is required`

#### Decrypt job auth payload

Body (JSON):

- `data` format:
  - `chainId_secretId_signer_blockNumber_jobId_download`
- `signature` = signature of `data`

Constraints:

- `jobId` in `data` must match URL `:jobId`
- last segment must literally be `download`
- `secretId` must match the job’s `secretId`
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
      "id": "....",
      "type": "encrypt",
      "status": "completed",
      "progress": 100,
      "secretId": 123,
      "chainId": 752025,
      "signerWallet": "0x...",
      "secretOwnerWallet": "0x...",
      "signerEmail": "alice@example.com",
      "recipientEmail": "bob@example.com",
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

Notes:

- `includeExpired` query accepts `true|false` and also `1|0` (server treats `true` or `1` as enabled).
- `signerEmail` / `recipientEmail` may be missing (undefined) depending on server-side user enrollment state.

### `POST /jobs/dataConsumption`

Auth required.

Body:

- `data` format:
  - `chainId_secretId_signer_blockNumber` (secretId ignored)
- `signature`

Response (200) returns per-user encryption/decryption limits & usage:

```json
{
  "success": true,
  "wallet": "0x...",
  "encryption": {
    "limit": 2147483648,
    "used": 123456,
    "remaining": 2147360192,
    "count": 3,
    "limitGB": 2,
    "usedGB": 0.0001,
    "remainingGB": 1.9999
  },
  "decryption": {
    "limit": 2147483648,
    "used": 654321,
    "remaining": 2146829327,
    "count": 2,
    "limitGB": 2,
    "usedGB": 0.0006,
    "remainingGB": 1.9994
  }
}
```

---

## SDK implementation hints (recommended)

### Build a single signing helper

Your SDK should generate these `data` strings and signatures centrally:

- `signAuth(data: string) -> { data, signature }`
- callers supply `chainId`, `secretId`, `signer`, `blockNumber`, plus endpoint-specific suffixes (e.g. `_jobId_download`)

### Recommended polling

- Poll `GET /jobs/:jobId/status` every ~1–2 seconds until:
  - `status === "completed"` → download
  - `status === "failed"` / `"expired"` → surface error

