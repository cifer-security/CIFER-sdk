/**
 * @module web2/blackbox
 * @description Web2 blackbox wrappers namespace
 *
 * Provides session-first wrappers around the core `blackbox.*` functions,
 * automatically filling in `chainId = -1` and the session signer.
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 *
 * // Encrypt a payload with a Web2 session
 * const encrypted = await web2.blackbox.payload.encryptPayload({
 *   session,
 *   secretId: 42,
 *   plaintext: 'Hello, Web2!',
 *   blackboxUrl,
 *   readClient,
 * });
 *
 * // Decrypt
 * const decrypted = await web2.blackbox.payload.decryptPayload({
 *   session,
 *   secretId: 42,
 *   encryptedMessage: encrypted.encryptedMessage,
 *   cifer: encrypted.cifer,
 *   blackboxUrl,
 *   readClient,
 * });
 * ```
 */

export * as payload from './payload.js';
export * as files from './files.js';
export * as jobs from './jobs.js';
