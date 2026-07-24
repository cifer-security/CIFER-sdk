[**cifer-sdk API Reference v0.5.2**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [blackbox](../../index.md) / blackbox/jobs

# blackbox/jobs

## Description

Job management for asynchronous file operations

## Interfaces

### DownloadParams

Defined in: [blackbox/jobs.ts:111](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L111)

Parameters for job download

#### Properties

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:113](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L113)

Blackbox URL

##### chainId?

> `optional` **chainId**: `number`

Defined in: [blackbox/jobs.ts:115](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L115)

Chain ID (required for decrypt jobs)

##### secretId?

> `optional` **secretId**: `number` \| `bigint`

Defined in: [blackbox/jobs.ts:117](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L117)

Secret ID (required for decrypt jobs)

##### signer?

> `optional` **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:119](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L119)

Signer (required for decrypt jobs)

##### readClient?

> `optional` **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:121](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L121)

Read client (required for decrypt jobs)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:123](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L123)

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

### DeleteParams

Defined in: [blackbox/jobs.ts:241](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L241)

Parameters for job deletion

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/jobs.ts:243](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L243)

Chain ID

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/jobs.ts:245](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L245)

Secret ID

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:247](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L247)

Signer (must be owner or delegate)

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:249](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L249)

Read client

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:251](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L251)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:253](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L253)

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

### ListJobsParams

Defined in: [blackbox/jobs.ts:327](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L327)

Parameters for listing jobs

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/jobs.ts:329](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L329)

Chain ID

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:331](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L331)

Signer

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:333](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L333)

Read client

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:335](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L335)

Blackbox URL

##### includeExpired?

> `optional` **includeExpired**: `boolean`

Defined in: [blackbox/jobs.ts:337](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L337)

Include expired jobs (default: false)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:339](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L339)

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

### ListJobsResult

Defined in: [blackbox/jobs.ts:345](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L345)

Result of listing jobs

#### Properties

##### jobs

> **jobs**: [`JobInfo`](../../../../../index.md#jobinfo)[]

Defined in: [blackbox/jobs.ts:347](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L347)

Array of jobs

##### count

> **count**: `number`

Defined in: [blackbox/jobs.ts:349](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L349)

Total count

##### includeExpired

> **includeExpired**: `boolean`

Defined in: [blackbox/jobs.ts:351](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L351)

Whether expired jobs were included

***

### DataConsumptionParams

Defined in: [blackbox/jobs.ts:477](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L477)

Parameters for data consumption query

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/jobs.ts:479](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L479)

Chain ID

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:481](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L481)

Signer

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:483](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L483)

Read client

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:485](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L485)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:487](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L487)

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

### getStatus()

> **getStatus**(`jobId`, `blackboxUrl`, `options?`): `Promise`\<[`JobInfo`](../../../../../index.md#jobinfo)\>

Defined in: [blackbox/jobs.ts:41](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L41)

Get the status of a job

This endpoint does not require authentication.

#### Parameters

##### jobId

`string`

The job ID to check

##### blackboxUrl

`string`

Blackbox URL

##### options?

Optional configuration

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

#### Returns

`Promise`\<[`JobInfo`](../../../../../index.md#jobinfo)\>

Job status information

#### Example

```typescript
const status = await getStatus('job-id', 'https://blackbox.cifersecurity.com:3010');

if (status.status === 'completed') {
  console.log('Job complete! Progress:', status.progress);
} else if (status.status === 'failed') {
  console.error('Job failed:', status.error);
}
```

***

### download()

> **download**(`jobId`, `params`): `Promise`\<`Blob`\>

Defined in: [blackbox/jobs.ts:153](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L153)

Download the result of a completed job

For encrypt jobs, no authentication is required.
For decrypt jobs, the signer must be the owner or delegate.

#### Parameters

##### jobId

`string`

The job ID to download

##### params

[`DownloadParams`](#downloadparams)

Download parameters

#### Returns

`Promise`\<`Blob`\>

The file as a Blob

#### Example

```typescript
// Encrypt job (no auth)
const encryptedBlob = await download(encryptJobId, {
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

// Decrypt job (auth required)
const decryptedBlob = await download(decryptJobId, {
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  chainId: 752025,
  secretId: 123n,
  signer,
  readClient,
});
```

***

### deleteJob()

> **deleteJob**(`jobId`, `params`): `Promise`\<`void`\>

Defined in: [blackbox/jobs.ts:273](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L273)

Delete a job (mark for cleanup)

#### Parameters

##### jobId

`string`

The job ID to delete

##### params

[`DeleteParams`](#deleteparams)

Delete parameters

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
await deleteJob('job-id', {
  chainId: 752025,
  secretId: 123n,
  signer,
  readClient,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
```

***

### list()

> **list**(`params`): `Promise`\<[`ListJobsResult`](#listjobsresult)\>

Defined in: [blackbox/jobs.ts:375](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L375)

List all jobs for the authenticated wallet

#### Parameters

##### params

[`ListJobsParams`](#listjobsparams)

List parameters

#### Returns

`Promise`\<[`ListJobsResult`](#listjobsresult)\>

Array of job info

#### Example

```typescript
const result = await list({
  chainId: 752025,
  signer,
  readClient,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  includeExpired: false,
});

for (const job of result.jobs) {
  console.log(`${job.id}: ${job.status}`);
}
```

***

### dataConsumption()

> **dataConsumption**(`params`): `Promise`\<[`DataConsumption`](../../../../../index.md#dataconsumption)\>

Defined in: [blackbox/jobs.ts:511](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L511)

Get data consumption/usage statistics for the authenticated wallet

#### Parameters

##### params

[`DataConsumptionParams`](#dataconsumptionparams)

Query parameters

#### Returns

`Promise`\<[`DataConsumption`](../../../../../index.md#dataconsumption)\>

Usage statistics

#### Example

```typescript
const usage = await dataConsumption({
  chainId: 752025,
  signer,
  readClient,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

console.log('User:', usage.userId, '(', usage.userType, ')');
console.log('Plan:', usage.planId, '— cycle:', usage.cycleType);
console.log('Encryption used:', usage.encryption.usedGB, 'GB');
console.log('Encryption remaining:', usage.encryption.remainingGB, 'GB');
```

***

### pollUntilComplete()

> **pollUntilComplete**(`jobId`, `blackboxUrl`, `options?`): `Promise`\<[`JobInfo`](../../../../../index.md#jobinfo)\>

Defined in: [blackbox/jobs.ts:628](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/blackbox/jobs.ts#L628)

Poll for job completion

This is a convenience helper that polls getStatus until the job
reaches a terminal state (completed, failed, or expired).

#### Parameters

##### jobId

`string`

The job ID to poll

##### blackboxUrl

`string`

Blackbox URL

##### options?

Polling options

###### intervalMs?

`number`

Polling interval in milliseconds (default: 2000)

###### maxAttempts?

`number`

Maximum polling attempts (default: 60)

###### onProgress?

(`job`) => `void`

Progress callback

###### abortSignal?

`AbortSignal`

Abort signal

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

Custom fetch implementation

#### Returns

`Promise`\<[`JobInfo`](../../../../../index.md#jobinfo)\>

Final job status

#### Example

```typescript
const finalStatus = await pollUntilComplete('job-id', blackboxUrl, {
  intervalMs: 2000,
  maxAttempts: 60,
  onProgress: (job) => console.log(`Progress: ${job.progress}%`),
});

if (finalStatus.status === 'completed') {
  console.log('Job completed successfully!');
}
```
