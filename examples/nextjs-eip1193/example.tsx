/**
 * @file examples/nextjs-eip1193/example.tsx
 * @description Example Next.js component using cifer-sdk with EIP-1193 wallet
 *
 * This example shows:
 * 1. Creating the SDK with discovery
 * 2. Connecting any EIP-1193 wallet (MetaMask, WalletConnect, etc.)
 * 3. Creating a secret
 * 4. Encrypting and decrypting data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  createCiferSdk,
  Eip1193SignerAdapter,
  type CiferSdk,
} from 'cifer-sdk';
import { keyManagement, blackbox, flows } from 'cifer-sdk';

// Constants
const BLACKBOX_URL = 'https://cifer-blackbox.ternoa.dev:3010';
const CHAIN_ID = 752025; // Ternoa mainnet

// Extend window for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export default function CiferExample() {
  // State
  const [sdk, setSdk] = useState<CiferSdk | null>(null);
  const [signer, setSigner] = useState<Eip1193SignerAdapter | null>(null);
  const [address, setAddress] = useState<string>('');
  const [secretId, setSecretId] = useState<bigint | null>(null);
  const [plaintext, setPlaintext] = useState('Hello, CIFER!');
  const [encryptedData, setEncryptedData] = useState<{
    cifer: string;
    encryptedMessage: string;
  } | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  // Logger
  const log = useCallback((message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  }, []);

  // Initialize SDK
  useEffect(() => {
    async function init() {
      try {
        log('Initializing SDK...');
        const newSdk = await createCiferSdk({
          blackboxUrl: BLACKBOX_URL,
          logger: log,
        });
        setSdk(newSdk);
        log(`SDK ready. Supported chains: ${newSdk.getSupportedChainIds().join(', ')}`);
      } catch (err) {
        setError(`Failed to initialize SDK: ${err}`);
      }
    }
    init();
  }, [log]);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('No Ethereum wallet found. Please install MetaMask.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create signer adapter
      const newSigner = new Eip1193SignerAdapter(window.ethereum);
      const addr = await newSigner.getAddress();

      setSigner(newSigner);
      setAddress(addr);
      log(`Connected: ${addr}`);

      // Check if user has secrets
      if (sdk) {
        const controllerAddress = sdk.getControllerAddress(CHAIN_ID);
        const secrets = await keyManagement.getSecretsByWallet(
          {
            chainId: CHAIN_ID,
            controllerAddress,
            readClient: sdk.readClient,
          },
          addr as `0x${string}`
        );

        if (secrets.owned.length > 0) {
          setSecretId(secrets.owned[0]);
          log(`Found existing secret: ${secrets.owned[0]}`);
        } else {
          log('No secrets found. Create one to get started.');
        }
      }
    } catch (err) {
      setError(`Failed to connect: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Create secret
  const createSecret = async () => {
    if (!sdk || !signer) return;

    try {
      setLoading(true);
      setError('');
      log('Creating secret...');

      const controllerAddress = sdk.getControllerAddress(CHAIN_ID);

      // Get fee
      const fee = await keyManagement.getSecretCreationFee({
        chainId: CHAIN_ID,
        controllerAddress,
        readClient: sdk.readClient,
      });
      log(`Fee: ${fee} wei`);

      // Build transaction
      const txIntent = keyManagement.buildCreateSecretTx({
        chainId: CHAIN_ID,
        controllerAddress,
        fee,
      });

      log('Please confirm the transaction in your wallet...');

      // Execute via wallet
      const txResult = await signer.sendTransaction!(txIntent);
      log(`Transaction sent: ${txResult.hash}`);

      // Wait for confirmation
      log('Waiting for confirmation...');
      const receipt = await txResult.waitReceipt();

      if (receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // Extract secret ID
      const newSecretId = keyManagement.extractSecretIdFromReceipt(receipt.logs);
      log(`Secret created: ${newSecretId}`);

      // Wait for sync
      log('Waiting for secret to sync...');
      let isReady = false;
      for (let i = 0; i < 30; i++) {
        isReady = await keyManagement.isSecretReady(
          { chainId: CHAIN_ID, controllerAddress, readClient: sdk.readClient },
          newSecretId
        );
        if (isReady) break;
        await new Promise((r) => setTimeout(r, 2000));
        log(`Waiting... (${i + 1}/30)`);
      }

      if (!isReady) {
        throw new Error('Secret sync timed out');
      }

      setSecretId(newSecretId);
      log('Secret is ready!');
    } catch (err) {
      setError(`Failed to create secret: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Encrypt data
  const encrypt = async () => {
    if (!sdk || !signer || !secretId) return;

    try {
      setLoading(true);
      setError('');
      log('Encrypting...');

      const result = await blackbox.payload.encryptPayload({
        chainId: CHAIN_ID,
        secretId,
        plaintext,
        signer,
        readClient: sdk.readClient,
        blackboxUrl: BLACKBOX_URL,
      });

      setEncryptedData({
        cifer: result.cifer,
        encryptedMessage: result.encryptedMessage,
      });

      log('Encryption complete!');
      log(`Cifer: ${result.cifer.slice(0, 50)}...`);
      log(`Encrypted message: ${result.encryptedMessage.slice(0, 50)}...`);
    } catch (err) {
      setError(`Encryption failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Decrypt data
  const decrypt = async () => {
    if (!sdk || !signer || !secretId || !encryptedData) return;

    try {
      setLoading(true);
      setError('');
      log('Decrypting...');

      const result = await blackbox.payload.decryptPayload({
        chainId: CHAIN_ID,
        secretId,
        encryptedMessage: encryptedData.encryptedMessage,
        cifer: encryptedData.cifer,
        signer,
        readClient: sdk.readClient,
        blackboxUrl: BLACKBOX_URL,
      });

      setDecryptedMessage(result.decryptedMessage);
      log(`Decrypted: ${result.decryptedMessage}`);
    } catch (err) {
      setError(`Decryption failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>CIFER SDK Example</h1>

      {/* Connection */}
      <section style={{ marginBottom: '20px' }}>
        <h2>1. Connect Wallet</h2>
        {address ? (
          <p>Connected: {address}</p>
        ) : (
          <button onClick={connectWallet} disabled={loading}>
            Connect Wallet
          </button>
        )}
      </section>

      {/* Secret */}
      <section style={{ marginBottom: '20px' }}>
        <h2>2. Secret</h2>
        {secretId ? (
          <p>Secret ID: {secretId.toString()}</p>
        ) : (
          <button onClick={createSecret} disabled={loading || !address}>
            Create Secret
          </button>
        )}
      </section>

      {/* Encrypt */}
      <section style={{ marginBottom: '20px' }}>
        <h2>3. Encrypt</h2>
        <input
          type="text"
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button onClick={encrypt} disabled={loading || !secretId}>
          Encrypt
        </button>
        {encryptedData && (
          <div style={{ marginTop: '10px', fontSize: '12px' }}>
            <p>✅ Data encrypted</p>
          </div>
        )}
      </section>

      {/* Decrypt */}
      <section style={{ marginBottom: '20px' }}>
        <h2>4. Decrypt</h2>
        <button onClick={decrypt} disabled={loading || !encryptedData}>
          Decrypt
        </button>
        {decryptedMessage && (
          <p style={{ marginTop: '10px' }}>Result: {decryptedMessage}</p>
        )}
      </section>

      {/* Error */}
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          Error: {error}
        </div>
      )}

      {/* Logs */}
      <section style={{ marginTop: '30px' }}>
        <h2>Logs</h2>
        <div
          style={{
            background: '#f0f0f0',
            padding: '10px',
            height: '200px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
