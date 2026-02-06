[**cifer-sdk API Reference v0.3.0-rc.2**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [blackbox](../../index.md) / blackbox/jobs

# blackbox/jobs

## Description

Job management for asynchronous file operations

## Interfaces

### DownloadParams

Defined in: [blackbox/jobs.ts:107](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L107)

Parameters for job download

#### Properties

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:109](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L109)

Blackbox URL

##### chainId?

> `optional` **chainId**: `number`

Defined in: [blackbox/jobs.ts:111](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L111)

Chain ID (required for decrypt jobs)

##### secretId?

> `optional` **secretId**: `number` \| `bigint`

Defined in: [blackbox/jobs.ts:113](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L113)

Secret ID (required for decrypt jobs)

##### signer?

> `optional` **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:115](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L115)

Signer (required for decrypt jobs)

##### readClient?

> `optional` **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:117](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L117)

Read client (required for decrypt jobs)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:119](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L119)

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

Defined in: [blackbox/jobs.ts:237](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L237)

Parameters for job deletion

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/jobs.ts:239](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L239)

Chain ID

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [blackbox/jobs.ts:241](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L241)

Secret ID

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:243](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L243)

Signer (must be owner or delegate)

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:245](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L245)

Read client

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:247](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L247)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:249](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L249)

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

Defined in: [blackbox/jobs.ts:323](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L323)

Parameters for listing jobs

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/jobs.ts:325](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L325)

Chain ID

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:327](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L327)

Signer

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:329](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L329)

Read client

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:331](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L331)

Blackbox URL

##### includeExpired?

> `optional` **includeExpired**: `boolean`

Defined in: [blackbox/jobs.ts:333](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L333)

Include expired jobs (default: false)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:335](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L335)

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

Defined in: [blackbox/jobs.ts:341](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L341)

Result of listing jobs

#### Properties

##### jobs

> **jobs**: [`JobInfo`](../../../../../index.md#jobinfo)[]

Defined in: [blackbox/jobs.ts:343](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L343)

Array of jobs

##### count

> **count**: `number`

Defined in: [blackbox/jobs.ts:345](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L345)

Total count

##### includeExpired

> **includeExpired**: `boolean`

Defined in: [blackbox/jobs.ts:347](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L347)

Whether expired jobs were included

***

### DataConsumptionParams

Defined in: [blackbox/jobs.ts:469](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L469)

Parameters for data consumption query

#### Properties

##### chainId

> **chainId**: `number`

Defined in: [blackbox/jobs.ts:471](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L471)

Chain ID

##### signer

> **signer**: [`SignerAdapter`](../../../../../index.md#signeradapter)

Defined in: [blackbox/jobs.ts:473](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L473)

Signer

##### readClient

> **readClient**: [`ReadClient`](../../../../../index.md#readclient-1)

Defined in: [blackbox/jobs.ts:475](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L475)

Read client

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [blackbox/jobs.ts:477](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L477)

Blackbox URL

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [blackbox/jobs.ts:479](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L479)

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

Defined in: [blackbox/jobs.ts:41](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L41)

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
const status = await getStatus('job-id', 'https://cifer-blackbox.ternoa.dev:3010');

if (status.status === 'completed') {
  console.log('Job complete! Progress:', status.progress);
} else if (status.status === 'failed') {
  console.error('Job failed:', status.error);
}
```

***

### download()

> **download**(`jobId`, `params`): `Promise`\<`Blob`\>

Defined in: [blackbox/jobs.ts:149](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L149)

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
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Decrypt job (auth required)
const decryptedBlob = await download(decryptJobId, {
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  chainId: 752025,
  secretId: 123n,
  signer,
  readClient,
});
```

***

### deleteJob()

> **deleteJob**(`jobId`, `params`): `Promise`\<`void`\>

Defined in: [blackbox/jobs.ts:269](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L269)

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
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

***

### list()

> **list**(`params`): `Promise`\<[`ListJobsResult`](#listjobsresult)\>

Defined in: [blackbox/jobs.ts:371](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L371)

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
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  includeExpired: false,
});

for (const job of result.jobs) {
  console.log(`${job.id}: ${job.status}`);
}
```

***

### dataConsumption()

> **dataConsumption**(`params`): `Promise`\<[`DataConsumption`](../../../../../index.md#dataconsumption)\>

Defined in: [blackbox/jobs.ts:501](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L501)

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
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

console.log('Encryption used:', usage.encryption.usedGB, 'GB');
console.log('Encryption remaining:', usage.encryption.remainingGB, 'GB');
```

***

### pollUntilComplete()

> **pollUntilComplete**(`jobId`, `blackboxUrl`, `options?`): `Promise`\<[`JobInfo`](../../../../../index.md#jobinfo)\>

Defined in: [blackbox/jobs.ts:604](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/1201f5773b5043db0124e6cc685a9c29cc3e677f/src/blackbox/jobs.ts#L604)

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
