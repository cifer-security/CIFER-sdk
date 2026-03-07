[**cifer-sdk API Reference v0.3.1**](../../../../../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../../../../../index.md) / [web2](../../../../../../index.md) / [web2/blackbox](../../../index.md) / web2/blackbox/files

# web2/blackbox/files

## Description

Web2 wrappers for file encryption/decryption

Thin wrappers around the core `blackbox.files.*` functions that
automatically fill in Web2-specific values (chainId, signer, etc.).

## Interfaces

### Web2EncryptFileParams

Defined in: [web2/blackbox/files.ts:24](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L24)

Parameters for Web2 file encryption.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/files.ts:26](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L26)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/files.ts:28](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L28)

Secret ID to use for encryption

##### file

> **file**: `Blob` \| `File`

Defined in: [web2/blackbox/files.ts:30](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L30)

The file to encrypt

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/files.ts:32](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L32)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/files.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L34)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/files.ts:36](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L36)

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

### Web2DecryptFileParams

Defined in: [web2/blackbox/files.ts:77](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L77)

Parameters for Web2 file decryption.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/files.ts:79](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L79)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/files.ts:81](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L81)

Secret ID used for encryption

##### file

> **file**: `Blob` \| `File`

Defined in: [web2/blackbox/files.ts:83](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L83)

The .cifer file to decrypt

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/files.ts:85](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L85)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/files.ts:87](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L87)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/files.ts:89](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L89)

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

### Web2DecryptExistingFileParams

Defined in: [web2/blackbox/files.ts:119](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L119)

Parameters for Web2 decrypt-existing-file.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/files.ts:121](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L121)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/files.ts:123](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L123)

Secret ID used for the original encryption

##### encryptJobId

> **encryptJobId**: `string`

Defined in: [web2/blackbox/files.ts:125](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L125)

Job ID of the completed encrypt job

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/files.ts:127](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L127)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/files.ts:129](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L129)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/files.ts:131](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L131)

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

### encryptFile()

> **encryptFile**(`params`): `Promise`\<[`FileJobResult`](../../../../../../../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Defined in: [web2/blackbox/files.ts:56](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L56)

Encrypt a file using a Web2 session.

#### Parameters

##### params

[`Web2EncryptFileParams`](#web2encryptfileparams)

Encryption parameters

#### Returns

`Promise`\<[`FileJobResult`](../../../../../../../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Job ID for polling and download

#### Example

```typescript
const job = await web2.blackbox.files.encryptFile({
  session,
  secretId: 42,
  file: myFile,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  readClient,
});
```

***

### decryptFile()

> **decryptFile**(`params`): `Promise`\<[`FileJobResult`](../../../../../../../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Defined in: [web2/blackbox/files.ts:98](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L98)

Decrypt a file using a Web2 session.

#### Parameters

##### params

[`Web2DecryptFileParams`](#web2decryptfileparams)

Decryption parameters

#### Returns

`Promise`\<[`FileJobResult`](../../../../../../../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Job ID for polling and download

***

### decryptExistingFile()

> **decryptExistingFile**(`params`): `Promise`\<[`FileJobResult`](../../../../../../../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Defined in: [web2/blackbox/files.ts:140](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/files.ts#L140)

Decrypt an existing file using a Web2 session.

#### Parameters

##### params

[`Web2DecryptExistingFileParams`](#web2decryptexistingfileparams)

Decryption parameters

#### Returns

`Promise`\<[`FileJobResult`](../../../../../../../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Job ID for polling and download
