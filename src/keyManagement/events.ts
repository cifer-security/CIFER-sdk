/**
 * @module keyManagement/events
 * @description Event parsing utilities for SecretsController
 */

import type { Address, Hex, Log } from '../types/common.js';
import {
  decodeSecretCreatedEvent,
  decodeSecretSyncedEvent,
  decodeDelegateUpdatedEvent,
  type SecretCreatedEvent,
  type SecretSyncedEvent,
  type DelegateUpdatedEvent,
} from '../internal/abi/secrets-controller.js';
import { KeyManagementError } from '../internal/errors/index.js';

/**
 * Parsed SecretCreated event
 */
export interface ParsedSecretCreatedEvent {
  /** The new secret ID */
  secretId: bigint;
  /** The owner address */
  owner: Address;
  /** The secret type */
  secretType: number;
  /** Original log for reference */
  log: Log;
}

/**
 * Parse a SecretCreated event from a transaction receipt log
 *
 * @param log - The log entry to parse
 * @returns Parsed event data
 * @throws KeyManagementError if the log is not a SecretCreated event
 *
 * @example
 * ```typescript
 * const receipt = await waitForReceipt(txHash);
 * const secretCreatedLog = receipt.logs.find(
 *   log => log.topics[0] === SECRETS_CONTROLLER_TOPICS.SecretCreated
 * );
 * if (secretCreatedLog) {
 *   const event = parseSecretCreatedLog(secretCreatedLog);
 *   console.log('New secret ID:', event.secretId);
 * }
 * ```
 */
export function parseSecretCreatedLog(log: Log): ParsedSecretCreatedEvent {
  if (log.topics.length < 3) {
    throw new KeyManagementError(
      'Invalid SecretCreated log: insufficient topics'
    );
  }

  try {
    const decoded = decodeSecretCreatedEvent(log.topics, log.data);
    return {
      secretId: decoded.secretId,
      owner: decoded.owner,
      secretType: decoded.secretType,
      log,
    };
  } catch (error) {
    throw new KeyManagementError(
      `Failed to parse SecretCreated log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Parsed SecretSynced event
 */
export interface ParsedSecretSyncedEvent {
  /** The secret ID that was synced */
  secretId: bigint;
  /** The cluster ID where the secret is stored */
  clusterId: number;
  /** The IPFS CID of the public key */
  publicKeyCid: string;
  /** Original log for reference */
  log: Log;
}

/**
 * Parse a SecretSynced event from a log
 *
 * This event indicates that a secret is now ready for use.
 *
 * @param log - The log entry to parse
 * @returns Parsed event data
 */
export function parseSecretSyncedLog(log: Log): ParsedSecretSyncedEvent {
  if (log.topics.length < 3) {
    throw new KeyManagementError(
      'Invalid SecretSynced log: insufficient topics'
    );
  }

  try {
    const decoded = decodeSecretSyncedEvent(log.topics, log.data);
    return {
      secretId: decoded.secretId,
      clusterId: decoded.clusterId,
      publicKeyCid: decoded.publicKeyCid,
      log,
    };
  } catch (error) {
    throw new KeyManagementError(
      `Failed to parse SecretSynced log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Parsed DelegateUpdated event
 */
export interface ParsedDelegateUpdatedEvent {
  /** The secret ID */
  secretId: bigint;
  /** The new delegate address */
  newDelegate: Address;
  /** Original log for reference */
  log: Log;
}

/**
 * Parse a DelegateUpdated event from a log
 *
 * @param log - The log entry to parse
 * @returns Parsed event data
 */
export function parseDelegateUpdatedLog(log: Log): ParsedDelegateUpdatedEvent {
  if (log.topics.length < 3) {
    throw new KeyManagementError(
      'Invalid DelegateUpdated log: insufficient topics'
    );
  }

  try {
    const decoded = decodeDelegateUpdatedEvent(log.topics);
    return {
      secretId: decoded.secretId,
      newDelegate: decoded.newDelegate,
      log,
    };
  } catch (error) {
    throw new KeyManagementError(
      `Failed to parse DelegateUpdated log: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Extract the secret ID from a createSecret transaction receipt
 *
 * This is a convenience function that finds the SecretCreated event
 * in a transaction receipt and extracts the secret ID.
 *
 * @param logs - The logs from the transaction receipt
 * @returns The new secret ID
 * @throws KeyManagementError if no SecretCreated event is found
 *
 * @example
 * ```typescript
 * const receipt = await waitForReceipt(txHash);
 * const secretId = extractSecretIdFromReceipt(receipt.logs);
 * console.log('Created secret:', secretId);
 * ```
 */
export function extractSecretIdFromReceipt(logs: Log[]): bigint {
  // SecretCreated event signature topic
  // This is keccak256("SecretCreated(uint256,address,uint8)")
  const secretCreatedTopic =
    '0x2c4d2e7974a7ef9593e886a5c6f7514bf3699f9cf8fd619cd4f9c4df6dcdff5d';

  const secretCreatedLog = logs.find(
    (log) => log.topics[0]?.toLowerCase() === secretCreatedTopic.toLowerCase()
  );

  if (!secretCreatedLog) {
    throw new KeyManagementError(
      'No SecretCreated event found in transaction receipt'
    );
  }

  const parsed = parseSecretCreatedLog(secretCreatedLog);
  return parsed.secretId;
}
