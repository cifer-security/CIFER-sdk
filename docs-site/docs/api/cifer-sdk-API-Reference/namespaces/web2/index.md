[**cifer-sdk API Reference v0.5.2**](../../../index.md)

***

[cifer-sdk API Reference](../../../index.md) / web2

# web2

Web2 namespace for email-based registration, session management,
and session-first blackbox operations.

## Remarks

This namespace provides:
- `auth`: Registration, email verification, key registration
- `session`: Managed and existing-key session creation
- `secret`: Web2 secret creation and listing
- `delegate`: Delegate management
- `permit`: Permit requests (rotate/transfer/delegate)
- `principal`: Principal lookup by email
- `blackbox`: Session-first wrappers for payload/file/job operations

## Namespaces

- [web2/auth](namespaces/web2/auth.md)
- [web2/blackbox](namespaces/web2/blackbox/index.md)
- [web2/delegate](namespaces/web2/delegate.md)
- [web2/permit](namespaces/web2/permit.md)
- [web2/principal](namespaces/web2/principal.md)
- [web2/secret](namespaces/web2/secret.md)
- [web2/session](namespaces/web2/session.md)

## Interfaces

### Web2ClientConfig

Defined in: [web2/client.ts:66](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L66)

Configuration for creating a Web2 client.

#### Properties

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/client.ts:68](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L68)

Blackbox URL (e.g. 'https://blackbox.cifersecurity.com:3010')

##### readClient?

> `optional` **readClient**: [`ReadClient`](../../../index.md#readclient-1)

Defined in: [web2/client.ts:70](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L70)

Read client for encrypt/decrypt operations (optional, can be passed per-call)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/client.ts:72](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L72)

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

### Web2Client

Defined in: [web2/client.ts:106](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L106)

Web2 client with auto-stored session and defaults.

#### Remarks

Created via [createClient](#createclient). Wraps the stateless `web2.*` functions
with stored `session`, `blackboxUrl`, and `readClient` so you don't need
to pass them on every call.

After calling `createManagedSession()` or `useExistingSessionKey()`,
the session is stored internally and used for all subsequent operations.
You can still override any default per-call.

#### Example

```typescript
const client = web2.createClient({ blackboxUrl, readClient });

await client.createManagedSession({ principalId, ed25519Signer });

const secret = await client.createSecret();
const encrypted = await client.payload.encryptPayload({
  secretId: secret.secretId,
  plaintext: 'Hello!',
});
```

#### Properties

##### session

> `readonly` **session**: [`Web2Session`](../../../index.md#web2session) \| `null`

Defined in: [web2/client.ts:108](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L108)

The currently stored session (null if no session has been created yet)

##### blackboxUrl

> `readonly` **blackboxUrl**: `string`

Defined in: [web2/client.ts:110](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L110)

The configured blackbox URL

##### readClient

> `readonly` **readClient**: [`ReadClient`](../../../index.md#readclient-1) \| `undefined`

Defined in: [web2/client.ts:112](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L112)

The configured read client (may be undefined)

##### payload

> **payload**: `object`

Defined in: [web2/client.ts:222](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L222)

###### encryptPayload()

> **encryptPayload**(`params`): `Promise`\<[`EncryptPayloadResult`](../blackbox/namespaces/blackbox/payload.md#encryptpayloadresult)\>

Encrypt a payload using the stored session.

###### Parameters

###### params

###### secretId

`number` \| `bigint`

###### plaintext

`string`

###### outputFormat?

[`OutputFormat`](../../../index.md#outputformat)

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`EncryptPayloadResult`](../blackbox/namespaces/blackbox/payload.md#encryptpayloadresult)\>

###### decryptPayload()

> **decryptPayload**(`params`): `Promise`\<[`DecryptPayloadResult`](../blackbox/namespaces/blackbox/payload.md#decryptpayloadresult)\>

Decrypt a payload using the stored session.

###### Parameters

###### params

###### secretId

`number` \| `bigint`

###### encryptedMessage

`string`

###### cifer

`string`

###### inputFormat?

[`InputFormat`](../../../index.md#inputformat)

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`DecryptPayloadResult`](../blackbox/namespaces/blackbox/payload.md#decryptpayloadresult)\>

##### files

> **files**: `object`

Defined in: [web2/client.ts:255](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L255)

###### encryptFile()

> **encryptFile**(`params`): `Promise`\<[`FileJobResult`](../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Encrypt a file using the stored session.

###### Parameters

###### params

###### secretId

`number` \| `bigint`

###### file

`Blob` \| `File`

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`FileJobResult`](../blackbox/namespaces/blackbox/files.md#filejobresult)\>

###### decryptFile()

> **decryptFile**(`params`): `Promise`\<[`FileJobResult`](../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Decrypt a file using the stored session.

###### Parameters

###### params

###### secretId

`number` \| `bigint`

###### file

`Blob` \| `File`

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`FileJobResult`](../blackbox/namespaces/blackbox/files.md#filejobresult)\>

###### decryptExistingFile()

> **decryptExistingFile**(`params`): `Promise`\<[`FileJobResult`](../blackbox/namespaces/blackbox/files.md#filejobresult)\>

Decrypt an existing file using the stored session.

###### Parameters

###### params

###### secretId

`number` \| `bigint`

###### encryptJobId

`string`

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`FileJobResult`](../blackbox/namespaces/blackbox/files.md#filejobresult)\>

##### jobs

> **jobs**: `object`

Defined in: [web2/client.ts:297](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L297)

###### getStatus()

> **getStatus**(`jobId`, `blackboxUrl?`, `options?`): `Promise`\<[`JobInfo`](../../../index.md#jobinfo)\>

Get job status (no session needed).

###### Parameters

###### jobId

`string`

###### blackboxUrl?

`string`

###### options?

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`JobInfo`](../../../index.md#jobinfo)\>

###### pollUntilComplete()

> **pollUntilComplete**(`jobId`, `blackboxUrl?`, `options?`): `Promise`\<[`JobInfo`](../../../index.md#jobinfo)\>

Poll until a job completes (no session needed).

###### Parameters

###### jobId

`string`

###### blackboxUrl?

`string`

###### options?

###### intervalMs?

`number`

###### maxAttempts?

`number`

###### onProgress?

(`job`) => `void`

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`JobInfo`](../../../index.md#jobinfo)\>

###### download()

> **download**(`jobId`, `params`): `Promise`\<`Blob`\>

Download a completed job (session needed for decrypt jobs).

###### Parameters

###### jobId

`string`

###### params

###### secretId

`number` \| `bigint`

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<`Blob`\>

###### deleteJob()

> **deleteJob**(`jobId`, `params`): `Promise`\<`void`\>

Delete a job (session needed).

###### Parameters

###### jobId

`string`

###### params

###### secretId

`number` \| `bigint`

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<`void`\>

###### list()

> **list**(`params?`): `Promise`\<[`ListJobsResult`](../blackbox/namespaces/blackbox/jobs.md#listjobsresult)\>

List all jobs (session needed).

###### Parameters

###### params?

###### includeExpired?

`boolean`

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`ListJobsResult`](../blackbox/namespaces/blackbox/jobs.md#listjobsresult)\>

###### dataConsumption()

> **dataConsumption**(`params?`): `Promise`\<[`DataConsumption`](../../../index.md#dataconsumption)\>

Get data consumption statistics (session needed).

###### Parameters

###### params?

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### readClient?

[`ReadClient`](../../../index.md#readclient-1)

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`DataConsumption`](../../../index.md#dataconsumption)\>

#### Methods

##### createManagedSession()

> **createManagedSession**(`params`): `Promise`\<[`Web2Session`](../../../index.md#web2session)\>

Defined in: [web2/client.ts:126](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L126)

Create a managed session and store it in the client.

The `blackboxUrl` is automatically filled from the client config.

###### Parameters

###### params

Session parameters (blackboxUrl is optional, defaults to client config)

###### principalId

`string`

###### ed25519Signer

[`Ed25519Signer`](../../../index.md#ed25519signer)

###### ttl?

`number`

###### blackboxUrl?

`string`

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`Web2Session`](../../../index.md#web2session)\>

The created Web2Session (also stored internally)

##### useExistingSessionKey()

> **useExistingSessionKey**(`params`): [`Web2Session`](../../../index.md#web2session)

Defined in: [web2/client.ts:140](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L140)

Use an existing session key and store it in the client.

###### Parameters

###### params

[`UseExistingSessionKeyParams`](../../../index.md#useexistingsessionkeyparams)

Existing session key parameters

###### Returns

[`Web2Session`](../../../index.md#web2session)

The Web2Session (also stored internally)

##### setSession()

> **setSession**(`session`): `void`

Defined in: [web2/client.ts:147](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L147)

Manually set or replace the stored session.

###### Parameters

###### session

[`Web2Session`](../../../index.md#web2session)

The session to store

###### Returns

`void`

##### createSecret()

> **createSecret**(`params?`): `Promise`\<[`CreateWeb2SecretResult`](../../../index.md#createweb2secretresult)\>

Defined in: [web2/client.ts:158](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L158)

Create a new Web2 secret.

Uses the stored session and blackboxUrl unless overridden.

###### Parameters

###### params?

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`CreateWeb2SecretResult`](../../../index.md#createweb2secretresult)\>

##### listSecrets()

> **listSecrets**(`params?`): `Promise`\<[`ListWeb2SecretsResult`](../../../index.md#listweb2secretsresult)\>

Defined in: [web2/client.ts:169](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L169)

List all Web2 secrets for the current principal.

Uses the stored session and blackboxUrl unless overridden.

###### Parameters

###### params?

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`ListWeb2SecretsResult`](../../../index.md#listweb2secretsresult)\>

##### setDelegate()

> **setDelegate**(`params`): `Promise`\<[`SetWeb2DelegateResult`](../../../index.md#setweb2delegateresult)\>

Defined in: [web2/client.ts:184](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L184)

Set or remove a delegate for a Web2 secret.

Uses the stored session and blackboxUrl unless overridden.

###### Parameters

###### params

###### secretId

`number` \| `bigint`

###### delegatePrincipalId

`string`

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`SetWeb2DelegateResult`](../../../index.md#setweb2delegateresult)\>

##### requestPermit()

> **requestPermit**(`params`): `Promise`\<[`RequestPermitResult`](../../../index.md#requestpermitresult)\>

Defined in: [web2/client.ts:202](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L202)

Request a permit (rotate, transfer, or delegate).

For transfer/delegate permits, uses the stored session unless overridden.
For rotate permits, no session is needed (uses email+password).

###### Parameters

###### params

`Omit`\<[`RequestRotatePermitParams`](../../../index.md#requestrotatepermitparams), `"blackboxUrl"`\> & `object` | `Omit`\<[`RequestTransferOrDelegatePermitParams`](../../../index.md#requesttransferordelegatepermitparams), `"blackboxUrl"` \| `"session"`\> & `object`

###### Returns

`Promise`\<[`RequestPermitResult`](../../../index.md#requestpermitresult)\>

##### getByEmail()

> **getByEmail**(`email`, `blackboxUrl?`, `options?`): `Promise`\<[`PrincipalByEmailResult`](../../../index.md#principalbyemailresult)\>

Defined in: [web2/client.ts:216](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L216)

Look up a principal by email address.

Uses the stored blackboxUrl unless overridden.

###### Parameters

###### email

`string`

###### blackboxUrl?

`string`

###### options?

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`PrincipalByEmailResult`](../../../index.md#principalbyemailresult)\>

## Functions

### createClient()

> **createClient**(`config`): [`Web2Client`](#web2client)

Defined in: [web2/client.ts:402](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/81dfcfc8f2b220a64e11e0528b01aa27031bb0a8/src/web2/client.ts#L402)

Create a Web2 client with auto-stored session and defaults.

#### Parameters

##### config

[`Web2ClientConfig`](#web2clientconfig)

Client configuration

#### Returns

[`Web2Client`](#web2client)

A configured Web2Client instance

#### Remarks

The client wraps all `web2.*` functions, storing `session`, `blackboxUrl`,
and `readClient` internally. After creating a session via
`createManagedSession()` or `useExistingSessionKey()`, all subsequent
calls automatically use the stored session.

The existing stateless `web2.*` functions remain available for advanced
use cases that need explicit parameter passing.

#### Example

```typescript
import { web2 } from 'cifer-sdk';

const client = web2.createClient({
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});

// Session is auto-stored
await client.createManagedSession({
  principalId: reg.principalId,
  ed25519Signer,
});

// No session or blackboxUrl needed!
const secret = await client.createSecret();

const encrypted = await client.payload.encryptPayload({
  secretId: secret.secretId,
  plaintext: 'Hello Web2!',
});
```
