[**cifer-sdk API Reference v0.5.3**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/session

# web2/session

## Description

Web2 session management

Provides two session modes:
- **Managed session**: SDK has Ed25519 key, can create and renew sessions
- **Existing session key**: SDK only has session EOA private key

## Functions

### createManagedSession()

> **createManagedSession**(`params`): `Promise`\<[`Web2Session`](../../../../../index.md#web2session)\>

Defined in: [web2/session.ts:139](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/session.ts#L139)

Create a managed Web2 session.

Generates an ephemeral EOA keypair and uses the provided Ed25519 signer
to authenticate with the blackbox. The returned session supports
automatic renewal via `ensureValid()`.

#### Parameters

##### params

[`CreateManagedSessionParams`](../../../../../index.md#createmanagedsessionparams)

Session creation parameters

#### Returns

`Promise`\<[`Web2Session`](../../../../../index.md#web2session)\>

A managed Web2Session

#### Example

```typescript
const session = await web2.session.createManagedSession({
  principalId: '550e8400-...',
  ed25519Signer: myEd25519Signer,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  ttl: 900000, // 15 minutes
});

// Use the session for encryption
const encrypted = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: 42,
  plaintext: 'Hello!',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});
```

***

### useExistingSessionKey()

> **useExistingSessionKey**(`params`): [`Web2Session`](../../../../../index.md#web2session)

Defined in: [web2/session.ts:236](https://github.com/cifer-security/CIFER-sdk/blob/de978807a12b14b61e1b81198d0c02b0933ff5c6/src/web2/session.ts#L236)

Use an existing session key for Web2 authentication.

This is the "advanced" mode for when a session was already created
externally (e.g. by a TEE web front). The SDK wraps the provided
private key in a signer but **cannot** create or renew sessions.

#### Parameters

##### params

[`UseExistingSessionKeyParams`](../../../../../index.md#useexistingsessionkeyparams)

Existing session key parameters

#### Returns

[`Web2Session`](../../../../../index.md#web2session)

A Web2Session (non-managed, cannot renew)

#### Example

```typescript
const session = web2.session.useExistingSessionKey({
  sessionPrivateKey: '0xabc123...',
  principalId: '550e8400-...', // optional
});

// Use the session — but note it cannot be renewed
const encrypted = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: 42,
  plaintext: 'Hello!',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});
```
