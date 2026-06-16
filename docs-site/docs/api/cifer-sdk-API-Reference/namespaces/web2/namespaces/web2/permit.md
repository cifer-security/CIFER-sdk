[**cifer-sdk API Reference v0.5.0**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/permit

# web2/permit

## Description

Web2 permit requests (rotate, transfer, delegate)

## Functions

### requestPermit()

> **requestPermit**(`params`): `Promise`\<[`RequestPermitResult`](../../../../../index.md#requestpermitresult)\>

Defined in: [web2/permit.ts:58](https://github.com/capsule-corp-ternoa/CIFER-sdk/blob/19097d66af0fa2722ad2893d7582d83598a739ed/src/web2/permit.ts#L58)

Request a permit for key rotation, secret transfer, or delegation.

**Rotate permits** use email+password authentication (no session).
**Transfer/delegate permits** use session-based signing.

Data string format (transfer/delegate): `-1_<secretId>_<sessionAddress>_<timestamp>`

#### Parameters

##### params

[`RequestPermitParams`](../../../../../index.md#requestpermitparams)

Permit request parameters (discriminated by `action`)

#### Returns

`Promise`\<[`RequestPermitResult`](../../../../../index.md#requestpermitresult)\>

Permit result with a confirmable `permitId`

#### Example

```typescript
// Key rotation (email+password)
const result = await web2.permit.requestPermit({
  action: 'rotate',
  email: 'user@example.com',
  password: 'securePassword123',
  payload: { newPublicKey: '...' },
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

// Transfer ownership (session)
const result = await web2.permit.requestPermit({
  action: 'transfer',
  session,
  secretId: 42,
  payload: { newOwnerPrincipalId: 'new-owner-uuid' },
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
```
