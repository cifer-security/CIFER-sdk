/**
 * @module blackbox/publicKey
 * @description Fetch ML-KEM public keys from the blackbox local store
 */

import type { ChainId } from '../types/common.js';
import type { SignerAdapter, ReadClient } from '../types/adapters.js';
import { buildFileOperationDataString } from '../internal/auth/data-string.js';
import { withBlockFreshRetry } from '../internal/auth/block-freshness.js';
import { signDataString } from '../internal/auth/signer.js';
import { parseBlackboxErrorResponse } from '../internal/errors/index.js';

/**
 * Parameters for fetching a secret's public key
 */
export interface GetSecretPublicKeyParams {
  /** Chain ID where the secret exists */
  chainId: ChainId;
  /** Secret ID to fetch */
  secretId: bigint | number;
  /** Signer for authentication */
  signer: SignerAdapter;
  /** Read client for fetching block numbers */
  readClient: ReadClient;
  /** Blackbox URL */
  blackboxUrl: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

/**
 * Result of fetching a secret's public key
 */
export interface GetSecretPublicKeyResult {
  /** Chain ID */
  chainId: number;
  /** Secret ID */
  secretId: number;
  /** Base64 ML-KEM-768 public key */
  publicKey: string;
}

/**
 * Fetch a secret's ML-KEM public key from the blackbox API.
 *
 * Auth format: `chainId_secretId_signer_blockNumber` (same as file operations).
 *
 * @param params - Request parameters
 * @returns Public key and identifiers
 */
export async function getSecretPublicKey(
  params: GetSecretPublicKeyParams
): Promise<GetSecretPublicKeyResult> {
  const { chainId, secretId, signer, readClient, blackboxUrl } = params;
  const fetchFn = params.fetch ?? fetch;
  const secretIdBigInt = BigInt(secretId);

  return withBlockFreshRetry(
    async (getFreshBlock) => {
      const blockNumber = await getFreshBlock();
      const signerAddress = await signer.getAddress();

      const dataString = buildFileOperationDataString({
        chainId,
        secretId: secretIdBigInt,
        signer: signerAddress,
        blockNumber,
      });

      const signed = await signDataString(dataString, signer);

      const url = `${blackboxUrl.replace(/\/$/, '')}/secret-public-key`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: signed.data,
          signature: signed.signature,
          chainId,
          secretId: Number(secretIdBigInt),
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        throw parseBlackboxErrorResponse(
          errorBody as { error?: string; message?: string },
          response.status,
          '/secret-public-key'
        );
      }

      const body = (await response.json()) as {
        success: boolean;
        chainId: number;
        secretId: number;
        publicKey: string;
      };

      return {
        chainId: body.chainId,
        secretId: body.secretId,
        publicKey: body.publicKey,
      };
    },
    readClient,
    chainId,
    { maxRetries: 3 }
  );
}
