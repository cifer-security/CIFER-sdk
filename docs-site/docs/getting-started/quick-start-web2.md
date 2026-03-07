---
sidebar_position: 3
---

# Quick Start (Web2)

Get up and running with CIFER email-based encryption in 5 minutes — no blockchain wallet needed.

:::info Looking for Web3?
This guide covers **Web2** (email + password) usage. If you want to use CIFER with a **blockchain wallet**, see the [Quick Start (Web3)](/docs/getting-started/quick-start).
:::

:::tip Using AI Assistants?
Point your AI agent (ChatGPT, Claude, Cursor, etc.) to [`llm.txt`](/llm.txt) — a comprehensive plaintext reference designed for AI consumption. This helps agents understand the SDK and implement features more accurately.
:::

## 1. Initialize the SDK and Create a Client

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';

const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Create a Web2 client — stores session & defaults automatically
const client = web2.createClient({
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

console.log('SDK ready');
```

:::tip Web2 Client
`web2.createClient()` stores `blackboxUrl`, `readClient`, and your session internally so you don't need to pass them on every call. This is the recommended way to use Web2 mode.
:::

## 2. Set Up an Ed25519 Signer

Web2 mode uses Ed25519 keys for authentication. Install a signing library:

```bash
npm install @noble/ed25519
```

```typescript
import * as ed from '@noble/ed25519';

const privateKey = ed.utils.randomPrivateKey();
const publicKey = await ed.getPublicKeyAsync(privateKey);

const ed25519Signer = {
  async sign(message: Uint8Array): Promise<Uint8Array> {
    return ed.signAsync(message, privateKey);
  },
  getPublicKey(): Uint8Array {
    return publicKey;
  },
};
```

:::warning Store Your Key Securely
Save the Ed25519 private key securely (e.g. environment variable, HSM, or secret manager). You'll need it to create sessions later.
:::

## 3. Register and Verify Email

```typescript
// Register
const reg = await web2.auth.register({
  email: 'user@example.com',
  password: 'securePassword123',
  blackboxUrl: sdk.blackboxUrl,
});

console.log('Principal ID:', reg.principalId);
// An OTP has been sent to your email

// Verify email with the OTP
await web2.auth.verifyEmail({
  email: 'user@example.com',
  otp: '123456', // OTP from email
  blackboxUrl: sdk.blackboxUrl,
});

// Register your Ed25519 key
await web2.auth.registerKey({
  principalId: reg.principalId,
  password: 'securePassword123',
  ed25519Signer,
  blackboxUrl: sdk.blackboxUrl,
});
```

## 4. Create a Session

Sessions authenticate your API calls. Using the client, the session is stored automatically and used for all subsequent calls.

```typescript
await client.createManagedSession({
  principalId: reg.principalId,
  ed25519Signer,
});

console.log('Session address:', client.session!.sessionAddress);
```

## 5. Create a Secret, Encrypt, and Decrypt

```typescript
// Create a secret — no session or blackboxUrl needed!
const secret = await client.createSecret();

console.log('Secret ID:', secret.secretId);

// Encrypt
const encrypted = await client.payload.encryptPayload({
  secretId: secret.secretId,
  plaintext: 'Hello, quantum-resistant world!',
});

console.log('Encrypted:', encrypted.cifer);

// Decrypt
const decrypted = await client.payload.decryptPayload({
  secretId: secret.secretId,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
});

console.log('Decrypted:', decrypted.decryptedMessage);
// Output: "Hello, quantum-resistant world!"
```

## Complete Example

Here's the full end-to-end flow using the Web2 client:

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';
import * as ed from '@noble/ed25519';

async function main() {
  const blackboxUrl = 'https://cifer-blackbox.ternoa.dev:3010';

  // 1. Initialize SDK + Web2 client
  const sdk = await createCiferSdk({ blackboxUrl });
  const client = web2.createClient({
    blackboxUrl,
    readClient: sdk.readClient,
  });

  // 2. Ed25519 key setup
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  const ed25519Signer = {
    async sign(message: Uint8Array) { return ed.signAsync(message, privateKey); },
    getPublicKey() { return publicKey; },
  };

  // 3. Register + verify
  const reg = await web2.auth.register({
    email: 'user@example.com',
    password: 'securePassword123',
    blackboxUrl,
  });
  await web2.auth.verifyEmail({ email: 'user@example.com', otp: '123456', blackboxUrl });
  await web2.auth.registerKey({ principalId: reg.principalId, password: 'securePassword123', ed25519Signer, blackboxUrl });

  // 4. Create session (auto-stored in client)
  await client.createManagedSession({
    principalId: reg.principalId,
    ed25519Signer,
  });

  // 5. Create secret + encrypt + decrypt (no session/blackboxUrl needed!)
  const secret = await client.createSecret();

  const encrypted = await client.payload.encryptPayload({
    secretId: secret.secretId,
    plaintext: 'Hello from Web2!',
  });

  const decrypted = await client.payload.decryptPayload({
    secretId: secret.secretId,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
  });

  console.log('Round-trip successful:', decrypted.decryptedMessage);
}

main().catch(console.error);
```

<details>
<summary>Alternative: Stateless API (without client)</summary>

You can also use the stateless `web2.*` functions directly. This requires passing `session` and `blackboxUrl` on every call:

```typescript
// Create session
const session = await web2.session.createManagedSession({
  principalId: reg.principalId,
  ed25519Signer,
  blackboxUrl,
});

// Create secret — must pass session and blackboxUrl
const secret = await web2.secret.createSecret({ session, blackboxUrl });

// Encrypt — must pass session, blackboxUrl, and readClient
const encrypted = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: secret.secretId,
  plaintext: 'Hello from Web2!',
  blackboxUrl,
  readClient: sdk.readClient,
});
```

</details>

## Next Steps

- [Authentication & Sessions](/docs/guides/web2/authentication) - Registration, keys, sessions, and password reset
- [Secret Management (Web2)](/docs/guides/web2/secret-management) - Delegates, permits, and more
- [Text Encryption (Web2)](/docs/guides/web2/text-encryption) - Encrypt and decrypt text payloads
- [File Encryption (Web2)](/docs/guides/web2/file-encryption) - Encrypt and decrypt large files
- [Core Concepts](/docs/getting-started/concepts) - Understand secrets, delegation, and the encryption model
- [API Reference](/docs/api) - Complete API documentation
