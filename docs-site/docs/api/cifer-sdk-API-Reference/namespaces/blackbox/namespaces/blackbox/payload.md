[**cifer-sdk API Reference v0.3.1**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [blackbox](../../index.md) / blackbox/payload

# blackbox/payload

## Description

Payload encryption and decryption via the blackbox API

## Interfaces

### EncryptPayloadResult

Defined in: [blackbox/payload.ts:23](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L23)

Result of encrypting a payload

#### Properties

##### cifer

> **cifer**: `string`

Defined in: [blackbox/payload.ts:25](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L25)

The CIFER envelope (ML-KEM ciphertext + AES-GCM tag)

##### encryptedMessage

> **encryptedMessage**: `string`

Defined in: [blackbox/payload.ts:27](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L27)

The AES-encrypted message

##### chainId

> **chainId**: `number`

Defined in: [blackbox/payload.ts:29](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L29)

Chain ID used

##### secretId

> **secretId**: `bigint`

Defined in: [blackbox/payload.ts:31](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L31)

Secret ID used

##### outputFormat

> **outputFormat**: [`OutputFormat`](../../../../../index.md#outputformat)

Defined in: [blackbox/payload.ts:33](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L33)

Output format used

***

### DecryptPayloadResult

Defined in: [blackbox/payload.ts:39](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L39)

Result of decrypting a payload

#### Properties

##### decryptedMessage

> **decryptedMessage**: `string`

Defined in: [blackbox/payload.ts:41](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L41)

The decrypted plaintext message

***

### EncryptPayloadParams

Defined in: [blackbox/payload.ts:47](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L47)

Parameters for encrypting a payload

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/payload.ts:49](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L49)

Chain ID where the secret exists

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/payload.ts:51](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L51)

Secret ID to use for encryption

##### plaintext

> **plaintext**: `string`

Defined in: [blackbox/payload.ts:53](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L53)

The plaintext to encrypt

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/payload.ts:55](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L55)

Signer for authentication

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/payload.ts:57](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L57)

Read client for fetching block numbers

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/payload.ts:59](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L59)

Blackbox URL

##### outputFormat?

> `optional` **outputFormat**: [`OutputFormat`](../../../../../index.md#outputformat)

Defined in: [blackbox/payload.ts:61](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L61)

Output format (default: 'hex')

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/payload.ts:63](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L63)

Custom fetch implementation

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

***

### DecryptPayloadParams

Defined in: [blackbox/payload.ts:179](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L179)

Parameters for decrypting a payload

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/payload.ts:181](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L181)

Chain ID where the secret exists

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/payload.ts:183](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L183)

Secret ID used for encryption

##### encryptedMessage

> **encryptedMessage**: `string`

Defined in: [blackbox/payload.ts:185](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L185)

The encrypted message (from encrypt result or on-chain logs)

##### cifer

> **cifer**: `string`

Defined in: [blackbox/payload.ts:187](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L187)

The CIFER envelope (from encrypt result or on-chain logs)

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/payload.ts:189](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L189)

Signer for authentication (must be owner or delegate)

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/payload.ts:191](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L191)

Read client for fetching block numbers

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/payload.ts:193](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L193)

Blackbox URL

##### inputFormat?

> `optional` **inputFormat**: [`InputFormat`](../../../../../index.md#inputformat)

Defined in: [blackbox/payload.ts:195](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L195)

Input format (default: 'hex')

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/payload.ts:197](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L197)

Custom fetch implementation

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

###### Parameters

###### input

`RequestInfo` | `URL`

###### init?

`RequestInit`

###### Returns

`Promise`\<`Response`\>

## Functions

### encryptPayload()

> **encryptPayload**(`params`): `Promise`\<[`EncryptPayloadResult`](#encryptpayloadresult)\>

Defined in: [blackbox/payload.ts:90](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L90)

Encrypt a payload using the blackbox API

This encrypts short messages (up to ~16KB) using a secret's public key.
The result can be stored on-chain as an encrypted commitment.

#### Parameters

##### params

[`EncryptPayloadParams`](#encryptpayloadparams)

Encryption parameters

#### Returns

`Promise`\<[`EncryptPayloadResult`](#encryptpayloadresult)\>

Encrypted data (cifer and encryptedMessage)

#### Example

```typescript
const result = await encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My secret message',
  signer,
  readClient,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

console.log('Cifer:', result.cifer);
console.log('Encrypted message:', result.encryptedMessage);
```

***

### decryptPayload()

> **decryptPayload**(`params`): `Promise`\<[`DecryptPayloadResult`](#decryptpayloadresult)\>

Defined in: [blackbox/payload.ts:227](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/payload.ts#L227)

Decrypt a payload using the blackbox API

This decrypts messages that were encrypted with encryptPayload() or
retrieved from on-chain commitment logs.

The signer must be the secret owner or delegate.

#### Parameters

##### params

[`DecryptPayloadParams`](#decryptpayloadparams)

Decryption parameters

#### Returns

`Promise`\<[`DecryptPayloadResult`](#decryptpayloadresult)\>

Decrypted plaintext message

#### Example

```typescript
// Decrypt data retrieved from on-chain logs
const result = await decryptPayload({
  chainId: 752025,
  secretId: 123n,
  encryptedMessage: commitmentData.encryptedMessage,
  cifer: commitmentData.cifer,
  signer,
  readClient,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

console.log('Decrypted:', result.decryptedMessage);
```
