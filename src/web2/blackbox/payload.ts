/**
 * @module web2/blackbox/payload
 * @description Web2 wrappers for payload encryption/decryption
 *
 * Thin wrappers around the core `blackbox.payload.*` functions that
 * automatically fill in Web2-specific values (chainId, signer, etc.).
 */

import { WEB2_CHAIN_ID } from '../../types/common.js';
import type { OutputFormat, InputFormat } from '../../types/common.js';
import type { ReadClient } from '../../types/adapters.js';
import type { Web2Session } from '../../types/web2.js';
import {
  encryptPayload as coreEncryptPayload,
  decryptPayload as coreDecryptPayload,
  type EncryptPayloadResult,
  type DecryptPayloadResult,
} from '../../blackbox/payload.js';

/**
 * Parameters for Web2 payload encryption.
 *
 * @public
 */
export interface Web2EncryptPayloadParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID to use for encryption */
  secretId: bigint | number;
  /** The plaintext to encrypt */
  plaintext: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Output format (default: 'hex') */
  outputFormat?: OutputFormat;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Encrypt a payload using a Web2 session.
 *
 * Automatically fills in `chainId = -1` and uses the session signer.
 *
 * @param params - Encryption parameters
 * @returns Encrypted data (cifer and encryptedMessage)
 *
 * @example
 * ```typescript
 * const result = await web2.blackbox.payload.encryptPayload({
 *   session,
 *   secretId: 42,
 *   plaintext: 'Hello, Web2!',
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   readClient,
 * });
 * ```
 */
export async function encryptPayload(
  params: Web2EncryptPayloadParams
): Promise<EncryptPayloadResult> {
  await params.session.ensureValid();

  return coreEncryptPayload({
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    plaintext: params.plaintext,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    outputFormat: params.outputFormat,
    fetch: params.fetch,
  });
}

/**
 * Parameters for Web2 payload decryption.
 *
 * @public
 */
export interface Web2DecryptPayloadParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID used for encryption */
  secretId: bigint | number;
  /** The encrypted message */
  encryptedMessage: string;
  /** The CIFER envelope */
  cifer: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Input format (default: 'hex') */
  inputFormat?: InputFormat;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Decrypt a payload using a Web2 session.
 *
 * Automatically fills in `chainId = -1` and uses the session signer.
 *
 * @param params - Decryption parameters
 * @returns Decrypted plaintext message
 *
 * @example
 * ```typescript
 * const result = await web2.blackbox.payload.decryptPayload({
 *   session,
 *   secretId: 42,
 *   encryptedMessage: encrypted.encryptedMessage,
 *   cifer: encrypted.cifer,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   readClient,
 * });
 * console.log(result.decryptedMessage);
 * ```
 */
export async function decryptPayload(
  params: Web2DecryptPayloadParams
): Promise<DecryptPayloadResult> {
  await params.session.ensureValid();

  return coreDecryptPayload({
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    encryptedMessage: params.encryptedMessage,
    cifer: params.cifer,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    inputFormat: params.inputFormat,
    fetch: params.fetch,
  });
}
