/**
 * @module internal/auth/signer
 * @description Signing utilities for blackbox authentication
 */

import type { Hex } from '../../types/common.js';
import type { SignerAdapter } from '../../types/adapters.js';
import { SignatureError } from '../errors/index.js';

/**
 * Signed data result
 */
export interface SignedData {
  /** The data string that was signed */
  data: string;
  /** The signature (hex string) */
  signature: Hex;
  /** The signer address */
  signer: string;
}

/**
 * Sign a data string using the provided signer
 *
 * This uses EIP-191 personal_sign semantics, which is what the blackbox
 * expects for signature verification.
 *
 * @param data - The data string to sign (NOT hashed or prefixed)
 * @param signer - The signer adapter
 * @returns The signed data with signature
 *
 * @example
 * ```typescript
 * const dataString = buildEncryptPayloadDataString({
 *   chainId: 752025,
 *   secretId: 123n,
 *   signer: address,
 *   blockNumber: 4200000,
 *   plaintext: 'my secret',
 * });
 *
 * const signed = await signDataString(dataString, signerAdapter);
 * // { data: '752025_123_0xabc..._4200000_my secret', signature: '0x...', signer: '0xabc...' }
 * ```
 */
export async function signDataString(
  data: string,
  signer: SignerAdapter
): Promise<SignedData> {
  try {
    const address = await signer.getAddress();
    const signature = await signer.signMessage(data);

    return {
      data,
      signature,
      signer: address,
    };
  } catch (error) {
    throw new SignatureError(
      `Failed to sign data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Normalize an address to lowercase for comparison
 *
 * The blackbox compares addresses in lowercase, so this ensures consistent
 * comparison behavior.
 *
 * @param address - The address to normalize
 * @returns Lowercase address
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Check if two addresses are equal (case-insensitive)
 *
 * @param a - First address
 * @param b - Second address
 * @returns True if addresses match
 */
export function addressesEqual(a: string, b: string): boolean {
  return normalizeAddress(a) === normalizeAddress(b);
}

/**
 * Validate that a signature result has the expected signer
 *
 * @param signed - The signed data
 * @param expectedSigner - The expected signer address
 * @throws SignatureError if signers don't match
 */
export function validateSigner(
  signed: SignedData,
  expectedSigner: string
): void {
  if (!addressesEqual(signed.signer, expectedSigner)) {
    throw new SignatureError(
      `Signer mismatch: expected ${expectedSigner}, got ${signed.signer}`
    );
  }
}
