[**cifer-sdk API Reference v0.5.4**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [blackbox](../../index.md) / blackbox/publicKey

# blackbox/publicKey

## Description

Fetch ML-KEM public keys from the blackbox local store

## Interfaces

### GetSecretPublicKeyParams

Defined in: [blackbox/publicKey.ts:16](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L16)

Parameters for fetching a secret's public key

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/publicKey.ts:18](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L18)

Chain ID where the secret exists

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/publicKey.ts:20](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L20)

Secret ID to fetch

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/publicKey.ts:22](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L22)

Signer for authentication

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/publicKey.ts:24](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L24)

Read client for fetching block numbers

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/publicKey.ts:26](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L26)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/publicKey.ts:28](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L28)

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

### FetchSecretPublicKeyParams

Defined in: [blackbox/publicKey.ts:34](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L34)

Parameters for unsigned public key fetch

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/publicKey.ts:36](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L36)

Chain ID where the secret exists (`-1` for Web2)

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/publicKey.ts:38](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L38)

Secret ID to fetch

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/publicKey.ts:40](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L40)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/publicKey.ts:42](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L42)

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

### GetSecretPublicKeyResult

Defined in: [blackbox/publicKey.ts:48](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L48)

Result of fetching a secret's public key

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/publicKey.ts:50](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L50)

Chain ID

##### secretId

> **secretId**: `number`

Defined in: [blackbox/publicKey.ts:52](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L52)

Secret ID

##### publicKey

> **publicKey**: `string`

Defined in: [blackbox/publicKey.ts:54](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L54)

Base64 ML-KEM-768 public key

## Functions

### fetchSecretPublicKey()

> **fetchSecretPublicKey**(`params`): `Promise`\<[`GetSecretPublicKeyResult`](#getsecretpublickeyresult)\>

Defined in: [blackbox/publicKey.ts:65](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L65)

Fetch a secret's ML-KEM public key via unsigned GET.

Preferred over [getSecretPublicKey](#getsecretpublickey).

#### Parameters

##### params

[`FetchSecretPublicKeyParams`](#fetchsecretpublickeyparams)

Request parameters

#### Returns

`Promise`\<[`GetSecretPublicKeyResult`](#getsecretpublickeyresult)\>

Public key and identifiers

***

### ~~getSecretPublicKey()~~

> **getSecretPublicKey**(`params`): `Promise`\<[`GetSecretPublicKeyResult`](#getsecretpublickeyresult)\>

Defined in: [blackbox/publicKey.ts:108](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/blackbox/publicKey.ts#L108)

Fetch a secret's ML-KEM public key from the blackbox API.

Auth format: `chainId_secretId_signer_blockNumber` (same as file operations).

#### Parameters

##### params

[`GetSecretPublicKeyParams`](#getsecretpublickeyparams)

Request parameters

#### Returns

`Promise`\<[`GetSecretPublicKeyResult`](#getsecretpublickeyresult)\>

Public key and identifiers

#### Deprecated

Use [fetchSecretPublicKey](#fetchsecretpublickey) — signed POST is legacy; prefer unsigned GET.
