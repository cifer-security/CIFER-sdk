/**
 * @module web2/delegate
 * @description Web2 delegate management
 */

import { WEB2_CHAIN_ID } from '../types/common.js';
import type {
  SetWeb2DelegateParams,
  SetWeb2DelegateResult,
} from '../types/web2.js';
import { signDataString } from '../internal/auth/signer.js';
import { BlackboxError } from '../internal/errors/index.js';

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
 * Set or remove a delegate for a Web2 secret.
 *
 * Data string format: `-1_<secretId>_<sessionAddress>_<timestamp>_<delegatePrincipalId>`
 *
 * @param params - Delegate parameters
 * @returns Operation result
 *
 * @example
 * ```typescript
 * // Set a delegate
 * await web2.delegate.setDelegate({
 *   session,
 *   secretId: 42,
 *   delegatePrincipalId: 'delegate-principal-uuid',
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 *
 * // Remove a delegate
 * await web2.delegate.setDelegate({
 *   session,
 *   secretId: 42,
 *   delegatePrincipalId: '',
 *   blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
 * });
 * ```
 */
export async function setDelegate(
  params: SetWeb2DelegateParams
): Promise<SetWeb2DelegateResult> {
  const { session, secretId, delegatePrincipalId, blackboxUrl } = params;
  const fetchFn = params.fetch ?? fetch;

  await session.ensureValid();

  const sessionAddress = await session.signer.getAddress();
  const timestamp = Date.now();

  // Data string: -1_<secretId>_<sessionAddress>_<timestamp>_<delegatePrincipalId>
  const dataString = `${WEB2_CHAIN_ID}_${secretId}_${sessionAddress}_${timestamp}_${delegatePrincipalId}`;
  const signed = await signDataString(dataString, session.signer);

  const url = `${normalizeUrl(blackboxUrl)}/web2/setDelegate`;

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: signed.data,
      signature: signed.signature,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const msg =
      (errorBody.error as string) ||
      (errorBody.message as string) ||
      `Set delegate failed with status ${response.status}`;
    throw new BlackboxError(msg, {
      statusCode: response.status,
      endpoint: '/web2/setDelegate',
    });
  }

  return (await response.json()) as SetWeb2DelegateResult;
}
