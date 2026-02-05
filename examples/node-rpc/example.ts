/**
 * @file examples/node-rpc/example.ts
 * @description Example Node.js script using cifer-sdk with RPC client
 *
 * This example shows:
 * 1. Creating the SDK without a browser wallet
 * 2. Using RpcReadClient for blockchain queries
 * 3. Implementing a custom server-side signer
 * 4. Encrypting and decrypting data
 */

import {
  createCiferSdk,
  RpcReadClient,
  keyManagement,
  blackbox,
  type SignerAdapter,
  type Hex,
  type Address,
  type TxIntent,
} from 'cifer-sdk';

// Constants
const BLACKBOX_URL = 'https://blackbox.cifer.network';
const CHAIN_ID = 752025;

/**
 * Custom server-side signer using a private key
 *
 * In production, you would use a proper signing library like
 * @ethersproject/wallet or viem's privateKeyToAccount.
 *
 * This is a simplified example showing the interface.
 */
class ServerSigner implements SignerAdapter {
  private privateKey: string;
  private address: Address;

  constructor(privateKey: string, address: Address) {
    this.privateKey = privateKey;
    this.address = address;
  }

  async getAddress(): Promise<Address> {
    return this.address;
  }

  async signMessage(message: string): Promise<Hex> {
    // In production, use a proper crypto library:
    //
    // import { Wallet } from 'ethers';
    // const wallet = new Wallet(this.privateKey);
    // return await wallet.signMessage(message);
    //
    // Or with viem:
    // import { privateKeyToAccount } from 'viem/accounts';
    // const account = privateKeyToAccount(this.privateKey);
    // return await account.signMessage({ message });

    // Placeholder - replace with actual signing
    console.log('Signing message:', message);
    throw new Error(
      'Replace this with actual signing implementation. ' +
        'Use ethers.Wallet.signMessage() or viem privateKeyToAccount().signMessage()'
    );
  }

  // Optional: Implement sendTransaction for direct tx submission
  // async sendTransaction(tx: TxIntent) { ... }
}

/**
 * External transaction executor stub
 *
 * In production, this would submit the transaction to the blockchain
 * using your preferred method (ethers, viem, direct RPC).
 */
async function executeTransaction(txIntent: TxIntent): Promise<{ hash: Hex }> {
  console.log('Executing transaction:', {
    to: txIntent.to,
    data: txIntent.data.slice(0, 20) + '...',
    value: txIntent.value?.toString(),
  });

  // In production:
  //
  // import { Wallet, JsonRpcProvider } from 'ethers';
  // const provider = new JsonRpcProvider(RPC_URL);
  // const wallet = new Wallet(PRIVATE_KEY, provider);
  // const tx = await wallet.sendTransaction({
  //   to: txIntent.to,
  //   data: txIntent.data,
  //   value: txIntent.value,
  // });
  // return { hash: tx.hash as Hex };

  throw new Error('Replace with actual transaction execution');
}

async function main() {
  console.log('=== CIFER SDK Node.js Example ===\n');

  // 1. Create SDK with discovery
  console.log('1. Initializing SDK...');
  const sdk = await createCiferSdk({
    blackboxUrl: BLACKBOX_URL,
    logger: (msg) => console.log(`   [SDK] ${msg}`),
  });

  console.log(`   Supported chains: ${sdk.getSupportedChainIds().join(', ')}`);
  console.log(`   Controller address: ${sdk.getControllerAddress(CHAIN_ID)}\n`);

  // 2. Set up signer
  console.log('2. Setting up signer...');
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const ADDRESS = process.env.ADDRESS as Address;

  if (!PRIVATE_KEY || !ADDRESS) {
    console.log('   Set PRIVATE_KEY and ADDRESS environment variables');
    console.log('   Example:');
    console.log('   export PRIVATE_KEY=0x...');
    console.log('   export ADDRESS=0x...');
    process.exit(1);
  }

  const signer = new ServerSigner(PRIVATE_KEY, ADDRESS);
  console.log(`   Address: ${ADDRESS}\n`);

  // 3. Check for existing secrets
  console.log('3. Checking for existing secrets...');
  const secrets = await keyManagement.getSecretsByWallet(
    {
      chainId: CHAIN_ID,
      controllerAddress: sdk.getControllerAddress(CHAIN_ID),
      readClient: sdk.readClient,
    },
    ADDRESS
  );

  if (secrets.owned.length === 0) {
    console.log('   No secrets found. Create one first using the web UI or:');
    console.log('');
    console.log('   const fee = await keyManagement.getSecretCreationFee({ ... });');
    console.log('   const txIntent = keyManagement.buildCreateSecretTx({ ... });');
    console.log('   await executeTransaction(txIntent);');
    process.exit(0);
  }

  const secretId = secrets.owned[0];
  console.log(`   Found secret: ${secretId}\n`);

  // 4. Check if secret is ready
  console.log('4. Checking secret status...');
  const secretState = await keyManagement.getSecret(
    {
      chainId: CHAIN_ID,
      controllerAddress: sdk.getControllerAddress(CHAIN_ID),
      readClient: sdk.readClient,
    },
    secretId
  );

  if (secretState.isSyncing) {
    console.log('   Secret is still syncing. Please wait.');
    process.exit(1);
  }

  console.log(`   Secret is ready!`);
  console.log(`   Public key CID: ${secretState.publicKeyCid}\n`);

  // 5. Encrypt a message
  console.log('5. Encrypting message...');
  const plaintext = 'Hello from Node.js!';
  console.log(`   Plaintext: ${plaintext}`);

  try {
    const encrypted = await blackbox.payload.encryptPayload({
      chainId: CHAIN_ID,
      secretId,
      plaintext,
      signer,
      readClient: sdk.readClient,
      blackboxUrl: BLACKBOX_URL,
    });

    console.log(`   ✓ Encrypted successfully!`);
    console.log(`   Cifer: ${encrypted.cifer.slice(0, 50)}...`);
    console.log(`   Message: ${encrypted.encryptedMessage.slice(0, 50)}...\n`);

    // 6. Decrypt the message
    console.log('6. Decrypting message...');
    const decrypted = await blackbox.payload.decryptPayload({
      chainId: CHAIN_ID,
      secretId,
      encryptedMessage: encrypted.encryptedMessage,
      cifer: encrypted.cifer,
      signer,
      readClient: sdk.readClient,
      blackboxUrl: BLACKBOX_URL,
    });

    console.log(`   ✓ Decrypted: ${decrypted.decryptedMessage}\n`);

    // Verify round-trip
    if (decrypted.decryptedMessage === plaintext) {
      console.log('✅ Round-trip successful!');
    } else {
      console.log('❌ Round-trip failed - messages do not match');
    }
  } catch (err) {
    console.error('Error:', err);
    console.log('\nNote: This example requires a real signing implementation.');
    console.log('Replace the ServerSigner.signMessage() placeholder with actual signing.');
  }
}

main().catch(console.error);
