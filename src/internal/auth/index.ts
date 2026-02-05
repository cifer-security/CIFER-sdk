/**
 * @module internal/auth
 * @description Authentication and signing utilities
 */

export {
  buildDataString,
  buildEncryptPayloadDataString,
  buildDecryptPayloadDataString,
  buildFileOperationDataString,
  buildJobDownloadDataString,
  buildJobDeleteDataString,
  buildJobsListDataString,
} from './data-string.js';

export {
  getFreshBlockNumber,
  withBlockFreshRetry,
  validateBlockFreshness,
  parseBlockFreshnessError,
  type RetryOptions,
} from './block-freshness.js';

export {
  signDataString,
  normalizeAddress,
  addressesEqual,
  validateSigner,
  type SignedData,
} from './signer.js';
