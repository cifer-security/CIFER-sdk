/**
 * Ed25519 key management helper for the Web2 integration example.
 *
 * Uses @noble/ed25519 (pure JS, browser-compatible) to generate
 * keypairs and implement the Ed25519Signer interface required by
 * web2.auth.registerKey() and web2.session.createManagedSession().
 *
 * @example
 * ```typescript
 * import { generateEd25519Signer, serializeKeys, restoreEd25519Signer } from '@/lib/ed25519';
 *
 * // Generate a new keypair
 * const signer = generateEd25519Signer();
 *
 * // Serialize to hex strings for storage
 * const keys = serializeKeys(signer);
 *
 * // Restore later
 * const restored = restoreEd25519Signer(keys.privateKeyHex);
 * ```
 */

import * as ed25519 from "@noble/ed25519"
import { sha512 } from "@noble/hashes/sha512"

// @noble/ed25519 v2 requires setting the SHA-512 hash function
// (it was built-in in v1 but now must be explicitly configured)
ed25519.etc.sha512Sync = (...m: Uint8Array[]) => {
  const h = sha512.create()
  for (const msg of m) h.update(msg)
  return h.digest()
}

/**
 * An Ed25519 signer wrapping a private key using @noble/ed25519.
 * Implements the Ed25519Signer interface from cifer-sdk.
 */
export interface StoredEd25519Signer {
  sign(message: Uint8Array): Promise<Uint8Array>
  getPublicKey(): Uint8Array
  /** The raw 32-byte private key (seed) */
  privateKey: Uint8Array
}

/**
 * Generate a new Ed25519 keypair and return a signer.
 */
export function generateEd25519Signer(): StoredEd25519Signer {
  const privateKey = ed25519.utils.randomPrivateKey()
  return createSignerFromPrivateKey(privateKey)
}

/**
 * Create a signer from an existing private key (32 bytes).
 */
export function createSignerFromPrivateKey(
  privateKey: Uint8Array
): StoredEd25519Signer {
  const publicKey = ed25519.getPublicKey(privateKey)

  return {
    privateKey,

    async sign(message: Uint8Array): Promise<Uint8Array> {
      return ed25519.sign(message, privateKey)
    },

    getPublicKey(): Uint8Array {
      return publicKey
    },
  }
}

/**
 * Restore an Ed25519 signer from a hex-encoded private key string.
 */
export function restoreEd25519Signer(privateKeyHex: string): StoredEd25519Signer {
  const privateKey = hexToBytes(privateKeyHex)
  return createSignerFromPrivateKey(privateKey)
}

/**
 * Serialize a signer's keys to hex strings (for display or storage).
 */
export function serializeKeys(signer: StoredEd25519Signer): {
  privateKeyHex: string
  publicKeyHex: string
} {
  return {
    privateKeyHex: bytesToHex(signer.privateKey),
    publicKeyHex: bytesToHex(signer.getPublicKey()),
  }
}

// ---------------------------------------------------------------------------
// Hex utilities
// ---------------------------------------------------------------------------

export function bytesToHex(bytes: Uint8Array): string {
  let hex = ""
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0")
  }
  return hex
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
