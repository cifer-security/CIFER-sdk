---
sidebar_position: 3
---

# Text Encryption

Learn how to encrypt and decrypt text payloads using the CIFER blackbox API.

## Overview

The `blackbox.payload` namespace provides functions for encrypting and decrypting short messages (< 16KB). For larger data, see the [File Encryption](/docs/guides/web3/file-encryption) guide.

## Encrypt

```typescript
import { blackbox } from 'cifer-sdk';

const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My secret message',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  outputFormat: 'hex', // or 'base64'
});

console.log('CIFER envelope:', encrypted.cifer);
console.log('Encrypted message:', encrypted.encryptedMessage);
```

## Decrypt

Only the secret owner (or delegate) can decrypt:

```typescript
const decrypted = await blackbox.payload.decryptPayload({
  chainId: 752025,
  secretId: 123n,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  inputFormat: 'hex', // or 'base64'
});

console.log('Decrypted:', decrypted.decryptedMessage);
```

## Output Formats

| Format | Use Case |
|--------|----------|
| `hex` | On-chain storage, JSON APIs |
| `base64` | Web APIs, compact storage |

## Error Handling

```typescript
import {
  BlackboxError,
  EncryptionError,
  DecryptionError,
  BlockStaleError,
  SecretNotReadyError,
  isBlockStaleError,
  isCiferError,
} from 'cifer-sdk';

try {
  await blackbox.payload.encryptPayload({ ... });
} catch (error) {
  if (isBlockStaleError(error)) {
    // SDK already retried - this indicates a persistent issue
    console.log('Stale block error after retries');
  } else if (error instanceof SecretNotReadyError) {
    console.log('Secret is still syncing');
  } else if (error instanceof EncryptionError) {
    console.log('Encryption failed:', error.message);
  } else if (error instanceof BlackboxError) {
    console.log('Blackbox error:', error.message, error.statusCode);
  }
  
  // All SDK errors include cause for error chaining
  if (isCiferError(error) && error.cause) {
    console.log('Underlying error:', error.cause);
  }
}
```

:::tip Debug Logging
The SDK doesn't log by default. To see progress messages, pass a `logger` when creating the SDK:

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
  logger: console.log,
});
```

See [Debugging & Logging](/docs/getting-started/concepts#debugging--logging) for more details.
:::

## Best Practices

### Choose the Right Method

| Data Size | Method |
|-----------|--------|
| < 16 KB | `payload.encryptPayload` (this guide) |
| > 16 KB | [`files.encryptFile`](/docs/guides/web3/file-encryption) |

### Handle Block Freshness

The SDK automatically retries on stale block errors, but you should:

- Use reliable RPC endpoints
- Minimize time between signing and API calls
- Consider retry logic for persistent failures

## Next Steps

- [File Encryption](/docs/guides/web3/file-encryption) - Encrypt and decrypt large files
- [Secret Management](/docs/guides/web3/secret-management) - Create and manage secrets
- [On-Chain Commitments](/docs/guides/web3/commitments) - Store encrypted data on-chain
- Looking for Web2? See [Text Encryption (Web2)](/docs/guides/web2/text-encryption)
