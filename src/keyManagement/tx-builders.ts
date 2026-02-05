/**
 * @module keyManagement/tx-builders
 * @description Transaction intent builders for SecretsController operations
 *
 * These functions return TxIntent objects that can be executed by any
 * EIP-1193 compatible wallet or transaction executor.
 */

import type { Address, ChainId } from '../types/common.js';
import type { TxIntentWithMeta } from '../types/tx-intent.js';
import {
  encodeCreateSecret,
  encodeSetDelegate,
  encodeTransferSecret,
} from '../internal/abi/secrets-controller.js';

/**
 * Build a transaction to create a new secret
 *
 * The transaction must be sent with value equal to the secretCreationFee.
 * Use getSecretCreationFee() to get the current fee before calling this.
 *
 * @param params - Transaction parameters
 * @returns Transaction intent
 *
 * @example
 * ```typescript
 * // Get the fee first
 * const fee = await getSecretCreationFee({ chainId, controllerAddress, readClient });
 *
 * // Build the transaction
 * const txIntent = buildCreateSecretTx({
 *   chainId: 752025,
 *   controllerAddress: '0x...',
 *   fee,
 * });
 *
 * // Execute with your preferred method
 * const hash = await wallet.sendTransaction({
 *   to: txIntent.to,
 *   data: txIntent.data,
 *   value: txIntent.value,
 * });
 * ```
 */
export function buildCreateSecretTx(params: {
  /** Chain ID */
  chainId: ChainId;
  /** SecretsController contract address */
  controllerAddress: Address;
  /** Secret creation fee (from getSecretCreationFee) */
  fee: bigint;
}): TxIntentWithMeta {
  const { chainId, controllerAddress, fee } = params;

  return {
    chainId,
    to: controllerAddress,
    data: encodeCreateSecret(),
    value: fee,
    description: 'Create a new CIFER secret',
    functionName: 'createSecret',
    args: {},
  };
}

/**
 * Build a transaction to set or update a delegate for a secret
 *
 * Only the secret owner can set a delegate. Setting the delegate to the
 * zero address removes the delegation.
 *
 * @param params - Transaction parameters
 * @returns Transaction intent
 *
 * @example
 * ```typescript
 * const txIntent = buildSetDelegateTx({
 *   chainId: 752025,
 *   controllerAddress: '0x...',
 *   secretId: 123n,
 *   newDelegate: '0xDelegateAddress...',
 * });
 * ```
 */
export function buildSetDelegateTx(params: {
  /** Chain ID */
  chainId: ChainId;
  /** SecretsController contract address */
  controllerAddress: Address;
  /** Secret ID */
  secretId: bigint;
  /** New delegate address */
  newDelegate: Address;
}): TxIntentWithMeta {
  const { chainId, controllerAddress, secretId, newDelegate } = params;

  return {
    chainId,
    to: controllerAddress,
    data: encodeSetDelegate(secretId, newDelegate),
    description: `Set delegate for secret ${secretId} to ${newDelegate}`,
    functionName: 'setDelegate',
    args: { secretId: secretId.toString(), newDelegate },
  };
}

/**
 * Build a transaction to remove a delegate from a secret
 *
 * This is a convenience wrapper around buildSetDelegateTx that sets
 * the delegate to the zero address.
 *
 * @param params - Transaction parameters
 * @returns Transaction intent
 */
export function buildRemoveDelegationTx(params: {
  /** Chain ID */
  chainId: ChainId;
  /** SecretsController contract address */
  controllerAddress: Address;
  /** Secret ID */
  secretId: bigint;
}): TxIntentWithMeta {
  const { chainId, controllerAddress, secretId } = params;

  return {
    chainId,
    to: controllerAddress,
    data: encodeSetDelegate(
      secretId,
      '0x0000000000000000000000000000000000000000'
    ),
    description: `Remove delegate from secret ${secretId}`,
    functionName: 'setDelegate',
    args: {
      secretId: secretId.toString(),
      newDelegate: '0x0000000000000000000000000000000000000000',
    },
  };
}

/**
 * Build a transaction to transfer ownership of a secret
 *
 * Only the current owner can transfer a secret. If the secret has a
 * delegate, the delegation will be cleared upon transfer.
 *
 * @param params - Transaction parameters
 * @returns Transaction intent
 *
 * @example
 * ```typescript
 * const txIntent = buildTransferSecretTx({
 *   chainId: 752025,
 *   controllerAddress: '0x...',
 *   secretId: 123n,
 *   newOwner: '0xNewOwner...',
 * });
 * ```
 */
export function buildTransferSecretTx(params: {
  /** Chain ID */
  chainId: ChainId;
  /** SecretsController contract address */
  controllerAddress: Address;
  /** Secret ID */
  secretId: bigint;
  /** New owner address */
  newOwner: Address;
}): TxIntentWithMeta {
  const { chainId, controllerAddress, secretId, newOwner } = params;

  return {
    chainId,
    to: controllerAddress,
    data: encodeTransferSecret(secretId, newOwner),
    description: `Transfer secret ${secretId} to ${newOwner}`,
    functionName: 'transferSecret',
    args: { secretId: secretId.toString(), newOwner },
  };
}
