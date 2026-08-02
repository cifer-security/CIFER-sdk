/**
 * @module web2/auth
 * @description Web2 authentication and registration endpoints
 *
 * Provides functions for the two-phase registration flow:
 * - Phase 1: Email + password registration with OTP verification
 * - Phase 2: Ed25519 key registration propagated to cluster nodes
 *
 * Also includes password reset and OTP resend helpers.
 */

import type {
  RegisterParams,
  RegisterResult,
  VerifyEmailParams,
  VerifyEmailResult,
  RegisterKeyParams,
  RegisterKeyResult,
  ResendOtpParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  VerifyCredentialsParams,
  VerifyCredentialsResult,
  RequestAccountDeletionParams,
  ConfirmAccountDeletionParams,
  ConfirmAccountDeletionResult,
  RetryNodeRegistrationParams,
  RetryNodeRegistrationResult,
  NodeRegistrationStatusResult,
} from '../types/web2.js';
import { Web2AuthError } from '../internal/errors/index.js';

// ============================================================================
// Internal helper
// ============================================================================

function normalizeUrl(blackboxUrl: string): string {
  return blackboxUrl.replace(/\/$/, '');
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}

async function handleErrorResponse(
  response: Response,
  endpoint: string
): Promise<never> {
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  const message =
    (body.error as string) ||
    (body.message as string) ||
    `Request to ${endpoint} failed with status ${response.status}`;
  throw new Web2AuthError(message);
}

// ============================================================================
// Registration
// ============================================================================

/**
 * Register a new Web2 principal with email and password.
 *
 * Sends an OTP to the provided email address for verification.
 *
 * @param params - Registration parameters
 * @returns The assigned principalId and server message
 *
 * @example
 * ```typescript
 * const result = await web2.auth.register({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 * console.log('Principal ID:', result.principalId);
 * // Now check email for OTP and call verifyEmail()
 * ```
 */
export async function register(
  params: RegisterParams
): Promise<RegisterResult> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/register`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/register');
  }

  const result = (await response.json()) as {
    principalId: string;
    message: string;
  };

  return {
    principalId: result.principalId,
    message: result.message,
  };
}

/**
 * Verify the email OTP sent during registration.
 *
 * @param params - Verification parameters
 * @returns The principalId and verification status
 *
 * @example
 * ```typescript
 * const result = await web2.auth.verifyEmail({
 *   email: 'user@example.com',
 *   otp: '123456',
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 * console.log('Verified:', result.emailVerified);
 * ```
 */
export async function verifyEmail(
  params: VerifyEmailParams
): Promise<VerifyEmailResult> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/verify-email`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      otp: params.otp,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/verify-email');
  }

  const result = (await response.json()) as {
    principalId: string;
    emailVerified: boolean;
  };

  return {
    principalId: result.principalId,
    emailVerified: result.emailVerified,
  };
}

/**
 * Register an Ed25519 public key and propagate the principal to cluster nodes.
 *
 * This is Phase 2 of the registration flow. Requires a verified email
 * and valid password.
 *
 * @param params - Key registration parameters
 * @returns Registration result including node propagation status
 *
 * @example
 * ```typescript
 * const result = await web2.auth.registerKey({
 *   principalId: '550e8400-...',
 *   password: 'securePassword123',
 *   ed25519Signer: myEd25519Signer,
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 *
 * if (result.nodeRegistrationStatus !== 'complete') {
 *   // Retry failed nodes
 *   await web2.auth.retryNodeRegistration({
 *     principalId: result.principalId,
 *     blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 *   });
 * }
 * ```
 */
export async function registerKey(
  params: RegisterKeyParams
): Promise<RegisterKeyResult> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/register-key`;

  // Get public key hex
  const publicKeyBytes = params.ed25519Signer.getPublicKey();
  const publicKeyHex = bytesToHex(publicKeyBytes);

  // Sign "cifer_register:<publicKey>"
  const message = `cifer_register:${publicKeyHex}`;
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = await params.ed25519Signer.sign(messageBytes);
  const signatureHex = bytesToHex(signatureBytes);

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      principalId: params.principalId,
      password: params.password,
      publicKey: publicKeyHex,
      signature: signatureHex,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/register-key');
  }

  const result = (await response.json()) as {
    principalId: string;
    emailHex: string;
    nodeRegistrationStatus: string;
    failedNodes: string[];
    nodeErrors: string[];
  };

  return {
    principalId: result.principalId,
    emailHex: result.emailHex,
    nodeRegistrationStatus: result.nodeRegistrationStatus as RegisterKeyResult['nodeRegistrationStatus'],
    failedNodes: result.failedNodes ?? [],
    nodeErrors: result.nodeErrors ?? [],
  };
}

/**
 * Resend the email verification OTP.
 *
 * Has a 60-second cooldown between requests.
 *
 * @param params - Resend parameters
 * @returns Server message
 */
export async function resendOtp(
  params: ResendOtpParams
): Promise<{ message: string }> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/resend-otp`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: params.email }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/resend-otp');
  }

  const result = (await response.json()) as { message: string };
  return { message: result.message };
}

/**
 * Send a password-reset OTP to a verified email.
 *
 * Has a 60-second cooldown between requests.
 *
 * @param params - Forgot password parameters
 * @returns Server message
 */
export async function forgotPassword(
  params: ForgotPasswordParams
): Promise<{ message: string }> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/forgot-password`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: params.email }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/forgot-password');
  }

  const result = (await response.json()) as { message: string };
  return { message: result.message };
}

/**
 * Reset a password using the OTP from forgotPassword.
 *
 * @param params - Reset password parameters
 * @returns Server message
 */
export async function resetPassword(
  params: ResetPasswordParams
): Promise<{ message: string }> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/reset-password`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      otp: params.otp,
      newPassword: params.newPassword,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/reset-password');
  }

  const result = (await response.json()) as { message: string };
  return { message: result.message };
}

/**
 * Verify Web2 email + password credentials against the Blackbox principal store.
 *
 * **Web2 only** (`chainId = -1`). This function is not available for Web3
 * wallet users. It validates credentials only — it does **not** create a
 * session or return session tokens.
 *
 * Use this when another system needs to confirm that a user entered the
 * correct email and password before proceeding (e.g. app unlock, key rotation).
 *
 * @param params - Verification parameters
 * @returns `{ valid: true, principalId }` on success
 * @throws {@link Web2AuthError} on invalid credentials (401/403/404)
 *
 * @example
 * ```typescript
 * // Web2 only — not for Web3 wallet users
 * const result = await web2.auth.verifyCredentials({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 * console.log('Principal ID:', result.principalId);
 * ```
 */
export async function verifyCredentials(
  params: VerifyCredentialsParams
): Promise<VerifyCredentialsResult> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/verify-credentials`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/verify-credentials');
  }

  const result = (await response.json()) as {
    valid: true;
    principalId: string;
  };

  return {
    valid: result.valid,
    principalId: result.principalId,
  };
}

// ============================================================================
// Account deletion (two-step, OTP-gated soft-delete)
// ============================================================================

/**
 * Step 1 of account deletion: request a deletion-confirmation OTP.
 *
 * Requires the account email, password, and the principalId issued at
 * registration. For anti-enumeration the Black Box always responds with a
 * generic success message; an OTP is only emailed when all details match a
 * verified, active account. Does not throw on "no such account".
 */
export async function requestAccountDeletion(
  params: RequestAccountDeletionParams
): Promise<{ message: string }> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/request-deletion`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      principalId: params.principalId,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/request-deletion');
  }

  const result = (await response.json()) as { message: string };
  return { message: result.message };
}

/**
 * Step 2 of account deletion: confirm with the emailed OTP. On success the
 * account is soft-deleted (dormant): hidden from all APIs but retained for
 * legal disclosure. Re-registering later with the same email reactivates the
 * same principalId (old secrets return).
 */
export async function confirmAccountDeletion(
  params: ConfirmAccountDeletionParams
): Promise<ConfirmAccountDeletionResult> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/confirm-deletion`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      otp: params.otp,
    }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/confirm-deletion');
  }

  const result = (await response.json()) as { success: true; message: string };
  return { success: result.success, message: result.message };
}

/**
 * Retry node registration for a principal whose initial registration
 * was partial or pending.
 *
 * @param params - Retry parameters
 * @returns Updated registration status
 */
export async function retryNodeRegistration(
  params: RetryNodeRegistrationParams
): Promise<RetryNodeRegistrationResult> {
  const fetchFn = params.fetch ?? fetch;
  const url = `${normalizeUrl(params.blackboxUrl)}/web2/auth/retry-node-registration`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ principalId: params.principalId }),
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/retry-node-registration');
  }

  const result = (await response.json()) as {
    principalId: string;
    nodeRegistrationStatus: string;
    failedNodes: string[];
    message?: string;
  };

  return {
    principalId: result.principalId,
    nodeRegistrationStatus: result.nodeRegistrationStatus as RetryNodeRegistrationResult['nodeRegistrationStatus'],
    failedNodes: result.failedNodes ?? [],
    message: result.message,
  };
}

/**
 * Check node registration status for a principal.
 *
 * @param principalId - The principal UUID
 * @param blackboxUrl - Blackbox URL
 * @param options - Optional configuration
 * @returns Node registration status
 */
export async function nodeRegistrationStatus(
  principalId: string,
  blackboxUrl: string,
  options?: { fetch?: typeof fetch }
): Promise<NodeRegistrationStatusResult> {
  const fetchFn = options?.fetch ?? fetch;
  const url = `${normalizeUrl(blackboxUrl)}/web2/auth/node-registration-status?principalId=${encodeURIComponent(principalId)}`;

  const response = await fetchFn(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    await handleErrorResponse(response, '/web2/auth/node-registration-status');
  }

  const result = (await response.json()) as {
    principalId: string;
    nodeRegistrationStatus: string;
    successNodes: string[];
    failedNodes: string[];
  };

  return {
    principalId: result.principalId,
    nodeRegistrationStatus: result.nodeRegistrationStatus as NodeRegistrationStatusResult['nodeRegistrationStatus'],
    successNodes: result.successNodes ?? [],
    failedNodes: result.failedNodes ?? [],
  };
}
