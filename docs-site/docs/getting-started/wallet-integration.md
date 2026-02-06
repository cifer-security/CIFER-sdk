---
sidebar_position: 3
---

# Wallet Integration

The CIFER SDK is wallet-agnostic—it works with any wallet that can sign messages. This guide shows you how to connect popular wallet solutions.

## The SignerAdapter Interface

All wallet integrations implement this simple interface:

```typescript
interface SignerAdapter {
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>; // EIP-191 personal_sign
  sendTransaction?(txRequest: TxIntent): Promise<TxExecutionResult>; // optional
}
```

The SDK provides a built-in `Eip1193SignerAdapter` that works with any EIP-1193 compatible provider, plus you can create custom signers.

---

## MetaMask

MetaMask injects `window.ethereum` which is EIP-1193 compatible.

```typescript
import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';

// Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Check if MetaMask is installed
if (typeof window.ethereum === 'undefined') {
  throw new Error('MetaMask is not installed');
}

// Request account access
await window.ethereum.request({ method: 'eth_requestAccounts' });

// Create signer
const signer = new Eip1193SignerAdapter(window.ethereum);
const address = await signer.getAddress();

console.log('Connected:', address);
```

### Handling Account Changes

```typescript
// Listen for account changes
window.ethereum.on('accountsChanged', (accounts: string[]) => {
  if (accounts.length === 0) {
    console.log('Wallet disconnected');
  } else {
    // Clear cached address and reconnect
    signer.clearCache();
    console.log('Switched to:', accounts[0]);
  }
});

// Listen for chain changes
window.ethereum.on('chainChanged', (chainId: string) => {
  console.log('Chain changed to:', parseInt(chainId, 16));
  // You may want to reload or update your app state
});
```

---

## WalletConnect

WalletConnect works with mobile wallets by scanning a QR code. Use WalletConnect's provider with the SDK.

### Using WalletConnect v2

```bash
npm install @walletconnect/modal @walletconnect/ethereum-provider
```

```typescript
import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Create WalletConnect provider
const provider = await EthereumProvider.init({
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from cloud.walletconnect.com
  chains: [752025], // Ternoa mainnet
  optionalChains: [1, 11155111], // Ethereum mainnet, Sepolia
  showQrModal: true,
  metadata: {
    name: 'My CIFER App',
    description: 'Quantum-resistant encryption',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/icon.png'],
  },
});

// Connect (shows QR modal)
await provider.connect();

// Create signer from WalletConnect provider
const signer = new Eip1193SignerAdapter(provider);
const address = await signer.getAddress();

console.log('Connected via WalletConnect:', address);
```

### Disconnecting

```typescript
// Disconnect WalletConnect session
await provider.disconnect();
```

---

## Thirdweb

Thirdweb provides a unified wallet SDK that supports multiple wallet types.

### Using Thirdweb Connect

```bash
npm install thirdweb
```

:::warning Ternoa Chain Definition Required
Thirdweb's RPC proxy does **not** support Ternoa (chain ID 752025). You must define the chain explicitly with its RPC URL using `defineChain()`. Without this, Thirdweb will route requests to its own proxy and return "Invalid chain". Standard chains (Sepolia, Polygon, etc.) work fine with just `defineChain(chainId)`.
:::

```typescript
import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';
import { createThirdwebClient, defineChain } from 'thirdweb';
import { createWallet, injectedProvider } from 'thirdweb/wallets';

// Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Create Thirdweb client
const thirdwebClient = createThirdwebClient({
  clientId: 'YOUR_THIRDWEB_CLIENT_ID', // Get from thirdweb.com/dashboard
});

// IMPORTANT: Ternoa is not in Thirdweb's built-in chain registry.
// You MUST define it explicitly with its RPC URL.
const ternoa = defineChain({
  id: 752025,
  name: 'Ternoa',
  nativeCurrency: { name: 'CAPS', symbol: 'CAPS', decimals: 18 },
  rpc: 'https://rpc-mainnet.zkevm.ternoa.network/',
  blockExplorers: [
    {
      name: 'Ternoa Explorer',
      url: 'https://explorer-mainnet.zkevm.ternoa.network/',
    },
  ],
});

// Create and connect a wallet
const wallet = createWallet('io.metamask'); // or 'walletConnect', 'coinbaseWallet', etc.
const account = await wallet.connect({
  client: thirdwebClient,
  chain: ternoa,
});

// Get the EIP-1193 provider from Thirdweb
const provider = injectedProvider('io.metamask');

// Create CIFER signer
const signer = new Eip1193SignerAdapter(provider);
const address = await signer.getAddress();

console.log('Connected via Thirdweb:', address);
```

### Using Thirdweb's In-App Wallet

```typescript
import { inAppWallet } from 'thirdweb/wallets';
import type { SignerAdapter } from 'cifer-sdk';

// Create an in-app wallet (email/social login)
const wallet = inAppWallet();

// Connect with email
const account = await wallet.connect({
  client: thirdwebClient,
  chain: ternoa,
  strategy: 'email',
  email: 'user@example.com',
});

// For in-app wallets, create a custom signer using the SDK's SignerAdapter type
const signer: SignerAdapter = {
  async getAddress() {
    return account.address;
  },
  async signMessage(message: string) {
    return account.signMessage({ message });
  },
};
```

---

## Private Key (Server-Side)

For backend services or scripts, you can sign directly with a private key.

:::warning Security
Never expose private keys in frontend code. This approach is only for trusted server environments.
:::

### Using ethers.js

```bash
npm install ethers
```

```typescript
import { createCiferSdk } from 'cifer-sdk';
import { Wallet } from 'ethers';
import type { SignerAdapter } from 'cifer-sdk';

// Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Create ethers wallet from private key
const privateKey = process.env.PRIVATE_KEY!;
const wallet = new Wallet(privateKey);

// Create custom signer adapter
const signer: SignerAdapter = {
  async getAddress() {
    return wallet.address;
  },
  async signMessage(message: string) {
    return wallet.signMessage(message);
  },
};

console.log('Server signer:', await signer.getAddress());
```

### Using viem

```bash
npm install viem
```

```typescript
import { createCiferSdk } from 'cifer-sdk';
import { privateKeyToAccount } from 'viem/accounts';
import type { SignerAdapter } from 'cifer-sdk';

// Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Create account from private key
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(privateKey);

// Create custom signer adapter
const signer: SignerAdapter = {
  async getAddress() {
    return account.address;
  },
  async signMessage(message: string) {
    return account.signMessage({ message });
  },
};

console.log('Server signer:', await signer.getAddress());
```

### Pure Node.js (No Dependencies)

For minimal setups without wallet libraries:

```typescript
import { createCiferSdk } from 'cifer-sdk';
import { createSign, createHash } from 'crypto';
import { secp256k1 } from '@noble/curves/secp256k1';
import type { SignerAdapter } from 'cifer-sdk';

// Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

const privateKeyHex = process.env.PRIVATE_KEY!.replace('0x', '');
const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');

// Derive address from private key
const publicKey = secp256k1.getPublicKey(privateKeyBytes, false);
const addressHash = createHash('keccak256')
  .update(Buffer.from(publicKey.slice(1)))
  .digest();
const address = '0x' + addressHash.slice(-20).toString('hex');

// Create custom signer
const signer: SignerAdapter = {
  async getAddress() {
    return address;
  },
  async signMessage(message: string) {
    // EIP-191 prefix
    const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
    const prefixedMessage = prefix + message;
    
    // Hash with keccak256
    const messageHash = createHash('keccak256')
      .update(prefixedMessage)
      .digest();
    
    // Sign with secp256k1
    const signature = secp256k1.sign(messageHash, privateKeyBytes);
    const r = signature.r.toString(16).padStart(64, '0');
    const s = signature.s.toString(16).padStart(64, '0');
    const v = (signature.recovery + 27).toString(16).padStart(2, '0');
    
    return `0x${r}${s}${v}`;
  },
};

console.log('Minimal signer:', await signer.getAddress());
```

---

## wagmi (React)

If you're using wagmi for React apps, you can easily get an EIP-1193 provider.

```bash
npm install wagmi viem @tanstack/react-query
```

```typescript
import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';
import { useAccount, useConnectorClient } from 'wagmi';

function useCiferSigner() {
  const { address, isConnected } = useAccount();
  const { data: connectorClient } = useConnectorClient();

  const getSigner = async () => {
    if (!isConnected || !connectorClient) {
      throw new Error('Wallet not connected');
    }

    // Get the underlying provider
    const provider = await connectorClient.transport;
    
    // Create CIFER signer
    return new Eip1193SignerAdapter(provider);
  };

  return { getSigner, address, isConnected };
}

// Usage in a component
function EncryptButton() {
  const { getSigner, isConnected } = useCiferSigner();

  const handleEncrypt = async () => {
    const sdk = await createCiferSdk({
      blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
    });
    
    const signer = await getSigner();
    
    const encrypted = await blackbox.payload.encryptPayload({
      chainId: 752025,
      secretId: 123n,
      plaintext: 'Hello from wagmi!',
      signer,
      readClient: sdk.readClient,
      blackboxUrl: sdk.blackboxUrl,
    });
    
    console.log('Encrypted:', encrypted);
  };

  return (
    <button onClick={handleEncrypt} disabled={!isConnected}>
      Encrypt Data
    </button>
  );
}
```

---

## Coinbase Wallet

Coinbase Wallet also provides an EIP-1193 provider.

```bash
npm install @coinbase/wallet-sdk
```

```typescript
import { createCiferSdk, Eip1193SignerAdapter } from 'cifer-sdk';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

// Initialize SDK
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Create Coinbase Wallet SDK
const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'My CIFER App',
  appLogoUrl: 'https://myapp.com/logo.png',
});

// Create provider for Ternoa
const provider = coinbaseWallet.makeWeb3Provider({
  options: 'all', // or 'smartWalletOnly', 'eoaOnly'
});

// Request connection
await provider.request({ method: 'eth_requestAccounts' });

// Create signer
const signer = new Eip1193SignerAdapter(provider);
const address = await signer.getAddress();

console.log('Connected via Coinbase:', address);
```

---

## Best Practices

### 1. Handle Connection States

```typescript
function WalletStatus({ signer }: { signer: SignerAdapter | null }) {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer) {
      signer.getAddress()
        .then(setAddress)
        .catch((e) => setError(e.message));
    }
  }, [signer]);

  if (error) return <div>Error: {error}</div>;
  if (!address) return <div>Connecting...</div>;
  return <div>Connected: {address}</div>;
}
```

### 2. Wrap Signing Errors

```typescript
async function safeSign(signer: SignerAdapter, message: string) {
  try {
    return await signer.signMessage(message);
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('User rejected the signature request');
    }
    throw error;
  }
}
```

### 3. Support Multiple Wallets

```typescript
type WalletType = 'metamask' | 'walletconnect' | 'coinbase';

async function createSigner(type: WalletType): Promise<SignerAdapter> {
  switch (type) {
    case 'metamask':
      return new Eip1193SignerAdapter(window.ethereum);
    
    case 'walletconnect':
      const wcProvider = await EthereumProvider.init({ /* ... */ });
      await wcProvider.connect();
      return new Eip1193SignerAdapter(wcProvider);
    
    case 'coinbase':
      const cbProvider = coinbaseWallet.makeWeb3Provider();
      await cbProvider.request({ method: 'eth_requestAccounts' });
      return new Eip1193SignerAdapter(cbProvider);
  }
}
```

---

## Next Steps

- [Quick Start](/docs/getting-started/quick-start) - Use your connected wallet to encrypt data
- [Core Concepts](/docs/getting-started/concepts) - Understand secrets and the encryption model
- [Key Management Guide](/docs/guides/key-management) - Create and manage secrets
