/**
 * Common types shared across the CIFER SDK.
 *
 * This module contains fundamental type definitions used throughout the SDK,
 * including blockchain primitives, job states, and data structures.
 *
 * @remarks
 * All address and hex types are branded string types to improve type safety
 * and catch misuse at compile time.
 *
 * @packageDocumentation
 * @module types/common
 */

/**
 * Ethereum address (0x-prefixed, 40 hex characters).
 *
 * @remarks
 * Addresses should be checksummed when displayed to users but are compared
 * case-insensitively within the SDK.
 *
 * @example
 * ```typescript
 * const address: Address = '0x1234567890123456789012345678901234567890';
 * ```
 *
 * @public
 */
export type Address = `0x${string}`;

/**
 * Bytes32 hex string (0x-prefixed, 64 hex characters).
 *
 * @remarks
 * Commonly used for keccak256 hashes and mapping keys in smart contracts.
 *
 * @example
 * ```typescript
 * const hash: Bytes32 = '0x1234567890123456789012345678901234567890123456789012345678901234';
 * ```
 *
 * @public
 */
export type Bytes32 = `0x${string}`;

/**
 * Generic hex string (0x-prefixed).
 *
 * @remarks
 * Used for arbitrary hex-encoded data such as transaction calldata,
 * signatures, and encoded messages.
 *
 * @public
 */
export type Hex = `0x${string}`;

/**
 * Chain ID as a number.
 *
 * @remarks
 * Common chain IDs used with CIFER:
 * - `752025` - Ternoa Mainnet
 * - `11155111` - Ethereum Sepolia (testnet)
 *
 * @public
 */
export type ChainId = number;

/**
 * Secret ID (uint256 on-chain, represented as bigint).
 *
 * @remarks
 * Secret IDs are auto-incremented by the SecretsController contract
 * when new secrets are created.
 *
 * @public
 */
export type SecretId = bigint;

/**
 * Block number.
 *
 * @public
 */
export type BlockNumber = number;

/**
 * Output format for blackbox encryption operations.
 *
 * @remarks
 * - `'hex'` - Returns data as 0x-prefixed hex strings
 * - `'base64'` - Returns data as base64 encoded strings
 *
 * @public
 */
export type OutputFormat = 'hex' | 'base64';

/**
 * Input format for blackbox decryption operations.
 *
 * @remarks
 * - `'hex'` - Input data is 0x-prefixed hex strings
 * - `'base64'` - Input data is base64 encoded strings
 *
 * @public
 */
export type InputFormat = 'hex' | 'base64';

/**
 * Job status as returned by the blackbox.
 *
 * @remarks
 * Job lifecycle:
 * 1. `'pending'` - Job created, waiting to be processed
 * 2. `'processing'` - Job is being processed
 * 3. `'completed'` | `'failed'` | `'expired'` - Terminal states
 *
 * @public
 */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

/**
 * Job type as returned by the blackbox.
 *
 * @public
 */
export type JobType = 'encrypt' | 'decrypt';

/**
 * Represents an EVM log entry from a transaction receipt.
 *
 * @remarks
 * Logs are used to retrieve encrypted commitment data that is emitted
 * in events rather than stored directly in contract storage.
 *
 * @public
 */
export interface Log {
  /** Contract address that emitted the log */
  address: Address;
  /** Array of indexed topics (topic[0] is the event signature) */
  topics: Hex[];
  /** Non-indexed data (ABI-encoded) */
  data: Hex;
  /** Block number where log was emitted */
  blockNumber: number;
  /** Transaction hash */
  transactionHash: Hex;
  /** Log index within the block */
  logIndex: number;
  /** Transaction index within the block */
  transactionIndex: number;
}

/**
 * Filter for querying logs via eth_getLogs.
 *
 * @remarks
 * Used with {@link ReadClient.getLogs} to retrieve event logs from the blockchain.
 *
 * @public
 */
export interface LogFilter {
  /** Contract address to filter by */
  address?: Address;
  /** Topics to filter by (null for wildcard at that position) */
  topics?: (Hex | null)[];
  /** Start block (inclusive) */
  fromBlock?: number | 'latest';
  /** End block (inclusive) */
  toBlock?: number | 'latest';
}

/**
 * Transaction receipt returned after a transaction is mined.
 *
 * @public
 */
export interface TransactionReceipt {
  /** Transaction hash */
  transactionHash: Hex;
  /** Block number where transaction was included */
  blockNumber: number;
  /** Contract address if this was a contract creation */
  contractAddress?: Address;
  /** Status (1 = success, 0 = failure/revert) */
  status: 0 | 1;
  /** Gas used by this transaction */
  gasUsed: bigint;
  /** Logs emitted by this transaction */
  logs: Log[];
}

/**
 * Secret state as stored on-chain in the SecretsController contract.
 *
 * @remarks
 * This represents the complete state of a secret including ownership,
 * delegation, synchronization status, and the public key location.
 *
 * A secret is ready for use when:
 * - `isSyncing` is `false`
 * - `publicKeyCid` is non-empty
 * - `secretType` is `1` (standard encryption)
 *
 * @public
 */
export interface SecretState {
  /** Owner address of the secret (can transfer, set delegate, decrypt) */
  owner: Address;
  /** Delegate address (can decrypt on owner's behalf, zero address if none) */
  delegate: Address;
  /** Whether the secret is still syncing (not ready for use) */
  isSyncing: boolean;
  /** Cluster ID where the secret's private key shards are stored */
  clusterId: number;
  /** Secret type (1 = standard ML-KEM-768 encryption) */
  secretType: number;
  /** IPFS CID of the public key (empty string if still syncing) */
  publicKeyCid: string;
}

/**
 * CIFER metadata stored on-chain for encrypted commitments.
 *
 * @remarks
 * This metadata is stored in contract storage and used to:
 * - Locate the block where encrypted data was emitted
 * - Verify integrity of retrieved data via hash comparison
 *
 * @public
 */
export interface CIFERMetadata {
  /** Secret ID used for encryption */
  secretId: bigint;
  /** Block number when data was stored/updated */
  storedAtBlock: number;
  /** keccak256 hash of the cifer bytes */
  ciferHash: Bytes32;
  /** keccak256 hash of the encrypted message bytes */
  encryptedMessageHash: Bytes32;
}

/**
 * Encrypted commitment data retrieved from event logs.
 *
 * @remarks
 * This data is emitted in `CIFERDataStored` or `CIFERDataUpdated` events
 * and must be retrieved from logs to decrypt the content.
 *
 * @public
 */
export interface CommitmentData {
  /** The CIFER envelope bytes (exactly 1104 bytes: ML-KEM ciphertext + AES-GCM tag) */
  cifer: Hex;
  /** The AES-GCM encrypted message bytes (variable length, max 16KB) */
  encryptedMessage: Hex;
  /** keccak256(cifer) - for integrity verification */
  ciferHash: Bytes32;
  /** keccak256(encryptedMessage) - for integrity verification */
  encryptedMessageHash: Bytes32;
}

/**
 * Job information returned by the blackbox.
 *
 * @remarks
 * File encryption and decryption operations are asynchronous. This interface
 * represents the state of a job at any point in its lifecycle.
 *
 * @public
 */
export interface JobInfo {
  /** Unique job identifier (UUID) */
  id: string;
  /** Type of job (encrypt or decrypt) */
  type: JobType;
  /** Current status */
  status: JobStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Secret ID used for this job */
  secretId: number;
  /** Chain ID */
  chainId: ChainId;
  /** Unix timestamp (ms) when job was created */
  createdAt: number;
  /** Unix timestamp (ms) when job completed (if completed) */
  completedAt?: number;
  /** Unix timestamp (ms) when job will expire */
  expiredAt?: number;
  /** Error message if job failed */
  error?: string;
  /** Result filename for download */
  resultFileName?: string;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Original file size in bytes */
  originalSize?: number;
}

/**
 * Data consumption/usage statistics for a wallet.
 *
 * @remarks
 * The blackbox tracks encryption and decryption usage per wallet
 * for rate limiting and billing purposes.
 *
 * @public
 */
export interface DataConsumption {
  /** Wallet address */
  wallet: Address;
  /** Encryption usage statistics */
  encryption: {
    /** Limit in bytes */
    limit: number;
    /** Used in bytes */
    used: number;
    /** Remaining in bytes */
    remaining: number;
    /** Number of encryption operations */
    count: number;
    /** Limit in GB */
    limitGB: number;
    /** Used in GB */
    usedGB: number;
    /** Remaining in GB */
    remainingGB: number;
  };
  /** Decryption usage statistics */
  decryption: {
    /** Limit in bytes */
    limit: number;
    /** Used in bytes */
    used: number;
    /** Remaining in bytes */
    remaining: number;
    /** Number of decryption operations */
    count: number;
    /** Limit in GB */
    limitGB: number;
    /** Used in GB */
    usedGB: number;
    /** Remaining in GB */
    remainingGB: number;
  };
}
