[**cifer-sdk API Reference v0.5.6**](../../../index.md)

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

Defined in: [web2/client.ts:67](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L67)

Configuration for creating a Web2 client.

#### Properties

##### blackboxUrl

> **blackboxUrl**: `string`

Defined in: [web2/client.ts:69](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L69)

Blackbox URL (e.g. 'https://blackbox.cifersecurity.com:3010')

##### readClient?

> `optional` **readClient**: [`ReadClient`](../../../index.md#readclient-1)

Defined in: [web2/client.ts:71](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L71)

Read client for encrypt/decrypt operations (optional, can be passed per-call)

##### fetch()?

> `optional` **fetch**: (`input`, `init?`) => `Promise`\<`Response`\>

Defined in: [web2/client.ts:73](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L73)

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

Defined in: [web2/client.ts:107](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L107)

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

Defined in: [web2/client.ts:109](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L109)

The currently stored session (null if no session has been created yet)

##### blackboxUrl

> `readonly` **blackboxUrl**: `string`

Defined in: [web2/client.ts:111](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L111)

The configured blackbox URL

##### readClient

> `readonly` **readClient**: [`ReadClient`](../../../index.md#readclient-1) \| `undefined`

Defined in: [web2/client.ts:113](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L113)

The configured read client (may be undefined)

##### payload

> **payload**: `object`

Defined in: [web2/client.ts:235](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L235)

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

Defined in: [web2/client.ts:268](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L268)

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

Defined in: [web2/client.ts:310](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L310)

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

Defined in: [web2/client.ts:127](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L127)

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

Defined in: [web2/client.ts:141](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L141)

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

Defined in: [web2/client.ts:148](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L148)

Manually set or replace the stored session.

###### Parameters

###### session

[`Web2Session`](../../../index.md#web2session)

The session to store

###### Returns

`void`

##### getSessionStatus()

> **getSessionStatus**(`params?`): `Promise`\<[`GetSessionStatusResult`](../../../index.md#getsessionstatusresult)\>

Defined in: [web2/client.ts:156](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L156)

Check whether the stored session wallet is still active.

Uses the stored session and blackboxUrl unless overridden.
Does not list secrets. An inactive session throws BlackboxError.

###### Parameters

###### params?

###### session?

[`Web2Session`](../../../index.md#web2session)

###### blackboxUrl?

`string`

###### fetch?

(`input`, `init?`) => `Promise`\<`Response`\>

###### Returns

`Promise`\<[`GetSessionStatusResult`](../../../index.md#getsessionstatusresult)\>

##### createSecret()

> **createSecret**(`params?`): `Promise`\<[`CreateWeb2SecretResult`](../../../index.md#createweb2secretresult)\>

Defined in: [web2/client.ts:171](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L171)

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

Defined in: [web2/client.ts:182](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L182)

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

Defined in: [web2/client.ts:197](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L197)

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

Defined in: [web2/client.ts:215](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L215)

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

Defined in: [web2/client.ts:229](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L229)

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

Defined in: [web2/client.ts:415](https://github.com/cifer-security/CIFER-sdk/blob/083a5f3814be5590df80ee61a53afe79b7d3cf52/src/web2/client.ts#L415)

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
