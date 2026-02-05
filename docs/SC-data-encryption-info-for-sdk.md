# CIFER On-chain Encrypted Commitments — Info for SDK (ICiferEncrypted + CiferEncryptedBase)

This document describes the **on-chain “endpoints”** (Solidity ABI functions + events + errors) provided by the CIFER encrypted-commitment base layer:

- `src/ICiferEncrypted.sol` (the **SDK-relevant ABI surface**)
- `src/CiferEncryptedBase.sol` (the **behavior/semantics** implemented by child contracts)

## Important scope note

An SDK **will not call `CiferEncryptedBase` directly** (it’s an abstract base). The SDK will talk to a **child contract** that inherits `CiferEncryptedBase` and exposes public/external wrapper functions (e.g., `examples/CiferVaultOnChain.sol` shows one possible wrapper design).

This doc intentionally **does not assume** any *particular* child wrapper API (like `setSecretId`, `store`, etc.). It focuses on what is stable and common across the ecosystem: `ICiferEncrypted` reads and the CIFER events/errors emitted/enforced by the base.

---

## Mental model: what the chain stores vs what the chain emits

### Storage model (minimal)

`CiferEncryptedBase` stores only minimal metadata per `dataId`:

- `secretId` (uint256)
- `storedAtBlock` (uint64) — the block number of the latest store/update
- `ciferHash = keccak256(cifer)` (bytes32)
- `encryptedMessageHash = keccak256(encryptedMessage)` (bytes32)

It does **not** store the actual `cifer` or `encryptedMessage` bytes on-chain storage.

### Retrieval model (event-sourced)

The actual bytes (`cifer`, `encryptedMessage`) are emitted in events and must be retrieved from logs:

- `CIFERDataStored(...)` on first write
- `CIFERDataUpdated(...)` on subsequent writes
- `CIFERDataDeleted(dataId)` on deletion (metadata removed; old logs remain queryable)

An SDK must therefore support:

- **ABI calls** for metadata (cheap reads)
- **log queries** for cifer/encryptedMessage bytes (events)

---

## Stable ABI: `ICiferEncrypted` (what SDK can rely on)

### Constants (pure)

#### `CIFER_ENVELOPE_BYTES() -> uint256`

- **Purpose**: The required `cifer` size in bytes.
- **Expected value**: `1104` (ML-KEM-768 ciphertext 1088 + AES-GCM tag 16).
- **How to call**: `eth_call` (no signer needed).
- **SDK behavior**: cache this per chain/contract; validate `cifer` length client-side before sending transactions.

#### `MAX_PAYLOAD_BYTES() -> uint256`

- **Purpose**: Upper bound for the emitted `encryptedMessage` length.
- **Current value in base**: `16384` (16 KiB).
- **How to call**: `eth_call`.
- **SDK behavior**: validate `encryptedMessage` length client-side before sending transactions.

### Reads (view)

#### `getCIFERMetadata(bytes32 dataId) -> (uint256 secretId, uint64 storedAtBlock, bytes32 ciferHash, bytes32 encryptedMessageHash)`

- **Purpose**: Returns the currently stored commitment/metadata for `dataId`.
- **How to call**: `eth_call`.
- **Return semantics**:
  - If no data exists for `dataId`, all fields will be zero (because storage slot is unset).
  - `storedAtBlock` is the last block where the record was stored/updated (useful for narrowing log queries).
  - `ciferHash` and `encryptedMessageHash` let you verify that event bytes you fetched from logs match the committed data.

#### `ciferDataExists(bytes32 dataId) -> bool`

- **Purpose**: Convenience existence check.
- **How to call**: `eth_call`.
- **Equivalent logic**: `storedAtBlock != 0`.

---

## Events (log-based “endpoints”)

Events are the canonical source for `cifer` + `encryptedMessage` bytes.

### `CIFERDataStored`

Emitted when a `dataId` is created for the first time.

**Indexed topics**:
- `dataId` (indexed)
- `secretId` (indexed)

**Data (non-indexed)**:
- `cifer` (bytes, length must equal `CIFER_ENVELOPE_BYTES()`)
- `encryptedMessage` (bytes, length must be `<= MAX_PAYLOAD_BYTES()`)
- `ciferHash` (bytes32) = `keccak256(cifer)`
- `encryptedMessageHash` (bytes32) = `keccak256(encryptedMessage)`

### `CIFERDataUpdated`

Emitted when an existing `dataId` is overwritten (updated).

Same fields as `CIFERDataStored`, same indexing rules.

### `CIFERDataDeleted`

Emitted when a `dataId` is deleted.

**Indexed topics**:
- `dataId` (indexed)

---

## Errors (how transactions fail)

The base enforces invariants and reverts with custom errors (these bubble up through child wrappers that call the base):

- `EmptyPayload()`: `encryptedMessage.length == 0`
- `EmptyEnvelope()`: `cifer.length == 0`
- `BadEnvelopeSize(uint256 got, uint256 expected)`: `cifer.length != CIFER_ENVELOPE_BYTES()`
- `PayloadTooLarge(uint256 got, uint256 maxAllowed)`: `encryptedMessage.length > MAX_PAYLOAD_BYTES()`
- `InvalidDataId()`: `dataId == bytes32(0)` (after child computes it)
- `InvalidSecretId()`: `secretId == 0`
- `DataNotFound()`: deleting a missing record

**SDK tip**: decode revert data for these errors to produce user-friendly messages (e.g., “cifer must be exactly 1104 bytes”).

---

## What the child contract must (and usually does) provide

`CiferEncryptedBase` is abstract and requires the child to implement:

- `_computeDataId(address dataOwner, bytes32 key) -> bytes32`

This function defines the **namespace / isolation strategy** (e.g., per-user isolation, admin namespace, multi-tenant namespace).

### Implications for SDK design

The SDK cannot assume `dataId = keccak256(abi.encodePacked(user, key))` universally, because the child contract controls `_computeDataId`.

Recommended SDK approach:

- **Best case**: the child exposes a public helper like `computeDataId(user, key)` so the SDK can call it.
- **Otherwise**: the child contract’s spec must publish the `_computeDataId` rule so the SDK can reproduce it off-chain.

> `examples/CiferVaultOnChain.sol` uses per-user isolation (`keccak256(abi.encodePacked(user, key))`) and exposes `computeDataId(user, key)`, but this is **just one example**.

---

## End-to-end SDK workflows (generic)

### 1) Write encrypted data (store/update)

Because `_storeEncrypted(...)` is internal, the child will expose *some* transaction method(s) that ultimately provide:

- `key: bytes32` (a user-chosen identifier)
- `secretId: uint256` (must be non-zero)
- `encryptedMessage: bytes` (encrypted data bytes; from blackbox `encryptedMessage`)
- `cifer: bytes` (exactly 1104 bytes; from blackbox `cifer`)

**Client-side preflight checks (recommended)**:

- Validate `cifer.length == CIFER_ENVELOPE_BYTES()`
- Validate `0 < encryptedMessage.length <= MAX_PAYLOAD_BYTES()`
- Validate `secretId != 0` (where the child’s UX requires it)

**Expected result**:

- The tx emits either `CIFERDataStored` (first write) or `CIFERDataUpdated` (overwrite).
- The metadata becomes readable via `getCIFERMetadata(dataId)`.

### 2) Read “latest” encrypted bytes for a record

Given you can compute or obtain `dataId`:

1. Call `getCIFERMetadata(dataId)`:
   - If `storedAtBlock == 0`: no data exists.
2. Query logs at (or around) `storedAtBlock` filtered by:
   - `dataId` topic
   - event signatures `CIFERDataStored` and `CIFERDataUpdated`
3. From matching logs, pick the “latest write”:
   - If you query only `fromBlock = toBlock = storedAtBlock`, pick the log with the highest `logIndex` among matching events.
4. Verify integrity:
   - `keccak256(cifer) == ciferHash` and `keccak256(encryptedMessage) == encryptedMessageHash` from metadata/event.

### 3) Check existence

- Use `ciferDataExists(dataId)` (or `getCIFERMetadata(dataId).storedAtBlock != 0`).

### 4) Delete

The child will expose *some* transaction method that ultimately calls `_deleteEncrypted(dataOwner, key)` (or equivalent).

Expected result:

- Emits `CIFERDataDeleted(dataId)`
- Metadata is removed (`storedAtBlock` returns `0` afterward)
- Historical stored/updated logs remain available in the chain index.

---

## SDK notes on types & inputs

### `key: bytes32`

Child contracts typically accept a `bytes32` key. The SDK should support:

- Passing a raw `0x…` 32-byte value, OR
- Deriving `bytes32` from a string identifier (common patterns are chain-specific / app-specific, e.g. `keccak256(utf8Bytes(name))`)

Because key-derivation is application-specific, the SDK should expose a clear helper (and document the project’s chosen convention).

### `encryptedMessage` & `cifer` bytes

- `encryptedMessage` is arbitrary encrypted bytes (AES-encrypted data)
- `cifer` is fixed-size 1104 bytes (ML‑KEM ciphertext + AES‑GCM tag)

The SDK should treat these as opaque `bytes` and never attempt to “interpret” them on-chain; only validate size and hash.

---

## Minimal ABI fragment (for agent/SDK generation)

When generating an SDK, the minimum common ABI to include for all CIFER-encrypted child contracts is:

```json
[
  { "type": "function", "name": "CIFER_ENVELOPE_BYTES", "stateMutability": "pure", "inputs": [], "outputs": [{ "type": "uint256" }] },
  { "type": "function", "name": "MAX_PAYLOAD_BYTES", "stateMutability": "pure", "inputs": [], "outputs": [{ "type": "uint256" }] },
  { "type": "function", "name": "getCIFERMetadata", "stateMutability": "view", "inputs": [{ "name": "dataId", "type": "bytes32" }], "outputs": [
    { "name": "secretId", "type": "uint256" },
    { "name": "storedAtBlock", "type": "uint64" },
    { "name": "ciferHash", "type": "bytes32" },
    { "name": "encryptedMessageHash", "type": "bytes32" }
  ] },
  { "type": "function", "name": "ciferDataExists", "stateMutability": "view", "inputs": [{ "name": "dataId", "type": "bytes32" }], "outputs": [{ "type": "bool" }] },
  { "type": "event", "name": "CIFERDataStored", "inputs": [
    { "indexed": true, "name": "dataId", "type": "bytes32" },
    { "indexed": true, "name": "secretId", "type": "uint256" },
    { "indexed": false, "name": "cifer", "type": "bytes" },
    { "indexed": false, "name": "encryptedMessage", "type": "bytes" },
    { "indexed": false, "name": "ciferHash", "type": "bytes32" },
    { "indexed": false, "name": "encryptedMessageHash", "type": "bytes32" }
  ] },
  { "type": "event", "name": "CIFERDataUpdated", "inputs": [
    { "indexed": true, "name": "dataId", "type": "bytes32" },
    { "indexed": true, "name": "secretId", "type": "uint256" },
    { "indexed": false, "name": "cifer", "type": "bytes" },
    { "indexed": false, "name": "encryptedMessage", "type": "bytes" },
    { "indexed": false, "name": "ciferHash", "type": "bytes32" },
    { "indexed": false, "name": "encryptedMessageHash", "type": "bytes32" }
  ] },
  { "type": "event", "name": "CIFERDataDeleted", "inputs": [
    { "indexed": true, "name": "dataId", "type": "bytes32" }
  ] }
]
```

> Child-specific write methods (store/update/delete wrappers and any secretId management) must be added from that child’s ABI/spec.

