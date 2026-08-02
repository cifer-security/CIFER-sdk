/**
 * @module web2/permit
 * @description Web2 permit requests (rotate, transfer, delegate) using the V2 Blackbox create contract.
 */

import { sha256 } from '@noble/hashes/sha256';
import { WEB2_CHAIN_ID } from '../types/common.js';
import type {
  RequestPermitParams,
  RequestPermitResult,
} from '../types/web2.js';
import { signDataString } from '../internal/auth/signer.js';
import { Web2AuthError, BlackboxError } from '../internal/errors/index.js';

// ============================================================================
// Internal helpers
// ============================================================================

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function normalizeUrl(blackboxUrl: string): string {
  return blackboxUrl.replace(/\/$/, '');
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function generateRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Canonical compact JSON + lowercase SHA-256 hex digest for permit payloads. */
function canonicalizePermitPayload(payload: Record<string, unknown>): {
  payloadStr: string;
  payloadDigest: string;
} {
  const payloadStr = JSON.stringify(payload);
  const payloadDigest = bytesToHex(sha256(new TextEncoder().encode(payloadStr)));
  return { payloadStr, payloadDigest };
}

function resolveRequestId(requestId: string | undefined): string {
  if (requestId !== undefined) {
    if (!UUID_V4_PATTERN.test(requestId)) {
      throw new Web2AuthError('requestId must be a lowercase UUIDv4');
    }
    return requestId;
  }
  return generateRequestId();
}

function canonicalSecretId(secretId: number | bigint): string {
  if (typeof secretId === 'bigint') {
    if (secretId < 0n) throw new Web2AuthError('secretId must be a non-negative integer');
    return secretId.toString();
  }
  if (!Number.isSafeInteger(secretId) || secretId < 0) {
    throw new Web2AuthError('secretId must be a non-negative safe integer');
  }
  return String(secretId);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Request a permit for key rotation, secret transfer, or delegation.
 *
 * **Rotate permits** use email+password authentication (no session).
 * **Transfer/delegate permits** use session-based signing.
 *
 * Always sends the V2 Blackbox contract:
 * - `requestId`: lowercase UUIDv4 (generated when omitted)
 * - transfer/delegate `data`:
 *   `-1_<secretId>_<sessionAddress>_<timestamp>_permit_<requestId>_<action>_<payloadDigest>`
 * - `payload`: exact compact JSON string used to compute `payloadDigest`
 *
 * @param params - Permit request parameters (discriminated by `action`)
 * @returns Permit result with a confirmable `permitId`
 *
 * @example
 * ```typescript
 * // Key rotation (email+password)
 * const result = await web2.permit.requestPermit({
 *   action: 'rotate',
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   payload: { newPublicKey: '...' },
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 *
 * // Transfer ownership (session)
 * const result = await web2.permit.requestPermit({
 *   action: 'transfer',
 *   session,
 *   secretId: 42,
 *   payload: { newOwnerPrincipalId: 'new-owner-uuid' },
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 * ```
 */
export async function requestPermit(
  params: RequestPermitParams
): Promise<RequestPermitResult> {
  const fetchFn = params.fetch ?? fetch;
  const baseUrl = normalizeUrl(params.blackboxUrl);
  const requestId = resolveRequestId(params.requestId);
  const { payloadStr, payloadDigest } = canonicalizePermitPayload(params.payload);

  if (params.action === 'rotate') {
    const url = `${baseUrl}/web2/permit`;

    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        action: 'rotate',
        email: params.email,
        password: params.password,
        payload: payloadStr,
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const msg =
        (errorBody.error as string) ||
        (errorBody.message as string) ||
        `Permit request failed with status ${response.status}`;
      throw new Web2AuthError(msg);
    }

    return (await response.json()) as RequestPermitResult;
  }

  // Transfer / Delegate uses session-based signing with the V2 eight-part string
  const { session, secretId, action } = params;

  await session.ensureValid();

  const sessionAddress = await session.signer.getAddress();
  const timestamp = Date.now();
  const secretIdPart = canonicalSecretId(secretId);

  // Data string: -1_<secretId>_<sessionAddress>_<timestamp>_permit_<requestId>_<action>_<payloadDigest>
  const dataString = `${WEB2_CHAIN_ID}_${secretIdPart}_${sessionAddress}_${timestamp}_permit_${requestId}_${action}_${payloadDigest}`;
  const signed = await signDataString(dataString, session.signer);

  const url = `${baseUrl}/web2/permit`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId,
      action,
      data: signed.data,
      signature: signed.signature,
      payload: payloadStr,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const msg =
      (errorBody.error as string) ||
      (errorBody.message as string) ||
      `Permit request failed with status ${response.status}`;
    throw new BlackboxError(msg, {
      statusCode: response.status,
      endpoint: '/web2/permit',
    });
  }

  return (await response.json()) as RequestPermitResult;
}
