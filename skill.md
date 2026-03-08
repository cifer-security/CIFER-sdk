# CIFER SDK - Quantum-Resistant Blockchain Encryption

> **Skill for AI Agents** | Enable quantum-resistant encryption in blockchain applications using the CIFER SDK.

## Overview

CIFER (Cryptographic Infrastructure for Encrypted Records) SDK provides quantum-resistant encryption for blockchain applications. This skill enables AI agents to implement secure data encryption, secret management, and on-chain commitments using post-quantum cryptography.

### Key Capabilities

- **Quantum-Resistant Encryption**: ML-KEM-768 (NIST standardized) key encapsulation
- **Multi-Chain Support**: Automatic chain discovery and configuration
- **Wallet Agnostic**: Works with MetaMask, WalletConnect, Coinbase, Thirdweb, and custom signers
- **Web2 Mode**: Email + password registration with session-based auth (no wallet needed)
- **File Encryption**: Async job system for large file encryption/decryption
- **On-Chain Commitments**: Store encrypted data references on-chain with log-based retrieval
- **Transaction Intents**: Non-custodial pattern - you control transaction execution

## When to Use This Skill

Use the CIFER SDK when you need to:

- Encrypt sensitive data with quantum-resistant algorithms
- Store encrypted records on blockchain
- Manage encryption keys with owner/delegate authorization
- Encrypt files larger than 16KB using the job system
- Build applications requiring post-quantum security
- Build walletless apps with email-based authentication (Web2 mode)

## Installation

```bash
npm install cifer-sdk
# or
yarn add cifer-sdk
# or
pnpm add cifer-sdk
```

**Requirements**: Node.js 18.0+, TypeScript 5.0+ (recommended)

## Quick Start

```typescript
import { createCiferSdk, Eip1193SignerAdapter, blackbox } from 'cifer-sdk';

// 1. Initialize SDK with auto-discovery
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// 2. Connect wallet (browser)
const signer = new Eip1193SignerAdapter(window.ethereum);

// 3. Encrypt data
const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My secret message',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

// 4. Decrypt data
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

### Quick Start (Web2 - No Wallet)

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';
import * as ed from '@noble/ed25519';

// 1. Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// 2. Ed25519 key setup
const privateKey = ed.utils.randomPrivateKey();
const publicKey = await ed.getPublicKeyAsync(privateKey);
const ed25519Signer = {
  async sign(message: Uint8Array) { return ed.signAsync(message, privateKey); },
  getPublicKey() { return publicKey; },
};

// 3. Register (one-time)
const reg = await web2.auth.register({
  email: 'user@example.com',
  password: 'securePassword123',
  blackboxUrl: sdk.blackboxUrl,
});
await web2.auth.verifyEmail({ email: 'user@example.com', otp: '123456', blackboxUrl: sdk.blackboxUrl });
await web2.auth.registerKey({ principalId: reg.principalId, password: 'securePassword123', ed25519Signer, blackboxUrl: sdk.blackboxUrl });

// 4. Create session
const session = await web2.session.createManagedSession({
  principalId: reg.principalId,
  ed25519Signer,
  blackboxUrl: sdk.blackboxUrl,
});

// 5. Create secret & encrypt
const secret = await web2.secret.createSecret({ session, blackboxUrl: sdk.blackboxUrl });

const encrypted = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: secret.secretId,
  plaintext: 'Hello from Web2!',
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

// 6. Decrypt
const decrypted = await web2.blackbox.payload.decryptPayload({
  session,
  secretId: secret.secretId,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

console.log(decrypted.decryptedMessage); // 'Hello from Web2!'
```

---

## Core Concepts

### Secrets

A **secret** is the core primitive in CIFER. Each secret represents an ML-KEM-768 key pair:

| Property | Description |
|----------|-------------|
| `owner` | Address that can transfer, set delegate, and decrypt |
| `delegate` | Address that can decrypt only (zero address if none) |
| `isSyncing` | `true` while key generation is in progress |
| `clusterId` | Which enclave cluster holds the private key shards |
| `secretType` | `1` = ML-KEM-768 (standard) |
| `publicKeyCid` | IPFS CID of public key (empty if syncing) |

**Lifecycle**: Creation → Syncing (~30-60s) → Ready

### Authorization Model

| Role | Capabilities |
|------|-------------|
| **Owner** | Encrypt, decrypt, transfer, set delegate |
| **Delegate** | Decrypt only |

### Encryption Model

CIFER uses hybrid encryption:
1. **ML-KEM-768**: Post-quantum key encapsulation (1088-byte ciphertext)
2. **AES-256-GCM**: Symmetric encryption for actual data

Output format:
- `cifer`: 1104 bytes (ML-KEM ciphertext + tag)
- `encryptedMessage`: Variable length (max 16KB)

### Transaction Intents

The SDK returns transaction intents instead of executing transactions:

```typescript
interface TxIntent {
  chainId: number;
  to: Address;
  data: Hex;
  value?: bigint;
}
```

Execute with any wallet library (ethers, wagmi, viem).

### Web2 Mode

CIFER supports Web2 mode for apps that don't use blockchain wallets. Users register with email + password and authenticate via Ed25519-signed sessions.

**`WEB2_CHAIN_ID = -1`**: Sentinel value used for all Web2 operations. When `chainId` is `-1`, the SDK uses `Date.now()` instead of an RPC block number for freshness.

| Feature | Web3 | Web2 |
|---------|------|------|
| Auth | EIP-1193 wallet | Email + password + Ed25519 key |
| Chain ID | Real chain ID (e.g. 752025) | `WEB2_CHAIN_ID = -1` (sentinel) |
| Block freshness | RPC `eth_blockNumber` | `Date.now()` (no RPC needed) |
| Signer | Wallet `personal_sign` | Session EOA `personal_sign` |
| Secret creation | On-chain transaction | `POST /web2/secret` API call |

**How sessions work**:
1. An ephemeral secp256k1 keypair is generated (session key)
2. The session is authenticated with an Ed25519 signature
3. The session key signs blackbox requests (same EIP-191 format as wallets)
4. Sessions expire and can be auto-renewed (managed sessions)

**Ed25519 Signer Interface** (bring-your-own-library):

```typescript
interface Ed25519Signer {
  sign(message: Uint8Array): Promise<Uint8Array>;
  getPublicKey(): Uint8Array;
}
```

Use `@noble/ed25519` or any Ed25519 library:

```typescript
import * as ed from '@noble/ed25519';

const privateKey = ed.utils.randomPrivateKey();
const publicKey = await ed.getPublicKeyAsync(privateKey);

const ed25519Signer: Ed25519Signer = {
  async sign(message) { return ed.signAsync(message, privateKey); },
  getPublicKey() { return publicKey; },
};
```

---

## API Reference

### SDK Initialization

#### With Discovery (Recommended)

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

sdk.getSupportedChainIds(); // [752025, 11155111, ...]
sdk.getControllerAddress(752025); // '0x...'
sdk.getRpcUrl(752025); // 'https://...'
```

#### With Overrides

```typescript
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  chainOverrides: {
    752025: {
      rpcUrl: 'https://my-private-rpc.example.com',
      secretsControllerAddress: '0x...',
    },
  },
});
```

#### Synchronous (No Discovery)

```typescript
import { createCiferSdkSync, RpcReadClient } from 'cifer-sdk';

const readClient = new RpcReadClient({
  rpcUrlByChainId: {
    752025: 'https://mainnet.ternoa.network',
  },
});

const sdk = createCiferSdkSync({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  readClient,
  chainOverrides: {
    752025: {
      rpcUrl: 'https://mainnet.ternoa.network',
      secretsControllerAddress: '0x...',
    },
  },
});
```

---

### Wallet Integration

All wallets must implement the `SignerAdapter` interface:

```typescript
interface SignerAdapter {
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>;
  sendTransaction?(txRequest: TxIntent): Promise<TxExecutionResult>;
}
```

#### MetaMask

```typescript
import { Eip1193SignerAdapter } from 'cifer-sdk';

await window.ethereum.request({ method: 'eth_requestAccounts' });
const signer = new Eip1193SignerAdapter(window.ethereum);
```

#### WalletConnect v2

```typescript
import { EthereumProvider } from '@walletconnect/ethereum-provider';

const provider = await EthereumProvider.init({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [752025],
  showQrModal: true,
});

await provider.connect();
const signer = new Eip1193SignerAdapter(provider);
```

#### Private Key (Server-Side)

```typescript
import { Wallet } from 'ethers';
import type { SignerAdapter } from 'cifer-sdk';

const wallet = new Wallet(process.env.PRIVATE_KEY);

const signer: SignerAdapter = {
  async getAddress() { return wallet.address; },
  async signMessage(message) { return wallet.signMessage(message); },
};
```

#### wagmi (React)

```typescript
import { useAccount, useConnectorClient } from 'wagmi';

function useCiferSigner() {
  const { address, isConnected } = useAccount();
  const { data: connectorClient } = useConnectorClient();

  const getSigner = async () => {
    if (!isConnected || !connectorClient) {
      throw new Error('Wallet not connected');
    }
    const provider = await connectorClient.transport;
    return new Eip1193SignerAdapter(provider);
  };

  return { getSigner, address, isConnected };
}
```

---

### keyManagement Namespace

Interact with the SecretsController contract for secret management.

#### Read Operations

```typescript
// Get secret creation fee
const fee = await keyManagement.getSecretCreationFee({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  readClient: sdk.readClient,
});

// Get secret state
const state = await keyManagement.getSecret(params, 123n);
// Returns: { owner, delegate, isSyncing, clusterId, secretType, publicKeyCid }

// Check if secret is ready
const ready = await keyManagement.isSecretReady(params, 123n);

// Check authorization
const canDecrypt = await keyManagement.isAuthorized(params, 123n, '0x...');

// Get secrets by wallet
const secrets = await keyManagement.getSecretsByWallet(params, '0xUser...');
// Returns: { owned: bigint[], delegated: bigint[] }
```

#### Transaction Builders

```typescript
// Create a new secret
const fee = await keyManagement.getSecretCreationFee(params);
const txIntent = keyManagement.buildCreateSecretTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  fee,
});

// Set delegate
const txIntent = keyManagement.buildSetDelegateTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  secretId: 123n,
  newDelegate: '0xDelegate...',
});

// Remove delegate
const txIntent = keyManagement.buildRemoveDelegationTx({ ... });

// Transfer ownership (irreversible!)
const txIntent = keyManagement.buildTransferSecretTx({
  chainId: 752025,
  controllerAddress: sdk.getControllerAddress(752025),
  secretId: 123n,
  newOwner: '0xNewOwner...',
});
```

#### Event Parsing

```typescript
const receipt = await provider.waitForTransaction(hash);
const secretId = keyManagement.extractSecretIdFromReceipt(receipt.logs);
```

---

### blackbox.payload Namespace

Encrypt and decrypt short messages (< 16KB).

#### Encrypt

```typescript
const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My secret message',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  outputFormat: 'hex', // or 'base64'
});

// Returns: { cifer: string, encryptedMessage: string }
```

#### Decrypt

```typescript
const decrypted = await blackbox.payload.decryptPayload({
  chainId: 752025,
  secretId: 123n,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  signer, // Must be owner or delegate
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
  inputFormat: 'hex',
});

// Returns: { decryptedMessage: string }
```

---

### blackbox.files Namespace

Encrypt and decrypt large files using async jobs.

```typescript
// Start encryption job
const job = await blackbox.files.encryptFile({
  chainId: 752025,
  secretId: 123n,
  file: myFile,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});
// Returns: { jobId: string, message: string }

// Start decryption job
const job = await blackbox.files.decryptFile({ ... });

// Decrypt from existing encrypt job
const job = await blackbox.files.decryptExistingFile({
  chainId: 752025,
  secretId: 123n,
  encryptJobId: previousJobId,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});
```

---

### blackbox.jobs Namespace

Manage async file jobs.

```typescript
// Get job status
const status = await blackbox.jobs.getStatus(jobId, sdk.blackboxUrl);
// Returns: { id, type, status, progress, secretId, chainId, ... }

// Poll until complete
const finalStatus = await blackbox.jobs.pollUntilComplete(
  jobId,
  sdk.blackboxUrl,
  {
    intervalMs: 2000,
    maxAttempts: 120,
    onProgress: (job) => console.log(`Progress: ${job.progress}%`),
  }
);

// Download result (encrypt jobs: no auth, decrypt jobs: auth required)
const blob = await blackbox.jobs.download(jobId, {
  blackboxUrl: sdk.blackboxUrl,
  // For decrypt jobs, also provide:
  chainId: 752025,
  secretId: 123n,
  signer,
  readClient: sdk.readClient,
});

// List jobs for wallet
const result = await blackbox.jobs.list({
  chainId: 752025,
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

// Get data consumption stats
const stats = await blackbox.jobs.dataConsumption({ ... });
```

---

### commitments Namespace

Store and retrieve encrypted data on-chain.

```typescript
// Check if commitment exists
const exists = await commitments.ciferDataExists(params, dataId);

// Get metadata
const metadata = await commitments.getCIFERMetadata(params, dataId);
// Returns: { secretId, storedAtBlock, ciferHash, encryptedMessageHash }

// Fetch encrypted data from logs
const data = await commitments.fetchCommitmentFromLogs({
  chainId: 752025,
  contractAddress: '0x...',
  dataId: dataKey,
  storedAtBlock: metadata.storedAtBlock,
  readClient: sdk.readClient,
});
// Returns: { cifer, encryptedMessage, ciferHash, encryptedMessageHash }

// Verify integrity
const result = commitments.verifyCommitmentIntegrity(data, metadata);

// Build store transaction
const txIntent = commitments.buildStoreCommitmentTx({
  chainId: 752025,
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
    key: dataKey,
    secretId: 123n,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
  },
});
```

**Constants**:
- `CIFER_ENVELOPE_BYTES = 1104` (fixed cifer size)
- `MAX_PAYLOAD_BYTES = 16384` (16KB max payload)

---

### flows Namespace

High-level orchestrated operations.

#### Flow Context

```typescript
const ctx = {
  signer: SignerAdapter,
  readClient: ReadClient,
  blackboxUrl: string,
  chainId: number,
  controllerAddress?: Address,
  txExecutor?: (intent: TxIntent) => Promise<TxExecutionResult>,
  pollingStrategy?: { intervalMs: number, maxAttempts: number },
  logger?: (message: string) => void,
  abortSignal?: AbortSignal,
};
```

#### Create Secret and Wait

```typescript
const result = await flows.createSecretAndWaitReady({
  ...ctx,
  controllerAddress: sdk.getControllerAddress(752025),
  txExecutor: async (intent) => {
    const hash = await wallet.sendTransaction(intent);
    return { hash, waitReceipt: () => provider.waitForTransaction(hash) };
  },
});

if (result.success) {
  console.log('Secret ID:', result.data.secretId);
  console.log('Public Key CID:', result.data.state.publicKeyCid);
}
```

#### Encrypt and Prepare Commit

```typescript
const result = await flows.encryptThenPrepareCommitTx(ctx, {
  secretId: 123n,
  plaintext: 'My secret data',
  key: dataKey,
  commitmentContract: '0x...',
});

if (result.success) {
  await wallet.sendTransaction(result.data.txIntent);
}
```

#### Retrieve and Decrypt from Logs

```typescript
const result = await flows.retrieveFromLogsThenDecrypt(ctx, {
  secretId: 123n,
  dataId: dataKey,
  commitmentContract: '0x...',
});

if (result.success) {
  console.log('Decrypted:', result.data.decryptedMessage);
}
```

#### File Flows

```typescript
// Encrypt file flow
const result = await flows.encryptFileJobFlow(ctx, {
  secretId: 123n,
  file: myFile,
});
// Returns: { jobId, job, encryptedFile: Blob }

// Decrypt file flow
const result = await flows.decryptFileJobFlow(ctx, {
  secretId: 123n,
  file: ciferFile,
});
// Returns: { jobId, job, decryptedFile: Blob }
```

---

### web2.auth Namespace

Registration and authentication for Web2 mode (two-phase flow).

```typescript
import { web2 } from 'cifer-sdk';

// Phase 1: Register with email + password (sends OTP)
const reg = await web2.auth.register({
  email: 'user@example.com',
  password: 'securePassword123',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
// Returns: { principalId: string, message: string }

// Phase 2: Verify email OTP
const verified = await web2.auth.verifyEmail({
  email: 'user@example.com',
  otp: '123456',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
// Returns: { principalId: string, emailVerified: boolean }

// Phase 3: Register Ed25519 key (propagated to cluster nodes)
const keyResult = await web2.auth.registerKey({
  principalId: reg.principalId,
  password: 'securePassword123',
  ed25519Signer,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
// Returns: { principalId: string, nodeRegistrationStatus: string }

// If nodeRegistrationStatus !== 'complete', retry:
await web2.auth.retryNodeRegistration({
  principalId: reg.principalId,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Check node registration status
const status = await web2.auth.nodeRegistrationStatus({
  principalId: reg.principalId,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

#### Helper Functions

```typescript
// Resend OTP (60-second cooldown)
await web2.auth.resendOtp({
  email: 'user@example.com',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Forgot password (sends OTP)
await web2.auth.forgotPassword({
  email: 'user@example.com',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Reset password with OTP
await web2.auth.resetPassword({
  email: 'user@example.com',
  otp: '123456',
  newPassword: 'newSecurePassword456',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

---

### web2.session Namespace

Create and manage Web2 sessions. Two modes available:

#### Managed Session (Recommended)

SDK manages session lifecycle with auto-renewal:

```typescript
const session = await web2.session.createManagedSession({
  principalId: 'your-uuid',
  ed25519Signer,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  ttl: 900, // seconds (default: 900 = 15 minutes)
});

// Session properties:
session.signer;         // SignerAdapter (ephemeral EOA)
session.sessionAddress; // EOA address
session.principalId;    // UUID
session.expiresAt;      // ISO 8601 timestamp
session.isManaged;      // true

// Auto-renew if near expiry (60s skew)
await session.ensureValid();

// Force renewal
await session.renew();
```

#### Existing Session Key (Advanced)

Wrap a pre-existing session private key (e.g. from a TEE web front):

```typescript
const session = web2.session.useExistingSessionKey({
  sessionPrivateKey: '0xabc123...', // hex-encoded secp256k1 private key
  principalId: 'your-uuid',        // optional
});

// session.isManaged === false
// session.renew() throws Web2SessionError
// session.ensureValid() is a no-op
```

---

### web2.secret Namespace

Create and list Web2 secrets.

```typescript
// Create a new secret
const result = await web2.secret.createSecret({
  session,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
// Returns: { secretId: number }

// List all secrets for the principal
const list = await web2.secret.listSecrets({
  session,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
// Returns: { secrets: Array<{ secretId, status }> }
```

---

### web2.delegate Namespace

Set or remove delegates on Web2 secrets.

```typescript
// Set a delegate
await web2.delegate.setDelegate({
  session,
  secretId: 42,
  delegatePrincipalId: 'delegate-principal-uuid',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Remove a delegate (empty string)
await web2.delegate.setDelegate({
  session,
  secretId: 42,
  delegatePrincipalId: '',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

---

### web2.permit Namespace

Request permits for key rotation, ownership transfer, or delegation changes.

```typescript
// Key rotation (email+password, no session needed)
const result = await web2.permit.requestPermit({
  action: 'rotate',
  email: 'user@example.com',
  password: 'securePassword123',
  payload: { newPublicKey: '...' },
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
// Returns: { permitId: string }

// Transfer ownership (session required)
const result = await web2.permit.requestPermit({
  action: 'transfer',
  session,
  secretId: 42,
  payload: { newOwnerPrincipalId: 'new-owner-uuid' },
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Delegate permit (session required)
const result = await web2.permit.requestPermit({
  action: 'delegate',
  session,
  secretId: 42,
  payload: { delegatePrincipalId: 'delegate-uuid' },
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});
```

---

### web2.principal Namespace

Look up principals by email.

```typescript
const principal = await web2.principal.getByEmail(
  'colleague@example.com',
  'https://cifer-blackbox.ternoa.dev:3010',
);
// Returns: { principalId: string, emailHex: string }
```

---

### web2.blackbox Namespace

Session-first wrappers around the core `blackbox.*` functions. Automatically fills `chainId = -1` and uses the session signer. Calls `session.ensureValid()` before each request.

#### web2.blackbox.payload

```typescript
// Encrypt
const encrypted = await web2.blackbox.payload.encryptPayload({
  session,
  secretId: 42,
  plaintext: 'Hello, Web2!',
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  readClient: sdk.readClient,
  outputFormat: 'hex', // optional, default: 'hex'
});
// Returns: { cifer: string, encryptedMessage: string }

// Decrypt
const decrypted = await web2.blackbox.payload.decryptPayload({
  session,
  secretId: 42,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  readClient: sdk.readClient,
  inputFormat: 'hex', // optional
});
// Returns: { decryptedMessage: string }
```

#### web2.blackbox.files

```typescript
// Encrypt file
const job = await web2.blackbox.files.encryptFile({
  session,
  secretId: 42,
  file: myFile,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});
// Returns: { jobId: string, message: string }

// Decrypt file
const job = await web2.blackbox.files.decryptFile({
  session,
  secretId: 42,
  file: encryptedFile,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

// Decrypt from existing encrypt job
const job = await web2.blackbox.files.decryptExistingFile({
  session,
  secretId: 42,
  encryptJobId: previousJobId,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});
```

#### web2.blackbox.jobs

```typescript
// These are re-exported from core (no session needed):
const status = await web2.blackbox.jobs.getStatus(jobId, sdk.blackboxUrl);
const final = await web2.blackbox.jobs.pollUntilComplete(jobId, sdk.blackboxUrl, {
  onProgress: (job) => console.log(`${job.progress}%`),
});

// These require a session:
const blob = await web2.blackbox.jobs.download(jobId, {
  session,
  secretId: 42,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

await web2.blackbox.jobs.deleteJob(jobId, {
  session,
  secretId: 42,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});

const jobs = await web2.blackbox.jobs.list({
  session,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
  includeExpired: false,
});

const stats = await web2.blackbox.jobs.dataConsumption({
  session,
  blackboxUrl: sdk.blackboxUrl,
  readClient: sdk.readClient,
});
```

---

### web2.createClient Factory

Stateful client that stores session, `blackboxUrl`, and `readClient` so you don't pass them on every call.

```typescript
import { web2 } from 'cifer-sdk';

const client = web2.createClient({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  readClient: sdk.readClient,
});

// Session is auto-stored after creation
await client.createManagedSession({
  principalId: 'your-uuid',
  ed25519Signer,
});

// No need to pass session or blackboxUrl!
const secret = await client.createSecret();

const encrypted = await client.payload.encryptPayload({
  secretId: secret.secretId,
  plaintext: 'Hello!',
});

const decrypted = await client.payload.decryptPayload({
  secretId: secret.secretId,
  encryptedMessage: encrypted.encryptedMessage,
  cifer: encrypted.cifer,
});

// Other client methods:
await client.listSecrets();
await client.setDelegate({ secretId: 42, delegatePrincipalId: 'uuid' });
await client.getByEmail('colleague@example.com');
client.setSession(anotherSession); // manually replace stored session
```

The `Web2Client` interface provides: `session`, `blackboxUrl`, `readClient`, `createManagedSession()`, `useExistingSessionKey()`, `setSession()`, `createSecret()`, `listSecrets()`, `setDelegate()`, `requestPermit()`, `getByEmail()`, `payload.*`, `files.*`, `jobs.*`.

---

## Error Handling

All SDK errors extend `CiferError` with typed subclasses:

```
CiferError
├── ConfigError
│   ├── DiscoveryError
│   └── ChainNotSupportedError
├── AuthError
│   ├── SignatureError
│   ├── BlockStaleError
│   └── SignerMismatchError
├── BlackboxError
│   ├── EncryptionError
│   ├── DecryptionError
│   ├── JobError
│   └── SecretNotReadyError
├── KeyManagementError
│   ├── SecretNotFoundError
│   └── NotAuthorizedError
├── CommitmentsError
│   ├── CommitmentNotFoundError
│   ├── IntegrityError
│   ├── InvalidCiferSizeError
│   └── PayloadTooLargeError
├── Web2Error
│   ├── Web2SessionError (session expired, cannot renew)
│   └── Web2AuthError (registration, OTP, password errors)
└── FlowError
    ├── FlowAbortedError
    └── FlowTimeoutError
```

### Type Guards

```typescript
import {
  isCiferError,
  isBlockStaleError,
  isSecretNotReadyError,
  isWeb2Error,
  isWeb2SessionError,
} from 'cifer-sdk';
```

### Error Handling Example

```typescript
try {
  await blackbox.payload.encryptPayload({ ... });
} catch (error) {
  if (isBlockStaleError(error)) {
    console.log('RPC returning stale blocks');
  } else if (error instanceof SecretNotReadyError) {
    console.log('Wait for secret to sync');
  } else if (error instanceof SecretNotFoundError) {
    console.log('Secret not found:', error.secretId);
  } else if (isWeb2SessionError(error)) {
    console.log('Web2 session expired or cannot renew');
  } else if (isWeb2Error(error)) {
    console.log('Web2 error:', error.message);
  } else if (isCiferError(error)) {
    console.log('CIFER error:', error.code, error.message);
  } else {
    throw error;
  }
}
```

### Common Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| "Block number is too old" | RPC issues | SDK auto-retries 3x; check RPC reliability |
| "Secret is syncing" | Key generation in progress | Wait 30-60s; use `isSecretReady()` |
| "Signature verification failed" | Wrong signing method | Use EIP-191 `personal_sign` |
| "Not authorized" | Not owner/delegate | Check with `isAuthorized()` |
| "No active Web2 session" | Session not created or expired | Call `createManagedSession()` or pass session explicitly |
| "Web2 session expired" | Existing-key session cannot renew | Recreate session externally |
| "OTP verification failed" | Invalid or expired OTP | Use `resendOtp()` and try again |

---

## Complete Examples

### Browser: Encrypt/Decrypt Message

```typescript
import { createCiferSdk, Eip1193SignerAdapter, blackbox } from 'cifer-sdk';

async function encryptDecryptExample() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });
  const signer = new Eip1193SignerAdapter(window.ethereum);
  
  const chainId = 752025;
  const secretId = 123n;
  
  // Encrypt
  const encrypted = await blackbox.payload.encryptPayload({
    chainId,
    secretId,
    plaintext: 'Hello, CIFER!',
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  // Decrypt
  const decrypted = await blackbox.payload.decryptPayload({
    chainId,
    secretId,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  console.log('Decrypted:', decrypted.decryptedMessage);
}
```

### Node.js Server-Side

```typescript
import { createCiferSdk, RpcReadClient, blackbox, type SignerAdapter } from 'cifer-sdk';
import { Wallet } from 'ethers';

async function serverSideExample() {
  const readClient = new RpcReadClient({
    rpcUrlByChainId: {
      752025: 'https://mainnet.ternoa.network',
    },
  });
  
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
    readClient,
  });
  
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  const signer: SignerAdapter = {
    async getAddress() { return wallet.address; },
    async signMessage(message) { return wallet.signMessage(message); },
  };
  
  const encrypted = await blackbox.payload.encryptPayload({
    chainId: 752025,
    secretId: 123n,
    plaintext: 'Server-side encryption',
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  console.log('Encrypted on server:', encrypted);
}
```

### File Encryption with Progress

```typescript
import { createCiferSdk, Eip1193SignerAdapter, blackbox } from 'cifer-sdk';

async function fileEncryptionExample() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });
  const signer = new Eip1193SignerAdapter(window.ethereum);
  
  const file = document.getElementById('fileInput').files[0];
  
  // Start job
  const job = await blackbox.files.encryptFile({
    chainId: 752025,
    secretId: 123n,
    file,
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  // Poll with progress
  const finalStatus = await blackbox.jobs.pollUntilComplete(
    job.jobId,
    sdk.blackboxUrl,
    {
      onProgress: (status) => console.log(`Progress: ${status.progress}%`),
    }
  );
  
  if (finalStatus.status === 'completed') {
    const encryptedBlob = await blackbox.jobs.download(job.jobId, {
      blackboxUrl: sdk.blackboxUrl,
    });
    
    // Download file
    const url = URL.createObjectURL(encryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encrypted.cifer';
    a.click();
  }
}
```

### Web2: Email Registration + Encrypt/Decrypt

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';
import * as ed from '@noble/ed25519';

async function web2Example() {
  const blackboxUrl = 'https://cifer-blackbox.ternoa.dev:3010';

  // Initialize SDK (for readClient)
  const sdk = await createCiferSdk({ blackboxUrl });

  // --- Ed25519 key setup ---
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  const ed25519Signer = {
    async sign(message: Uint8Array) { return ed.signAsync(message, privateKey); },
    getPublicKey() { return publicKey; },
  };

  // --- Registration (one-time) ---
  const reg = await web2.auth.register({
    email: 'user@example.com',
    password: 'securePassword123',
    blackboxUrl,
  });

  // (User receives OTP via email)
  await web2.auth.verifyEmail({
    email: 'user@example.com',
    otp: '123456',
    blackboxUrl,
  });

  await web2.auth.registerKey({
    principalId: reg.principalId,
    password: 'securePassword123',
    ed25519Signer,
    blackboxUrl,
  });

  // --- Session ---
  const session = await web2.session.createManagedSession({
    principalId: reg.principalId,
    ed25519Signer,
    blackboxUrl,
  });

  // --- Create secret ---
  const secret = await web2.secret.createSecret({ session, blackboxUrl });

  // --- Encrypt ---
  const encrypted = await web2.blackbox.payload.encryptPayload({
    session,
    secretId: secret.secretId,
    plaintext: 'Hello from Web2!',
    blackboxUrl,
    readClient: sdk.readClient,
  });

  // --- Decrypt ---
  const decrypted = await web2.blackbox.payload.decryptPayload({
    session,
    secretId: secret.secretId,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
    blackboxUrl,
    readClient: sdk.readClient,
  });

  console.log('Decrypted:', decrypted.decryptedMessage);
  // Output: "Hello from Web2!"
}
```

### Web2: Using the Client Factory

```typescript
import { createCiferSdk, web2 } from 'cifer-sdk';

async function web2ClientExample() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });

  // Create stateful client
  const client = web2.createClient({
    blackboxUrl: sdk.blackboxUrl,
    readClient: sdk.readClient,
  });

  // Create session (auto-stored in client)
  await client.createManagedSession({
    principalId: 'your-uuid',
    ed25519Signer,
  });

  // All calls auto-use stored session + blackboxUrl + readClient
  const secret = await client.createSecret();

  const encrypted = await client.payload.encryptPayload({
    secretId: secret.secretId,
    plaintext: 'Simplified Web2 API!',
  });

  const decrypted = await client.payload.decryptPayload({
    secretId: secret.secretId,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
  });

  console.log('Decrypted:', decrypted.decryptedMessage);
}
```

---

## Type Definitions

```typescript
type Address = `0x${string}`;
type Bytes32 = `0x${string}`;
type Hex = `0x${string}`;
type ChainId = number;
type SecretId = bigint;
type OutputFormat = 'hex' | 'base64';
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
type JobType = 'encrypt' | 'decrypt';

interface SecretState {
  owner: Address;
  delegate: Address;
  isSyncing: boolean;
  clusterId: number;
  secretType: number;
  publicKeyCid: string;
}

interface JobInfo {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  secretId: number;
  chainId: ChainId;
  createdAt: number;
  completedAt?: number;
  error?: string;
  resultFileName?: string;
  ttl: number;
  originalSize?: number;
}

interface FlowResult<T> {
  success: boolean;
  plan: FlowPlan;
  data?: T;
  error?: Error;
  receipts?: TransactionReceipt[];
}

// --- Web2 Types ---

const WEB2_CHAIN_ID = -1; // Sentinel chain ID for Web2 operations

interface Ed25519Signer {
  sign(message: Uint8Array): Promise<Uint8Array>;
  getPublicKey(): Uint8Array;
}

interface Web2Session {
  readonly principalId: string;       // UUID
  readonly sessionAddress: string;    // Session EOA address
  readonly expiresAt: string;         // ISO 8601 timestamp
  readonly signer: SignerAdapter;     // Ephemeral EOA signer
  readonly isManaged: boolean;        // true = auto-renew capable
  ensureValid(): Promise<void>;       // Check expiry, auto-renew if needed
  renew(): Promise<void>;             // Force renewal (managed only)
}

interface Web2ClientConfig {
  blackboxUrl: string;
  readClient?: ReadClient;
  fetch?: typeof fetch;
}

interface Web2Client {
  readonly session: Web2Session | null;
  readonly blackboxUrl: string;
  readonly readClient: ReadClient | undefined;
  createManagedSession(params): Promise<Web2Session>;
  useExistingSessionKey(params): Web2Session;
  setSession(session: Web2Session): void;
  createSecret(params?): Promise<CreateWeb2SecretResult>;
  listSecrets(params?): Promise<ListWeb2SecretsResult>;
  setDelegate(params): Promise<SetWeb2DelegateResult>;
  requestPermit(params): Promise<RequestPermitResult>;
  getByEmail(email, blackboxUrl?): Promise<PrincipalByEmailResult>;
  payload: { encryptPayload(params), decryptPayload(params) };
  files: { encryptFile(params), decryptFile(params), decryptExistingFile(params) };
  jobs: { getStatus(), pollUntilComplete(), download(), deleteJob(), list(), dataConsumption() };
}
```

---

## Resources

- **npm**: [https://www.npmjs.com/package/cifer-sdk](https://www.npmjs.com/package/cifer-sdk)
- **GitHub**: [https://github.com/cifer-security/cifer-sdk](https://github.com/cifer-security/cifer-sdk)
- **Blackbox API**: `https://cifer-blackbox.ternoa.dev:3010`
- **Supported Chain**: Ternoa (752025)

---

*This skill enables AI agents to implement quantum-resistant encryption in blockchain applications using the CIFER SDK.*
