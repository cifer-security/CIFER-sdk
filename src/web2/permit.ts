/**
 * @module web2/permit
 * @description Web2 permit requests (rotate, transfer, delegate)
 */

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

function normalizeUrl(blackboxUrl: string): string {
  return blackboxUrl.replace(/\/$/, '');
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
 * Data string format (transfer/delegate): `-1_<secretId>_<sessionAddress>_<timestamp>`
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
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 *
 * // Transfer ownership (session)
 * const result = await web2.permit.requestPermit({
 *   action: 'transfer',
 *   session,
 *   secretId: 42,
 *   payload: { newOwnerPrincipalId: 'new-owner-uuid' },
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 * ```
 */
export async function requestPermit(
  params: RequestPermitParams
): Promise<RequestPermitResult> {
  const fetchFn = params.fetch ?? fetch;
  const baseUrl = normalizeUrl(params.blackboxUrl);

  if (params.action === 'rotate') {
    // Rotate uses email+password auth
    const url = `${baseUrl}/web2/permit`;

    const response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'rotate',
        email: params.email,
        password: params.password,
        payload: params.payload,
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

  // Transfer / Delegate uses session-based signing
  const { session, secretId, payload, action } = params;

  await session.ensureValid();

  const sessionAddress = await session.signer.getAddress();
  const timestamp = Date.now();

  // Data string: -1_<secretId>_<sessionAddress>_<timestamp>
  const dataString = `${WEB2_CHAIN_ID}_${secretId}_${sessionAddress}_${timestamp}`;
  const signed = await signDataString(dataString, session.signer);

  const url = `${baseUrl}/web2/permit`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      data: signed.data,
      signature: signed.signature,
      payload,
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
