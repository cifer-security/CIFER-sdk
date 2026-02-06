# cifer-sdk

The official JavaScript/TypeScript SDK for CIFER (Cryptographic Infrastructure for Encrypted Records).

CIFER provides quantum-resistant encryption for blockchain applications using ML-KEM-768 key encapsulation and AES-GCM symmetric encryption.

## Features

- 🔐 **Quantum-resistant encryption** via ML-KEM-768
- 🌐 **Multi-chain support** with automatic discovery
- 💼 **Wallet agnostic** - works with any EIP-1193 provider
- 📦 **Zero wallet dependencies** - bring your own wallet
- 🔄 **Transaction intent pattern** - you control transaction execution
- 📁 **File encryption** with async job system
- ⛓️ **On-chain commitments** with log-based retrieval
- 🏃 **High-level flows** for common operations

## Installation

```bash
npm install cifer-sdk
# or
yarn add cifer-sdk
# or
pnpm add cifer-sdk
```

## Quick Start

```typescript
import { 
  createCiferSdk, 
  Eip1193SignerAdapter,
  keyManagement,
  blackbox 
} from 'cifer-sdk';

// 1. Create SDK with discovery
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// 2. Connect any EIP-1193 wallet
const signer = new Eip1193SignerAdapter(window.ethereum);
const address = await signer.getAddress();

// 3. Create a secret (one-time setup)
const fee = await keyManagement.getSecretCreationFee({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  readClient: sdk.readClient,
});

const txIntent = keyManagement.buildCreateSecretTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  fee,
});

// Execute with your wallet (wagmi, ethers, viem, etc.)
await wallet.sendTransaction(txIntent);

// 4. Encrypt data
const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My secret message',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

// 5. Decrypt data
const decrypted = await blackbox.payload.decryptPayload({
  chainId: 752025,
  secretId: 123n,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

console.log(decrypted.decryptedMessage); // 'My secret message'
```

## Core Concepts

### Discovery

The SDK uses automatic discovery to fetch chain configurations:

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Get supported chains
sdk.getSupportedChainIds(); // [752025, 11155111, ...]

// Get contract address for a chain
sdk.getControllerAddress(752025); // '0x...'

// Get RPC URL for a chain
sdk.getRpcUrl(752025); // 'https://...'
```

You can also provide explicit overrides:

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  chainOverrides: {
    752025: {
      rpcUrl: 'https://my-private-rpc.example.com',
    },
  },
});
```

### Wallet Abstraction

The SDK uses a minimal `SignerAdapter` interface that works with any wallet:

```typescript
interface SignerAdapter {
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>; // EIP-191 personal_sign
}
```

Built-in adapters:

```typescript
// For browser wallets (MetaMask, WalletConnect, etc.)
import { Eip1193SignerAdapter } from 'cifer-sdk';
const signer = new Eip1193SignerAdapter(window.ethereum);

// For wagmi
const provider = await connector.getProvider();
const signer = new Eip1193SignerAdapter(provider);
```

Custom signer example:

```typescript
const customSigner: SignerAdapter = {
  async getAddress() {
    return '0x...';
  },
  async signMessage(message) {
    return ethers.Wallet.signMessage(message);
  },
};
```

### Transaction Intent Pattern

The SDK returns transaction intents instead of executing transactions:

```typescript
interface TxIntent {
  chainId: number;
  to: string;
  data: string;
  value?: bigint;
}
```

Execute with your preferred method:

```typescript
// With ethers
const tx = await signer.sendTransaction({
  to: txIntent.to,
  data: txIntent.data,
  value: txIntent.value,
});

// With wagmi
await sendTransaction({
  to: txIntent.to,
  data: txIntent.data,
  value: txIntent.value,
});

// With viem
await walletClient.sendTransaction({
  to: txIntent.to,
  data: txIntent.data,
  value: txIntent.value,
});
```

## Namespaces

### keyManagement

Interact with the SecretsController contract:

```typescript
import { keyManagement } from 'cifer-sdk';

// Read operations
const fee = await keyManagement.getSecretCreationFee({ chainId, controllerAddress, readClient });
const state = await keyManagement.getSecret({ ... }, secretId);
const isReady = await keyManagement.isSecretReady({ ... }, secretId);
const secrets = await keyManagement.getSecretsByWallet({ ... }, address);

// Transaction builders
const createTx = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });
const delegateTx = keyManagement.buildSetDelegateTx({ ... });
const transferTx = keyManagement.buildTransferSecretTx({ ... });

// Event parsing
const secretId = keyManagement.extractSecretIdFromReceipt(receipt.logs);
```

### blackbox

Encryption and decryption via the blackbox API:

```typescript
import { blackbox } from 'cifer-sdk';

// Payload encryption (< 16KB)
const encrypted = await blackbox.payload.encryptPayload({
  chainId,
  secretId,
  plaintext,
  signer,
  readClient,
  blackboxUrl,
});

const decrypted = await blackbox.payload.decryptPayload({
  chainId,
  secretId,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  signer,
  readClient,
  blackboxUrl,
});

// File encryption (async jobs)
const job = await blackbox.files.encryptFile({
  chainId,
  secretId,
  file: myFile,
  signer,
  readClient,
  blackboxUrl,
});

// Poll for completion
const status = await blackbox.jobs.pollUntilComplete(job.jobId, blackboxUrl);

// Download result
const blob = await blackbox.jobs.download(job.jobId, { blackboxUrl });
```

### commitments

Work with on-chain encrypted commitments:

```typescript
import { commitments } from 'cifer-sdk';

// Read metadata
const metadata = await commitments.getCIFERMetadata({
  chainId,
  contractAddress,
  readClient,
}, dataId);

// Fetch encrypted data from logs
const data = await commitments.fetchCommitmentFromLogs({
  chainId,
  contractAddress,
  dataId,
  storedAtBlock: metadata.storedAtBlock,
  readClient,
});

// Verify integrity
commitments.assertCommitmentIntegrity(data, metadata);

// Build store transaction (requires your contract's ABI)
const txIntent = commitments.buildStoreCommitmentTx({
  chainId,
  contractAddress,
  storeFunction: yourContractAbi,
  args: { key, secretId, encryptedMessage, cifer },
});
```

### flows

High-level orchestrated operations:

```typescript
import { flows } from 'cifer-sdk';

// Flow context
const ctx = {
  signer,
  readClient,
  blackboxUrl,
  chainId,
  controllerAddress,
  txExecutor: async (intent) => {
    const hash = await wallet.sendTransaction(intent);
    return { hash, waitReceipt: () => provider.waitForTransaction(hash) };
  },
  logger: console.log,
};

// Create secret and wait until ready
const result = await flows.createSecretAndWaitReady(ctx);
console.log('Secret ID:', result.data.secretId);

// Encrypt and prepare commit transaction
const encryptResult = await flows.encryptThenPrepareCommitTx(ctx, {
  secretId,
  plaintext: 'secret data',
  key: dataKey,
  commitmentContract,
});

// Retrieve and decrypt from logs
const decryptResult = await flows.retrieveFromLogsThenDecrypt(ctx, {
  secretId,
  dataId,
  commitmentContract,
});
```

## Error Handling

All errors extend `CiferError` with typed subclasses:

```typescript
import { 
  isCiferError,
  isBlockStaleError,
  BlockStaleError,
  SecretNotReadyError,
  CommitmentNotFoundError,
} from 'cifer-sdk';

try {
  await blackbox.payload.encryptPayload({ ... });
} catch (error) {
  if (isBlockStaleError(error)) {
    // Block number was too old, retry with fresh block
    console.log('Retrying with fresh block...');
  } else if (error instanceof SecretNotReadyError) {
    // Secret is still syncing
    console.log('Wait for secret to sync');
  } else if (isCiferError(error)) {
    console.log('CIFER error:', error.code, error.message);
  }
}
```

### Error Properties

All SDK errors include:

- **`code`**: Programmatic error code (`CONFIG_ERROR`, `AUTH_ERROR`, `BLACKBOX_ERROR`, etc.)
- **`message`**: Human-readable description
- **`cause`**: Original underlying error (for error chaining)

```typescript
if (isCiferError(error)) {
  console.log('Code:', error.code);
  console.log('Message:', error.message);
  if (error.cause) {
    console.log('Caused by:', error.cause);
  }
}
```

## Debugging & Logging

The SDK **does not log to console by default**. To enable debug output, pass a `logger` function:

```typescript
// SDK-level logging
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  logger: console.log,
});

// Flow-level logging
const ctx = {
  signer,
  readClient,
  blackboxUrl,
  chainId,
  txExecutor,
  logger: (msg) => console.log(`[CIFER] ${msg}`),
};
```

The logger receives progress messages like:
- `"Performing discovery..."`
- `"Discovery complete. Supported chains: 752025, 11155111"`

## Troubleshooting

### "Block number is too old"

The blackbox validates that requests include a recent block number. If you see this error:

1. **Automatic retry**: The SDK automatically retries with a fresh block (up to 3 times)
2. **Network issues**: Check if your RPC is returning stale data
3. **Slow signing**: If signing takes too long, the block may become stale

```typescript
// Increase retry attempts
await withBlockFreshRetry(
  async (getFreshBlock) => {
    const block = await getFreshBlock();
    // ... your code
  },
  readClient,
  chainId,
  { maxRetries: 5, retryDelayMs: 2000 }
);
```

### "Secret is syncing"

After creating a secret, wait for it to sync before using:

```typescript
// Poll until ready
let isReady = false;
while (!isReady) {
  isReady = await keyManagement.isSecretReady({ ... }, secretId);
  if (!isReady) await sleep(2000);
}

// Or use the flow
const result = await flows.createSecretAndWaitReady(ctx);
```

### "Signature verification failed"

Ensure you're using EIP-191 `personal_sign`:

```typescript
// Correct: personal_sign
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [hexMessage, address],
});

// Wrong: eth_sign (different prefix)
// Wrong: eth_signTypedData (different format)
```

### File encryption timeout

Large files take time to encrypt. Adjust polling parameters:

```typescript
const status = await blackbox.jobs.pollUntilComplete(jobId, blackboxUrl, {
  intervalMs: 5000,     // Poll every 5 seconds
  maxAttempts: 120,     // Wait up to 10 minutes
});
```

## TypeScript Support

The SDK is written in TypeScript with full type exports:

```typescript
import type {
  CiferSdk,
  CiferSdkConfig,
  SignerAdapter,
  ReadClient,
  TxIntent,
  SecretState,
  CommitmentData,
  CIFERMetadata,
  FlowContext,
  FlowResult,
} from 'cifer-sdk';
```

## Examples

- [Next.js + EIP-1193](./examples/nextjs-eip1193/) - Browser wallet integration
- [Node.js + RPC](./examples/node-rpc/) - Server-side usage

## API Reference

Full API documentation is available via TypeScript IntelliSense. Each function includes JSDoc comments with examples.

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## Support

- GitHub Issues: Report bugs or request features
- Discord: Join the CIFER community
