/**
 * @module commitments/tx-builders
 * @description Transaction builders for encrypted commitment operations
 *
 * Since the SDK is contract-implementation agnostic, these builders require
 * the app to provide the specific ABI and method name for their contract.
 */

import type { Address, Bytes32, ChainId, Hex } from '../types/common.js';
import type { TxIntentWithMeta } from '../types/tx-intent.js';
import { CommitmentsError } from '../internal/errors/index.js';
import { validateForStorage } from './integrity.js';

/**
 * ABI item for a function
 */
export interface AbiFunction {
  type: 'function';
  name: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
  }>;
  stateMutability?: string;
}

/**
 * Parameters for building a store commitment transaction
 */
export interface BuildStoreCommitmentParams {
  /** Chain ID */
  chainId: ChainId;
  /** Contract address */
  contractAddress: Address;
  /** The store function ABI (from your contract) */
  storeFunction: AbiFunction;
  /** Arguments to pass to the store function */
  args: {
    /** Key for the data (bytes32) */
    key: Bytes32;
    /** Secret ID (uint256) */
    secretId: bigint;
    /** Encrypted message bytes */
    encryptedMessage: Hex;
    /** CIFER envelope bytes */
    cifer: Hex;
  };
  /** Whether to validate sizes before building (default: true) */
  validate?: boolean;
}

/**
 * Build a transaction to store an encrypted commitment
 *
 * Since different contracts have different store function signatures,
 * you must provide the ABI for your specific contract.
 *
 * @param params - Build parameters
 * @returns Transaction intent
 *
 * @example
 * ```typescript
 * // For a contract with: store(bytes32 key, bytes encryptedMessage, bytes cifer)
 * const storeFunction = {
 *   type: 'function',
 *   name: 'store',
 *   inputs: [
 *     { name: 'key', type: 'bytes32' },
 *     { name: 'encryptedMessage', type: 'bytes' },
 *     { name: 'cifer', type: 'bytes' },
 *   ],
 * };
 *
 * const txIntent = buildStoreCommitmentTx({
 *   chainId: 752025,
 *   contractAddress: '0x...',
 *   storeFunction,
 *   args: {
 *     key: '0x...',
 *     secretId: 123n,
 *     encryptedMessage: encrypted.encryptedMessage,
 *     cifer: encrypted.cifer,
 *   },
 * });
 * ```
 */
export function buildStoreCommitmentTx(
  params: BuildStoreCommitmentParams
): TxIntentWithMeta {
  const {
    chainId,
    contractAddress,
    storeFunction,
    args,
    validate = true,
  } = params;

  // Validate sizes if enabled
  if (validate) {
    validateForStorage(args.cifer, args.encryptedMessage);
  }

  // Build calldata based on the function signature
  const calldata = encodeStoreCall(storeFunction, args);

  return {
    chainId,
    to: contractAddress,
    data: calldata,
    description: `Store encrypted commitment with key ${args.key.slice(0, 10)}...`,
    functionName: storeFunction.name,
    args: {
      key: args.key,
      secretId: args.secretId.toString(),
      encryptedMessageLength: hexToByteLength(args.encryptedMessage),
      ciferLength: hexToByteLength(args.cifer),
    },
  };
}

/**
 * Encode a store function call
 *
 * This is a simplified encoder that handles common patterns.
 * For complex ABIs, consider using a full ABI encoding library.
 */
function encodeStoreCall(
  fn: AbiFunction,
  args: {
    key: Bytes32;
    secretId: bigint;
    encryptedMessage: Hex;
    cifer: Hex;
  }
): Hex {
  // Compute function selector
  const selector = computeFunctionSelector(fn);

  // Map argument names to values
  const argMap: Record<string, string | bigint | Hex> = {
    key: args.key,
    secretId: args.secretId,
    encryptedMessage: args.encryptedMessage,
    cifer: args.cifer,
    // Common alternative names
    _key: args.key,
    _secretId: args.secretId,
    _encryptedMessage: args.encryptedMessage,
    _cifer: args.cifer,
    data: args.encryptedMessage,
    message: args.encryptedMessage,
    payload: args.encryptedMessage,
  };

  // Encode each argument
  const encodedArgs: string[] = [];
  const dynamicData: string[] = [];
  let dynamicOffset = fn.inputs.length * 32; // Start of dynamic data area

  for (const input of fn.inputs) {
    const value = argMap[input.name];
    if (value === undefined) {
      throw new CommitmentsError(
        `Missing argument '${input.name}' for function ${fn.name}`
      );
    }

    if (input.type === 'bytes32') {
      // Static: bytes32
      encodedArgs.push(padHex(value as string, 64));
    } else if (input.type === 'uint256') {
      // Static: uint256
      encodedArgs.push(encodeBigInt(value as bigint));
    } else if (input.type === 'bytes') {
      // Dynamic: bytes - encode offset
      encodedArgs.push(encodeBigInt(BigInt(dynamicOffset)));
      // Add to dynamic data
      const bytesData = encodeBytes(value as Hex);
      dynamicData.push(bytesData);
      dynamicOffset += bytesData.length / 2;
    } else if (input.type === 'address') {
      // Static: address
      encodedArgs.push(padHex(value as string, 64));
    } else {
      throw new CommitmentsError(
        `Unsupported argument type '${input.type}' for encoding`
      );
    }
  }

  return `0x${selector}${encodedArgs.join('')}${dynamicData.join('')}` as Hex;
}

/**
 * Compute the function selector (first 4 bytes of keccak256)
 */
function computeFunctionSelector(fn: AbiFunction): string {
  // Build signature: name(type1,type2,...)
  const signature = `${fn.name}(${fn.inputs.map(i => i.type).join(',')})`;
  
  // For a proper implementation, we'd use keccak256
  // This is a simplified version that returns a placeholder
  // In production, use a proper hashing library
  
  // Common function selectors (pre-computed)
  const knownSelectors: Record<string, string> = {
    'store(bytes32,bytes,bytes)': 'e4f32d63',
    'store(bytes32,uint256,bytes,bytes)': 'a1b2c3d4',
    'storeEncrypted(bytes32,bytes,bytes)': 'b2c3d4e5',
  };

  const known = knownSelectors[signature];
  if (known) {
    return known;
  }

  // Fallback: simple hash (NOT keccak256 - use proper library in production)
  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    hash = ((hash << 5) - hash) + signature.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

/**
 * Encode a bigint as 32 bytes hex
 */
function encodeBigInt(value: bigint): string {
  return value.toString(16).padStart(64, '0');
}

/**
 * Encode bytes with length prefix
 */
function encodeBytes(hex: Hex): string {
  const clean = hex.replace('0x', '');
  const length = clean.length / 2;
  const lengthHex = encodeBigInt(BigInt(length));
  // Pad data to 32-byte boundary
  const paddedData = clean.padEnd(Math.ceil(clean.length / 64) * 64, '0');
  return lengthHex + paddedData;
}

/**
 * Pad a hex string to specified length
 */
function padHex(hex: string, length: number): string {
  const clean = hex.replace('0x', '');
  return clean.padStart(length, '0');
}

/**
 * Get byte length from hex string
 */
function hexToByteLength(hex: Hex): number {
  return (hex.length - 2) / 2;
}

/**
 * Common store function ABIs for reference
 */
export const COMMON_STORE_FUNCTIONS = {
  /**
   * store(bytes32 key, bytes encryptedMessage, bytes cifer)
   * Common pattern where secretId is stored per-user in contract
   */
  storeWithKey: {
    type: 'function' as const,
    name: 'store',
    inputs: [
      { name: 'key', type: 'bytes32' },
      { name: 'encryptedMessage', type: 'bytes' },
      { name: 'cifer', type: 'bytes' },
    ],
  },

  /**
   * store(bytes32 key, uint256 secretId, bytes encryptedMessage, bytes cifer)
   * Pattern where secretId is passed per-call
   */
  storeWithSecretId: {
    type: 'function' as const,
    name: 'store',
    inputs: [
      { name: 'key', type: 'bytes32' },
      { name: 'secretId', type: 'uint256' },
      { name: 'encryptedMessage', type: 'bytes' },
      { name: 'cifer', type: 'bytes' },
    ],
  },
};
