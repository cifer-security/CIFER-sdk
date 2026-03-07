[**cifer-sdk API Reference v0.3.1**](../../../../../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../../../../../index.md) / [web2](../../../../../../index.md) / [web2/blackbox](../../../index.md) / web2/blackbox/jobs

# web2/blackbox/jobs

## Description

Web2 wrappers for job management

Thin wrappers around the core `blackbox.jobs.*` functions that
automatically fill in Web2-specific values (chainId, signer, etc.).

Also re-exports `getStatus` and `pollUntilComplete` directly since
they don't require session authentication.

## Interfaces

### Web2DownloadParams

Defined in: [web2/blackbox/jobs.ts:34](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L34)

Parameters for Web2 job download (decrypt jobs).

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/jobs.ts:36](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L36)

Active Web2 session (required for decrypt job downloads)

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/jobs.ts:38](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L38)

Secret ID (required for decrypt job downloads)

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/jobs.ts:40](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L40)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/jobs.ts:42](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L42)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/jobs.ts:44](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L44)

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

### Web2DeleteJobParams

Defined in: [web2/blackbox/jobs.ts:79](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L79)

Parameters for Web2 job deletion.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/jobs.ts:81](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L81)

Active Web2 session

##### secretId

> **secretId**: `number` \| `bigint`

Defined in: [web2/blackbox/jobs.ts:83](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L83)

Secret ID

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/jobs.ts:85](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L85)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/jobs.ts:87](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L87)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/jobs.ts:89](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L89)

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

### Web2ListJobsParams

Defined in: [web2/blackbox/jobs.ts:119](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L119)

Parameters for Web2 job listing.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/jobs.ts:121](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L121)

Active Web2 session

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/jobs.ts:123](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L123)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/jobs.ts:125](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L125)

Read client for freshness

##### includeExpired?

> `optional` **includeExpired**: `boolean`

Defined in: [web2/blackbox/jobs.ts:127](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L127)

Include expired jobs (default: false)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/jobs.ts:129](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L129)

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

### Web2DataConsumptionParams

Defined in: [web2/blackbox/jobs.ts:158](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L158)

Parameters for Web2 data consumption query.

#### Properties

##### session

> **session**: [`Web2Session`](../../../../../../../../../index.md#web2session)

Defined in: [web2/blackbox/jobs.ts:160](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L160)

Active Web2 session

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/blackbox/jobs.ts:162](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L162)

Blackbox URL

##### readClient

> **readClient**: [`ReadClient`](../../../../../../../../../index.md#readclient-1)

Defined in: [web2/blackbox/jobs.ts:164](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L164)

Read client for freshness

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/blackbox/jobs.ts:166](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L166)

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

### download()

> **download**(`jobId`, `params`): `Promise`\<`Blob`\>

Defined in: [web2/blackbox/jobs.ts:58](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L58)

Download a completed job result using a Web2 session.

For encrypt jobs, authentication is not required — you can use
`blackbox.jobs.download` directly. This wrapper is for decrypt
jobs that need session-based auth.

#### Parameters

##### jobId

`string`

The job ID

##### params

[`Web2DownloadParams`](#web2downloadparams)

Download parameters

#### Returns

`Promise`\<`Blob`\>

The file as a Blob

***

### deleteJob()

> **deleteJob**(`jobId`, `params`): `Promise`\<`void`\>

Defined in: [web2/blackbox/jobs.ts:98](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L98)

Delete a job using a Web2 session.

#### Parameters

##### jobId

`string`

The job ID to delete

##### params

[`Web2DeleteJobParams`](#web2deletejobparams)

Delete parameters

#### Returns

`Promise`\<`void`\>

***

### list()

> **list**(`params`): `Promise`\<[`ListJobsResult`](../../../../../../../blackbox/namespaces/blackbox/jobs.md#listjobsresult)\>

Defined in: [web2/blackbox/jobs.ts:138](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L138)

List all jobs for the authenticated Web2 principal.

#### Parameters

##### params

[`Web2ListJobsParams`](#web2listjobsparams)

List parameters

#### Returns

`Promise`\<[`ListJobsResult`](../../../../../../../blackbox/namespaces/blackbox/jobs.md#listjobsresult)\>

Array of job info

***

### dataConsumption()

> **dataConsumption**(`params`): `Promise`\<[`DataConsumption`](../../../../../../../../../index.md#dataconsumption)\>

Defined in: [web2/blackbox/jobs.ts:175](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/0a837c3346c5c5087534315fa77c34b851d312a9/src/web2/blackbox/jobs.ts#L175)

Get data consumption/usage statistics for the authenticated Web2 principal.

#### Parameters

##### params

[`Web2DataConsumptionParams`](#web2dataconsumptionparams)

Query parameters

#### Returns

`Promise`\<[`DataConsumption`](../../../../../../../../../index.md#dataconsumption)\>

Usage statistics

## References

### getStatus

Re-exports [getStatus](../../../../../../../blackbox/namespaces/blackbox/jobs.md#getstatus)

***

### pollUntilComplete

Re-exports [pollUntilComplete](../../../../../../../blackbox/namespaces/blackbox/jobs.md#polluntilcomplete)
