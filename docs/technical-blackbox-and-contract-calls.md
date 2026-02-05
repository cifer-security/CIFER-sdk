# Technical Integration (dapp): Blackbox API Calls + Smart Contract Calls

This document explains, **specifically for** `dapps/CiferVaultOnChain/`, how:

- the CIFER **blackbox HTTP APIs** are called
- request **payloads are constructed**
- payloads are **signed** with the user’s wallet
- the dapp performs **smart contract reads/writes** (including event-log decoding on decrypt)

> Source of truth for addresses/ABI used by the dapp is `dapps/CiferVaultOnChain/lib/contracts.ts` and `dapps/CiferVaultOnChain/lib/abi/CiferVaultOnChain.abi.json`.

---

## Key files (where the logic lives)

- **Blackbox API + signing + store tx**: `components/vault-encrypt.tsx`
- **Log query + signing + decrypt**: `components/vault-decrypt.tsx`
- **Secret creation (SecretsController)**: `components/secret-creator.tsx`
- **Secret ownership check (SecretsController)**: `components/secret-checker.tsx`
- **Link secretId to vault**: `app/setup/page.tsx`
- **Routing / UX**: `app/page.tsx`, `app/vault/page.tsx`
- **Chain + Thirdweb client**: `lib/thirdweb-client.ts`
- **Contract addresses/ABIs**: `lib/contracts.ts`

---

## Runtime configuration (env vars)

The dapp expects:

- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Thirdweb client id (used by `createThirdwebClient`)
- `NEXT_PUBLIC_BLACKBOX_URL`: base URL for the blackbox server (used by encrypt/decrypt fetch)

The dapp uses `NEXT_PUBLIC_BLACKBOX_URL` as:

- `POST {BLACKBOX_URL}/encrypt-payload`
- `POST {BLACKBOX_URL}/decrypt-payload`

---

## High-level architecture

### What happens on encrypt + store

1. UI collects:
   - `key` (human string; converted to `bytes32`)
   - `plaintext` (string)
2. UI reads `userSecretId` from the vault contract (`userSecretId(address) -> uint256`).
3. UI builds a **deterministic signing string** (details below) and asks the wallet to sign it.
4. UI POSTs `(dataString, signature, outputFormat)` to blackbox `/encrypt-payload`.
5. Blackbox returns `{ cifer, encryptedMessage }` (both hex strings).
6. UI sends an on-chain tx to `store(bytes32 key, bytes encryptedMessage, bytes cifer)`.

### What happens on decrypt

1. UI collects `key` and computes the on-chain `dataId`.
2. UI reads metadata (including `storedAtBlock`) from the vault contract.
3. UI queries chain logs *at* `storedAtBlock` to recover the **actual bytes**:
   - `cifer`
   - `encryptedMessage`
4. UI builds a **deterministic signing string** and asks the wallet to sign it.
5. UI POSTs `(cifer, dataString, signature)` to blackbox `/decrypt-payload`.
6. Blackbox returns `{ decryptedMessage }`.

This design is consistent with CIFER’s “commitments in storage, ciphertext in events” model (see `Docs/info-for-sdk.md`).

---

## Blackbox API integration (payload creation + signing)

### The signing primitive

Both encrypt and decrypt use **EIP-191 personal message signing** (via Thirdweb’s `account.signMessage`), not EIP-712 typed data.

The app constructs a `dataString` (plain UTF-8 string) and calls:

- `signature = await account.signMessage({ message: dataString })`

The blackbox server is expected to recover the signer from the signature and validate that:

- the signature is over the provided `dataString`
- the string structure is correct
- the signer is authorized for the referenced `secretId`
- the request is “fresh” (see block number below)

> The exact authorization + freshness rules are implemented in the blackbox service (not in this repo). The **client-side shape** is defined by the dapp code.

### Why a block number is included

Both flows include the **current block number** in the signed message. This gives the blackbox a clear anti-replay primitive:

- it can reject signatures that reference blocks too far in the past (stale)
- it can require the signed block to be within a window of its own latest block (fresh)

The block number is fetched from the chain RPC (via `ethers` `JsonRpcProvider.getBlockNumber()`).

---

## Encrypt API call (`/encrypt-payload`)

### Inputs

From the dapp:

- `chainId`: `752025` (Ternoa mainnet chain id)
- `secretId`: user’s vault-linked secret id (`userSecretId(account.address)`)
- `signer`: `account.address`
- `blockNumber`: current chain block number
- `plaintext`: the text entered in the UI

### Signed `dataString` format (encrypt)

`vault-encrypt.tsx` constructs:

```
{chainId}_{secretId}_{signer}_{blockNumber}_{plaintext}
```

Example shape (not real values):

```
752025_123_0xabc...def_4200000_my secret message
```

### Request (HTTP)

`POST {BLACKBOX_URL}/encrypt-payload`

JSON body:

```json
{
  "data": "<dataString>",
  "signature": "0x...",
  "outputFormat": "hex"
}
```

Notes:

- `outputFormat: "hex"` is chosen so the response can be passed directly as Solidity `bytes` (with `0x` prefix).

### Response (HTTP)

The dapp expects:

```json
{
  "cifer": "0x...",
  "encryptedMessage": "0x..."
}
```

The dapp stores these in React state only until it sends the on-chain `store` transaction.

---

## Decrypt API call (`/decrypt-payload`)

### Inputs

From the dapp:

- `chainId`: `752025`
- `secretId`: comes from `getUserMetadata(...)` for the record being decrypted
- `signer`: `account.address`
- `blockNumber`: current chain block number
- `encryptedMessageHex`: recovered from event logs and hexlified
- `ciferHex`: recovered from event logs and hexlified

### Signed `dataString` format (decrypt)

`vault-decrypt.tsx` constructs:

```
{chainId}_{secretId}_{signer}_{blockNumber}_{encryptedMessageHex}
```

Note the last field is the **ciphertext** (hex) rather than plaintext.

### Request (HTTP)

`POST {BLACKBOX_URL}/decrypt-payload`

JSON body:

```json
{
  "cifer": "0x...",
  "data": "<dataString>",
  "signature": "0x...",
  "inputFormat": "hex"
}
```

### Response (HTTP)

The dapp expects:

```json
{
  "decryptedMessage": "..."
}
```

Security note: the decrypted message is kept only in component state and cleared on unmount.

---

## Smart contract interactions (Thirdweb + ethers)

The dapp uses:

- **Thirdweb** for contract reads and sending transactions:
  - `useReadContract`
  - `prepareContractCall`
  - `useSendTransaction`
  - `useWaitForReceipt`
- **ethers v6** for:
  - `encodeBytes32String` (key → `bytes32`)
  - `JsonRpcProvider` (block number + `getLogs`)
  - `AbiCoder` + `id()` (event topic + decoding)
  - `hexlify` (bytes → hex string)

### Important chain nuance: legacy gas pricing

Ternoa does **not** support EIP-1559 dynamic fees in this integration, so the dapp forces **legacy** transactions:

- it queries `eth_gasPrice` using `thirdweb/rpc`
- it passes `gasPrice` into `prepareContractCall(...)`

This is used in:

- `createSecret` (SecretsController)
- `setSecretId` (Vault)
- `store` (Vault)

---

## SecretsController contract calls (secret creation + ownership checks)

Addresses/ABI:

- address: `SECRETS_CONTROLLER_ADDRESS` (see `lib/contracts.ts`)
- ABI: `SECRETS_CONTROLLER_ABI` (a minimal hand-maintained subset in `lib/contracts.ts`)

### Check existing secret ownership (`SecretChecker`)

Read:

- `getSecretOwner(secretId) -> address`

The UI treats a revert (e.g. “Secret not found”) as “does not exist”.

### Create a new secret (`SecretCreator`)

Reads:

- `secretCreationFee() -> uint256`
- `nextSecretId() -> uint256` (used only for UX/preview)

Write:

- `createSecret()` (payable), sending `value = secretCreationFee`

After success the UI prompts the user to “Use This Secret” (feeds the secret id into setup flow).

---

## Vault contract calls (CiferVaultOnChain)

Address/ABI:

- address: `CIFER_VAULT_ADDRESS` (see `lib/contracts.ts`)
- ABI: `CIFER_VAULT_ABI` (imported from `lib/abi/CiferVaultOnChain.abi.json`)

### Link your secret to the vault (`SetupPage`)

Write:

- `setSecretId(uint256 secretId)`

This sets `userSecretId[msg.sender]` on the vault.

### Encrypt & store (`VaultEncrypt`)

Read:

- `userSecretId(address user) -> uint256`

Write:

- `store(bytes32 key, bytes encryptedMessage, bytes cifer)`

Parameter construction details:

- `key` is taken from a user string and converted using `encodeBytes32String(keyString)`.
  - The UI enforces `maxLength={31}` because `bytes32` string encoding has a practical limit.
- `encryptedMessage` and `cifer` are expected to be hex strings returned by the blackbox and passed as `0x…` to the ABI encoder.

### Retrieve metadata (`VaultDecrypt`)

Read:

- `computeDataId(address user, bytes32 key) -> bytes32`
- `getUserMetadata(address user, bytes32 key) -> (secretId, storedAtBlock, ciferHash, encryptedMessageHash)`
- `userSecretId(address user) -> uint256` (display / UX)

The UI uses `storedAtBlock` to narrow down the log query to a single block for efficiency.

---

## Event log retrieval + decoding (decrypt flow)

The vault does **not** store `cifer` or `encryptedMessage` in contract storage. Instead, they are emitted in events:

- `CIFERDataStored(bytes32 indexed dataId, uint256 indexed secretId, bytes cifer, bytes encryptedMessage, bytes32 ciferHash, bytes32 encryptedMessageHash)`
- `CIFERDataUpdated(...)` (same payload)

To retrieve ciphertext bytes, `VaultDecrypt`:

1. Fetches metadata via `getUserMetadata(...)` → obtains `storedAtBlock` and `secretId`
2. Computes the correct indexed `dataId` via `computeDataId(...)`
3. Queries logs at exactly `storedAtBlock` with topics:
   - topic0 = keccak256(event signature) via `ethers.id("CIFERDataStored(...)")`
   - topic1 = `dataId` (indexed)
4. If no `CIFERDataStored` logs are found at that block, it tries `CIFERDataUpdated`
5. Decodes `logs[0].data` using:

   - ABI types: `["bytes", "bytes", "bytes32", "bytes32"]`
   - output: `(ciferBytes, encryptedMessageBytes, ciferHash, encryptedMessageHash)`

6. Converts `ciferBytes` and `encryptedMessageBytes` to hex strings using `hexlify(...)`
7. Uses those hex strings to construct the decrypt `dataString` and call the blackbox.

> Integrity verification (optional): the app already has `ciferHash` + `encryptedMessageHash` from metadata; a stricter client could compute `keccak256(ciferBytes)` and compare. (The current UI does not do this comparison.)

---

## Operational notes / troubleshooting

- **Blackbox URL missing**: UI will warn if `NEXT_PUBLIC_BLACKBOX_URL` is empty; encrypt/decrypt calls will fail.
- **Wallet must support message signing**: both flows require `account.signMessage`.
- **Network mismatch**: `ConnectButton` is configured with `ternoaChain`; contract calls assume chain id `752025`.
- **Gas pricing**: transactions use `gasPrice` (legacy). If you remove it, transactions may fail on Ternoa.

