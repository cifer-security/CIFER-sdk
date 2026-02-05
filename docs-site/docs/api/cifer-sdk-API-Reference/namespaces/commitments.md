[**cifer-sdk API Reference v0.3.0**](../../index.md)

***

[cifer-sdk API Reference](../../index.md) / commitments

# commitments

On-chain commitment operations for encrypted data storage.

## Remarks

This namespace provides functions for:
- Reading commitment metadata from contracts
- Fetching encrypted data from event logs
- Verifying data integrity
- Building store transactions

## Interfaces

### IntegrityResult

Defined in: [commitments/integrity.ts:22](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/integrity.ts#L22)

Result of integrity verification

#### Properties

##### valid

> **valid**: `boolean`

Defined in: [commitments/integrity.ts:24](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/integrity.ts#L24)

Whether all checks passed

##### checks

> **checks**: `object`

Defined in: [commitments/integrity.ts:26](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/integrity.ts#L26)

Detailed results per check

###### ciferSize

> **ciferSize**: `object`

Cifer size check

###### ciferSize.valid

> **valid**: `boolean`

###### ciferSize.actual

> **actual**: `number`

###### ciferSize.expected

> **expected**: `number`

###### payloadSize

> **payloadSize**: `object`

Encrypted message size check

###### payloadSize.valid

> **valid**: `boolean`

###### payloadSize.actual

> **actual**: `number`

###### payloadSize.max

> **max**: `number`

###### ciferHash?

> `optional` **ciferHash**: `object`

Cifer hash matches (if metadata provided)

###### ciferHash.valid

> **valid**: `boolean`

###### ciferHash.expected?

> `optional` **expected**: `string`

###### ciferHash.actual?

> `optional` **actual**: `string`

###### encryptedMessageHash?

> `optional` **encryptedMessageHash**: `object`

Encrypted message hash matches (if metadata provided)

###### encryptedMessageHash.valid

> **valid**: `boolean`

###### encryptedMessageHash.expected?

> `optional` **expected**: `string`

###### encryptedMessageHash.actual?

> `optional` **actual**: `string`

***

### FetchCommitmentParams

Defined in: [commitments/logs.ts:18](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L18)

Parameters for fetching commitment data from logs

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [commitments/logs.ts:20](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L20)

Chain ID

##### contractAddress

> **contractAddress**: `` `0x${string}` ``

Defined in: [commitments/logs.ts:22](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L22)

Contract address implementing ICiferEncrypted

##### dataId

> **dataId**: `` `0x${string}` ``

Defined in: [commitments/logs.ts:24](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L24)

The data ID to find

##### storedAtBlock

> **storedAtBlock**: `number`

Defined in: [commitments/logs.ts:26](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L26)

Block number where the data was stored (from metadata)

##### readClient

> **readClient**: [`ReadClient`](../../index.md#readclient-1)

Defined in: [commitments/logs.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L28)

Read client for log queries

***

### CommitmentReadParams

Defined in: [commitments/metadata.ts:32](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L32)

Parameters for commitment read operations

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [commitments/metadata.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L34)

Chain ID

##### contractAddress

> **contractAddress**: `` `0x${string}` ``

Defined in: [commitments/metadata.ts:36](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L36)

Contract address implementing ICiferEncrypted

##### readClient

> **readClient**: [`ReadClient`](../../index.md#readclient-1)

Defined in: [commitments/metadata.ts:38](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L38)

Read client for making RPC calls

***

### AbiFunction

Defined in: [commitments/tx-builders.ts:17](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L17)

ABI item for a function

#### Properties

##### type

> **type**: `"function"`

Defined in: [commitments/tx-builders.ts:18](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L18)

##### name

> **name**: `string`

Defined in: [commitments/tx-builders.ts:19](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L19)

##### inputs

> **inputs**: `object`[]

Defined in: [commitments/tx-builders.ts:20](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L20)

###### name

> **name**: `string`

###### type

> **type**: `string`

##### outputs?

> `optional` **outputs**: `object`[]

Defined in: [commitments/tx-builders.ts:24](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L24)

###### name

> **name**: `string`

###### type

> **type**: `string`

##### stateMutability?

> `optional` **stateMutability**: `string`

Defined in: [commitments/tx-builders.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L28)

***

### BuildStoreCommitmentParams

Defined in: [commitments/tx-builders.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L34)

Parameters for building a store commitment transaction

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [commitments/tx-builders.ts:36](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L36)

Chain ID

##### contractAddress

> **contractAddress**: `` `0x${string}` ``

Defined in: [commitments/tx-builders.ts:38](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L38)

Contract address

##### storeFunction

> **storeFunction**: [`AbiFunction`](#abifunction)

Defined in: [commitments/tx-builders.ts:40](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L40)

The store function ABI (from your contract)

##### args

> **args**: `object`

Defined in: [commitments/tx-builders.ts:42](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L42)

Arguments to pass to the store function

###### key

> **key**: `` `0x${string}` ``

Key for the data (bytes32)

###### secretId

> **secretId**: `bigint`

Secret ID (uint256)

###### encryptedMessage

> **encryptedMessage**: `` `0x${string}` ``

Encrypted message bytes

###### cifer

> **cifer**: `` `0x${string}` ``

CIFER envelope bytes

##### validate?

> `optional` **validate**: `boolean`

Defined in: [commitments/tx-builders.ts:53](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L53)

Whether to validate sizes before building (default: true)

## Variables

### COMMON\_STORE\_FUNCTIONS

> `const` **COMMON\_STORE\_FUNCTIONS**: `object`

Defined in: [commitments/tx-builders.ts:267](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L267)

Common store function ABIs for reference

#### Type Declaration

##### storeWithKey

> **storeWithKey**: `object`

store(bytes32 key, bytes encryptedMessage, bytes cifer)
Common pattern where secretId is stored per-user in contract

###### storeWithKey.type

> **type**: `"function"`

###### storeWithKey.name

> **name**: `string` = `'store'`

###### storeWithKey.inputs

> **inputs**: `object`[]

##### storeWithSecretId

> **storeWithSecretId**: `object`

store(bytes32 key, uint256 secretId, bytes encryptedMessage, bytes cifer)
Pattern where secretId is passed per-call

###### storeWithSecretId.type

> **type**: `"function"`

###### storeWithSecretId.name

> **name**: `string` = `'store'`

###### storeWithSecretId.inputs

> **inputs**: `object`[]

## Functions

### verifyCommitmentIntegrity()

> **verifyCommitmentIntegrity**(`data`, `metadata?`): [`IntegrityResult`](#integrityresult)

Defined in: [commitments/integrity.ts:63](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/integrity.ts#L63)

Verify the integrity of commitment data

This performs several checks:
1. Cifer size is exactly 1104 bytes
2. Encrypted message size is within limits (≤ 16KB, > 0)
3. If metadata is provided, hashes match

#### Parameters

##### data

[`CommitmentData`](../../index.md#commitmentdata)

The commitment data to verify

##### metadata?

[`CIFERMetadata`](../../index.md#cifermetadata)

Optional metadata for hash verification

#### Returns

[`IntegrityResult`](#integrityresult)

Integrity check result

#### Example

```typescript
// Verify data retrieved from logs
const commitment = await fetchCommitmentFromLogs({ ... });
const metadata = await getCIFERMetadata({ ... }, dataId);

const result = verifyCommitmentIntegrity(commitment, metadata);

if (!result.valid) {
  console.error('Integrity check failed:', result.checks);
}
```

***

### assertCommitmentIntegrity()

> **assertCommitmentIntegrity**(`data`, `metadata?`): `void`

Defined in: [commitments/integrity.ts:123](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/integrity.ts#L123)

Verify commitment integrity and throw on failure

#### Parameters

##### data

[`CommitmentData`](../../index.md#commitmentdata)

The commitment data to verify

##### metadata?

[`CIFERMetadata`](../../index.md#cifermetadata)

Optional metadata for hash verification

#### Returns

`void`

#### Throws

InvalidCiferSizeError if cifer size is wrong

#### Throws

PayloadTooLargeError if payload is too large

#### Throws

IntegrityError if hash verification fails

***

### validateForStorage()

> **validateForStorage**(`cifer`, `encryptedMessage`): `void`

Defined in: [commitments/integrity.ts:175](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/integrity.ts#L175)

Validate cifer and encrypted message sizes before storing

Call this before submitting a store transaction to catch
size errors early.

#### Parameters

##### cifer

The cifer bytes (hex or Uint8Array)

`` `0x${string}` `` | `Uint8Array`\<`ArrayBufferLike`\>

##### encryptedMessage

The encrypted message bytes (hex or Uint8Array)

`` `0x${string}` `` | `Uint8Array`\<`ArrayBufferLike`\>

#### Returns

`void`

#### Throws

InvalidCiferSizeError if cifer size is wrong

#### Throws

PayloadTooLargeError if payload is too large

#### Throws

CommitmentsError if payload is empty

***

### fetchCommitmentFromLogs()

> **fetchCommitmentFromLogs**(`params`): `Promise`\<[`CommitmentData`](../../index.md#commitmentdata)\>

Defined in: [commitments/logs.ts:60](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L60)

Fetch commitment data (cifer + encryptedMessage) from event logs

The actual encrypted bytes are not stored on-chain - they are emitted
in CIFERDataStored or CIFERDataUpdated events. This function retrieves
those bytes from the logs.

#### Parameters

##### params

[`FetchCommitmentParams`](#fetchcommitmentparams)

Fetch parameters

#### Returns

`Promise`\<[`CommitmentData`](../../index.md#commitmentdata)\>

Commitment data with cifer and encryptedMessage

#### Throws

CommitmentNotFoundError if no matching log is found

#### Example

```typescript
// First get the metadata to know which block to query
const metadata = await getCIFERMetadata({ chainId, contractAddress, readClient }, dataId);

// Then fetch the actual encrypted data from logs
const commitment = await fetchCommitmentFromLogs({
  chainId: 752025,
  contractAddress: '0x...',
  dataId,
  storedAtBlock: metadata.storedAtBlock,
  readClient,
});

console.log('Cifer:', commitment.cifer);
console.log('Encrypted message:', commitment.encryptedMessage);
```

***

### fetchCommitmentWithRetry()

> **fetchCommitmentWithRetry**(`params`): `Promise`\<[`CommitmentData`](../../index.md#commitmentdata)\>

Defined in: [commitments/logs.ts:130](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L130)

Fetch commitment with expanded block range search

Sometimes the exact block might not have the event due to reorgs or
indexing delays. This function searches within a range around the
expected block.

#### Parameters

##### params

[`FetchCommitmentParams`](#fetchcommitmentparams) & `object`

Fetch parameters with extended search options

#### Returns

`Promise`\<[`CommitmentData`](../../index.md#commitmentdata)\>

Commitment data

***

### parseCommitmentLog()

> **parseCommitmentLog**(`log`): [`CommitmentData`](../../index.md#commitmentdata)

Defined in: [commitments/logs.ts:216](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L216)

Parse a CIFER data event from a raw log

Use this when you have logs from your own source (e.g., WebSocket subscription)
and need to decode them.

#### Parameters

##### log

[`Log`](../../index.md#log)

The raw log entry

#### Returns

[`CommitmentData`](../../index.md#commitmentdata)

Parsed commitment data

***

### isCIFERDataEvent()

> **isCIFERDataEvent**(`log`): `boolean`

Defined in: [commitments/logs.ts:239](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/logs.ts#L239)

Check if a log is a CIFER data event (stored or updated)

#### Parameters

##### log

[`Log`](../../index.md#log)

The log to check

#### Returns

`boolean`

True if it's a CIFER data event

***

### getCIFERMetadata()

> **getCIFERMetadata**(`params`, `dataId`): `Promise`\<[`CIFERMetadata`](../../index.md#cifermetadata)\>

Defined in: [commitments/metadata.ts:65](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L65)

Get CIFER metadata for a data ID

Returns the on-chain metadata for an encrypted commitment, including
the secret ID, block number, and hashes for integrity verification.

#### Parameters

##### params

[`CommitmentReadParams`](#commitmentreadparams)

Read parameters

##### dataId

`` `0x${string}` ``

The data ID to query

#### Returns

`Promise`\<[`CIFERMetadata`](../../index.md#cifermetadata)\>

CIFER metadata

#### Throws

CommitmentNotFoundError if no data exists for the ID

#### Example

```typescript
const metadata = await getCIFERMetadata({
  chainId: 752025,
  contractAddress: '0x...',
  readClient,
}, dataId);

console.log('Secret ID:', metadata.secretId);
console.log('Stored at block:', metadata.storedAtBlock);
console.log('Cifer hash:', metadata.ciferHash);
```

***

### ciferDataExists()

> **ciferDataExists**(`params`, `dataId`): `Promise`\<`boolean`\>

Defined in: [commitments/metadata.ts:115](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L115)

Check if commitment data exists for a data ID

#### Parameters

##### params

[`CommitmentReadParams`](#commitmentreadparams)

Read parameters

##### dataId

`` `0x${string}` ``

The data ID to check

#### Returns

`Promise`\<`boolean`\>

True if data exists

***

### hexToBytes()

> **hexToBytes**(`hex`): `Uint8Array`

Defined in: [commitments/metadata.ts:175](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L175)

Convert hex string to bytes

#### Parameters

##### hex

`` `0x${string}` ``

#### Returns

`Uint8Array`

***

### bytesToHex()

> **bytesToHex**(`bytes`): `` `0x${string}` ``

Defined in: [commitments/metadata.ts:187](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/metadata.ts#L187)

Convert bytes to hex string

#### Parameters

##### bytes

`Uint8Array`

#### Returns

`` `0x${string}` ``

***

### buildStoreCommitmentTx()

> **buildStoreCommitmentTx**(`params`): [`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Defined in: [commitments/tx-builders.ts:91](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1e11a88c69460b0ffd7cd10f8f07c611e4574095/src/commitments/tx-builders.ts#L91)

Build a transaction to store an encrypted commitment

Since different contracts have different store function signatures,
you must provide the ABI for your specific contract.

#### Parameters

##### params

[`BuildStoreCommitmentParams`](#buildstorecommitmentparams)

Build parameters

#### Returns

[`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Transaction intent

#### Example

```typescript
// For a contract with: store(bytes32 key, bytes encryptedMessage, bytes cifer)
const storeFunction = {
  type: 'function',
  name: 'store',
  inputs: [
    { name: 'key', type: 'bytes32' },
    { name: 'encryptedMessage', type: 'bytes' },
    { name: 'cifer', type: 'bytes' },
  ],
};

const txIntent = buildStoreCommitmentTx({
  chainId: 752025,
  contractAddress: '0x...',
  storeFunction,
  args: {
    key: '0x...',
    secretId: 123n,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
  },
});
```

## References

### CIFER\_ENVELOPE\_BYTES

Re-exports [CIFER_ENVELOPE_BYTES](../../index.md#cifer_envelope_bytes)

***

### MAX\_PAYLOAD\_BYTES

Re-exports [MAX_PAYLOAD_BYTES](../../index.md#max_payload_bytes)
