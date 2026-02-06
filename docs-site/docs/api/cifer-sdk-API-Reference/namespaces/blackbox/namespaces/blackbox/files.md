[**cifer-sdk API Reference v0.3.1**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [blackbox](../../index.md) / blackbox/files

# blackbox/files

## Description

File encryption and decryption via the blackbox API

File operations are asynchronous - they return a job ID that can be
polled for status and downloaded when complete.

## Interfaces

### FileJobResult

Defined in: [blackbox/files.ts:23](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L23)

Result of starting a file encryption/decryption job

#### Properties

##### jobId

> **jobId**: `string`

Defined in: [blackbox/files.ts:25](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L25)

The job ID for polling and download

##### message

> **message**: `string`

Defined in: [blackbox/files.ts:27](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L27)

Success message

***

### FileOperationParams

Defined in: [blackbox/files.ts:33](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L33)

Parameters for file operations

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/files.ts:35](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L35)

Chain ID where the secret exists

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/files.ts:37](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L37)

Secret ID to use

##### file

> **file**: `Blob` \| `File`

Defined in: [blackbox/files.ts:39](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L39)

The file to process

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/files.ts:41](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L41)

Signer for authentication

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/files.ts:43](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L43)

Read client for fetching block numbers

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/files.ts:45](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L45)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/files.ts:47](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L47)

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

### DecryptExistingFileParams

Defined in: [blackbox/files.ts:270](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L270)

Parameters for decrypting an existing encrypted file

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/files.ts:272](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L272)

Chain ID where the secret exists

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/files.ts:274](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L274)

Secret ID used for the original encryption

##### encryptJobId

> **encryptJobId**: `string`

Defined in: [blackbox/files.ts:276](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L276)

Job ID of the completed encrypt job

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/files.ts:278](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L278)

Signer for authentication (must be owner or delegate)

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/files.ts:280](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L280)

Read client for fetching block numbers

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/files.ts:282](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L282)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/files.ts:284](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L284)

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

> **encryptFile**(`params`): `Promise`\<[`FileJobResult`](#filejobresult)\>

Defined in: [blackbox/files.ts:87](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L87)

Encrypt a file using the blackbox API

This is an asynchronous operation. The function returns a job ID
that can be used to poll for status and download the encrypted file
when complete.

The encrypted file is a .cifer ZIP containing encrypted chunks and metadata.

#### Parameters

##### params

[`FileOperationParams`](#fileoperationparams)

File encryption parameters

#### Returns

`Promise`\<[`FileJobResult`](#filejobresult)\>

Job ID for polling and download

#### Example

```typescript
// Start encryption job
const job = await encryptFile({
  chainId: 752025,
  secretId: 123n,
  file: myFile,
  signer,
  readClient,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

console.log('Job ID:', job.jobId);

// Poll for completion
let status = await getStatus(job.jobId, blackboxUrl);
while (status.status !== 'completed') {
  await sleep(2000);
  status = await getStatus(job.jobId, blackboxUrl);
}

// Download encrypted file (no auth required for encrypt jobs)
const encryptedBlob = await download(job.jobId, { blackboxUrl });
```

***

### decryptFile()

> **decryptFile**(`params`): `Promise`\<[`FileJobResult`](#filejobresult)\>

Defined in: [blackbox/files.ts:190](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L190)

Decrypt a file using the blackbox API

This accepts a .cifer file (encrypted ZIP) and starts a decryption job.
The signer must be the secret owner or delegate.

#### Parameters

##### params

[`FileOperationParams`](#fileoperationparams)

File decryption parameters

#### Returns

`Promise`\<[`FileJobResult`](#filejobresult)\>

Job ID for polling and download

#### Example

```typescript
// Upload encrypted file for decryption
const job = await decryptFile({
  chainId: 752025,
  secretId: 123n,
  file: encryptedCiferFile,
  signer,
  readClient,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Poll and download (auth required for decrypt jobs)
// ...
```

***

### decryptExistingFile()

> **decryptExistingFile**(`params`): `Promise`\<[`FileJobResult`](#filejobresult)\>

Defined in: [blackbox/files.ts:309](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/9e54f19f9c97288adfe41940d0eb2984cd23f717/src/blackbox/files.ts#L309)

Decrypt an existing encrypted file without re-uploading

This creates a new decrypt job from a previously completed encrypt job.
The encrypted file is already stored on the blackbox server.

#### Parameters

##### params

[`DecryptExistingFileParams`](#decryptexistingfileparams)

Decryption parameters

#### Returns

`Promise`\<[`FileJobResult`](#filejobresult)\>

Job ID for polling and download

#### Example

```typescript
// Decrypt from an existing encrypt job
const job = await decryptExistingFile({
  chainId: 752025,
  secretId: 123n,
  encryptJobId: 'previous-encrypt-job-id',
  signer,
  readClient,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```
