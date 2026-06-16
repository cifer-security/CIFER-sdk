/**
 * @module web2/secret
 * @description Web2 secret creation and listing
 */

import { WEB2_CHAIN_ID } from '../types/common.js';
import type {
  CreateWeb2SecretParams,
  CreateWeb2SecretResult,
  ListWeb2SecretsParams,
  ListWeb2SecretsResult,
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
 * Create a new Web2 secret.
 *
 * Data string format: `-1_0_<sessionAddress>_<timestamp>`
 *
 * @param params - Secret creation parameters
 * @returns Created secret info
 *
 * @example
 * ```typescript
 * const result = await web2.secret.createSecret({
 *   session,
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 * console.log('Secret ID:', result.secretId);
 * ```
 */
export async function createSecret(
  params: CreateWeb2SecretParams
): Promise<CreateWeb2SecretResult> {
  const { session, blackboxUrl } = params;
  const fetchFn = params.fetch ?? fetch;

  await session.ensureValid();

  const sessionAddress = await session.signer.getAddress();
  const timestamp = Date.now();

  // Data string: -1_0_<sessionAddress>_<timestamp>
  const dataString = `${WEB2_CHAIN_ID}_0_${sessionAddress}_${timestamp}`;
  const signed = await signDataString(dataString, session.signer);

  const url = `${normalizeUrl(blackboxUrl)}/web2/secret`;

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
      `Secret creation failed with status ${response.status}`;
    throw new BlackboxError(msg, {
      statusCode: response.status,
      endpoint: '/web2/secret',
    });
  }

  return (await response.json()) as CreateWeb2SecretResult;
}

/**
 * List all Web2 secrets for the current principal.
 *
 * Data string format: `-1_<principalId>_<sessionAddress>_<timestamp>`
 *
 * @param params - List parameters
 * @returns Array of secret info
 *
 * @example
 * ```typescript
 * const result = await web2.secret.listSecrets({
 *   session,
 *   blackboxUrl: 'https://blackbox.cifersecurity.com:3010',
 * });
 * console.log('Secrets:', result.secrets);
 * ```
 */
export async function listSecrets(
  params: ListWeb2SecretsParams
): Promise<ListWeb2SecretsResult> {
  const { session, blackboxUrl } = params;
  const fetchFn = params.fetch ?? fetch;

  await session.ensureValid();

  const sessionAddress = await session.signer.getAddress();
  const timestamp = Date.now();

  // Data string: -1_<principalId>_<sessionAddress>_<timestamp>
  const dataString = `${WEB2_CHAIN_ID}_${session.principalId}_${sessionAddress}_${timestamp}`;
  const signed = await signDataString(dataString, session.signer);

  const url = `${normalizeUrl(blackboxUrl)}/web2/secrets`;

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
      `List secrets failed with status ${response.status}`;
    throw new BlackboxError(msg, {
      statusCode: response.status,
      endpoint: '/web2/secrets',
    });
  }

  return (await response.json()) as ListWeb2SecretsResult;
}
