/**
 * @module web2/blackbox/files
 * @description Web2 wrappers for file encryption/decryption
 *
 * Thin wrappers around the core `blackbox.files.*` functions that
 * automatically fill in Web2-specific values (chainId, signer, etc.).
 */

import { WEB2_CHAIN_ID } from '../../types/common.js';
import type { ReadClient } from '../../types/adapters.js';
import type { Web2Session } from '../../types/web2.js';
import {
  encryptFile as coreEncryptFile,
  decryptFile as coreDecryptFile,
  decryptExistingFile as coreDecryptExistingFile,
  type FileJobResult,
} from '../../blackbox/files.js';

/**
 * Parameters for Web2 file encryption.
 *
 * @public
 */
export interface Web2EncryptFileParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID to use for encryption */
  secretId: bigint | number;
  /** The file to encrypt */
  file: File | Blob;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Encrypt a file using a Web2 session.
 *
 * @param params - Encryption parameters
 * @returns Job ID for polling and download
 *
 * @example
 * ```typescript
 * const job = await web2.blackbox.files.encryptFile({
 *   session,
 *   secretId: 42,
 *   file: myFile,
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 *   readClient,
 * });
 * ```
 */
export async function encryptFile(
  params: Web2EncryptFileParams
): Promise<FileJobResult> {
  await params.session.ensureValid();

  return coreEncryptFile({
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    file: params.file,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    fetch: params.fetch,
  });
}

/**
 * Parameters for Web2 file decryption.
 *
 * @public
 */
export interface Web2DecryptFileParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID used for encryption */
  secretId: bigint | number;
  /** The .cifer file to decrypt */
  file: File | Blob;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Decrypt a file using a Web2 session.
 *
 * @param params - Decryption parameters
 * @returns Job ID for polling and download
 */
export async function decryptFile(
  params: Web2DecryptFileParams
): Promise<FileJobResult> {
  await params.session.ensureValid();

  return coreDecryptFile({
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    file: params.file,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    fetch: params.fetch,
  });
}

/**
 * Parameters for Web2 decrypt-existing-file.
 *
 * @public
 */
export interface Web2DecryptExistingFileParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID used for the original encryption */
  secretId: bigint | number;
  /** Job ID of the completed encrypt job */
  encryptJobId: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Decrypt an existing file using a Web2 session.
 *
 * @param params - Decryption parameters
 * @returns Job ID for polling and download
 */
export async function decryptExistingFile(
  params: Web2DecryptExistingFileParams
): Promise<FileJobResult> {
  await params.session.ensureValid();

  return coreDecryptExistingFile({
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    encryptJobId: params.encryptJobId,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    fetch: params.fetch,
  });
}
