/**
 * Typed errors for the CIFER SDK.
 *
 * All SDK errors extend {@link CiferError}, which includes a `code` property
 * for programmatic error handling and a `cause` property for error chaining.
 *
 * @remarks
 * Error handling best practices:
 * - Use `instanceof` checks for specific error types
 * - Use type guards like {@link isCiferError} for general SDK errors
 * - Check `error.code` for programmatic error handling
 * - Access `error.cause` for the underlying error
 *
 * @example
 * ```typescript
 * import { isCiferError, isBlockStaleError, SecretNotReadyError } from 'cifer-sdk';
 *
 * try {
 *   await blackbox.payload.encryptPayload({ ... });
 * } catch (error) {
 *   if (isBlockStaleError(error)) {
 *     console.log('Retrying with fresh block...');
 *   } else if (error instanceof SecretNotReadyError) {
 *     console.log('Wait for secret to sync');
 *   } else if (isCiferError(error)) {
 *     console.log('CIFER error:', error.code, error.message);
 *   }
 * }
 * ```
 *
 * @packageDocumentation
 * @module internal/errors
 */

/**
 * Base error class for all CIFER SDK errors.
 *
 * @remarks
 * All SDK errors extend this class. Use {@link isCiferError} to check
 * if an unknown error is a CIFER SDK error.
 *
 * @public
 */
export class CiferError extends Error {
  /**
   * Error code for programmatic handling.
   *
   * @remarks
   * Possible codes:
   * - `CONFIG_ERROR` - Configuration or discovery errors
   * - `AUTH_ERROR` - Authentication and signing errors
   * - `BLACKBOX_ERROR` - Blackbox API errors
   * - `KEY_MANAGEMENT_ERROR` - SecretsController errors
   * - `COMMITMENTS_ERROR` - On-chain commitment errors
   * - `FLOW_ERROR` - Flow execution errors
   */
  readonly code: string;

  /** Original error that caused this error (for error chaining) */
  readonly cause?: Error;

  /**
   * Create a new CIFER error.
   *
   * @param message - Human-readable error message
   * @param code - Error code for programmatic handling
   * @param cause - Original error that caused this error
   */
  constructor(message: string, code: string, cause?: Error) {
    super(message);
    this.name = 'CiferError';
    this.code = code;
    this.cause = cause;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    const ErrorConstructor = Error as typeof Error & {
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    };
    if (ErrorConstructor.captureStackTrace) {
      ErrorConstructor.captureStackTrace(this, this.constructor);
    }
  }
}

// ============================================================================
// Configuration Errors
// ============================================================================

/**
 * Error thrown when SDK configuration is invalid or missing.
 *
 * @public
 */
export class ConfigError extends CiferError {
  /**
   * @param message - Description of the configuration problem
   * @param cause - Original error if this wraps another error
   */
  constructor(message: string, cause?: Error) {
    super(message, 'CONFIG_ERROR', cause);
    this.name = 'ConfigError';
  }
}

/**
 * Error thrown when discovery fails.
 *
 * @remarks
 * This error is thrown when the SDK cannot fetch configuration from
 * the blackbox `/healthz` endpoint.
 *
 * @public
 */
export class DiscoveryError extends ConfigError {
  /** The blackbox URL that failed */
  readonly blackboxUrl: string;

  /**
   * @param message - Description of the discovery failure
   * @param blackboxUrl - The URL that was attempted
   * @param cause - Original network or parsing error
   */
  constructor(message: string, blackboxUrl: string, cause?: Error) {
    super(message, cause);
    this.name = 'DiscoveryError';
    this.blackboxUrl = blackboxUrl;
  }
}

/**
 * Error thrown when a chain is not supported or not configured.
 *
 * @public
 */
export class ChainNotSupportedError extends ConfigError {
  /** The chain ID that is not supported */
  readonly chainId: number;

  /**
   * @param chainId - The unsupported chain ID
   * @param cause - Original error if this wraps another error
   */
  constructor(chainId: number, cause?: Error) {
    super(`Chain ${chainId} is not supported`, cause);
    this.name = 'ChainNotSupportedError';
    this.chainId = chainId;
  }
}

// ============================================================================
// Authentication Errors
// ============================================================================

/**
 * Error thrown when authentication or signing fails.
 *
 * @public
 */
export class AuthError extends CiferError {
  /**
   * @param message - Description of the authentication failure
   * @param cause - Original signing or wallet error
   */
  constructor(message: string, cause?: Error) {
    super(message, 'AUTH_ERROR', cause);
    this.name = 'AuthError';
  }
}

/**
 * Error thrown when signature verification fails.
 *
 * @public
 */
export class SignatureError extends AuthError {
  /**
   * @param message - Description of the signature problem
   * @param cause - Original verification error
   */
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'SignatureError';
  }
}

/**
 * Error thrown when block number is stale (outside the freshness window).
 *
 * @remarks
 * The blackbox requires signatures to include a recent block number to
 * prevent replay attacks. If the block is too old, this error is thrown.
 *
 * The SDK automatically retries with a fresh block number (up to 3 times).
 *
 * @public
 */
export class BlockStaleError extends AuthError {
  /** The block number that was used in the signature */
  readonly blockNumber: number;
  /** The current block number on-chain when the error occurred */
  readonly currentBlock: number;
  /** The maximum allowed difference (typically ~100 blocks / 10 minutes) */
  readonly maxWindow: number;

  /**
   * @param blockNumber - The stale block number that was used
   * @param currentBlock - The current block number on-chain
   * @param maxWindow - Maximum allowed block difference
   * @param cause - Original error from the server
   */
  constructor(
    blockNumber: number,
    currentBlock: number,
    maxWindow: number,
    cause?: Error
  ) {
    super(
      `Block number ${blockNumber} is too old (current: ${currentBlock}, max window: ${maxWindow})`,
      cause
    );
    this.name = 'BlockStaleError';
    this.blockNumber = blockNumber;
    this.currentBlock = currentBlock;
    this.maxWindow = maxWindow;
  }
}

/**
 * Error thrown when signer address doesn't match expected.
 *
 * @public
 */
export class SignerMismatchError extends AuthError {
  /** The expected signer address */
  readonly expected: string;
  /** The actual signer address */
  readonly actual: string;

  /**
   * @param expected - Expected signer address
   * @param actual - Actual signer address recovered from signature
   * @param cause - Original verification error
   */
  constructor(expected: string, actual: string, cause?: Error) {
    super(`Signer mismatch: expected ${expected}, got ${actual}`, cause);
    this.name = 'SignerMismatchError';
    this.expected = expected;
    this.actual = actual;
  }
}

// ============================================================================
// Blackbox Errors
// ============================================================================

/**
 * Error thrown when a blackbox API call fails.
 *
 * @public
 */
export class BlackboxError extends CiferError {
  /** HTTP status code (if applicable) */
  readonly statusCode?: number;
  /** The endpoint that failed (e.g., '/encrypt-payload') */
  readonly endpoint?: string;

  /**
   * @param message - Error message from the server or description
   * @param options - Additional error details
   */
  constructor(
    message: string,
    options?: { statusCode?: number; endpoint?: string; cause?: Error }
  ) {
    super(message, 'BLACKBOX_ERROR', options?.cause);
    this.name = 'BlackboxError';
    this.statusCode = options?.statusCode;
    this.endpoint = options?.endpoint;
  }
}

/**
 * Error thrown when encryption fails.
 *
 * @public
 */
export class EncryptionError extends BlackboxError {
  /**
   * @param message - Description of the encryption failure
   * @param cause - Original error from the blackbox
   */
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'EncryptionError';
  }
}

/**
 * Error thrown when decryption fails.
 *
 * @public
 */
export class DecryptionError extends BlackboxError {
  /**
   * @param message - Description of the decryption failure
   * @param cause - Original error from the blackbox
   */
  constructor(message: string, cause?: Error) {
    super(message, { cause });
    this.name = 'DecryptionError';
  }
}

/**
 * Error thrown when a job operation fails.
 *
 * @public
 */
export class JobError extends BlackboxError {
  /** The job ID that failed */
  readonly jobId: string;

  /**
   * @param message - Description of the job failure
   * @param jobId - The ID of the failed job
   * @param cause - Original error from the blackbox
   */
  constructor(message: string, jobId: string, cause?: Error) {
    super(message, { cause });
    this.name = 'JobError';
    this.jobId = jobId;
  }
}

/**
 * Error thrown when a secret is not ready (still syncing).
 *
 * @remarks
 * After creating a secret, it takes some time for the enclave cluster
 * to generate and sync the key material. During this time, the secret
 * cannot be used for encryption or decryption.
 *
 * @public
 */
export class SecretNotReadyError extends BlackboxError {
  /** The secret ID that is not ready */
  readonly secretId: bigint;

  /**
   * @param secretId - The ID of the secret that is still syncing
   * @param cause - Original error from the server
   */
  constructor(secretId: bigint, cause?: Error) {
    super(`Secret ${secretId} is not ready (still syncing)`, { cause });
    this.name = 'SecretNotReadyError';
    this.secretId = secretId;
  }
}

// ============================================================================
// Key Management Errors
// ============================================================================

/**
 * Error thrown when a key management operation fails.
 *
 * @public
 */
export class KeyManagementError extends CiferError {
  /**
   * @param message - Description of the operation failure
   * @param cause - Original RPC or contract error
   */
  constructor(message: string, cause?: Error) {
    super(message, 'KEY_MANAGEMENT_ERROR', cause);
    this.name = 'KeyManagementError';
  }
}

/**
 * Error thrown when a secret is not found.
 *
 * @public
 */
export class SecretNotFoundError extends KeyManagementError {
  /** The secret ID that was not found */
  readonly secretId: bigint;

  /**
   * @param secretId - The ID that was not found
   * @param cause - Original contract error
   */
  constructor(secretId: bigint, cause?: Error) {
    super(`Secret ${secretId} not found`, cause);
    this.name = 'SecretNotFoundError';
    this.secretId = secretId;
  }
}

/**
 * Error thrown when caller is not authorized for a secret operation.
 *
 * @public
 */
export class NotAuthorizedError extends KeyManagementError {
  /** The secret ID */
  readonly secretId: bigint;
  /** The caller address that is not authorized */
  readonly caller: string;

  /**
   * @param secretId - The secret ID
   * @param caller - The address that tried to perform the operation
   * @param cause - Original contract error
   */
  constructor(secretId: bigint, caller: string, cause?: Error) {
    super(`Address ${caller} is not authorized for secret ${secretId}`, cause);
    this.name = 'NotAuthorizedError';
    this.secretId = secretId;
    this.caller = caller;
  }
}

// ============================================================================
// Commitments Errors
// ============================================================================

/**
 * Error thrown when a commitment operation fails.
 *
 * @public
 */
export class CommitmentsError extends CiferError {
  /**
   * @param message - Description of the operation failure
   * @param cause - Original RPC or contract error
   */
  constructor(message: string, cause?: Error) {
    super(message, 'COMMITMENTS_ERROR', cause);
    this.name = 'CommitmentsError';
  }
}

/**
 * Error thrown when commitment data is not found.
 *
 * @public
 */
export class CommitmentNotFoundError extends CommitmentsError {
  /** The data ID that was not found */
  readonly dataId: string;

  /**
   * @param dataId - The data ID (bytes32) that was not found
   * @param cause - Original error
   */
  constructor(dataId: string, cause?: Error) {
    super(`Commitment data not found for dataId: ${dataId}`, cause);
    this.name = 'CommitmentNotFoundError';
    this.dataId = dataId;
  }
}

/**
 * Error thrown when commitment integrity check fails.
 *
 * @remarks
 * This indicates that the data retrieved from logs does not match
 * the hashes stored on-chain. This could indicate data corruption
 * or tampering.
 *
 * @public
 */
export class IntegrityError extends CommitmentsError {
  /** Which field failed verification ('cifer' or 'encryptedMessage') */
  readonly field: 'cifer' | 'encryptedMessage';
  /** Expected hash from on-chain metadata */
  readonly expectedHash: string;
  /** Actual hash computed from retrieved data */
  readonly actualHash: string;

  /**
   * @param field - The field that failed integrity check
   * @param expectedHash - Hash from on-chain metadata
   * @param actualHash - Hash computed from retrieved data
   * @param cause - Original error
   */
  constructor(
    field: 'cifer' | 'encryptedMessage',
    expectedHash: string,
    actualHash: string,
    cause?: Error
  ) {
    super(
      `Integrity check failed for ${field}: expected ${expectedHash}, got ${actualHash}`,
      cause
    );
    this.name = 'IntegrityError';
    this.field = field;
    this.expectedHash = expectedHash;
    this.actualHash = actualHash;
  }
}

/**
 * Error thrown when cifer size is invalid.
 *
 * @remarks
 * The CIFER envelope must be exactly 1104 bytes (ML-KEM-768 ciphertext + AES-GCM tag).
 *
 * @public
 */
export class InvalidCiferSizeError extends CommitmentsError {
  /** The actual size in bytes */
  readonly actualSize: number;
  /** The expected size in bytes (1104) */
  readonly expectedSize: number;

  /**
   * @param actualSize - Actual size of the cifer data
   * @param expectedSize - Expected size (1104 bytes)
   * @param cause - Original error
   */
  constructor(actualSize: number, expectedSize: number, cause?: Error) {
    super(
      `Invalid cifer size: expected ${expectedSize} bytes, got ${actualSize} bytes`,
      cause
    );
    this.name = 'InvalidCiferSizeError';
    this.actualSize = actualSize;
    this.expectedSize = expectedSize;
  }
}

/**
 * Error thrown when encrypted message is too large.
 *
 * @remarks
 * The maximum payload size is 16KB (16384 bytes) for on-chain commitments.
 *
 * @public
 */
export class PayloadTooLargeError extends CommitmentsError {
  /** The actual size in bytes */
  readonly actualSize: number;
  /** The maximum allowed size in bytes (16384) */
  readonly maxSize: number;

  /**
   * @param actualSize - Actual size of the encrypted message
   * @param maxSize - Maximum allowed size
   * @param cause - Original error
   */
  constructor(actualSize: number, maxSize: number, cause?: Error) {
    super(
      `Encrypted message too large: ${actualSize} bytes exceeds maximum of ${maxSize} bytes`,
      cause
    );
    this.name = 'PayloadTooLargeError';
    this.actualSize = actualSize;
    this.maxSize = maxSize;
  }
}

// ============================================================================
// Flow Errors
// ============================================================================

/**
 * Error thrown when a flow operation fails.
 *
 * @public
 */
export class FlowError extends CiferError {
  /** The flow that failed (e.g., 'createSecretAndWaitReady') */
  readonly flowName: string;
  /** The step that failed (if applicable) */
  readonly stepName?: string;

  /**
   * @param message - Description of the failure
   * @param flowName - Name of the flow that failed
   * @param stepName - Name of the step that failed (optional)
   * @param cause - Original error from the failed step
   */
  constructor(
    message: string,
    flowName: string,
    stepName?: string,
    cause?: Error
  ) {
    super(message, 'FLOW_ERROR', cause);
    this.name = 'FlowError';
    this.flowName = flowName;
    this.stepName = stepName;
  }
}

/**
 * Error thrown when a flow is aborted.
 *
 * @remarks
 * Flows can be aborted by passing an `AbortSignal` to the flow context.
 * When the signal is aborted, this error is thrown.
 *
 * @public
 */
export class FlowAbortedError extends FlowError {
  /**
   * @param flowName - Name of the aborted flow
   * @param stepName - Step where abort was detected (optional)
   * @param cause - Original abort error
   */
  constructor(flowName: string, stepName?: string, cause?: Error) {
    super(`Flow ${flowName} was aborted`, flowName, stepName, cause);
    this.name = 'FlowAbortedError';
  }
}

/**
 * Error thrown when a flow times out.
 *
 * @public
 */
export class FlowTimeoutError extends FlowError {
  /** Timeout in milliseconds */
  readonly timeoutMs: number;

  /**
   * @param flowName - Name of the flow that timed out
   * @param timeoutMs - Timeout duration in milliseconds
   * @param stepName - Step where timeout occurred (optional)
   * @param cause - Original timeout error
   */
  constructor(
    flowName: string,
    timeoutMs: number,
    stepName?: string,
    cause?: Error
  ) {
    super(
      `Flow ${flowName} timed out after ${timeoutMs}ms`,
      flowName,
      stepName,
      cause
    );
    this.name = 'FlowTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if an error is a CIFER SDK error.
 *
 * @param error - The error to check
 * @returns `true` if the error is an instance of {@link CiferError}
 *
 * @example
 * ```typescript
 * try {
 *   await sdk.keyManagement.getSecret({ ... }, secretId);
 * } catch (error) {
 *   if (isCiferError(error)) {
 *     console.log('SDK error:', error.code, error.message);
 *   } else {
 *     console.log('Unknown error:', error);
 *   }
 * }
 * ```
 *
 * @public
 */
export function isCiferError(error: unknown): error is CiferError {
  return error instanceof CiferError;
}

/**
 * Check if an error indicates a stale block number.
 *
 * @param error - The error to check
 * @returns `true` if the error is an instance of {@link BlockStaleError}
 *
 * @public
 */
export function isBlockStaleError(error: unknown): error is BlockStaleError {
  return error instanceof BlockStaleError;
}

/**
 * Check if an error indicates the secret is not ready.
 *
 * @param error - The error to check
 * @returns `true` if the error is an instance of {@link SecretNotReadyError}
 *
 * @public
 */
export function isSecretNotReadyError(
  error: unknown
): error is SecretNotReadyError {
  return error instanceof SecretNotReadyError;
}

/**
 * Parse a blackbox error response and return the appropriate error.
 *
 * @remarks
 * This function parses error responses from the blackbox API and creates
 * the appropriate typed error. It handles special patterns like block
 * freshness errors and secret sync errors.
 *
 * @param response - The error response from the blackbox
 * @param statusCode - HTTP status code
 * @param endpoint - The endpoint that returned the error
 * @returns The appropriate typed error
 *
 * @internal
 */
export function parseBlackboxErrorResponse(
  response: { error?: string; message?: string },
  statusCode: number,
  endpoint: string
): BlackboxError {
  const message = response.error || response.message || 'Unknown error';

  // Check for specific error patterns
  if (message.includes('is too old')) {
    // Parse block freshness error
    const match = message.match(
      /Block number (\d+) is too old \(current: (\d+), max window: (\d+)\)/
    );
    if (match) {
      return new BlockStaleError(
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3], 10)
      );
    }
  }

  if (message.includes('is syncing') || message.includes('not ready')) {
    const secretIdMatch = message.match(/secret\s*(\d+)/i);
    if (secretIdMatch) {
      return new SecretNotReadyError(BigInt(secretIdMatch[1]));
    }
  }

  return new BlackboxError(message, { statusCode, endpoint });
}
