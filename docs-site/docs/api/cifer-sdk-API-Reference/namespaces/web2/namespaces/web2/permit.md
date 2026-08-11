[**cifer-sdk API Reference v0.5.4**](../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../index.md) / [web2](../../index.md) / web2/permit

# web2/permit

## Description

Web2 permit requests (rotate, transfer, delegate) using the V2 Blackbox create contract.

## Functions

### requestPermit()

> **requestPermit**(`params`): `Promise`\<[`RequestPermitResult`](../../../../../index.md#requestpermitresult)\>

Defined in: [web2/permit.ts:113](https://github.com/cifer-security/CIFER-sdk/blob/812593f8284deea22de7da15e9b99137b85b97ec/src/web2/permit.ts#L113)

Request a permit for key rotation, secret transfer, or delegation.

**Rotate permits** use email+password authentication (no session).
**Transfer/delegate permits** use session-based signing.

Always sends the V2 Blackbox contract:
- `requestId`: lowercase UUIDv4 (generated when omitted)
- transfer/delegate `data`:
  `-1_<secretId>_<sessionAddress>_<timestamp>_permit_<requestId>_<action>_<payloadDigest>`
- `payload`: exact compact JSON string used to compute `payloadDigest`

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
