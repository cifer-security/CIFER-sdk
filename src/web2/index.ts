/**
 * @module web2
 * @description Web2 namespace for the CIFER SDK
 *
 * Provides email-based registration, session management, secret/delegate/permit
 * operations, and session-first blackbox wrappers for encryption/decryption.
 *
 * @example
 * ```typescript
 * import { web2 } from 'cifer-sdk';
 *
 * // 1. Register
 * const reg = await web2.auth.register({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   blackboxUrl,
 * });
 *
 * // 2. Verify email
 * await web2.auth.verifyEmail({ email: 'user@example.com', otp: '123456', blackboxUrl });
 *
 * // 3. Register Ed25519 key
 * await web2.auth.registerKey({
 *   principalId: reg.principalId,
 *   password: 'securePassword123',
 *   ed25519Signer: myEd25519Signer,
 *   blackboxUrl,
 * });
 *
 * // 4. Create session
 * const session = await web2.session.createManagedSession({
 *   principalId: reg.principalId,
 *   ed25519Signer: myEd25519Signer,
 *   blackboxUrl,
 * });
 *
 * // 5. Create secret
 * const secret = await web2.secret.createSecret({ session, blackboxUrl });
 *
 * // 6. Encrypt
 * const encrypted = await web2.blackbox.payload.encryptPayload({
 *   session,
 *   secretId: secret.secretId,
 *   plaintext: 'Hello Web2!',
 *   blackboxUrl,
 *   readClient,
 * });
 * ```
 *
 * @packageDocumentation
 */

export * as auth from './auth.js';
export * as session from './session.js';
export * as secret from './secret.js';
export * as delegate from './delegate.js';
export * as permit from './permit.js';
export * as principal from './principal.js';
export * as blackbox from './blackbox/index.js';
export { createClient, type Web2Client, type Web2ClientConfig } from './client.js';