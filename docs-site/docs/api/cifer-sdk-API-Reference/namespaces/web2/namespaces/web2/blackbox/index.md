[**cifer-sdk API Reference v0.5.2**](../../../../../../index.md)

***

[cifer-sdk API Reference](../../../../../../index.md) / [web2](../../../index.md) / web2/blackbox

# web2/blackbox

## Description

Web2 blackbox wrappers namespace

Provides session-first wrappers around the core `blackbox.*` functions,
automatically filling in `chainId = -1` and the session signer.

## Example

```typescript
import { web2 } from 'cifer-sdk';

// Encrypt a payload with a Web2 session
const encrypted = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: 42,
  plaintext: 'Hello, Web2!',
  blackboxUrl,
  readClient,
});

// Decrypt
const decrypted = await web2.blackbox.payload.decryptPayload({
  session,
  secretId: 42,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  blackboxUrl,
  readClient,
});
```

## Namespaces

- [web2/blackbox/files](namespaces/web2/blackbox/files.md)
- [web2/blackbox/jobs](namespaces/web2/blackbox/jobs.md)
- [web2/blackbox/payload](namespaces/web2/blackbox/payload.md)
- [web2/blackbox/publicKey](namespaces/web2/blackbox/publicKey.md)
