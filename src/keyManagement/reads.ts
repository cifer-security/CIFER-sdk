/**
 * @module keyManagement/reads
 * @description Read operations for the SecretsController contract
 */

import type { Address, ChainId, SecretState } from '../types/common.js';
import type { ReadClient } from '../types/adapters.js';
import {
  encodeSecretCreationFee,
  encodeGetSecretState,
  encodeGetSecretOwner,
  encodeGetDelegate,
  encodeGetSecretsByWallet,
  encodeGetSecretsCountByWallet,
  decodeSecretCreationFee,
  decodeGetSecretState,
  decodeGetSecretOwner,
  decodeGetDelegate,
  decodeGetSecretsByWallet,
  decodeGetSecretsCountByWallet,
} from '../internal/abi/secrets-controller.js';
import { KeyManagementError, SecretNotFoundError } from '../internal/errors/index.js';

/**
 * Parameters for read operations
 */
export interface ReadParams {
  /** Chain ID */
  chainId: ChainId;
  /** SecretsController contract address */
  controllerAddress: Address;
  /** Read client for making RPC calls */
  readClient: ReadClient;
}

/**
 * Get the secret creation fee
 *
 * This is the amount of native token (in wei) required to create a new secret.
 *
 * @param params - Read parameters
 * @returns The fee in wei
 *
 * @example
 * ```typescript
 * const fee = await getSecretCreationFee({
 *   chainId: 752025,
 *   controllerAddress: '0x...',
 *   readClient,
 * });
 * console.log('Fee:', fee, 'wei');
 * ```
 */
export async function getSecretCreationFee(params: ReadParams): Promise<bigint> {
  const { chainId, controllerAddress, readClient } = params;

  if (!readClient.call) {
    throw new KeyManagementError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeSecretCreationFee();
    const result = await readClient.call(chainId, {
      to: controllerAddress,
      data,
    });
    return decodeSecretCreationFee(result);
  } catch (error) {
    throw new KeyManagementError(
      `Failed to get secret creation fee: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get the full state of a secret
 *
 * @param params - Read parameters
 * @param secretId - The secret ID to query
 * @returns The secret state
 * @throws SecretNotFoundError if the secret doesn't exist
 *
 * @example
 * ```typescript
 * const state = await getSecret({
 *   chainId: 752025,
 *   controllerAddress: '0x...',
 *   readClient,
 * }, 123n);
 *
 * console.log('Owner:', state.owner);
 * console.log('Is syncing:', state.isSyncing);
 * console.log('Public key CID:', state.publicKeyCid);
 * ```
 */
export async function getSecret(
  params: ReadParams,
  secretId: bigint
): Promise<SecretState> {
  const { chainId, controllerAddress, readClient } = params;

  if (!readClient.call) {
    throw new KeyManagementError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeGetSecretState(secretId);
    const result = await readClient.call(chainId, {
      to: controllerAddress,
      data,
    });

    const decoded = decodeGetSecretState(result);

    // Check if secret exists (owner is zero address means not found)
    if (decoded.owner === '0x0000000000000000000000000000000000000000') {
      throw new SecretNotFoundError(secretId);
    }

    return {
      owner: decoded.owner,
      delegate: decoded.delegate,
      isSyncing: decoded.isSyncing,
      clusterId: decoded.clusterId,
      secretType: decoded.secretType,
      publicKeyCid: decoded.publicKeyCid,
    };
  } catch (error) {
    if (error instanceof SecretNotFoundError) {
      throw error;
    }

    // Check for "Secret not found" revert
    if (error instanceof Error && error.message.includes('Secret not found')) {
      throw new SecretNotFoundError(secretId, error);
    }

    throw new KeyManagementError(
      `Failed to get secret state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get the owner of a secret
 *
 * @param params - Read parameters
 * @param secretId - The secret ID to query
 * @returns The owner address
 * @throws SecretNotFoundError if the secret doesn't exist
 */
export async function getSecretOwner(
  params: ReadParams,
  secretId: bigint
): Promise<Address> {
  const { chainId, controllerAddress, readClient } = params;

  if (!readClient.call) {
    throw new KeyManagementError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeGetSecretOwner(secretId);
    const result = await readClient.call(chainId, {
      to: controllerAddress,
      data,
    });
    return decodeGetSecretOwner(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Secret not found')) {
      throw new SecretNotFoundError(secretId, error);
    }
    throw new KeyManagementError(
      `Failed to get secret owner: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get the delegate of a secret
 *
 * @param params - Read parameters
 * @param secretId - The secret ID to query
 * @returns The delegate address (zero address if no delegate)
 * @throws SecretNotFoundError if the secret doesn't exist
 */
export async function getDelegate(
  params: ReadParams,
  secretId: bigint
): Promise<Address> {
  const { chainId, controllerAddress, readClient } = params;

  if (!readClient.call) {
    throw new KeyManagementError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeGetDelegate(secretId);
    const result = await readClient.call(chainId, {
      to: controllerAddress,
      data,
    });
    return decodeGetDelegate(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Secret not found')) {
      throw new SecretNotFoundError(secretId, error);
    }
    throw new KeyManagementError(
      `Failed to get delegate: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Result of getSecretsByWallet
 */
export interface SecretsByWallet {
  /** Secret IDs owned by the wallet */
  owned: bigint[];
  /** Secret IDs delegated to the wallet */
  delegated: bigint[];
}

/**
 * Get all secrets owned by or delegated to a wallet
 *
 * Note: The returned arrays are unordered sets. The contract uses
 * swap-and-pop for removals, so order is not stable.
 *
 * @param params - Read parameters
 * @param wallet - The wallet address to query
 * @returns Object containing owned and delegated secret IDs
 *
 * @example
 * ```typescript
 * const secrets = await getSecretsByWallet({
 *   chainId: 752025,
 *   controllerAddress: '0x...',
 *   readClient,
 * }, '0xUser...');
 *
 * console.log('Owned:', secrets.owned);
 * console.log('Delegated:', secrets.delegated);
 * ```
 */
export async function getSecretsByWallet(
  params: ReadParams,
  wallet: Address
): Promise<SecretsByWallet> {
  const { chainId, controllerAddress, readClient } = params;

  if (!readClient.call) {
    throw new KeyManagementError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeGetSecretsByWallet(wallet);
    const result = await readClient.call(chainId, {
      to: controllerAddress,
      data,
    });
    return decodeGetSecretsByWallet(result);
  } catch (error) {
    throw new KeyManagementError(
      `Failed to get secrets by wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Result of getSecretsCountByWallet
 */
export interface SecretsCountByWallet {
  /** Number of secrets owned */
  ownedCount: bigint;
  /** Number of secrets delegated */
  delegatedCount: bigint;
}

/**
 * Get the count of secrets owned by or delegated to a wallet
 *
 * This is more gas-efficient than getSecretsByWallet when you only need counts.
 *
 * @param params - Read parameters
 * @param wallet - The wallet address to query
 * @returns Object containing owned and delegated counts
 */
export async function getSecretsCountByWallet(
  params: ReadParams,
  wallet: Address
): Promise<SecretsCountByWallet> {
  const { chainId, controllerAddress, readClient } = params;

  if (!readClient.call) {
    throw new KeyManagementError(
      'ReadClient does not support eth_call. Provide a client with call() method.'
    );
  }

  try {
    const data = encodeGetSecretsCountByWallet(wallet);
    const result = await readClient.call(chainId, {
      to: controllerAddress,
      data,
    });
    return decodeGetSecretsCountByWallet(result);
  } catch (error) {
    throw new KeyManagementError(
      `Failed to get secrets count: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Check if a secret is ready (not syncing)
 *
 * A secret is ready when isSyncing is false and publicKeyCid is set.
 *
 * @param params - Read parameters
 * @param secretId - The secret ID to check
 * @returns True if the secret is ready for encryption/decryption
 */
export async function isSecretReady(
  params: ReadParams,
  secretId: bigint
): Promise<boolean> {
  const state = await getSecret(params, secretId);
  return !state.isSyncing && state.publicKeyCid !== '';
}

/**
 * Check if an address is authorized for a secret (owner or delegate)
 *
 * @param params - Read parameters
 * @param secretId - The secret ID to check
 * @param address - The address to check authorization for
 * @returns True if the address is owner or delegate
 */
export async function isAuthorized(
  params: ReadParams,
  secretId: bigint,
  address: Address
): Promise<boolean> {
  const state = await getSecret(params, secretId);
  const normalizedAddress = address.toLowerCase();
  const isOwner = state.owner.toLowerCase() === normalizedAddress;
  const isDelegate =
    state.delegate.toLowerCase() === normalizedAddress &&
    state.delegate !== '0x0000000000000000000000000000000000000000';
  return isOwner || isDelegate;
}
