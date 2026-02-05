/**
 * @module keyManagement
 * @description Key management namespace for SecretsController operations
 *
 * This module provides functions for:
 * - Reading secret state from the SecretsController contract
 * - Building transaction intents for creating, delegating, and transferring secrets
 * - Parsing events from transaction receipts
 *
 * @example
 * ```typescript
 * import { keyManagement } from 'cifer-sdk';
 *
 * // Read operations
 * const fee = await keyManagement.getSecretCreationFee({ chainId, controllerAddress, readClient });
 * const state = await keyManagement.getSecret({ chainId, controllerAddress, readClient }, 123n);
 *
 * // Build transaction intents
 * const createTx = keyManagement.buildCreateSecretTx({ chainId, controllerAddress, fee });
 * const delegateTx = keyManagement.buildSetDelegateTx({ ... });
 *
 * // Parse events
 * const secretId = keyManagement.extractSecretIdFromReceipt(receipt.logs);
 * ```
 */

// Read operations
export {
  getSecretCreationFee,
  getSecret,
  getSecretOwner,
  getDelegate,
  getSecretsByWallet,
  getSecretsCountByWallet,
  isSecretReady,
  isAuthorized,
  type ReadParams,
  type SecretsByWallet,
  type SecretsCountByWallet,
} from './reads.js';

// Transaction builders
export {
  buildCreateSecretTx,
  buildSetDelegateTx,
  buildRemoveDelegationTx,
  buildTransferSecretTx,
} from './tx-builders.js';

// Event parsing
export {
  parseSecretCreatedLog,
  parseSecretSyncedLog,
  parseDelegateUpdatedLog,
  extractSecretIdFromReceipt,
  type ParsedSecretCreatedEvent,
  type ParsedSecretSyncedEvent,
  type ParsedDelegateUpdatedEvent,
} from './events.js';
