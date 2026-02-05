/**
 * @module internal/adapters/eip1193-signer
 * @description EIP-1193 signer adapter for browser wallets
 */

import type { Address, Hex } from '../../types/common.js';
import type {
  SignerAdapter,
  Eip1193Provider,
} from '../../types/adapters.js';
import type { TxIntent, TxExecutionResult } from '../../types/tx-intent.js';
import { AuthError } from '../errors/index.js';

/**
 * Signer adapter for EIP-1193 compatible providers
 *
 * This adapter works with any EIP-1193 provider including:
 * - MetaMask (window.ethereum)
 * - WalletConnect
 * - Coinbase Wallet
 * - Any wagmi connector
 *
 * @example
 * ```typescript
 * // Browser with MetaMask
 * const signer = new Eip1193SignerAdapter(window.ethereum);
 *
 * // With wagmi
 * const provider = await connector.getProvider();
 * const signer = new Eip1193SignerAdapter(provider);
 *
 * // Usage
 * const address = await signer.getAddress();
 * const signature = await signer.signMessage('Hello, CIFER!');
 * ```
 */
export class Eip1193SignerAdapter implements SignerAdapter {
  private provider: Eip1193Provider;
  private cachedAddress: Address | null = null;

  /**
   * Create a new EIP-1193 signer adapter
   *
   * @param provider - An EIP-1193 compatible provider
   */
  constructor(provider: Eip1193Provider) {
    this.provider = provider;
  }

  /**
   * Get the address of the connected account
   *
   * Uses eth_accounts to get the currently connected account.
   * Caches the result for subsequent calls.
   *
   * @returns The checksummed address
   * @throws AuthError if no account is connected
   */
  async getAddress(): Promise<Address> {
    if (this.cachedAddress) {
      return this.cachedAddress;
    }

    try {
      const accounts = (await this.provider.request({
        method: 'eth_accounts',
        params: [],
      })) as string[];

      if (!accounts || accounts.length === 0) {
        // Try to request accounts if none connected
        const requestedAccounts = (await this.provider.request({
          method: 'eth_requestAccounts',
          params: [],
        })) as string[];

        if (!requestedAccounts || requestedAccounts.length === 0) {
          throw new AuthError('No accounts available. Please connect a wallet.');
        }

        this.cachedAddress = requestedAccounts[0] as Address;
      } else {
        this.cachedAddress = accounts[0] as Address;
      }

      return this.cachedAddress;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        `Failed to get address: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sign a message using personal_sign (EIP-191)
   *
   * This is the signing method expected by the blackbox for authentication.
   *
   * @param message - The message to sign (raw string, not hashed)
   * @returns The signature as a hex string
   */
  async signMessage(message: string): Promise<Hex> {
    const address = await this.getAddress();

    try {
      // Convert message to hex for personal_sign
      const hexMessage = stringToHex(message);

      const signature = (await this.provider.request({
        method: 'personal_sign',
        params: [hexMessage, address],
      })) as Hex;

      return signature;
    } catch (error) {
      throw new AuthError(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Optional: Send a transaction via the provider
   *
   * This is an opt-in convenience method. Apps can use this to execute
   * TxIntent objects directly, or they can handle transaction submission
   * themselves using their preferred method.
   *
   * @param txRequest - The transaction intent to send
   * @returns Transaction hash and wait function
   */
  async sendTransaction(txRequest: TxIntent): Promise<TxExecutionResult> {
    const address = await this.getAddress();

    try {
      // Build the transaction request
      const tx: Record<string, string> = {
        from: address,
        to: txRequest.to,
        data: txRequest.data,
      };

      if (txRequest.value !== undefined) {
        tx.value = `0x${txRequest.value.toString(16)}`;
      }

      // Send the transaction
      const hash = (await this.provider.request({
        method: 'eth_sendTransaction',
        params: [tx],
      })) as Hex;

      return {
        hash,
        waitReceipt: async () => {
          // Poll for receipt
          return this.waitForReceipt(hash);
        },
      };
    } catch (error) {
      throw new AuthError(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Wait for a transaction receipt
   */
  private async waitForReceipt(hash: Hex): Promise<import('../../types/common.js').TransactionReceipt> {
    const maxAttempts = 60; // ~5 minutes with 5s interval
    const intervalMs = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const receipt = (await this.provider.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        })) as {
          transactionHash: Hex;
          blockNumber: Hex;
          contractAddress: Address | null;
          status: Hex;
          gasUsed: Hex;
          logs: Array<{
            address: Address;
            topics: Hex[];
            data: Hex;
            blockNumber: Hex;
            transactionHash: Hex;
            logIndex: Hex;
            transactionIndex: Hex;
          }>;
        } | null;

        if (receipt) {
          return {
            transactionHash: receipt.transactionHash,
            blockNumber: parseInt(receipt.blockNumber, 16),
            contractAddress: receipt.contractAddress ?? undefined,
            status: (parseInt(receipt.status, 16) === 1 ? 1 : 0) as 0 | 1,
            gasUsed: BigInt(receipt.gasUsed),
            logs: receipt.logs.map((log) => ({
              address: log.address,
              topics: log.topics,
              data: log.data,
              blockNumber: parseInt(log.blockNumber, 16),
              transactionHash: log.transactionHash,
              logIndex: parseInt(log.logIndex, 16),
              transactionIndex: parseInt(log.transactionIndex, 16),
            })),
          };
        }
      } catch {
        // Receipt not available yet, continue polling
      }

      await sleep(intervalMs);
    }

    throw new AuthError(`Transaction receipt not found after ${maxAttempts * intervalMs / 1000} seconds`);
  }

  /**
   * Clear the cached address
   *
   * Call this when the user disconnects or switches accounts.
   */
  clearCache(): void {
    this.cachedAddress = null;
  }
}

/**
 * Convert a string to hex
 */
function stringToHex(str: string): Hex {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let hex = '0x';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex as Hex;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
