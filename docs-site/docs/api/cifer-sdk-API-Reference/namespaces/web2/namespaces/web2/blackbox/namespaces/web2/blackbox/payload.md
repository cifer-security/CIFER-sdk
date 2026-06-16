[**cifer-sdk API Reference v0.5.0**](../../../../../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../../../../../index.md) / [web2](../../../../../../index.md) / [web2/blackbox](../../../index.md) / web2/blackbox/payload

# web2/blackbox/payload

## Description

Web2 wrappers for payload encryption/decryption

Thin wrappers around the core `blackbox.payload.*` functions that
automatically fill in Web2-specific values (chainId, signer, etc.).

## Interfaces

### Web2EncryptPayloadParams

Defined in: [web2/blackbox/payload.ts:25](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L25)

Parameters for Web2 payload encryption.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/payload.ts:27](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L27)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/payload.ts:29](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L29)

Secret ID to use for encryption

##### plaintext

> **plaintext**: `string`

Defined in: [web2/blackbox/payload.ts:31](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L31)

The plaintext to encrypt

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/payload.ts:33](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L33)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/payload.ts:35](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L35)

Read client for freshness

##### outputFormat?

> `optional` **outputFormat**: [`OutputFormat`](../../../../../../../../../index.md#outputformat)

Defined in: [web2/blackbox/payload.ts:37](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L37)

Output format (default: 'hex')

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/payload.ts:39](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L39)

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

### Web2DecryptPayloadParams

Defined in: [web2/blackbox/payload.ts:83](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L83)

Parameters for Web2 payload decryption.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/payload.ts:85](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L85)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/payload.ts:87](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L87)

Secret ID used for encryption

##### encryptedMessage

> **encryptedMessage**: `string`

Defined in: [web2/blackbox/payload.ts:89](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L89)

The encrypted message

##### cifer

> **cifer**: `string`

Defined in: [web2/blackbox/payload.ts:91](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L91)

The CIFER envelope

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/payload.ts:93](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L93)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/payload.ts:95](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L95)

Read client for freshness

##### inputFormat?

> `optional` **inputFormat**: [`InputFormat`](../../../../../../../../../index.md#inputformat)

Defined in: [web2/blackbox/payload.ts:97](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L97)

Input format (default: 'hex')

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/payload.ts:99](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L99)

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

> **encryptPayload**(`params`): `Promise`\<[`EncryptPayloadResult`](../../../../../../../blackbox/namespaces/blackbox/payload.md#encryptpayloadresult)\>

Defined in: [web2/blackbox/payload.ts:61](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L61)

Encrypt a payload using a Web2 session.

Automatically fills in `chainId = -1` and uses the session signer.

#### Parameters

##### params

[`Web2EncryptPayloadParams`](#web2encryptpayloadparams)

Encryption parameters

#### Returns

`Promise`\<[`EncryptPayloadResult`](../../../../../../../blackbox/namespaces/blackbox/payload.md#encryptpayloadresult)\>

Encrypted data (cifer and encryptedMessage)

#### Example

```typescript
const result = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: 42,
  plaintext: 'Hello, Web2!',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient,
});
```

***

### decryptPayload()

> **decryptPayload**(`params`): `Promise`\<[`DecryptPayloadResult`](../../../../../../../blackbox/namespaces/blackbox/payload.md#decryptpayloadresult)\>

Defined in: [web2/blackbox/payload.ts:123](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/blackbox/payload.ts#L123)

Decrypt a payload using a Web2 session.

Automatically fills in `chainId = -1` and uses the session signer.

#### Parameters

##### params

[`Web2DecryptPayloadParams`](#web2decryptpayloadparams)

Decryption parameters

#### Returns

`Promise`\<[`DecryptPayloadResult`](../../../../../../../blackbox/namespaces/blackbox/payload.md#decryptpayloadresult)\>

Decrypted plaintext message

#### Example

```typescript
const result = await web2.blackbox.payload.decryptPayload({
  session,
  secretId: 42,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient,
});
console.log(result.decryptedMessage);
```
