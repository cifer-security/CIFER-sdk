---
sidebar_position: 3
---

# Text Encryption

Learn how to encrypt and decrypt text payloads in CIFER Web2 mode.

## Prerequisites

This guide assumes you have already [set up authentication](/docs/guides/web2/authentication) (registered, verified email, created a session). Here is a quick setup recap:

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';

const sdk = await createCiferSdk({
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
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

## Encrypt (Client)

```typescript
const encrypted = await client.payload.encryptPayload({
  secretId: 42,
  plaintext: 'My secret message',
});

console.log('Cifer:', encrypted.cifer);
console.log('Encrypted message:', encrypted.encryptedMessage);
```

## Decrypt (Client)

```typescript
const decrypted = await client.payload.decryptPayload({
  secretId: 42,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
});

console.log('Decrypted:', decrypted.decryptedMessage);
```

## Stateless API

You can also use the stateless `web2.blackbox` functions directly. This requires passing `session`, `blackboxUrl`, and `readClient` on every call:

### Encrypt

```typescript
const encrypted = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: 42,
  plaintext: 'My secret message',
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});

console.log('Cifer:', encrypted.cifer);
console.log('Encrypted message:', encrypted.encryptedMessage);
```

### Decrypt

```typescript
const decrypted = await web2.blackbox.payload.decryptPayload({
  session,
  secretId: 42,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  readClient: sdk.readClient,
});

console.log('Decrypted:', decrypted.decryptedMessage);
```

## Error Handling

```typescript
import {
  Web2Error,
  Web2SessionError,
  BlackboxError,
  EncryptionError,
  DecryptionError,
  isWeb2SessionError,
  isCiferError,
} from 'cifer-sdk';

try {
  await client.payload.encryptPayload({ ... });
} catch (error) {
  if (isWeb2SessionError(error)) {
    // Session expired or cannot be renewed
    console.log('Session error:', error.message);
    // Re-create the session
  } else if (error instanceof EncryptionError) {
    console.log('Encryption failed:', error.message);
  } else if (error instanceof BlackboxError) {
    console.log('Blackbox error:', error.message, error.statusCode);
  } else if (isCiferError(error)) {
    console.log('CIFER error:', error.code, error.message);
  }
}
```

## Best Practices

1. **Use the client** - Prefer `client.payload.encryptPayload()` over the stateless API. The client handles session, blackboxUrl, and readClient automatically.
2. **Check payload size** - Text payloads must be < 16KB. For larger data, use [File Encryption](/docs/guides/web2/file-encryption).
3. **Let sessions auto-renew** - The client calls `session.ensureValid()` before each request automatically.

## Next Steps

- [File Encryption (Web2)](/docs/guides/web2/file-encryption) - Encrypt and decrypt large files
- [Secret Management (Web2)](/docs/guides/web2/secret-management) - Create and manage secrets
- [Account Management](/docs/guides/web2/authentication) - Registration, keys, sessions, and account lifecycle
- Looking for Web3? See [Text Encryption (Web3)](/docs/guides/web3/text-encryption)
