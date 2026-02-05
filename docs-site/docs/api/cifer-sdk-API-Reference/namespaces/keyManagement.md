[**cifer-sdk API Reference v0.3.0**](../../index.md)

***

[cifer-sdk API Reference](../../index.md) / keyManagement

# keyManagement

Key management operations for the SecretsController contract.

## Remarks

This namespace provides functions for:
- Reading secret state and fees
- Building transaction intents for secret creation and management
- Parsing events from transaction receipts

## Interfaces

### ParsedSecretCreatedEvent

Defined in: [keyManagement/events.ts:17](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L17)

Parsed SecretCreated event

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [keyManagement/events.ts:19](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L19)

The new secret ID

##### owner

> **owner**: `` `0x${string}` ``

Defined in: [keyManagement/events.ts:21](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L21)

The owner address

##### secretType

> **secretType**: `number`

Defined in: [keyManagement/events.ts:23](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L23)

The secret type

##### log

> **log**: [`Log`](../../index.md#log)

Defined in: [keyManagement/events.ts:25](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L25)

Original log for reference

***

### ParsedSecretSyncedEvent

Defined in: [keyManagement/events.ts:73](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L73)

Parsed SecretSynced event

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [keyManagement/events.ts:75](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L75)

The secret ID that was synced

##### clusterId

> **clusterId**: `number`

Defined in: [keyManagement/events.ts:77](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L77)

The cluster ID where the secret is stored

##### publicKeyCid

> **publicKeyCid**: `string`

Defined in: [keyManagement/events.ts:79](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L79)

The IPFS CID of the public key

##### log

> **log**: [`Log`](../../index.md#log)

Defined in: [keyManagement/events.ts:81](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L81)

Original log for reference

***

### ParsedDelegateUpdatedEvent

Defined in: [keyManagement/events.ts:118](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L118)

Parsed DelegateUpdated event

#### Properties

##### secretId

> **secretId**: `bigint`

Defined in: [keyManagement/events.ts:120](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L120)

The secret ID

##### newDelegate

> **newDelegate**: `` `0x${string}` ``

Defined in: [keyManagement/events.ts:122](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L122)

The new delegate address

##### log

> **log**: [`Log`](../../index.md#log)

Defined in: [keyManagement/events.ts:124](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L124)

Original log for reference

***

### ReadParams

Defined in: [keyManagement/reads.ts:27](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L27)

Parameters for read operations

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [keyManagement/reads.ts:29](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L29)

Chain ID

##### controllerAddress

> **controllerAddress**: `` `0x${string}` ``

Defined in: [keyManagement/reads.ts:31](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L31)

SecretsController contract address

##### readClient

> **readClient**: [`ReadClient`](../../index.md#readclient-1)

Defined in: [keyManagement/reads.ts:33](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L33)

Read client for making RPC calls

***

### SecretsByWallet

Defined in: [keyManagement/reads.ts:229](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L229)

Result of getSecretsByWallet

#### Properties

##### owned

> **owned**: `bigint`[]

Defined in: [keyManagement/reads.ts:231](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L231)

Secret IDs owned by the wallet

##### delegated

> **delegated**: `bigint`[]

Defined in: [keyManagement/reads.ts:233](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L233)

Secret IDs delegated to the wallet

***

### SecretsCountByWallet

Defined in: [keyManagement/reads.ts:288](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L288)

Result of getSecretsCountByWallet

#### Properties

##### ownedCount

> **ownedCount**: `bigint`

Defined in: [keyManagement/reads.ts:290](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L290)

Number of secrets owned

##### delegatedCount

> **delegatedCount**: `bigint`

Defined in: [keyManagement/reads.ts:292](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L292)

Number of secrets delegated

## Functions

### parseSecretCreatedLog()

> **parseSecretCreatedLog**(`log`): [`ParsedSecretCreatedEvent`](#parsedsecretcreatedevent)

Defined in: [keyManagement/events.ts:47](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L47)

Parse a SecretCreated event from a transaction receipt log

#### Parameters

##### log

[`Log`](../../index.md#log)

The log entry to parse

#### Returns

[`ParsedSecretCreatedEvent`](#parsedsecretcreatedevent)

Parsed event data

#### Throws

KeyManagementError if the log is not a SecretCreated event

#### Example

```typescript
const receipt = await waitForReceipt(txHash);
const secretCreatedLog = receipt.logs.find(
  log => log.topics[0] === SECRETS_CONTROLLER_TOPICS.SecretCreated
);
if (secretCreatedLog) {
  const event = parseSecretCreatedLog(secretCreatedLog);
  console.log('New secret ID:', event.secretId);
}
```

***

### parseSecretSyncedLog()

> **parseSecretSyncedLog**(`log`): [`ParsedSecretSyncedEvent`](#parsedsecretsyncedevent)

Defined in: [keyManagement/events.ts:92](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L92)

Parse a SecretSynced event from a log

This event indicates that a secret is now ready for use.

#### Parameters

##### log

[`Log`](../../index.md#log)

The log entry to parse

#### Returns

[`ParsedSecretSyncedEvent`](#parsedsecretsyncedevent)

Parsed event data

***

### parseDelegateUpdatedLog()

> **parseDelegateUpdatedLog**(`log`): [`ParsedDelegateUpdatedEvent`](#parseddelegateupdatedevent)

Defined in: [keyManagement/events.ts:133](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L133)

Parse a DelegateUpdated event from a log

#### Parameters

##### log

[`Log`](../../index.md#log)

The log entry to parse

#### Returns

[`ParsedDelegateUpdatedEvent`](#parseddelegateupdatedevent)

Parsed event data

***

### extractSecretIdFromReceipt()

> **extractSecretIdFromReceipt**(`logs`): `bigint`

Defined in: [keyManagement/events.ts:172](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/events.ts#L172)

Extract the secret ID from a createSecret transaction receipt

This is a convenience function that finds the SecretCreated event
in a transaction receipt and extracts the secret ID.

#### Parameters

##### logs

[`Log`](../../index.md#log)[]

The logs from the transaction receipt

#### Returns

`bigint`

The new secret ID

#### Throws

KeyManagementError if no SecretCreated event is found

#### Example

```typescript
const receipt = await waitForReceipt(txHash);
const secretId = extractSecretIdFromReceipt(receipt.logs);
console.log('Created secret:', secretId);
```

***

### getSecretCreationFee()

> **getSecretCreationFee**(`params`): `Promise`\<`bigint`\>

Defined in: [keyManagement/reads.ts:54](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L54)

Get the secret creation fee

This is the amount of native token (in wei) required to create a new secret.

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

#### Returns

`Promise`\<`bigint`\>

The fee in wei

#### Example

```typescript
const fee = await getSecretCreationFee({
  chainId: 752025,
  controllerAddress: '0x...',
  readClient,
});
console.log('Fee:', fee, 'wei');
```

***

### getSecret()

> **getSecret**(`params`, `secretId`): `Promise`\<[`SecretState`](../../index.md#secretstate)\>

Defined in: [keyManagement/reads.ts:99](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L99)

Get the full state of a secret

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

##### secretId

`bigint`

The secret ID to query

#### Returns

`Promise`\<[`SecretState`](../../index.md#secretstate)\>

The secret state

#### Throws

SecretNotFoundError if the secret doesn't exist

#### Example

```typescript
const state = await getSecret({
  chainId: 752025,
  controllerAddress: '0x...',
  readClient,
}, 123n);

console.log('Owner:', state.owner);
console.log('Is syncing:', state.isSyncing);
console.log('Public key CID:', state.publicKeyCid);
```

***

### getSecretOwner()

> **getSecretOwner**(`params`, `secretId`): `Promise`\<`` `0x${string}` ``\>

Defined in: [keyManagement/reads.ts:158](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L158)

Get the owner of a secret

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

##### secretId

`bigint`

The secret ID to query

#### Returns

`Promise`\<`` `0x${string}` ``\>

The owner address

#### Throws

SecretNotFoundError if the secret doesn't exist

***

### getDelegate()

> **getDelegate**(`params`, `secretId`): `Promise`\<`` `0x${string}` ``\>

Defined in: [keyManagement/reads.ts:196](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L196)

Get the delegate of a secret

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

##### secretId

`bigint`

The secret ID to query

#### Returns

`Promise`\<`` `0x${string}` ``\>

The delegate address (zero address if no delegate)

#### Throws

SecretNotFoundError if the secret doesn't exist

***

### getSecretsByWallet()

> **getSecretsByWallet**(`params`, `wallet`): `Promise`\<[`SecretsByWallet`](#secretsbywallet)\>

Defined in: [keyManagement/reads.ts:258](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L258)

Get all secrets owned by or delegated to a wallet

Note: The returned arrays are unordered sets. The contract uses
swap-and-pop for removals, so order is not stable.

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

##### wallet

`` `0x${string}` ``

The wallet address to query

#### Returns

`Promise`\<[`SecretsByWallet`](#secretsbywallet)\>

Object containing owned and delegated secret IDs

#### Example

```typescript
const secrets = await getSecretsByWallet({
  chainId: 752025,
  controllerAddress: '0x...',
  readClient,
}, '0xUser...');

console.log('Owned:', secrets.owned);
console.log('Delegated:', secrets.delegated);
```

***

### getSecretsCountByWallet()

> **getSecretsCountByWallet**(`params`, `wallet`): `Promise`\<[`SecretsCountByWallet`](#secretscountbywallet)\>

Defined in: [keyManagement/reads.ts:304](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L304)

Get the count of secrets owned by or delegated to a wallet

This is more gas-efficient than getSecretsByWallet when you only need counts.

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

##### wallet

`` `0x${string}` ``

The wallet address to query

#### Returns

`Promise`\<[`SecretsCountByWallet`](#secretscountbywallet)\>

Object containing owned and delegated counts

***

### isSecretReady()

> **isSecretReady**(`params`, `secretId`): `Promise`\<`boolean`\>

Defined in: [keyManagement/reads.ts:340](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L340)

Check if a secret is ready (not syncing)

A secret is ready when isSyncing is false and publicKeyCid is set.

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

##### secretId

`bigint`

The secret ID to check

#### Returns

`Promise`\<`boolean`\>

True if the secret is ready for encryption/decryption

***

### isAuthorized()

> **isAuthorized**(`params`, `secretId`, `address`): `Promise`\<`boolean`\>

Defined in: [keyManagement/reads.ts:356](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/reads.ts#L356)

Check if an address is authorized for a secret (owner or delegate)

#### Parameters

##### params

[`ReadParams`](#readparams)

Read parameters

##### secretId

`bigint`

The secret ID to check

##### address

`` `0x${string}` ``

The address to check authorization for

#### Returns

`Promise`\<`boolean`\>

True if the address is owner or delegate

***

### buildCreateSecretTx()

> **buildCreateSecretTx**(`params`): [`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Defined in: [keyManagement/tx-builders.ts:46](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/tx-builders.ts#L46)

Build a transaction to create a new secret

The transaction must be sent with value equal to the secretCreationFee.
Use getSecretCreationFee() to get the current fee before calling this.

#### Parameters

##### params

Transaction parameters

###### chainId

`number`

Chain ID

###### controllerAddress

`` `0x${string}` ``

SecretsController contract address

###### fee

`bigint`

Secret creation fee (from getSecretCreationFee)

#### Returns

[`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Transaction intent

#### Example

```typescript
// Get the fee first
const fee = await getSecretCreationFee({ chainId, controllerAddress, readClient });

// Build the transaction
const txIntent = buildCreateSecretTx({
  chainId: 752025,
  controllerAddress: '0x...',
  fee,
});

// Execute with your preferred method
const hash = await wallet.sendTransaction({
  to: txIntent.to,
  data: txIntent.data,
  value: txIntent.value,
});
```

***

### buildSetDelegateTx()

> **buildSetDelegateTx**(`params`): [`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Defined in: [keyManagement/tx-builders.ts:86](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/tx-builders.ts#L86)

Build a transaction to set or update a delegate for a secret

Only the secret owner can set a delegate. Setting the delegate to the
zero address removes the delegation.

#### Parameters

##### params

Transaction parameters

###### chainId

`number`

Chain ID

###### controllerAddress

`` `0x${string}` ``

SecretsController contract address

###### secretId

`bigint`

Secret ID

###### newDelegate

`` `0x${string}` ``

New delegate address

#### Returns

[`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Transaction intent

#### Example

```typescript
const txIntent = buildSetDelegateTx({
  chainId: 752025,
  controllerAddress: '0x...',
  secretId: 123n,
  newDelegate: '0xDelegateAddress...',
});
```

***

### buildRemoveDelegationTx()

> **buildRemoveDelegationTx**(`params`): [`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Defined in: [keyManagement/tx-builders.ts:117](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/tx-builders.ts#L117)

Build a transaction to remove a delegate from a secret

This is a convenience wrapper around buildSetDelegateTx that sets
the delegate to the zero address.

#### Parameters

##### params

Transaction parameters

###### chainId

`number`

Chain ID

###### controllerAddress

`` `0x${string}` ``

SecretsController contract address

###### secretId

`bigint`

Secret ID

#### Returns

[`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Transaction intent

***

### buildTransferSecretTx()

> **buildTransferSecretTx**(`params`): [`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Defined in: [keyManagement/tx-builders.ts:162](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/fe04ca635b8fb4fcb3ca3abf47b8bfd83a93d41c/src/keyManagement/tx-builders.ts#L162)

Build a transaction to transfer ownership of a secret

Only the current owner can transfer a secret. If the secret has a
delegate, the delegation will be cleared upon transfer.

#### Parameters

##### params

Transaction parameters

###### chainId

`number`

Chain ID

###### controllerAddress

`` `0x${string}` ``

SecretsController contract address

###### secretId

`bigint`

Secret ID

###### newOwner

`` `0x${string}` ``

New owner address

#### Returns

[`TxIntentWithMeta`](../../index.md#txintentwithmeta)

Transaction intent

#### Example

```typescript
const txIntent = buildTransferSecretTx({
  chainId: 752025,
  controllerAddress: '0x...',
  secretId: 123n,
  newOwner: '0xNewOwner...',
});
```
