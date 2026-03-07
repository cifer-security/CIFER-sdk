---
sidebar_position: 2
---

# Secret Management

Learn how to create, manage, and delegate CIFER secrets in Web2 mode.

## Prerequisites

This guide assumes you have already [set up authentication](/docs/guides/web2/authentication) (registered, verified email, created a session). Here is a quick setup recap:

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';

const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

const client = web2.createClient({
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

// Session already created (see Authentication guide)
await client.createManagedSession({
  principalId: 'your-principal-uuid',
  ed25519Signer: myEd25519Signer,
});
```

## Create a Secret

### Using the Client (Recommended)

```typescript
const secret = await client.createSecret();
console.log('Secret ID:', secret.secretId);
```

### Using the Stateless API

```typescript
const secret = await web2.secret.createSecret({
  session,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

console.log('Secret ID:', secret.secretId);
```

## List Secrets

```typescript
const result = await web2.secret.listSecrets({
  session,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

for (const s of result.secrets) {
  console.log(`Secret ${s.secretId}: ${s.status}`);
}
```

## Delegates

Allow another principal to decrypt your secrets:

### Set a Delegate

```typescript
await web2.delegate.setDelegate({
  session,
  secretId: 42,
  delegatePrincipalId: 'delegate-principal-uuid',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

### Remove a Delegate

```typescript
// Pass empty string to remove delegation
await web2.delegate.setDelegate({
  session,
  secretId: 42,
  delegatePrincipalId: '',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

:::tip Finding a Principal ID
Use `web2.principal.getByEmail()` to look up a principal ID by email address:

```typescript
const principal = await web2.principal.getByEmail(
  'colleague@example.com',
  'https://cifer-blackbox.ternoa.dev:3010'
);
console.log('Delegate principal:', principal.principalId);
```
:::

## Permits

Request permits for key rotation, ownership transfer, or delegation:

```typescript
// Key rotation (uses email + password, no session needed)
const rotateResult = await web2.permit.requestPermit({
  action: 'rotate',
  email: 'user@example.com',
  password: 'securePassword123',
  payload: { newPublicKey: '...' },
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Transfer ownership (uses session)
const transferResult = await web2.permit.requestPermit({
  action: 'transfer',
  session,
  secretId: 42,
  payload: { newOwnerPrincipalId: 'new-owner-uuid' },
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

## Error Handling

```typescript
import {
  Web2Error,
  isWeb2Error,
  isCiferError,
} from 'cifer-sdk';

try {
  await client.createSecret();
} catch (error) {
  if (isWeb2Error(error)) {
    console.log('Web2 error:', error.code, error.message);
  } else if (isCiferError(error)) {
    console.log('CIFER error:', error.code, error.message);
  }
}
```

## Next Steps

- [Text Encryption (Web2)](/docs/guides/web2/text-encryption) - Encrypt and decrypt text payloads
- [File Encryption (Web2)](/docs/guides/web2/file-encryption) - Encrypt and decrypt large files
- [Authentication & Sessions](/docs/guides/web2/authentication) - Registration, keys, and session management
- Looking for Web3? See [Secret Management (Web3)](/docs/guides/web3/secret-management)
