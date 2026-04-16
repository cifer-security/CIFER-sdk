#!/usr/bin/env node

/**
 * Generate llm.txt - Complete SDK documentation for AI agents
 * 
 * This script generates a comprehensive plaintext documentation file
 * that AI agents can use to understand the CIFER SDK.
 * 
 * Output: docs-site/static/llm.txt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));

const SEPARATOR = '='.repeat(80);
const SUB_SEPARATOR = '-'.repeat(80);

function generateHeader() {
  return `CIFER SDK - Complete Reference for AI Agents
${SEPARATOR}

This file contains complete documentation for the cifer-sdk package.
AI agents can use this file to understand how to implement CIFER encryption
in applications. Point your AI assistant to this file for accurate SDK usage.

Generated: ${new Date().toISOString()}
Version: ${packageJson.version}
Package: ${packageJson.name}

${SEPARATOR}
TABLE OF CONTENTS
${SEPARATOR}

1. OVERVIEW
2. INSTALLATION
3. QUICK START
4. CORE CONCEPTS
   - Secrets
   - Authorization Model
   - Encryption Model
   - Block Freshness
   - Transaction Intents
   - Web2 Mode
5. SDK INITIALIZATION & WALLET INTEGRATION
   - Discovery
   - Wallet Adapters (MetaMask, WalletConnect, Thirdweb, Private Key, wagmi, Coinbase)
6. NAMESPACE REFERENCE
   - keyManagement
   - blackbox.payload
   - blackbox.files
   - blackbox.jobs
   - commitments
   - flows
7. WEB2 NAMESPACE REFERENCE
   - web2.auth
   - web2.session
   - web2.secret
   - web2.delegate
   - web2.permit
   - web2.principal
   - web2.blackbox (payload, files, jobs)
8. TYPE DEFINITIONS
9. ERROR HANDLING
10. COMPLETE EXAMPLES
`;
}

function generateOverview() {
  return `
${SEPARATOR}
1. OVERVIEW
${SEPARATOR}

CIFER (Cryptographic Infrastructure for Encrypted Records) SDK provides 
quantum-resistant encryption for blockchain applications.

Key Features:
- Quantum-resistant encryption using ML-KEM-768 (NIST standardized)
- Multi-chain support with automatic discovery
- Wallet agnostic - works with any EIP-1193 provider
- Zero wallet dependencies - bring your own wallet
- Transaction intent pattern - you control transaction execution
- File encryption with async job system
- On-chain commitments with log-based retrieval
- High-level flows for common operations
- Web2 mode - email + password registration with session-based auth (no wallet needed)

Architecture:
- SecretsController (on-chain): Manages secret ownership and delegation
- Blackbox API (off-chain): Handles encryption/decryption operations
- Enclave Cluster: Stores private key shards using threshold cryptography
- IPFS: Stores public keys for encryption
`;
}

function generateInstallation() {
  return `
${SEPARATOR}
2. INSTALLATION
${SEPARATOR}

npm install cifer-sdk
# or
yarn add cifer-sdk
# or
pnpm add cifer-sdk

Requirements:
- Node.js 18.0 or higher
- TypeScript 5.0+ (recommended)

Runtime Dependencies:
- @noble/secp256k1 (for PrivateKeySignerAdapter / Web2 sessions)
- @noble/hashes (for keccak256 address derivation)

ESM Import:
import { createCiferSdk, keyManagement, blackbox, commitments, flows, web2 } from 'cifer-sdk';

CommonJS Import:
const { createCiferSdk, keyManagement, blackbox, web2 } = require('cifer-sdk');

Sub-path Imports:
import * as web2 from 'cifer-sdk/web2';
import { encryptPayload } from 'cifer-sdk/blackbox';
import { Eip1193SignerAdapter } from 'cifer-sdk/adapters';
`;
}

function generateQuickStart() {
  return `
${SEPARATOR}
3. QUICK START
${SEPARATOR}

// 1. Initialize SDK with auto-discovery
import { createCiferSdk, Eip1193SignerAdapter, blackbox } from 'cifer-sdk';

const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// 2. Connect wallet (browser)
const signer = new Eip1193SignerAdapter(window.ethereum);

// 3. Encrypt data
const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,  // Your secret ID
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
`;
}

function generateCoreConcepts() {
  return `
${SEPARATOR}
4. CORE CONCEPTS
${SEPARATOR}

${SUB_SEPARATOR}
4.1 SECRETS
${SUB_SEPARATOR}

A secret is the core primitive in CIFER. Each secret represents an ML-KEM-768 
key pair where:
- Public key: Stored on IPFS, used for encryption
- Private key: Split across enclave cluster using threshold cryptography

Secret State Structure:
{
  owner: Address,        // Can transfer, set delegate, decrypt
  delegate: Address,     // Can decrypt (zero address if none)
  isSyncing: boolean,    // True while key generation in progress
  clusterId: number,     // Which enclave cluster holds shards
  secretType: number,    // 1 = ML-KEM-768 (standard)
  publicKeyCid: string,  // IPFS CID of public key (empty if syncing)
}

Secret Lifecycle:
1. Creation: User calls createSecret() on SecretsController (pays fee)
2. Syncing: Enclave cluster generates keys and stores shards (~30-60 seconds)
3. Ready: isSyncing becomes false, publicKeyCid is set
4. Usage: Owner/delegate can encrypt and decrypt

${SUB_SEPARATOR}
4.2 AUTHORIZATION MODEL
${SUB_SEPARATOR}

Two-role authorization. Encryption requires only a valid signature — any wallet
can encrypt for any secret. Decryption and management are restricted by role:

| Role       | Encrypt | Decrypt | Transfer | Set Delegate |
|------------|---------|---------|----------|--------------|
| Owner      | Yes     | Yes     | Yes      | Yes          |
| Delegate   | Yes     | Yes     | No       | No           |
| Any wallet | Yes     | No      | No       | No           |

Setting a delegate:
const txIntent = keyManagement.buildSetDelegateTx({
  chainId,
  controllerAddress,
  secretId: 123n,
  newDelegate: '0xDelegateAddress...',
});

Removing a delegate:
const txIntent = keyManagement.buildRemoveDelegationTx({
  chainId,
  controllerAddress,
  secretId: 123n,
});

${SUB_SEPARATOR}
4.3 ENCRYPTION MODEL
${SUB_SEPARATOR}

CIFER uses hybrid encryption:
1. ML-KEM-768: Post-quantum key encapsulation (1088-byte ciphertext)
2. AES-256-GCM: Symmetric encryption for actual data

Output Format:
| Field            | Size          | Description                          |
|------------------|---------------|--------------------------------------|
| cifer            | 1104 bytes    | ML-KEM ciphertext (1088) + tag (16)  |
| encryptedMessage | Variable      | AES-GCM encrypted data (max 16KB)    |

${SUB_SEPARATOR}
4.4 BLOCK FRESHNESS
${SUB_SEPARATOR}

All blackbox API calls require a recent block number in the signed payload
to prevent replay attacks.

- Freshness window: ~100 blocks (~10 minutes)
- SDK automatically retries with fresh block (up to 3 times)
- If you see "block too old" errors, check RPC reliability

${SUB_SEPARATOR}
4.5 TRANSACTION INTENTS
${SUB_SEPARATOR}

The SDK returns transaction intents instead of executing transactions directly:

interface TxIntent {
  chainId: number;   // Target chain
  to: Address;       // Contract address
  data: Hex;         // Encoded calldata
  value?: bigint;    // Native token value (if payable)
}

Execute with any wallet library:

// ethers v6
await signer.sendTransaction({ to: txIntent.to, data: txIntent.data, value: txIntent.value });

// wagmi
await sendTransaction({ to: txIntent.to, data: txIntent.data, value: txIntent.value });

// viem
await walletClient.sendTransaction({ to: txIntent.to, data: txIntent.data, value: txIntent.value });

${SUB_SEPARATOR}
4.6 WEB2 MODE
${SUB_SEPARATOR}

CIFER supports Web2 mode for apps that don't use blockchain wallets.
Users register with email + password and authenticate via Ed25519-signed sessions.

Web2 vs Web3:
| Feature          | Web3                          | Web2                                   |
|------------------|-------------------------------|----------------------------------------|
| Auth             | EIP-1193 wallet               | Email + password + Ed25519 key         |
| Chain ID         | Real chain ID (e.g. 752025)   | WEB2_CHAIN_ID = -1 (sentinel)          |
| Block freshness  | RPC eth_blockNumber           | Date.now() (no RPC needed)             |
| Signer           | Wallet personal_sign          | Session EOA personal_sign              |
| Secret creation  | On-chain transaction          | POST /web2/secret API call             |

WEB2_CHAIN_ID = -1: Sentinel value used for all Web2 operations.
When chainId is -1, the SDK uses Date.now() instead of an RPC block number.

Sessions:
1. An ephemeral secp256k1 keypair is generated (session key)
2. The session is authenticated with an Ed25519 signature
3. The session key signs blackbox requests (same EIP-191 format as wallets)
4. Sessions expire and can be auto-renewed (managed sessions)
`;
}

function generateSdkInitialization() {
  return `
${SEPARATOR}
5. SDK INITIALIZATION
${SEPARATOR}

${SUB_SEPARATOR}
5.1 WITH DISCOVERY (Recommended)
${SUB_SEPARATOR}

const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Get supported chains
sdk.getSupportedChainIds(); // [752025, 11155111, ...]

// Get contract address
sdk.getControllerAddress(752025); // '0x...'

// Get RPC URL
sdk.getRpcUrl(752025); // 'https://...'

${SUB_SEPARATOR}
5.2 WITH OVERRIDES
${SUB_SEPARATOR}

const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  chainOverrides: {
    752025: {
      rpcUrl: 'https://my-private-rpc.example.com',
      secretsControllerAddress: '0x...',
    },
  },
});

${SUB_SEPARATOR}
5.3 SYNCHRONOUS (No Discovery)
${SUB_SEPARATOR}

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

${SUB_SEPARATOR}
5.4 WALLET INTEGRATION
${SUB_SEPARATOR}

The SDK is wallet-agnostic. All wallets implement this interface:

interface SignerAdapter {
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>; // EIP-191 personal_sign
  sendTransaction?(txRequest: TxIntent): Promise<TxExecutionResult>; // optional
}

--- MetaMask ---

import { Eip1193SignerAdapter } from 'cifer-sdk';

// Check if MetaMask is installed
if (typeof window.ethereum === 'undefined') {
  throw new Error('MetaMask is not installed');
}

// Request account access
await window.ethereum.request({ method: 'eth_requestAccounts' });

// Create signer
const signer = new Eip1193SignerAdapter(window.ethereum);
const address = await signer.getAddress();

// Handle account changes
window.ethereum.on('accountsChanged', (accounts) => {
  signer.clearCache();
  console.log('Switched to:', accounts[0]);
});

--- WalletConnect v2 ---

npm install @walletconnect/modal @walletconnect/ethereum-provider

import { EthereumProvider } from '@walletconnect/ethereum-provider';

const provider = await EthereumProvider.init({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [752025],
  showQrModal: true,
  metadata: {
    name: 'My CIFER App',
    description: 'Quantum-resistant encryption',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/icon.png'],
  },
});

await provider.connect();
const signer = new Eip1193SignerAdapter(provider);

--- Thirdweb ---

npm install thirdweb

import { createThirdwebClient, defineChain } from 'thirdweb';
import { createWallet, injectedProvider } from 'thirdweb/wallets';

const thirdwebClient = createThirdwebClient({
  clientId: 'YOUR_THIRDWEB_CLIENT_ID',
});

const ternoa = defineChain({
  id: 752025,
  name: 'Ternoa',
  nativeCurrency: { name: 'CAPS', symbol: 'CAPS', decimals: 18 },
  rpcUrls: { default: { http: ['https://mainnet.ternoa.network'] } },
});

const wallet = createWallet('io.metamask');
await wallet.connect({ client: thirdwebClient, chain: ternoa });

const provider = injectedProvider('io.metamask');
const signer = new Eip1193SignerAdapter(provider);

// For in-app wallets (email/social login):
import { inAppWallet } from 'thirdweb/wallets';

const wallet = inAppWallet();
const account = await wallet.connect({
  client: thirdwebClient,
  chain: ternoa,
  strategy: 'email',
  email: 'user@example.com',
});

const signer = {
  async getAddress() { return account.address; },
  async signMessage(message) { return account.signMessage({ message }); },
};

--- Private Key (Server-Side) ---

WARNING: Never expose private keys in frontend code!

Using ethers.js:
npm install ethers

import { Wallet } from 'ethers';

const privateKey = process.env.PRIVATE_KEY;
const wallet = new Wallet(privateKey);

const signer = {
  async getAddress() { return wallet.address; },
  async signMessage(message) { return wallet.signMessage(message); },
};

Using viem:
npm install viem

import { privateKeyToAccount } from 'viem/accounts';

const privateKey = process.env.PRIVATE_KEY;
const account = privateKeyToAccount(privateKey);

const signer = {
  async getAddress() { return account.address; },
  async signMessage(message) { return account.signMessage({ message }); },
};

--- wagmi (React) ---

npm install wagmi viem @tanstack/react-query

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

--- Coinbase Wallet ---

npm install @coinbase/wallet-sdk

import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'My CIFER App',
  appLogoUrl: 'https://myapp.com/logo.png',
});

const provider = coinbaseWallet.makeWeb3Provider({ options: 'all' });
await provider.request({ method: 'eth_requestAccounts' });

const signer = new Eip1193SignerAdapter(provider);

--- Supporting Multiple Wallets ---

type WalletType = 'metamask' | 'walletconnect' | 'coinbase';

async function createSigner(type: WalletType): Promise<SignerAdapter> {
  switch (type) {
    case 'metamask':
      return new Eip1193SignerAdapter(window.ethereum);
    case 'walletconnect':
      const wcProvider = await EthereumProvider.init({ /* config */ });
      await wcProvider.connect();
      return new Eip1193SignerAdapter(wcProvider);
    case 'coinbase':
      const cbProvider = coinbaseWallet.makeWeb3Provider();
      await cbProvider.request({ method: 'eth_requestAccounts' });
      return new Eip1193SignerAdapter(cbProvider);
  }
}
`;
}

function generateKeyManagementReference() {
  return `
${SEPARATOR}
6.1 keyManagement NAMESPACE
${SEPARATOR}

Interact with the SecretsController contract for secret management.

${SUB_SEPARATOR}
READ OPERATIONS
${SUB_SEPARATOR}

getSecretCreationFee(params): Promise<bigint>
  Get the fee required to create a new secret.
  
  Parameters:
    - chainId: number
    - controllerAddress: Address
    - readClient: ReadClient
  
  Returns: Fee in wei (bigint)
  
  Example:
    const fee = await keyManagement.getSecretCreationFee({
      chainId: 752025,
      controllerAddress: sdk.getControllerAddress(752025),
      readClient: sdk.readClient,
    });

${SUB_SEPARATOR}

getSecret(params, secretId): Promise<SecretState>
  Get the full state of a secret.
  
  Parameters:
    - params: { chainId, controllerAddress, readClient }
    - secretId: bigint
  
  Returns: SecretState object
  Throws: SecretNotFoundError if secret doesn't exist
  
  Example:
    const state = await keyManagement.getSecret({
      chainId: 752025,
      controllerAddress: sdk.getControllerAddress(752025),
      readClient: sdk.readClient,
    }, 123n);
    
    console.log(state.owner);        // '0x...'
    console.log(state.delegate);     // '0x...' or zero address
    console.log(state.isSyncing);    // false when ready
    console.log(state.publicKeyCid); // IPFS CID

${SUB_SEPARATOR}

isSecretReady(params, secretId): Promise<boolean>
  Check if a secret is ready for use (not syncing).
  
  Example:
    const ready = await keyManagement.isSecretReady(params, 123n);

${SUB_SEPARATOR}

isAuthorized(params, secretId, address): Promise<boolean>
  Check if an address is authorized (owner or delegate).
  
  Example:
    const canDecrypt = await keyManagement.isAuthorized(params, 123n, '0x...');

${SUB_SEPARATOR}

getSecretsByWallet(params, wallet): Promise<{ owned: bigint[], delegated: bigint[] }>
  Get all secrets owned by or delegated to a wallet.
  
  Example:
    const secrets = await keyManagement.getSecretsByWallet(params, '0xUser...');
    console.log('Owned:', secrets.owned);
    console.log('Delegated:', secrets.delegated);

${SUB_SEPARATOR}

getSecretsCountByWallet(params, wallet): Promise<{ ownedCount: bigint, delegatedCount: bigint }>
  Get counts of secrets (more gas-efficient than getSecretsByWallet).

${SUB_SEPARATOR}
TRANSACTION BUILDERS
${SUB_SEPARATOR}

buildCreateSecretTx(params): TxIntentWithMeta
  Build transaction to create a new secret.
  
  Parameters:
    - chainId: number
    - controllerAddress: Address
    - fee: bigint (from getSecretCreationFee)
  
  Returns: TxIntentWithMeta (includes value for the fee)
  
  Example:
    const fee = await keyManagement.getSecretCreationFee(params);
    const txIntent = keyManagement.buildCreateSecretTx({
      chainId: 752025,
      controllerAddress: sdk.getControllerAddress(752025),
      fee,
    });
    await wallet.sendTransaction(txIntent);

${SUB_SEPARATOR}

buildSetDelegateTx(params): TxIntentWithMeta
  Build transaction to set or update a delegate.
  
  Parameters:
    - chainId: number
    - controllerAddress: Address
    - secretId: bigint
    - newDelegate: Address
  
  Example:
    const txIntent = keyManagement.buildSetDelegateTx({
      chainId: 752025,
      controllerAddress: sdk.getControllerAddress(752025),
      secretId: 123n,
      newDelegate: '0xDelegate...',
    });

${SUB_SEPARATOR}

buildRemoveDelegationTx(params): TxIntentWithMeta
  Build transaction to remove a delegate (sets to zero address).

${SUB_SEPARATOR}

buildTransferSecretTx(params): TxIntentWithMeta
  Build transaction to transfer ownership (clears delegate).
  
  Parameters:
    - chainId: number
    - controllerAddress: Address
    - secretId: bigint
    - newOwner: Address
  
  WARNING: Ownership transfer is irreversible.

${SUB_SEPARATOR}
EVENT PARSING
${SUB_SEPARATOR}

extractSecretIdFromReceipt(logs): bigint
  Extract secret ID from createSecret transaction receipt.
  
  Example:
    const receipt = await provider.waitForTransaction(hash);
    const secretId = keyManagement.extractSecretIdFromReceipt(receipt.logs);

parseSecretCreatedLog(log): ParsedSecretCreatedEvent
  Parse a SecretCreated event log.

parseSecretSyncedLog(log): ParsedSecretSyncedEvent
  Parse a SecretSynced event log.

parseDelegateUpdatedLog(log): ParsedDelegateUpdatedEvent
  Parse a DelegateUpdated event log.
`;
}

function generateBlackboxPayloadReference() {
  return `
${SEPARATOR}
6.2 blackbox.payload NAMESPACE
${SEPARATOR}

Encrypt and decrypt short messages (< 16KB).

${SUB_SEPARATOR}
encryptPayload(params): Promise<EncryptPayloadResult>
${SUB_SEPARATOR}

Encrypt a plaintext message using a secret's public key.

Parameters:
  - chainId: number - Chain where secret exists
  - secretId: bigint | number - Secret ID to use
  - plaintext: string - Message to encrypt
  - signer: SignerAdapter - For authentication
  - readClient: ReadClient - For block number
  - blackboxUrl: string - Blackbox API URL
  - outputFormat?: 'hex' | 'base64' - Default: 'hex'

Returns:
  {
    cifer: string,            // ML-KEM ciphertext (1104 bytes)
    encryptedMessage: string, // AES-GCM encrypted data
  }

Throws:
  - BlackboxError: API call failed
  - BlockStaleError: Block number too old (auto-retried)
  - SecretNotReadyError: Secret still syncing

Example:
  const encrypted = await blackbox.payload.encryptPayload({
    chainId: 752025,
    secretId: 123n,
    plaintext: 'My secret message',
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
    outputFormat: 'hex',
  });
  
  // Store or transmit encrypted.cifer and encrypted.encryptedMessage

${SUB_SEPARATOR}
decryptPayload(params): Promise<DecryptPayloadResult>
${SUB_SEPARATOR}

Decrypt a message. Caller must be owner or delegate.

Parameters:
  - chainId: number
  - secretId: bigint | number
  - encryptedMessage: string - From encryptPayload
  - cifer: string - From encryptPayload
  - signer: SignerAdapter - Must be owner or delegate
  - readClient: ReadClient
  - blackboxUrl: string
  - inputFormat?: 'hex' | 'base64' - Must match encryption output

Returns:
  {
    decryptedMessage: string, // Original plaintext
  }

Throws:
  - BlackboxError: API call failed
  - NotAuthorizedError: Signer is not owner or delegate

Example:
  const decrypted = await blackbox.payload.decryptPayload({
    chainId: 752025,
    secretId: 123n,
    encryptedMessage: encrypted.encryptedMessage,
    cifer: encrypted.cifer,
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
    inputFormat: 'hex',
  });
  
  console.log(decrypted.decryptedMessage);
`;
}

function generateBlackboxFilesReference() {
  return `
${SEPARATOR}
6.3 blackbox.files NAMESPACE
${SEPARATOR}

Encrypt and decrypt large files using async jobs.

${SUB_SEPARATOR}
encryptFile(params): Promise<FileJobResult>
${SUB_SEPARATOR}

Start a file encryption job.

Parameters:
  - chainId: number
  - secretId: bigint | number
  - file: File | Blob - The file to encrypt
  - signer: SignerAdapter
  - readClient: ReadClient
  - blackboxUrl: string

Returns:
  {
    jobId: string,   // Job ID for polling/download
    message: string, // Success message
  }

Example:
  const job = await blackbox.files.encryptFile({
    chainId: 752025,
    secretId: 123n,
    file: myFile,
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  console.log('Job started:', job.jobId);

${SUB_SEPARATOR}
decryptFile(params): Promise<FileJobResult>
${SUB_SEPARATOR}

Start a file decryption job. Accepts .cifer files.

Parameters: Same as encryptFile
Returns: { jobId, message }

${SUB_SEPARATOR}
decryptExistingFile(params): Promise<FileJobResult>
${SUB_SEPARATOR}

Decrypt from an existing encrypt job without re-uploading.

Parameters:
  - chainId: number
  - secretId: bigint | number
  - encryptJobId: string - Previous encrypt job ID
  - signer: SignerAdapter
  - readClient: ReadClient
  - blackboxUrl: string
`;
}

function generateBlackboxJobsReference() {
  return `
${SEPARATOR}
6.4 blackbox.jobs NAMESPACE
${SEPARATOR}

Manage async file encryption/decryption jobs.

${SUB_SEPARATOR}
getStatus(jobId, blackboxUrl, options?): Promise<JobInfo>
${SUB_SEPARATOR}

Get status of a job (no auth required).

Returns:
  {
    id: string,
    type: 'encrypt' | 'decrypt',
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired',
    progress: number,        // 0-100
    secretId: number,
    chainId: number,
    createdAt: number,       // Unix timestamp ms
    completedAt?: number,
    expiredAt?: number,
    error?: string,          // If failed
    resultFileName?: string,
    ttl: number,
    originalSize?: number,
  }

Example:
  const status = await blackbox.jobs.getStatus(jobId, sdk.blackboxUrl);
  console.log(\`Progress: \${status.progress}%\`);

${SUB_SEPARATOR}
pollUntilComplete(jobId, blackboxUrl, options?): Promise<JobInfo>
${SUB_SEPARATOR}

Poll until job reaches terminal state.

Options:
  - intervalMs?: number - Poll interval (default: 2000)
  - maxAttempts?: number - Max attempts (default: 60)
  - onProgress?: (job: JobInfo) => void
  - abortSignal?: AbortSignal

Example:
  const finalStatus = await blackbox.jobs.pollUntilComplete(
    jobId,
    sdk.blackboxUrl,
    {
      intervalMs: 2000,
      maxAttempts: 120,
      onProgress: (job) => console.log(\`Progress: \${job.progress}%\`),
    }
  );

${SUB_SEPARATOR}
download(jobId, params): Promise<Blob>
${SUB_SEPARATOR}

Download result of a completed job.

For encrypt jobs: No auth required
For decrypt jobs: Auth required (provide chainId, secretId, signer, readClient)

Example (encrypt job):
  const blob = await blackbox.jobs.download(jobId, {
    blackboxUrl: sdk.blackboxUrl,
  });

Example (decrypt job):
  const blob = await blackbox.jobs.download(jobId, {
    blackboxUrl: sdk.blackboxUrl,
    chainId: 752025,
    secretId: 123n,
    signer,
    readClient: sdk.readClient,
  });

${SUB_SEPARATOR}
deleteJob(jobId, params): Promise<void>
${SUB_SEPARATOR}

Delete a job (mark for cleanup).

${SUB_SEPARATOR}
list(params): Promise<ListJobsResult>
${SUB_SEPARATOR}

List all jobs for the authenticated wallet.

Parameters:
  - chainId: number
  - signer: SignerAdapter
  - readClient: ReadClient
  - blackboxUrl: string
  - includeExpired?: boolean

Returns:
  {
    jobs: JobInfo[],
    count: number,
    includeExpired: boolean,
  }

${SUB_SEPARATOR}
dataConsumption(params): Promise<DataConsumption>
${SUB_SEPARATOR}

Get usage statistics for the authenticated wallet.

Returns:
  {
    wallet: Address,
    encryption: { limit, used, remaining, count, limitGB, usedGB, remainingGB },
    decryption: { limit, used, remaining, count, limitGB, usedGB, remainingGB },
  }
`;
}

function generateCommitmentsReference() {
  return `
${SEPARATOR}
6.5 commitments NAMESPACE
${SEPARATOR}

Store and retrieve encrypted data on-chain.

The commitment pattern:
1. Only hashes stored in contract storage (gas efficient)
2. Full encrypted bytes emitted in events
3. Retrieve from logs using block number from metadata

${SUB_SEPARATOR}
ciferDataExists(params, dataId): Promise<boolean>
${SUB_SEPARATOR}

Check if commitment data exists.

Parameters:
  - params: { chainId, contractAddress, readClient }
  - dataId: Bytes32 - The data key

${SUB_SEPARATOR}
getCIFERMetadata(params, dataId): Promise<CIFERMetadata>
${SUB_SEPARATOR}

Get metadata for a commitment.

Returns:
  {
    secretId: bigint,
    storedAtBlock: number,
    ciferHash: Bytes32,
    encryptedMessageHash: Bytes32,
  }

Throws: CommitmentNotFoundError

Example:
  const metadata = await commitments.getCIFERMetadata({
    chainId: 752025,
    contractAddress: '0xYourContract...',
    readClient: sdk.readClient,
  }, dataKey);
  
  console.log('Stored at block:', metadata.storedAtBlock);

${SUB_SEPARATOR}
fetchCommitmentFromLogs(params): Promise<CommitmentData>
${SUB_SEPARATOR}

Fetch encrypted data from event logs.

Parameters:
  - chainId: number
  - contractAddress: Address
  - dataId: Bytes32
  - storedAtBlock: number - From getCIFERMetadata
  - readClient: ReadClient

Returns:
  {
    cifer: Hex,
    encryptedMessage: Hex,
    ciferHash: Bytes32,
    encryptedMessageHash: Bytes32,
  }

Example:
  const data = await commitments.fetchCommitmentFromLogs({
    chainId: 752025,
    contractAddress: '0x...',
    dataId: dataKey,
    storedAtBlock: metadata.storedAtBlock,
    readClient: sdk.readClient,
  });

${SUB_SEPARATOR}
verifyCommitmentIntegrity(data, metadata?): IntegrityResult
${SUB_SEPARATOR}

Verify integrity of commitment data.

Returns:
  {
    valid: boolean,
    checks: {
      ciferSize: { valid, actual, expected },
      payloadSize: { valid, actual, max },
      ciferHash?: { valid, expected, actual },
      encryptedMessageHash?: { valid, expected, actual },
    },
  }

${SUB_SEPARATOR}
assertCommitmentIntegrity(data, metadata?): void
${SUB_SEPARATOR}

Verify and throw on failure.

Throws:
  - InvalidCiferSizeError: cifer not 1104 bytes
  - PayloadTooLargeError: encryptedMessage > 16KB
  - IntegrityError: Hash mismatch

${SUB_SEPARATOR}
validateForStorage(cifer, encryptedMessage): void
${SUB_SEPARATOR}

Validate before storing. Throws on invalid sizes.

${SUB_SEPARATOR}
buildStoreCommitmentTx(params): TxIntentWithMeta
${SUB_SEPARATOR}

Build transaction to store encrypted commitment.

Parameters:
  - chainId: number
  - contractAddress: Address
  - storeFunction: AbiFunction - Your contract's store function ABI
  - args: { key: Bytes32, secretId: bigint, encryptedMessage: Hex, cifer: Hex }
  - validate?: boolean - Default: true

Example:
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

${SUB_SEPARATOR}
CONSTANTS
${SUB_SEPARATOR}

CIFER_ENVELOPE_BYTES = 1104  // Fixed size of cifer field
MAX_PAYLOAD_BYTES = 16384   // Maximum encrypted message size (16KB)
`;
}

function generateFlowsReference() {
  return `
${SEPARATOR}
6.6 flows NAMESPACE
${SEPARATOR}

High-level orchestrated operations that combine multiple primitives.

Flows support two modes:
- plan: Returns a plan describing steps (dry run)
- execute: Actually performs the operations

${SUB_SEPARATOR}
FLOW CONTEXT
${SUB_SEPARATOR}

All flows require a context object:

const ctx = {
  // Required
  signer: SignerAdapter,
  readClient: ReadClient,
  blackboxUrl: string,
  chainId: number,
  
  // Optional
  controllerAddress?: Address,  // Required for keyManagement flows
  
  // For execute mode
  txExecutor?: (intent: TxIntent) => Promise<TxExecutionResult>,
  
  // Configuration
  pollingStrategy?: {
    intervalMs: number,  // Default: 2000
    maxAttempts: number, // Default: 60
  },
  
  // Callbacks
  logger?: (message: string) => void,
  abortSignal?: AbortSignal,
};

${SUB_SEPARATOR}
createSecretAndWaitReady(ctx, options?): Promise<FlowResult<CreateSecretResult>>
${SUB_SEPARATOR}

Create a secret and wait until it's ready for use.

Steps:
1. Read secret creation fee
2. Submit createSecret transaction
3. Poll until secret is synced

Example:
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

${SUB_SEPARATOR}
encryptThenPrepareCommitTx(ctx, params, options?): Promise<FlowResult<EncryptThenCommitResult>>
${SUB_SEPARATOR}

Encrypt data and prepare a store transaction.

Parameters:
  - secretId: bigint
  - plaintext: string
  - key: Bytes32
  - commitmentContract: Address
  - storeFunction?: AbiFunction

Returns on success:
  {
    cifer: Hex,
    encryptedMessage: Hex,
    txIntent: TxIntentWithMeta,
  }

Example:
  const result = await flows.encryptThenPrepareCommitTx(ctx, {
    secretId: 123n,
    plaintext: 'My secret data',
    key: dataKey,
    commitmentContract: '0x...',
  });
  
  if (result.success) {
    await wallet.sendTransaction(result.data.txIntent);
  }

${SUB_SEPARATOR}
retrieveFromLogsThenDecrypt(ctx, params, options?): Promise<FlowResult<RetrieveAndDecryptResult>>
${SUB_SEPARATOR}

Retrieve encrypted data from logs and decrypt it.

Parameters:
  - secretId: bigint
  - dataId: Bytes32
  - commitmentContract: Address
  - storedAtBlock?: number - Fetched if not provided
  - skipIntegrityCheck?: boolean

Returns on success:
  {
    decryptedMessage: string,
    secretId: bigint,
    storedAtBlock: number,
  }

Example:
  const result = await flows.retrieveFromLogsThenDecrypt(ctx, {
    secretId: 123n,
    dataId: dataKey,
    commitmentContract: '0x...',
  });
  
  if (result.success) {
    console.log('Decrypted:', result.data.decryptedMessage);
  }

${SUB_SEPARATOR}
encryptFileJobFlow(ctx, params, options?): Promise<FlowResult<EncryptFileFlowResult>>
${SUB_SEPARATOR}

Encrypt a file and download the result.

Parameters:
  - secretId: bigint
  - file: File | Blob

Returns on success:
  {
    jobId: string,
    job: JobInfo,
    encryptedFile: Blob,
  }

${SUB_SEPARATOR}
decryptFileJobFlow(ctx, params, options?): Promise<FlowResult<DecryptFileFlowResult>>
${SUB_SEPARATOR}

Decrypt a file and download the result.

Parameters:
  - secretId: bigint
  - file: File | Blob - The .cifer file

Returns on success:
  {
    jobId: string,
    job: JobInfo,
    decryptedFile: Blob,
  }

${SUB_SEPARATOR}
decryptExistingFileJobFlow(ctx, params, options?): Promise<FlowResult<DecryptFileFlowResult>>
${SUB_SEPARATOR}

Decrypt from existing encrypt job without re-uploading.

Parameters:
  - secretId: bigint
  - encryptJobId: string
`;
}

function generateWeb2Reference() {
  return `
${SEPARATOR}
7. WEB2 NAMESPACE REFERENCE
${SEPARATOR}

The web2 namespace provides email-based registration, session management,
and session-first blackbox wrappers.

import { web2 } from 'cifer-sdk';
// or
import * as web2 from 'cifer-sdk/web2';

${SUB_SEPARATOR}
7.1 web2.auth
${SUB_SEPARATOR}

register(params): Promise<RegisterResult>
  Register a new Web2 principal with email and password.

  Parameters:
    - email: string
    - password: string
    - blackboxUrl: string
    - fetch?: typeof fetch

  Returns: { principalId: string }

  Example:
    const result = await web2.auth.register({
      email: 'user@example.com',
      password: 'securePassword123',
      blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
    });
    // An OTP is sent to the email

${SUB_SEPARATOR}

verifyEmail(params): Promise<VerifyEmailResult>
  Verify the email OTP sent during registration.

  Parameters:
    - email: string
    - otp: string
    - blackboxUrl: string

  Returns: { emailVerified: boolean }

${SUB_SEPARATOR}

registerKey(params): Promise<RegisterKeyResult>
  Register an Ed25519 public key for a principal.

  Parameters:
    - principalId: string
    - password: string
    - ed25519Signer: Ed25519Signer
    - blackboxUrl: string

  Returns: { principalId: string, nodeRegistrationStatus: string }

  NOTE: After registerKey, check nodeRegistrationStatus.
        If not 'complete', call retryNodeRegistration().

${SUB_SEPARATOR}

resendOtp(params): Promise<ResendOtpResult>
  Resend the email OTP. 60-second cooldown between requests.

  Parameters:
    - email: string
    - blackboxUrl: string

${SUB_SEPARATOR}

forgotPassword(params): Promise<ForgotPasswordResult>
  Request a password reset OTP. 60-second cooldown.

  Parameters:
    - email: string
    - blackboxUrl: string

${SUB_SEPARATOR}

resetPassword(params): Promise<ResetPasswordResult>
  Reset password using the OTP from forgotPassword.

  Parameters:
    - email: string
    - otp: string
    - newPassword: string
    - blackboxUrl: string

${SUB_SEPARATOR}

retryNodeRegistration(params): Promise<RetryNodeRegistrationResult>
  Retry registration on failed enclave nodes.

  Parameters:
    - principalId: string
    - blackboxUrl: string

${SUB_SEPARATOR}

nodeRegistrationStatus(params): Promise<NodeRegistrationStatusResult>
  Check node registration status.

  Parameters:
    - principalId: string
    - blackboxUrl: string

${SUB_SEPARATOR}
7.2 web2.session
${SUB_SEPARATOR}

createManagedSession(params): Promise<Web2Session>
  Create a managed session with auto-renewal.

  Parameters:
    - principalId: string
    - ed25519Signer: Ed25519Signer
    - blackboxUrl: string
    - ttl?: number (seconds, default: 900 = 15 minutes)
    - fetch?: typeof fetch

  Returns: Web2Session object with:
    - signer: SignerAdapter (ephemeral EOA)
    - sessionAddress: string
    - principalId: string
    - expiresAt: number
    - isManaged: true
    - ensureValid(): Promise<void> (auto-renews if expired)
    - renew(): Promise<void>

  Example:
    const session = await web2.session.createManagedSession({
      principalId: 'your-uuid',
      ed25519Signer: myEd25519Signer,
      blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
    });

${SUB_SEPARATOR}

useExistingSessionKey(params): Web2Session
  Wrap an existing session private key (no auto-renewal).

  Parameters:
    - sessionPrivateKey: string (hex-encoded secp256k1 private key)
    - principalId?: string

  Returns: Web2Session (isManaged = false, renew() throws Web2SessionError)

  WARNING: Cannot renew. Must recreate session externally when it expires.

${SUB_SEPARATOR}
7.3 web2.secret
${SUB_SEPARATOR}

createSecret(params): Promise<CreateWeb2SecretResult>
  Create a new Web2 secret.

  Parameters:
    - session: Web2Session
    - blackboxUrl: string
    - fetch?: typeof fetch

  Returns: { secretId: number }

  Example:
    const result = await web2.secret.createSecret({
      session,
      blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
    });

${SUB_SEPARATOR}

listSecrets(params): Promise<ListWeb2SecretsResult>
  List all secrets for the session principal.

  Parameters:
    - session: Web2Session
    - blackboxUrl: string
    - fetch?: typeof fetch

  Returns: { secrets: Array<{ secretId, status }> }

${SUB_SEPARATOR}
7.4 web2.delegate
${SUB_SEPARATOR}

setDelegate(params): Promise<SetWeb2DelegateResult>
  Set or remove a delegate for a Web2 secret.

  Parameters:
    - session: Web2Session
    - secretId: number
    - delegatePrincipalId: string (empty string to remove)
    - blackboxUrl: string

  Example:
    // Set delegate
    await web2.delegate.setDelegate({
      session, secretId: 42,
      delegatePrincipalId: 'delegate-uuid',
      blackboxUrl,
    });

    // Remove delegate
    await web2.delegate.setDelegate({
      session, secretId: 42,
      delegatePrincipalId: '',
      blackboxUrl,
    });

${SUB_SEPARATOR}
7.5 web2.permit
${SUB_SEPARATOR}

requestPermit(params): Promise<RequestPermitResult>
  Request a permit for key rotation, transfer, or delegation.

  Rotate permits use email+password (no session):
    Parameters:
      - action: 'rotate'
      - email: string
      - password: string
      - payload: object
      - blackboxUrl: string

  Transfer/delegate permits use session:
    Parameters:
      - action: 'transfer' | 'delegate'
      - session: Web2Session
      - secretId: number
      - payload: object
      - blackboxUrl: string

  Returns: { permitId: string }

${SUB_SEPARATOR}
7.6 web2.principal
${SUB_SEPARATOR}

getByEmail(email, blackboxUrl, options?): Promise<PrincipalByEmailResult>
  Look up a principal by email address.

  Returns: { principalId: string, emailHex: string }

  Example:
    const principal = await web2.principal.getByEmail(
      'colleague@example.com',
      'https://cifer-blackbox.ternoa.dev:3010'
    );

${SUB_SEPARATOR}
7.7 web2.blackbox (payload, files, jobs)
${SUB_SEPARATOR}

Session-first wrappers around the core blackbox functions.
Automatically fills in chainId = -1 and uses the session signer.

--- web2.blackbox.payload ---

encryptPayload(params): Promise<EncryptPayloadResult>
  Parameters:
    - session: Web2Session
    - secretId: bigint | number
    - plaintext: string
    - blackboxUrl: string
    - readClient: ReadClient
    - outputFormat?: 'hex' | 'base64'

  Example:
    const encrypted = await web2.blackbox.payload.encryptPayload({
      session, secretId: 42, plaintext: 'Hello!',
      blackboxUrl, readClient: sdk.readClient,
    });

decryptPayload(params): Promise<DecryptPayloadResult>
  Parameters:
    - session: Web2Session
    - secretId: bigint | number
    - encryptedMessage: string
    - cifer: string
    - blackboxUrl: string
    - readClient: ReadClient
    - inputFormat?: 'hex' | 'base64'

--- web2.blackbox.files ---

encryptFile(params): Promise<FileJobResult>
  Parameters: session, secretId, file, blackboxUrl, readClient

decryptFile(params): Promise<FileJobResult>
  Parameters: session, secretId, file, blackboxUrl, readClient

decryptExistingFile(params): Promise<FileJobResult>
  Parameters: session, secretId, encryptJobId, blackboxUrl, readClient

--- web2.blackbox.jobs ---

getStatus(jobId, blackboxUrl, options?): Promise<JobInfo>
  Re-exported from core (no session needed).

pollUntilComplete(jobId, blackboxUrl, options?): Promise<JobInfo>
  Re-exported from core (no session needed).

download(jobId, params): Promise<Blob>
  For decrypt jobs (session required).
  Parameters: session, secretId, blackboxUrl, readClient

deleteJob(jobId, params): Promise<void>
  Parameters: session, secretId, blackboxUrl, readClient

list(params): Promise<ListJobsResult>
  Parameters: session, blackboxUrl, readClient

dataConsumption(params): Promise<DataConsumption>
  Parameters: session, blackboxUrl, readClient
`;
}

function generateTypeDefinitions() {
  return `
${SEPARATOR}
8. TYPE DEFINITIONS
${SEPARATOR}

${SUB_SEPARATOR}
PRIMITIVE TYPES
${SUB_SEPARATOR}

type Address = \`0x\${string}\`
  Ethereum address (0x-prefixed, 40 hex chars)

type Bytes32 = \`0x\${string}\`
  32-byte hex string (0x-prefixed, 64 hex chars)

type Hex = \`0x\${string}\`
  Generic hex string

type ChainId = number
  Chain identifier

type SecretId = bigint
  Secret identifier (uint256 on-chain)

type OutputFormat = 'hex' | 'base64'
type InputFormat = 'hex' | 'base64'

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
type JobType = 'encrypt' | 'decrypt'

${SUB_SEPARATOR}
INTERFACES
${SUB_SEPARATOR}

interface SignerAdapter {
  getAddress(): Promise<Address>;
  signMessage(message: string): Promise<Hex>;
  sendTransaction?(txRequest: TxIntent): Promise<TxExecutionResult>;
}

interface ReadClient {
  getBlockNumber(chainId: ChainId): Promise<number>;
  getLogs(chainId: ChainId, filter: LogFilter): Promise<Log[]>;
  call?(chainId: ChainId, callRequest: CallRequest): Promise<Hex>;
}

interface TxIntent {
  chainId: ChainId;
  to: Address;
  data: Hex;
  value?: bigint;
}

interface TxIntentWithMeta extends TxIntent {
  description: string;
  functionName: string;
  args?: Record<string, unknown>;
}

interface TxExecutionResult {
  hash: Hex;
  waitReceipt: () => Promise<TransactionReceipt>;
}

interface SecretState {
  owner: Address;
  delegate: Address;
  isSyncing: boolean;
  clusterId: number;
  secretType: number;
  publicKeyCid: string;
}

interface CIFERMetadata {
  secretId: bigint;
  storedAtBlock: number;
  ciferHash: Bytes32;
  encryptedMessageHash: Bytes32;
}

interface CommitmentData {
  cifer: Hex;
  encryptedMessage: Hex;
  ciferHash: Bytes32;
  encryptedMessageHash: Bytes32;
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
  expiredAt?: number;
  error?: string;
  resultFileName?: string;
  ttl: number;
  originalSize?: number;
}

interface FlowContext {
  signer: SignerAdapter;
  readClient: ReadClient;
  blackboxUrl: string;
  chainId: ChainId;
  controllerAddress?: Address;
  txExecutor?: (intent: TxIntent) => Promise<TxExecutionResult>;
  pollingStrategy?: PollingStrategy;
  logger?: (message: string) => void;
  abortSignal?: AbortSignal;
  fetch?: typeof fetch;
}

interface FlowResult<T> {
  success: boolean;
  plan: FlowPlan;
  data?: T;
  error?: Error;
  receipts?: TransactionReceipt[];
}

interface CiferSdkConfig {
  blackboxUrl?: string;
  signer?: SignerAdapter;
  readClient?: ReadClient;
  chainOverrides?: Record<ChainId, Partial<ChainConfig>>;
  discoveryCacheTtlMs?: number;
  fetch?: typeof fetch;
  logger?: (message: string) => void;
}

${SUB_SEPARATOR}
WEB2 TYPES
${SUB_SEPARATOR}

const WEB2_CHAIN_ID = -1
  Sentinel chain ID for Web2 operations.

interface Ed25519Signer {
  sign(message: Uint8Array): Promise<Uint8Array>;
  getPublicKey(): Uint8Array;
}

interface Web2Session {
  signer: SignerAdapter;        // Ephemeral EOA signer
  sessionAddress: string;       // Session EOA address
  principalId: string;          // UUID
  expiresAt: number;            // Unix timestamp ms
  isManaged: boolean;           // true = auto-renew capable
  ensureValid(): Promise<void>; // Check expiry, auto-renew if needed
  renew(): Promise<void>;       // Force renewal
}

interface RegisterParams {
  email: string;
  password: string;
  blackboxUrl: string;
  fetch?: typeof fetch;
}

interface CreateManagedSessionParams {
  principalId: string;
  ed25519Signer: Ed25519Signer;
  blackboxUrl: string;
  ttl?: number; // seconds
  fetch?: typeof fetch;
}

interface CreateWeb2SecretParams {
  session: Web2Session;
  blackboxUrl: string;
  fetch?: typeof fetch;
}

interface SetWeb2DelegateParams {
  session: Web2Session;
  secretId: number;
  delegatePrincipalId: string;
  blackboxUrl: string;
  fetch?: typeof fetch;
}

interface RequestPermitParams {
  // Discriminated union on 'action'
  action: 'rotate' | 'transfer' | 'delegate';
  // For rotate: email, password, payload
  // For transfer/delegate: session, secretId, payload
  blackboxUrl: string;
}
`;
}

function generateErrorHandling() {
  return `
${SEPARATOR}
9. ERROR HANDLING
${SEPARATOR}

All SDK errors extend CiferError with typed subclasses.

${SUB_SEPARATOR}
ERROR HIERARCHY
${SUB_SEPARATOR}

CiferError (base class)
├── ConfigError (code: CONFIG_ERROR)
│   ├── DiscoveryError
│   └── ChainNotSupportedError
├── AuthError (code: AUTH_ERROR)
│   ├── SignatureError
│   ├── BlockStaleError
│   └── SignerMismatchError
├── BlackboxError (code: BLACKBOX_ERROR)
│   ├── EncryptionError
│   ├── DecryptionError
│   ├── JobError
│   └── SecretNotReadyError
├── KeyManagementError (code: KEY_MANAGEMENT_ERROR)
│   ├── SecretNotFoundError
│   └── NotAuthorizedError
├── CommitmentsError (code: COMMITMENTS_ERROR)
│   ├── CommitmentNotFoundError
│   ├── IntegrityError
│   ├── InvalidCiferSizeError
│   └── PayloadTooLargeError
├── Web2Error (code: WEB2_ERROR)
│   ├── Web2SessionError (session expired, cannot renew)
│   └── Web2AuthError (registration, OTP, password errors)
└── FlowError (code: FLOW_ERROR)
    ├── FlowAbortedError
    └── FlowTimeoutError

${SUB_SEPARATOR}
TYPE GUARDS
${SUB_SEPARATOR}

isCiferError(error): error is CiferError
  Check if error is any CIFER SDK error.

isBlockStaleError(error): error is BlockStaleError
  Check if error is a stale block error.

isSecretNotReadyError(error): error is SecretNotReadyError
  Check if error is a secret not ready error.

isWeb2Error(error): error is Web2Error
  Check if error is any Web2 error.

isWeb2SessionError(error): error is Web2SessionError
  Check if error is a Web2 session error.

${SUB_SEPARATOR}
ERROR HANDLING EXAMPLE
${SUB_SEPARATOR}

import {
  isCiferError,
  isBlockStaleError,
  isWeb2Error,
  isWeb2SessionError,
  SecretNotFoundError,
  SecretNotReadyError,
  CommitmentNotFoundError,
  Web2AuthError,
} from 'cifer-sdk';

try {
  await blackbox.payload.encryptPayload({ ... });
} catch (error) {
  if (isBlockStaleError(error)) {
    // Block number was too old
    // SDK already retried 3 times - this indicates persistent RPC issues
    console.log('RPC returning stale blocks');
    
  } else if (error instanceof SecretNotReadyError) {
    // Secret is still syncing
    console.log('Wait for secret to sync, try again in 30 seconds');
    
  } else if (error instanceof SecretNotFoundError) {
    // Secret doesn't exist
    console.log('Secret not found:', error.secretId);
    
  } else if (error instanceof CommitmentNotFoundError) {
    // Commitment data not found
    console.log('No data for key:', error.dataId);
    
  } else if (isCiferError(error)) {
    // Generic CIFER error
    console.log('CIFER error:', error.code, error.message);
    
  } else {
    // Unknown error
    throw error;
  }
}

${SUB_SEPARATOR}
COMMON ERROR SCENARIOS
${SUB_SEPARATOR}

"Block number is too old"
  - SDK retries automatically (3 times)
  - If persists, check RPC endpoint reliability
  - Ensure minimal delay between signing and API call

"Secret is syncing"
  - Wait ~30-60 seconds after creating a secret
  - Use isSecretReady() to check status
  - Use createSecretAndWaitReady flow

"Signature verification failed"
  - Ensure using EIP-191 personal_sign (not eth_sign or typed data)
  - Verify signer address matches expected

"Not authorized"
  - Signer must be secret owner or delegate for decryption
  - Check authorization with isAuthorized()
`;
}

function generateCompleteExamples() {
  return `
${SEPARATOR}
10. COMPLETE EXAMPLES
${SEPARATOR}

${SUB_SEPARATOR}
EXAMPLE 1: BROWSER - ENCRYPT/DECRYPT MESSAGE
${SUB_SEPARATOR}

import { createCiferSdk, Eip1193SignerAdapter, blackbox } from 'cifer-sdk';

async function encryptDecryptExample() {
  // Initialize
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });
  const signer = new Eip1193SignerAdapter(window.ethereum);
  
  const chainId = 752025;
  const secretId = 123n; // Your secret ID
  
  // Encrypt
  const encrypted = await blackbox.payload.encryptPayload({
    chainId,
    secretId,
    plaintext: 'Hello, CIFER!',
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  console.log('Encrypted:', encrypted);
  
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

${SUB_SEPARATOR}
EXAMPLE 2: CREATE SECRET AND WAIT
${SUB_SEPARATOR}

import { createCiferSdk, Eip1193SignerAdapter, flows } from 'cifer-sdk';

async function createSecretExample() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });
  const signer = new Eip1193SignerAdapter(window.ethereum);
  
  const result = await flows.createSecretAndWaitReady({
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
    chainId: 752025,
    controllerAddress: sdk.getControllerAddress(752025),
    txExecutor: async (intent) => {
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: intent.to,
          data: intent.data,
          value: intent.value ? \`0x\${intent.value.toString(16)}\` : undefined,
        }],
      });
      return {
        hash,
        waitReceipt: async () => {
          // Poll for receipt
          while (true) {
            const receipt = await window.ethereum.request({
              method: 'eth_getTransactionReceipt',
              params: [hash],
            });
            if (receipt) return receipt;
            await new Promise(r => setTimeout(r, 2000));
          }
        },
      };
    },
    logger: console.log,
  });
  
  if (result.success) {
    console.log('Created secret:', result.data.secretId);
    console.log('Public key CID:', result.data.state.publicKeyCid);
  } else {
    console.error('Failed:', result.error);
  }
}

${SUB_SEPARATOR}
EXAMPLE 3: STORE AND RETRIEVE ON-CHAIN
${SUB_SEPARATOR}

import { createCiferSdk, Eip1193SignerAdapter, flows, commitments } from 'cifer-sdk';

async function onChainExample() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });
  const signer = new Eip1193SignerAdapter(window.ethereum);
  
  const ctx = {
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
    chainId: 752025,
  };
  
  const secretId = 123n;
  const dataKey = '0x' + '1234'.repeat(16); // Your bytes32 key
  const commitmentContract = '0xYourContract...';
  
  // Encrypt and prepare transaction
  const encryptResult = await flows.encryptThenPrepareCommitTx(ctx, {
    secretId,
    plaintext: 'Stored on-chain',
    key: dataKey,
    commitmentContract,
  });
  
  if (encryptResult.success) {
    // Execute the store transaction
    await wallet.sendTransaction(encryptResult.data.txIntent);
  }
  
  // Later: Retrieve and decrypt
  const decryptResult = await flows.retrieveFromLogsThenDecrypt(ctx, {
    secretId,
    dataId: dataKey,
    commitmentContract,
  });
  
  if (decryptResult.success) {
    console.log('Retrieved:', decryptResult.data.decryptedMessage);
  }
}

${SUB_SEPARATOR}
EXAMPLE 4: FILE ENCRYPTION
${SUB_SEPARATOR}

import { createCiferSdk, Eip1193SignerAdapter, blackbox } from 'cifer-sdk';

async function fileEncryptionExample() {
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
  });
  const signer = new Eip1193SignerAdapter(window.ethereum);
  
  const chainId = 752025;
  const secretId = 123n;
  const file = document.getElementById('fileInput').files[0];
  
  // Start encryption job
  const job = await blackbox.files.encryptFile({
    chainId,
    secretId,
    file,
    signer,
    readClient: sdk.readClient,
    blackboxUrl: sdk.blackboxUrl,
  });
  
  console.log('Job started:', job.jobId);
  
  // Poll until complete
  const finalStatus = await blackbox.jobs.pollUntilComplete(
    job.jobId,
    sdk.blackboxUrl,
    {
      onProgress: (status) => {
        console.log(\`Progress: \${status.progress}%\`);
      },
    }
  );
  
  if (finalStatus.status === 'completed') {
    // Download encrypted file
    const encryptedBlob = await blackbox.jobs.download(job.jobId, {
      blackboxUrl: sdk.blackboxUrl,
    });
    
    // Save file
    const url = URL.createObjectURL(encryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encrypted.cifer';
    a.click();
  }
}

${SUB_SEPARATOR}
EXAMPLE 5: NODE.JS SERVER-SIDE
${SUB_SEPARATOR}

import { createCiferSdk, RpcReadClient, blackbox } from 'cifer-sdk';
import { Wallet } from 'ethers';

async function serverSideExample() {
  // Create read client
  const readClient = new RpcReadClient({
    rpcUrlByChainId: {
      752025: 'https://mainnet.ternoa.network',
    },
  });
  
  // Initialize SDK
  const sdk = await createCiferSdk({
    blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
    readClient,
  });
  
  // Create server-side signer
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  const signer = {
    async getAddress() {
      return wallet.address;
    },
    async signMessage(message) {
      return await wallet.signMessage(message);
    },
  };
  
  // Use SDK
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

${SUB_SEPARATOR}
EXAMPLE 6: WEB2 - EMAIL REGISTRATION + ENCRYPT/DECRYPT
${SUB_SEPARATOR}

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
    async sign(message) { return ed.signAsync(message, privateKey); },
    getPublicKey() { return publicKey; },
  };

  // --- Registration ---
  const reg = await web2.auth.register({
    email: 'user@example.com',
    password: 'securePassword123',
    blackboxUrl,
  });

  // (User receives OTP via email)
  await web2.auth.verifyEmail({
    email: 'user@example.com', otp: '123456', blackboxUrl,
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
`;
}

function generateFooter() {
  return `
${SEPARATOR}
END OF DOCUMENTATION
${SEPARATOR}

For more information:
- GitHub: https://github.com/cifer-security/cifer-sdk
- npm: https://www.npmjs.com/package/cifer-sdk

Generated by cifer-sdk documentation pipeline.
`;
}

// Main generation function
function generateLlmTxt() {
  const sections = [
    generateHeader(),
    generateOverview(),
    generateInstallation(),
    generateQuickStart(),
    generateCoreConcepts(),
    generateSdkInitialization(),
    generateKeyManagementReference(),
    generateBlackboxPayloadReference(),
    generateBlackboxFilesReference(),
    generateBlackboxJobsReference(),
    generateCommitmentsReference(),
    generateFlowsReference(),
    generateWeb2Reference(),
    generateTypeDefinitions(),
    generateErrorHandling(),
    generateCompleteExamples(),
    generateFooter(),
  ];

  return sections.join('\n');
}

// Write to file
function main() {
  const outputDir = path.join(ROOT_DIR, 'docs-site', 'static');
  const outputPath = path.join(outputDir, 'llm.txt');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const content = generateLlmTxt();
  fs.writeFileSync(outputPath, content, 'utf-8');

  console.log(`Generated: ${outputPath}`);
  console.log(`Size: ${(content.length / 1024).toFixed(2)} KB`);
}

main();
