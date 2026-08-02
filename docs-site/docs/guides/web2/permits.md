---
sidebar_position: 3
title: Permits
description: Request Web2 key-rotation, transfer, and delegate permits with the V2 Blackbox payload.
---

# Web2 Permits

Admin permits let a principal request a **key rotation**, **secret ownership transfer**, or **delegation change**. The owner confirms via email; Blackbox then consumes the permit across the cluster.

This guide documents the **V2** create contract used by `cifer-sdk` `0.5.4+`.

## Prerequisites

- A deployed Blackbox that accepts V2 permit create (`requestId` + digest-bound session auth for transfer/delegate).
- For transfer/delegate: an active [Web2 session](/docs/guides/web2/authentication).
- For rotate: the account email and password (session not required).

## What changed (breaking)

| Field | Old (pre-0.5.4) | New (V2) |
| --- | --- | --- |
| `requestId` | omitted | **required** (SDK generates a UUIDv4 when you omit it) |
| Transfer/delegate `data` | 4 parts: `-1_<secretId>_<sessionAddress>_<timestamp>` | **8 parts**: `…_permit_<requestId>_<action>_<payloadDigest>` |
| `payload` | JSON object in the body | **Exact compact JSON string** that was hashed for `payloadDigest` |

Prefer `web2.permit.requestPermit()` — do not hand-roll the old 4-part body.

## Request a permit with the SDK

```typescript
import { web2 } from 'cifer-sdk';

// Key rotation — email + password, no session
const rotate = await web2.permit.requestPermit({
  action: 'rotate',
  email: 'user@example.com',
  password: 'securePassword123',
  payload: { newPublicKey: '<ed25519-hex>' },
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

// Transfer — session auth
const transfer = await web2.permit.requestPermit({
  action: 'transfer',
  session,
  secretId: 42,
  payload: { newOwnerPrincipalId: 'new-owner-uuid' },
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

// Delegate set / clear — session auth
const delegate = await web2.permit.requestPermit({
  action: 'delegate',
  session,
  secretId: 42,
  payload: { delegatePrincipalId: 'delegate-uuid' }, // or null to remove
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});

console.log(transfer.permitId, transfer.expiresAt);
```

Optional: pass `requestId` yourself and **reuse the same UUID** if you need an exact replay after a crash or network retry.

```typescript
const requestId = crypto.randomUUID(); // lowercase UUIDv4

await web2.permit.requestPermit({
  action: 'transfer',
  requestId,
  session,
  secretId: 42,
  payload: { newOwnerPrincipalId: 'new-owner-uuid' },
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
});
```

## V2 HTTP body (Blackbox `POST /web2/permit`)

### Rotate

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "rotate",
  "email": "user@example.com",
  "password": "mypassword123",
  "payload": "{\"newPublicKey\":\"<ed25519-hex>\"}"
}
```

### Transfer / delegate

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "transfer",
  "data": "-1_42_0xabc…_1710000000000_permit_550e8400-e29b-41d4-a716-446655440000_transfer_<payloadDigest>",
  "signature": "<eip191-signature-of-data>",
  "payload": "{\"newOwnerPrincipalId\":\"<principalId>\"}"
}
```

### Payload digest

1. Build a one-key JSON object (`newPublicKey`, `newOwnerPrincipalId`, or `delegatePrincipalId`).
2. Serialize with `JSON.stringify` (compact, no extra spaces).
3. `payloadDigest = lowercaseHex(SHA-256(UTF-8(payloadString)))`.
4. Put that same string in the HTTP `payload` field and, for transfer/delegate, as the last part of signed `data`.

Allowed payloads:

- rotate: `{ "newPublicKey": "<non-empty-string>" }` (max 4096 chars)
- transfer: `{ "newOwnerPrincipalId": "<principalId>" }`
- delegate: `{ "delegatePrincipalId": "<principalId>" }` or `{ "delegatePrincipalId": null }` to remove

## Confirmation

After a successful create, Blackbox emails a confirmation link. The owner opens it (`GET /web2/confirm`); Blackbox consumes the permit on the cluster. The SDK does not complete confirmation in-app — show a “check your email / continue after confirming” UX.

## Errors to expect

| HTTP | Typical cause |
| --- | --- |
| 400 | Invalid/malformed `requestId`, payload, or 8-part authorization |
| 403 | Wrong password, not secret owner, owner cannot be delegate/new owner |
| 409 | Same `requestId` reused with different immutable context, or expired intent |
| 503 | Cluster membership / slot-0 create failure |

## Migration checklist

1. Upgrade to `cifer-sdk` **0.5.4+**.
2. Deploy Blackbox/nodes that support V2 permit create (and ideally dual-accept during other clients’ migration).
3. Replace any custom `/web2/permit` calls that still use the 4-part session string.
4. Keep `requestId` stable across retries of the **same** logical request.

## Next steps

- [Secret Management (Web2)](/docs/guides/web2/secret-management) — create secrets and set delegates
- [Authentication (Web2)](/docs/guides/web2/authentication) — sessions and keys
- [API: web2/permit](/docs/api/cifer-sdk-API-Reference/namespaces/web2/namespaces/web2/permit)
