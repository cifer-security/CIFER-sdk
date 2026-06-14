/**
 * @module web2/blackbox/publicKey
 * @description Web2 wrapper for fetching secret public keys
 */

import { WEB2_CHAIN_ID } from '../../types/common.js';
import type { ReadClient } from '../../types/adapters.js';
import type { Web2Session } from '../../types/web2.js';
import {
  getSecretPublicKey as coreGetSecretPublicKey,
  type GetSecretPublicKeyResult,
} from '../../blackbox/publicKey.js';

/**
 * Parameters for Web2 public key fetch
 */
export interface Web2GetSecretPublicKeyParams {
  /** Active Web2 session */
  session: Web2Session;
  /** Secret ID to fetch */
  secretId: bigint | number;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Read client for freshness */
  readClient: ReadClient;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Fetch a secret's ML-KEM public key using a Web2 session.
 */
export async function getSecretPublicKey(
  params: Web2GetSecretPublicKeyParams
): Promise<GetSecretPublicKeyResult> {
  await params.session.ensureValid();

  return coreGetSecretPublicKey({
    chainId: WEB2_CHAIN_ID,
    secretId: params.secretId,
    signer: params.session.signer,
    readClient: params.readClient,
    blackboxUrl: params.blackboxUrl,
    fetch: params.fetch,
  });
}
