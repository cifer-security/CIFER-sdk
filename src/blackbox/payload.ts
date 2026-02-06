/**
 * @module blackbox/payload
 * @description Payload encryption and decryption via the blackbox API
 */

import type { ChainId, OutputFormat, InputFormat } from '../types/common.js';
import type { SignerAdapter, ReadClient } from '../types/adapters.js';
import {
  buildEncryptPayloadDataString,
  buildDecryptPayloadDataString,
} from '../internal/auth/data-string.js';
import { withBlockFreshRetry } from '../internal/auth/block-freshness.js';
import { signDataString } from '../internal/auth/signer.js';
import {
  EncryptionError,
  DecryptionError,
  parseBlackboxErrorResponse,
} from '../internal/errors/index.js';

/**
 * Result of encrypting a payload
 */
export interface EncryptPayloadResult {
  /** The CIFER envelope (ML-KEM ciphertext + AES-GCM tag) */
  cifer: string;
  /** The AES-encrypted message */
  encryptedMessage: string;
  /** Chain ID used */
  chainId: ChainId;
  /** Secret ID used */
  secretId: bigint;
  /** Output format used */
  outputFormat: OutputFormat;
}

/**
 * Result of decrypting a payload
 */
export interface DecryptPayloadResult {
  /** The decrypted plaintext message */
  decryptedMessage: string;
}

/**
 * Parameters for encrypting a payload
 */
export interface EncryptPayloadParams {
  /** Chain ID where the secret exists */
  chainId: ChainId;
  /** Secret ID to use for encryption */
  secretId: bigint | number;
  /** The plaintext to encrypt */
  plaintext: string;
  /** Signer for authentication */
  signer: SignerAdapter;
  /** Read client for fetching block numbers */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Output format (default: 'hex') */
  outputFormat?: OutputFormat;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Encrypt a payload using the blackbox API
 *
 * This encrypts short messages (up to ~16KB) using a secret's public key.
 * The result can be stored on-chain as an encrypted commitment.
 *
 * @param params - Encryption parameters
 * @returns Encrypted data (cifer and encryptedMessage)
 *
 * @example
 * ```typescript
 * const result = await encryptPayload({
 *   chainId: 752025,
 *   secretId: 123n,
 *   plaintext: 'My secret message',
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 *
 * console.log('Cifer:', result.cifer);
 * console.log('Encrypted message:', result.encryptedMessage);
 * ```
 */
export async function encryptPayload(
  params: EncryptPayloadParams
): Promise<EncryptPayloadResult> {
  const {
    chainId,
    secretId,
    plaintext,
    signer,
    readClient,
    blackboxUrl,
    outputFormat = 'hex',
  } = params;
  const fetchFn = params.fetch ?? fetch;

  const secretIdBigInt = BigInt(secretId);

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      // Get fresh block number
      const blockNumber = await getFreshBlock();

      // Get signer address
      const signerAddress = await signer.getAddress();

      // Build the data string
      const dataString = buildEncryptPayloadDataString({
        chainId,
        secretId: secretIdBigInt,
        signer: signerAddress,
        blockNumber,
        plaintext,
      });

      // Sign the data string
      const signed = await signDataString(dataString, signer);

      // Make the API call
      const url = `${blackboxUrl.replace(/\/$/, '')}/encrypt-payload`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: signed.data,
          signature: signed.signature,
          outputFormat,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/encrypt-payload'
        );
      }

      const result = (await response.json()) as {
        success: boolean;
        cifer: string;
        encryptedMessage: string;
        chainId: number;
        secretId: number;
        outputFormat: string;
      };

      if (!result.success) {
        throw new EncryptionError('Encryption failed: server returned success=false');
      }

      return {
        cifer: result.cifer,
        encryptedMessage: result.encryptedMessage,
        chainId: result.chainId,
        secretId: BigInt(result.secretId),
        outputFormat: result.outputFormat as OutputFormat,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}

/**
 * Parameters for decrypting a payload
 */
export interface DecryptPayloadParams {
  /** Chain ID where the secret exists */
  chainId: ChainId;
  /** Secret ID used for encryption */
  secretId: bigint | number;
  /** The encrypted message (from encrypt result or on-chain logs) */
  encryptedMessage: string;
  /** The CIFER envelope (from encrypt result or on-chain logs) */
  cifer: string;
  /** Signer for authentication (must be owner or delegate) */
  signer: SignerAdapter;
  /** Read client for fetching block numbers */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Input format (default: 'hex') */
  inputFormat?: InputFormat;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Decrypt a payload using the blackbox API
 *
 * This decrypts messages that were encrypted with encryptPayload() or
 * retrieved from on-chain commitment logs.
 *
 * The signer must be the secret owner or delegate.
 *
 * @param params - Decryption parameters
 * @returns Decrypted plaintext message
 *
 * @example
 * ```typescript
 * // Decrypt data retrieved from on-chain logs
 * const result = await decryptPayload({
 *   chainId: 752025,
 *   secretId: 123n,
 *   encryptedMessage: commitmentData.encryptedMessage,
 *   cifer: commitmentData.cifer,
 *   signer,
 *   readClient,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 *
 * console.log('Decrypted:', result.decryptedMessage);
 * ```
 */
export async function decryptPayload(
  params: DecryptPayloadParams
): Promise<DecryptPayloadResult> {
  const {
    chainId,
    secretId,
    encryptedMessage,
    cifer,
    signer,
    readClient,
    blackboxUrl,
    inputFormat = 'hex',
  } = params;
  const fetchFn = params.fetch ?? fetch;

  const secretIdBigInt = BigInt(secretId);

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      // Get fresh block number
      const blockNumber = await getFreshBlock();

      // Get signer address
      const signerAddress = await signer.getAddress();

      // Build the data string
      const dataString = buildDecryptPayloadDataString({
        chainId,
        secretId: secretIdBigInt,
        signer: signerAddress,
        blockNumber,
        encryptedMessage,
      });

      // Sign the data string
      const signed = await signDataString(dataString, signer);

      // Make the API call
      const url = `${blackboxUrl.replace(/\/$/, '')}/decrypt-payload`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cifer,
          data: signed.data,
          signature: signed.signature,
          inputFormat,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/decrypt-payload'
        );
      }

      const result = (await response.json()) as {
        success: boolean;
        decryptedMessage: string;
      };

      if (!result.success) {
        throw new DecryptionError('Decryption failed: server returned success=false');
      }

      return {
        decryptedMessage: result.decryptedMessage,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}
