/**
 * Web2-specific types for the CIFER SDK.
 *
 * These types support the email-based registration, session management,
 * and Web2 secret/delegate/permit operations.
 *
 * @packageDocumentation
 * @module types/web2
 */

import type { Address } from './common.js';
import type { SignerAdapter } from './adapters.js';

// ============================================================================
// Ed25519 Signer
// ============================================================================

/**
 * Ed25519 signer callback interface.
 *
 * @remarks
 * The SDK does not bundle a specific Ed25519 library. Consumers can
 * implement this interface using any library they prefer, for example:
 * - `@noble/ed25519`
 * - Node.js `crypto.sign('ed25519', ...)`
 * - A TEE-backed signing service
 *
 * @example Using @noble/ed25519
 * ```typescript
 * import * as ed25519 from '@noble/ed25519';
 *
 * const ed25519Signer: Ed25519Signer = {
 *   async sign(message: Uint8Array) {
 *     return ed25519.sign(message, privateKey);
 *   },
 *   getPublicKey() {
 *     return ed25519.getPublicKey(privateKey);
 *   },
 * };
 * ```
 *
 * @public
 */
export interface Ed25519Signer {
  /**
   * Sign a message with the Ed25519 private key.
   *
   * @param message - Raw bytes to sign
   * @returns The 64-byte Ed25519 signature
   */
  sign(message: Uint8Array): Promise<Uint8Array>;

  /**
   * Get the Ed25519 public key (32 bytes).
   *
   * @returns The 32-byte public key
   */
  getPublicKey(): Uint8Array;
}

// ============================================================================
// Registration Types
// ============================================================================

/**
 * Parameters for email+password registration.
 *
 * @public
 */
export interface RegisterParams {
  /** Email address (must contain @) */
  email: string;
  /** Password (minimum 8 characters) */
  password: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of registration.
 *
 * @public
 */
export interface RegisterResult {
  /** The assigned principal UUID */
  principalId: string;
  /** Server message (e.g. "OTP sent to email") */
  message: string;
}

/**
 * Parameters for email OTP verification.
 *
 * @public
 */
export interface VerifyEmailParams {
  /** Email address */
  email: string;
  /** OTP code received via email */
  otp: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of email verification.
 *
 * @public
 */
export interface VerifyEmailResult {
  /** The principal UUID */
  principalId: string;
  /** Whether the email is now verified */
  emailVerified: boolean;
}

/**
 * Parameters for Ed25519 key registration (Phase 2).
 *
 * @public
 */
export interface RegisterKeyParams {
  /** Principal UUID from registration */
  principalId: string;
  /** Password for verification */
  password: string;
  /** Ed25519 signer (provides publicKey + sign) */
  ed25519Signer: Ed25519Signer;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of key registration.
 *
 * @public
 */
export interface RegisterKeyResult {
  /** The principal UUID */
  principalId: string;
  /** Hex-encoded email */
  emailHex: string;
  /**
   * Status of node registration.
   * - `"complete"`: all 5 nodes registered
   * - `"partial"`: quorum threshold reached (3+ of 5), can create sessions
   * - `"pending"`: some nodes registered but below threshold, need retry
   * - `"failed"`: all nodes failed
   */
  nodeRegistrationStatus: 'complete' | 'partial' | 'pending' | 'failed';
  /** Array of node URLs that failed to register */
  failedNodes: string[];
  /** Array of error details from failed nodes */
  nodeErrors: string[];
}

/**
 * Parameters for resending the email OTP.
 *
 * @public
 */
export interface ResendOtpParams {
  /** Email address */
  email: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Parameters for sending a password-reset OTP.
 *
 * @public
 */
export interface ForgotPasswordParams {
  /** Email address */
  email: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Parameters for resetting a password with OTP.
 *
 * @public
 */
export interface ResetPasswordParams {
  /** Email address */
  email: string;
  /** OTP received via email */
  otp: string;
  /** New password (minimum 8 characters) */
  newPassword: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Parameters for retrying node registration.
 *
 * @public
 */
export interface RetryNodeRegistrationParams {
  /** Principal UUID */
  principalId: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of retrying node registration.
 *
 * @public
 */
export interface RetryNodeRegistrationResult {
  /** The principal UUID */
  principalId: string;
  /** Updated node registration status */
  nodeRegistrationStatus: 'complete' | 'partial' | 'pending' | 'failed';
  /** Array of node URLs that failed */
  failedNodes: string[];
  /** Optional server message */
  message?: string;
}

/**
 * Result of checking node registration status.
 *
 * @public
 */
export interface NodeRegistrationStatusResult {
  /** The principal UUID */
  principalId: string;
  /** Node registration status */
  nodeRegistrationStatus: 'complete' | 'partial' | 'pending' | 'failed';
  /** Array of successful node URLs */
  successNodes: string[];
  /** Array of failed node URLs */
  failedNodes: string[];
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * Parameters for creating a managed session.
 *
 * @remarks
 * A managed session uses an Ed25519 signer to create and renew sessions
 * automatically. The SDK generates an ephemeral EOA keypair and handles
 * session lifecycle.
 *
 * @public
 */
export interface CreateManagedSessionParams {
  /** Principal UUID */
  principalId: string;
  /** Ed25519 signer for session creation/renewal */
  ed25519Signer: Ed25519Signer;
  /** Blackbox URL */
  blackboxUrl: string;
  /**
   * Session time-to-live in milliseconds.
   * Min: 60000 (1 minute), Max: 2592000000 (30 days).
   * Default: 900000 (15 minutes).
   */
  ttl?: number;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Raw result from the POST /web2/session endpoint.
 *
 * @public
 */
export interface CreateSessionResult {
  /** Session token (used server-side, SDK does not need to store this for requests) */
  sessionToken: string;
  /** The session EOA address */
  sessionAddress: Address;
  /** Quorum proof from cluster nodes */
  quorumProof: Array<{ nodeAddress: string; signature: string }>;
  /** ISO 8601 expiry timestamp */
  expiresAt: string;
}

/**
 * Parameters for using an existing session key.
 *
 * @remarks
 * This is the "advanced" mode where the session has already been created
 * externally (e.g. via a TEE web front) and the SDK only receives the
 * session EOA private key.
 *
 * The SDK will NOT be able to create or renew sessions in this mode.
 *
 * @public
 */
export interface UseExistingSessionKeyParams {
  /** The session EOA private key (hex string, with or without 0x prefix) */
  sessionPrivateKey: string;
  /** Principal UUID (optional, for informational purposes) */
  principalId?: string;
}

/**
 * Web2 session object returned by session creation functions.
 *
 * @remarks
 * This object contains everything needed to make authenticated
 * Web2 requests: a `signer` (session EOA), `principalId`, and
 * session validity information.
 *
 * For managed sessions, `renew()` and `ensureValid()` handle
 * automatic session lifecycle.
 *
 * @public
 */
export interface Web2Session {
  /** The principal UUID */
  readonly principalId: string;

  /** The session EOA address */
  readonly sessionAddress: Address;

  /** ISO 8601 expiry timestamp (empty string for existing-key sessions) */
  readonly expiresAt: string;

  /** The signer adapter wrapping the session EOA private key */
  readonly signer: SignerAdapter;

  /** Whether this is a managed session (can renew) */
  readonly isManaged: boolean;

  /**
   * Renew the session.
   *
   * @remarks
   * Only available for managed sessions. Throws `Web2SessionError`
   * for existing-key sessions.
   */
  renew(): Promise<void>;

  /**
   * Ensure the session is still valid, renewing if near expiry.
   *
   * @remarks
   * For managed sessions, renews automatically if the session expires
   * within the next 60 seconds.
   *
   * For existing-key sessions, this is a no-op (cannot check validity
   * without a server call).
   */
  ensureValid(): Promise<void>;
}

// ============================================================================
// Secret Types
// ============================================================================

/**
 * Parameters for creating a Web2 secret.
 *
 * @public
 */
export interface CreateWeb2SecretParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of creating a Web2 secret.
 *
 * @public
 */
export interface CreateWeb2SecretResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** The assigned secret ID */
  secretId: number;
  /** Cluster ID where the secret is stored */
  clusterId: number;
  /** IPFS CID of the public key */
  publicKeyCid: string;
  /**
   * Status of secret creation.
   * - `"complete"`: secret fully created and synced
   * - `"propagating"`: secret created but still propagating to some nodes
   */
  status: 'complete' | 'propagating';
}

/**
 * Parameters for listing Web2 secrets.
 *
 * @public
 */
export interface ListWeb2SecretsParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Web2 secret information.
 *
 * @public
 */
export interface Web2SecretInfo {
  /** Secret ID */
  secretId: number;
  /** Owner principal UUID */
  ownerPrincipalId: string;
  /** Delegate principal UUID (null if none) */
  delegatePrincipalId: string | null;
  /** Whether the secret is still syncing */
  isSyncing: number;
  /** Cluster ID */
  clusterId: number;
  /** Secret type (1 = standard ML-KEM-768 encryption) */
  secretType: number;
  /** IPFS CID of the public key */
  publicKeyCid: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last update timestamp */
  updatedAt: string;
}

/**
 * Result of listing Web2 secrets.
 *
 * @public
 */
export interface ListWeb2SecretsResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Array of secret info */
  secrets: Web2SecretInfo[];
}

// ============================================================================
// Delegate Types
// ============================================================================

/**
 * Parameters for setting a Web2 delegate.
 *
 * @public
 */
export interface SetWeb2DelegateParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID to set delegate for */
  secretId: number | bigint;
  /**
   * The delegate principal UUID, or empty string to remove the delegate.
   */
  delegatePrincipalId: string;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of setting a Web2 delegate.
 *
 * @public
 */
export interface SetWeb2DelegateResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Secret ID */
  secretId: number;
}

// ============================================================================
// Permit Types
// ============================================================================

/**
 * Permit action type.
 *
 * @public
 */
export type PermitAction = 'rotate' | 'transfer' | 'delegate';

/**
 * Parameters for requesting a key rotation permit (email+password auth).
 *
 * @public
 */
export interface RequestRotatePermitParams {
  /** Action type */
  action: 'rotate';
  /** Email address */
  email: string;
  /** Password */
  password: string;
  /** JSON payload with newPublicKey */
  payload: { newPublicKey: string };
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Parameters for requesting a transfer or delegate permit (session auth).
 *
 * @public
 */
export interface RequestTransferOrDelegatePermitParams {
  /** Action type ('transfer' or 'delegate') */
  action: 'transfer' | 'delegate';
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID */
  secretId: number | bigint;
  /** JSON payload (newOwnerPrincipalId or delegatePrincipalId) */
  payload: { newOwnerPrincipalId?: string; delegatePrincipalId?: string };
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Combined permit request params.
 *
 * @public
 */
export type RequestPermitParams =
  | RequestRotatePermitParams
  | RequestTransferOrDelegatePermitParams;

/**
 * Result of requesting a permit.
 *
 * @public
 */
export interface RequestPermitResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Permit UUID */
  permitId: string;
  /** Action type */
  action: PermitAction;
  /** Cluster ID */
  clusterId: number;
  /** ISO 8601 expiry timestamp */
  expiresAt: string;
  /** Server message */
  message: string;
}

// ============================================================================
// Principal Types
// ============================================================================

/**
 * Result of looking up a principal by email.
 *
 * @public
 */
export interface PrincipalByEmailResult {
  /** The principal UUID */
  principalId: string;
  /** Hex-encoded email */
  emailHex: string;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Common parameters for Web2 blackbox wrapper calls.
 *
 * @remarks
 * These wrappers automatically fill in `chainId`, `signer`, and
 * other session-derived values.
 *
 * @public
 */
export interface Web2BlackboxBaseParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client (for freshness) */
  readClient: import('./adapters.js').ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}
