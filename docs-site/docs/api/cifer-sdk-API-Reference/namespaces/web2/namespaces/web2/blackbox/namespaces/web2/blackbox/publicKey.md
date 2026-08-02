[**cifer-sdk API Reference v0.5.3**](../../../../../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../../../../../index.md) / [web2](../../../../../../index.md) / [web2/blackbox](../../../index.md) / web2/blackbox/publicKey

# web2/blackbox/publicKey

## Description

Web2 wrapper for fetching secret public keys

## Interfaces

### Web2GetSecretPublicKeyParams

Defined in: [web2/blackbox/publicKey.ts:17](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/blackbox/publicKey.ts#L17)

Parameters for Web2 public key fetch

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/publicKey.ts:19](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/blackbox/publicKey.ts#L19)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/publicKey.ts:21](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/blackbox/publicKey.ts#L21)

Secret ID to fetch

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/publicKey.ts:23](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/blackbox/publicKey.ts#L23)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/publicKey.ts:25](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/blackbox/publicKey.ts#L25)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/publicKey.ts:27](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/blackbox/publicKey.ts#L27)

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

### getSecretPublicKey()

> **getSecretPublicKey**(`params`): `Promise`\<[`GetSecretPublicKeyResult`](../../../../../../../blackbox/namespaces/blackbox/publicKey.md#getsecretpublickeyresult)\>

Defined in: [web2/blackbox/publicKey.ts:33](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/blackbox/publicKey.ts#L33)

Fetch a secret's ML-KEM public key using a Web2 session.

#### Parameters

##### params

[`Web2GetSecretPublicKeyParams`](#web2getsecretpublickeyparams)

#### Returns

`Promise`\<[`GetSecretPublicKeyResult`](../../../../../../../blackbox/namespaces/blackbox/publicKey.md#getsecretpublickeyresult)\>
