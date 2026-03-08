/**
 * @module web2/principal
 * @description Web2 principal lookup
 */

import type { PrincipalByEmailResult } from '../types/web2.js';
import { Web2AuthError } from '../internal/errors/index.js';

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
 * Look up a principal by email address.
 *
 * @param email - The email address to search for
 * @param blackboxUrl - Blackbox URL
 * @param options - Optional configuration
 * @returns The principal's UUID and email hex
 *
 * @example
 * ```typescript
 * const principal = await web2.principal.getByEmail(
 *   'user@example.com',
 *   'https://cifer-blackbox.ternoa.dev:3010'
 * );
 * console.log('Principal ID:', principal.principalId);
 * ```
 */
export async function getByEmail(
  email: string,
  blackboxUrl: string,
  options?: { fetch?: typeof fetch }
): Promise<PrincipalByEmailResult> {
  const fetchFn = options?.fetch ?? fetch;
  const url = `${normalizeUrl(blackboxUrl)}/web2/principal/byEmail?email=${encodeURIComponent(email)}`;

  const response = await fetchFn(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const msg =
      (errorBody.error as string) ||
      (errorBody.message as string) ||
      `Principal lookup failed with status ${response.status}`;
    throw new Web2AuthError(msg);
  }

  return (await response.json()) as PrincipalByEmailResult;
}
