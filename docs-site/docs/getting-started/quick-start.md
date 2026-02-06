---
sidebar_position: 2
---

# Quick Start

Get up and running with CIFER encryption in 5 minutes.

:::tip Using AI Assistants?
Point your AI agent (ChatGPT, Claude, Cursor, etc.) to [`llm.txt`](/llm.txt) — a comprehensive plaintext reference designed for AI consumption. This helps agents understand the SDK and implement features more accurately.
:::

## 1. Initialize the SDK

```typescript
import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';

// Create SDK with auto-discovery
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Connect your wallet
const signer = new Eip1193SignerAdapter(window.ethereum);
const address = await signer.getAddress();

console.log('Connected:', address);
console.log('Supported chains:', sdk.getSupportedChainIds());
```

## 2. Create a Secret

Secrets are the foundation of CIFER encryption. Each secret has an owner who can encrypt/decrypt and optionally delegate access.

```typescript
import { keyManagement } from 'cifer-sdk';

// Configuration
const chainId = 752025; // Ternoa mainnet
const controllerAddress = sdk.getControllerAddress(chainId);

// Get the creation fee
const fee = await keyManagement.getSecretCreationFee({
  chainId,
  controllerAddress,
  readClient: sdk.readClient,
});

console.log('Creation fee:', fee, 'wei');

// Build the transaction
const txIntent = keyManagement.buildCreateSecretTx({
  chainId,
  controllerAddress,
  fee,
});

// Execute with your wallet
const hash = await wallet.sendTransaction({
  to: txIntent.to,
  data: txIntent.data,
  value: txIntent.value,
});

// Wait for receipt and extract the secret ID
const receipt = await provider.waitForTransaction(hash);
const secretId = keyManagement.extractSecretIdFromReceipt(receipt.logs);

console.log('Created secret:', secretId);
```

:::tip Wait for Sync
After creation, secrets need ~30-60 seconds to sync before they can be used. The SDK provides a `createSecretAndWaitReady` flow that handles this automatically.
:::

## 3. Encrypt Data

Once your secret is ready, you can encrypt data:

```typescript
import { blackbox } from 'cifer-sdk';

const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n, // Your secret ID
  plaintext: 'Hello, quantum-resistant world!',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

console.log('CIFER envelope:', encrypted.cifer);
console.log('Encrypted message:', encrypted.encryptedMessage);
```

## 4. Decrypt Data

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
});

console.log('Decrypted:', decrypted.decryptedMessage);
// Output: "Hello, quantum-resistant world!"
```

## 5. Store On-Chain (Optional)

Store encrypted data as an on-chain commitment:

```typescript
import { commitments } from 'cifer-sdk';

const txIntent = commitments.buildStoreCommitmentTx({
  chainId,
  contractAddress: '0xYourContract...',
  storeFunction: {
    type: 'function',
    name: 'store',
    inputs: [
      { name: 'key', type: 'bytes32' },
      { name: 'encryptedMessage', type: 'bytes' },
      { name: 'cifer', type: 'bytes' },
    ],
  },
  args: {
    key: '0x...', // Your data key
    secretId: 123n,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
  },
});

// Execute the transaction
await wallet.sendTransaction(txIntent);
```

## Complete Example

Here's a complete example putting it all together:

```typescript
import {
  createCiferSdk,
  Eip1193SignerAdapter,
  keyManagement,
  blackbox,
} from 'cifer-sdk';

async function main() {
  // 1. Initialize
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });
  const signer = new Eip1193SignerAdapter(window.ethereum);
  
  // 2. Use an existing secret (or create one)
  const secretId = 123n; // Replace with your secret ID
  
  // 3. Check if secret is ready
  const isReady = await keyManagement.isSecretReady({
    chainId: 752025,
    controllerAddress: sdk.getControllerAddress(752025),
    readClient: sdk.readClient,
  }, secretId);
  
  if (!isReady) {
    throw new Error('Secret is still syncing');
  }
  
  // 4. Encrypt
  const encrypted = await blackbox.payload.encryptPayload({
    chainId: 752025,
    secretId,
    plaintext: 'My secret data',
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  // 5. Decrypt
  const decrypted = await blackbox.payload.decryptPayload({
    chainId: 752025,
    secretId,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  console.log('Round-trip successful:', decrypted.decryptedMessage);
}

main().catch(console.error);
```

## Next Steps

- [Core Concepts](/docs/getting-started/concepts) - Understand secrets, delegation, and the encryption model
- [Key Management Guide](/docs/guides/key-management) - Deep dive into secret management
- [Encryption Guide](/docs/guides/encryption) - Learn about payload and file encryption
