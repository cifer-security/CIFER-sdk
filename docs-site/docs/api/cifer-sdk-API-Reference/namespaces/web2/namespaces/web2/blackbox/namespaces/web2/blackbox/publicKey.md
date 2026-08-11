[**cifer-sdk API Reference v0.5.4**](../../../../../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../../../../../index.md) / [web2](../../../../../../index.md) / [web2/blackbox](../../../index.md) / web2/blackbox/publicKey

# web2/blackbox/publicKey

## Description

Web2 wrapper for fetching secret public keys

## Interfaces

### Web2FetchSecretPublicKeyParams

Defined in: [web2/blackbox/publicKey.ts:18](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L18)

Parameters for unsigned Web2 public key fetch

#### Properties

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/publicKey.ts:20](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L20)

Secret ID to fetch

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/publicKey.ts:22](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L22)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/publicKey.ts:24](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L24)

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

### Web2GetSecretPublicKeyParams

Defined in: [web2/blackbox/publicKey.ts:45](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L45)

Parameters for Web2 public key fetch

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/publicKey.ts:47](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L47)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/publicKey.ts:49](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L49)

Secret ID to fetch

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/publicKey.ts:51](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L51)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/publicKey.ts:53](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L53)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/publicKey.ts:55](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L55)

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

### fetchSecretPublicKey()

> **fetchSecretPublicKey**(`params`): `Promise`\<[`GetSecretPublicKeyResult`](../../../../../../../blackbox/namespaces/blackbox/publicKey.md#getsecretpublickeyresult)\>

Defined in: [web2/blackbox/publicKey.ts:31](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L31)

Fetch a secret's ML-KEM public key using unsigned GET (Web2 chainId=-1).
No session required.

#### Parameters

##### params

[`Web2FetchSecretPublicKeyParams`](#web2fetchsecretpublickeyparams)

#### Returns

`Promise`\<[`GetSecretPublicKeyResult`](../../../../../../../blackbox/namespaces/blackbox/publicKey.md#getsecretpublickeyresult)\>

***

### ~~getSecretPublicKey()~~

> **getSecretPublicKey**(`params`): `Promise`\<[`GetSecretPublicKeyResult`](../../../../../../../blackbox/namespaces/blackbox/publicKey.md#getsecretpublickeyresult)\>

Defined in: [web2/blackbox/publicKey.ts:63](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/blackbox/publicKey.ts#L63)

Fetch a secret's ML-KEM public key using a Web2 session.

#### Parameters

##### params

[`Web2GetSecretPublicKeyParams`](#web2getsecretpublickeyparams)

#### Returns

`Promise`\<[`GetSecretPublicKeyResult`](../../../../../../../blackbox/namespaces/blackbox/publicKey.md#getsecretpublickeyresult)\>

#### Deprecated

Use [fetchSecretPublicKey](#fetchsecretpublickey) — signed POST is legacy; prefer unsigned GET.
