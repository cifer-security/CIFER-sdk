/**
 * @module internal/adapters/private-key-signer
 * @description Private key signer adapter for Web2 sessions and server-side signing
 */

import type { Address, Hex } from '../../types/common.js';
import type { SignerAdapter } from '../../types/adapters.js';
import { AuthError } from '../errors/index.js';

/**
 * Signer adapter backed by a raw secp256k1 private key.
 *
 * This adapter performs EIP-191 `personal_sign` using the provided key,
 * making it ideal for Web2 session signing where there is no browser
 * wallet. It can also be used for server-side / backend signing.
 *
 * @remarks
 * The private key is stored in memory. Users are responsible for
 * securing it (e.g. never persisting to disk unencrypted).
 *
 * This adapter uses the `@noble/secp256k1` and `@noble/hashes`
 * libraries for cryptographic operations.
 *
 * @example
 * ```typescript
 * import { PrivateKeySignerAdapter } from 'cifer-sdk';
 *
 * // From an existing hex private key
 * const signer = new PrivateKeySignerAdapter('0xabc123...');
 *
 * // Generate a fresh random keypair
 * const signer = PrivateKeySignerAdapter.generate();
 *
 * const address = await signer.getAddress();
 * const signature = await signer.signMessage('Hello');
 * ```
 *
 * @public
 */
export class PrivateKeySignerAdapter implements SignerAdapter {
  private readonly privateKeyBytes: Uint8Array;
  private cachedAddress: Address | null = null;

  /**
   * Create a new private-key signer from a hex-encoded private key.
   *
   * @param privateKeyHex - The private key as a hex string (with or without 0x prefix)
   */
  constructor(privateKeyHex: string) {
    const hex = privateKeyHex.startsWith('0x')
      ? privateKeyHex.slice(2)
      : privateKeyHex;

    if (hex.length !== 64) {
      throw new AuthError(
        `Invalid private key length: expected 64 hex characters, got ${hex.length}`
      );
    }

    this.privateKeyBytes = hexToBytes(hex);
  }

  /**
   * Generate a fresh random private-key signer.
   *
   * Uses `crypto.getRandomValues` for secure key generation.
   *
   * @returns A new PrivateKeySignerAdapter with a random private key
   */
  static generate(): PrivateKeySignerAdapter {
    const privateKey = new Uint8Array(32);
    crypto.getRandomValues(privateKey);
    return new PrivateKeySignerAdapter(bytesToHex(privateKey));
  }

  /**
   * Get the hex-encoded private key (without 0x prefix).
   *
   * @remarks
   * Use with caution. This exposes the raw private key.
   *
   * @returns The private key as a hex string (no 0x prefix)
   */
  getPrivateKeyHex(): string {
    return bytesToHex(this.privateKeyBytes);
  }

  /**
   * Get the Ethereum address derived from this private key.
   *
   * @returns The checksummed Ethereum address
   */
  async getAddress(): Promise<Address> {
    if (this.cachedAddress) {
      return this.cachedAddress;
    }

    try {
      // Lazy-load @noble/secp256k1
      const { getPublicKey } = await import('@noble/secp256k1');
      const { keccak_256 } = await import('@noble/hashes/sha3');

      // Get uncompressed public key (65 bytes: 0x04 || x || y)
      const publicKey = getPublicKey(this.privateKeyBytes, false);

      // keccak256 of the 64-byte key (skip the 0x04 prefix)
      const hash = keccak_256(publicKey.slice(1));

      // Take the last 20 bytes as the address
      const addressBytes = hash.slice(-20);
      this.cachedAddress = `0x${bytesToHex(addressBytes)}` as Address;

      return this.cachedAddress;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        `Failed to derive address: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sign a message using EIP-191 personal_sign semantics.
   *
   * @param message - The raw message string to sign (NOT hashed or prefixed)
   * @returns The signature as a hex string
   */
  async signMessage(message: string): Promise<Hex> {
    try {
      const secp = await import('@noble/secp256k1');
      const { hmac } = await import('@noble/hashes/hmac');
      const { sha256 } = await import('@noble/hashes/sha256');
      const { keccak_256 } = await import('@noble/hashes/sha3');

      // Configure @noble/secp256k1 with hashing primitives
      secp.etc.hmacSha256Sync = (k: Uint8Array, ...m: Uint8Array[]) =>
        hmac(sha256, k, secp.etc.concatBytes(...m));

      const { sign } = secp;

      // EIP-191 prefix
      const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
      const prefixBytes = new TextEncoder().encode(prefix);
      const messageBytes = new TextEncoder().encode(message);

      // Concatenate prefix + message
      const combined = new Uint8Array(prefixBytes.length + messageBytes.length);
      combined.set(prefixBytes, 0);
      combined.set(messageBytes, prefixBytes.length);

      // keccak256 hash
      const hash = keccak_256(combined);

      // Sign (returns { r, s, recovery })
      const sig = sign(hash, this.privateKeyBytes);

      // Build the 65-byte signature: r (32) + s (32) + v (1)
      const r = sig.r.toString(16).padStart(64, '0');
      const s = sig.s.toString(16).padStart(64, '0');
      const v = (sig.recovery + 27).toString(16).padStart(2, '0');

      return `0x${r}${s}${v}` as Hex;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }
}

// ============================================================================
// Hex utilities (internal)
// ============================================================================

/**
 * Convert hex string (no 0x prefix) to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string (no 0x prefix)
 */
function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}
