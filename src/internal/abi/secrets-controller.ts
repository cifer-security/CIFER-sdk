/**
 * @module internal/abi/secrets-controller
 * @description ABI and encoding utilities for CiferSecretsControllerMultichain
 */

import type { Address, Hex } from '../../types/common.js';

/**
 * SecretsController ABI - user-facing subset for SDK
 * Excludes admin/internal functions (addWhitelistedBlackBox, markSecretSynced, etc.)
 */
export const SECRETS_CONTROLLER_ABI = [
  // Read functions
  {
    type: 'function',
    name: 'secretCreationFee',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'defaultSecretType',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextSecretId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSecretState',
    inputs: [{ name: 'secretId', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'delegate', type: 'address' },
      { name: 'isSyncing', type: 'bool' },
      { name: 'clusterId', type: 'uint8' },
      { name: 'secretType', type: 'uint8' },
      { name: 'publicKeyCid', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSecretOwner',
    inputs: [{ name: 'secretId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDelegate',
    inputs: [{ name: 'secretId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSecretsByWallet',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      { name: 'owned', type: 'uint256[]' },
      { name: 'delegated', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSecretsCountByWallet',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      { name: 'ownedCount', type: 'uint256' },
      { name: 'delegatedCount', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  // Write functions
  {
    type: 'function',
    name: 'createSecret',
    inputs: [],
    outputs: [{ name: 'secretId', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'setDelegate',
    inputs: [
      { name: 'secretId', type: 'uint256' },
      { name: 'newDelegate', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferSecret',
    inputs: [
      { name: 'secretId', type: 'uint256' },
      { name: 'newOwner', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Events
  {
    type: 'event',
    name: 'SecretCreated',
    inputs: [
      { name: 'secretId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'secretType', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'SecretSynced',
    inputs: [
      { name: 'secretId', type: 'uint256', indexed: true },
      { name: 'clusterId', type: 'uint8', indexed: true },
      { name: 'publicKeyCid', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'DelegateUpdated',
    inputs: [
      { name: 'secretId', type: 'uint256', indexed: true },
      { name: 'newDelegate', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'SecretOwnershipTransferred',
    inputs: [
      { name: 'secretId', type: 'uint256', indexed: true },
      { name: 'oldOwner', type: 'address', indexed: true },
      { name: 'newOwner', type: 'address', indexed: true },
    ],
  },
] as const;

/**
 * Function selectors (first 4 bytes of keccak256 of function signature)
 */
export const SECRETS_CONTROLLER_SELECTORS = {
  // Reads
  secretCreationFee: '0xb9387101' as Hex,
  defaultSecretType: '0x5f5f38bf' as Hex,
  nextSecretId: '0x28e32de1' as Hex,
  getSecretState: '0xd3d63b51' as Hex,
  getSecretOwner: '0x7c4e39a4' as Hex,
  getDelegate: '0xdcc66cc2' as Hex,
  getSecretsByWallet: '0xfb618966' as Hex,
  getSecretsCountByWallet: '0xe55a2c36' as Hex,
  // Writes
  createSecret: '0xc9354af2' as Hex,
  setDelegate: '0x94dcf2e6' as Hex,
  transferSecret: '0x75cec53c' as Hex,
} as const;

/**
 * Event topic signatures (keccak256 of event signature)
 */
export const SECRETS_CONTROLLER_TOPICS = {
  SecretCreated:
    '0x37b4b901c8ebed314689cc4d38f8c7b2d893bb9c472df1598e30c7f0bef2af81' as Hex,
  SecretSynced:
    '0x792957745e170c30a6d1b00d24be4300d460f1345171fec4e7155309f54f8fd1' as Hex,
  DelegateUpdated:
    '0x8682660f5651eae4e317da0c532f4b8612a4aab7fbdda5dcade609634c78419f' as Hex,
  SecretOwnershipTransferred:
    '0xeb69ed772c6ac53a4d25fb83d3efd61497881f29561ce3e09de3a204c301af77' as Hex,
} as const;

// ============================================================================
// ABI Encoding Utilities (minimal, no external dependencies)
// ============================================================================

/**
 * Encode a uint256 as a 32-byte hex string (no 0x prefix internally)
 */
function encodeUint256(value: bigint | number): string {
  const hex = BigInt(value).toString(16);
  return hex.padStart(64, '0');
}

/**
 * Encode an address as a 32-byte hex string (padded)
 */
function encodeAddress(address: string): string {
  // Remove 0x prefix if present
  const clean = address.toLowerCase().replace('0x', '');
  return clean.padStart(64, '0');
}

/**
 * Encode createSecret() call data
 */
export function encodeCreateSecret(): Hex {
  return SECRETS_CONTROLLER_SELECTORS.createSecret;
}

/**
 * Encode setDelegate(uint256 secretId, address newDelegate) call data
 */
export function encodeSetDelegate(secretId: bigint, newDelegate: Address): Hex {
  const selector = SECRETS_CONTROLLER_SELECTORS.setDelegate.slice(2);
  const secretIdEncoded = encodeUint256(secretId);
  const delegateEncoded = encodeAddress(newDelegate);
  return `0x${selector}${secretIdEncoded}${delegateEncoded}` as Hex;
}

/**
 * Encode transferSecret(uint256 secretId, address newOwner) call data
 */
export function encodeTransferSecret(
  secretId: bigint,
  newOwner: Address
): Hex {
  const selector = SECRETS_CONTROLLER_SELECTORS.transferSecret.slice(2);
  const secretIdEncoded = encodeUint256(secretId);
  const ownerEncoded = encodeAddress(newOwner);
  return `0x${selector}${secretIdEncoded}${ownerEncoded}` as Hex;
}

/**
 * Encode secretCreationFee() call data
 */
export function encodeSecretCreationFee(): Hex {
  return SECRETS_CONTROLLER_SELECTORS.secretCreationFee;
}

/**
 * Encode getSecretState(uint256 secretId) call data
 */
export function encodeGetSecretState(secretId: bigint): Hex {
  const selector = SECRETS_CONTROLLER_SELECTORS.getSecretState.slice(2);
  const secretIdEncoded = encodeUint256(secretId);
  return `0x${selector}${secretIdEncoded}` as Hex;
}

/**
 * Encode getSecretOwner(uint256 secretId) call data
 */
export function encodeGetSecretOwner(secretId: bigint): Hex {
  const selector = SECRETS_CONTROLLER_SELECTORS.getSecretOwner.slice(2);
  const secretIdEncoded = encodeUint256(secretId);
  return `0x${selector}${secretIdEncoded}` as Hex;
}

/**
 * Encode getDelegate(uint256 secretId) call data
 */
export function encodeGetDelegate(secretId: bigint): Hex {
  const selector = SECRETS_CONTROLLER_SELECTORS.getDelegate.slice(2);
  const secretIdEncoded = encodeUint256(secretId);
  return `0x${selector}${secretIdEncoded}` as Hex;
}

/**
 * Encode getSecretsByWallet(address wallet) call data
 */
export function encodeGetSecretsByWallet(wallet: Address): Hex {
  const selector = SECRETS_CONTROLLER_SELECTORS.getSecretsByWallet.slice(2);
  const walletEncoded = encodeAddress(wallet);
  return `0x${selector}${walletEncoded}` as Hex;
}

/**
 * Encode getSecretsCountByWallet(address wallet) call data
 */
export function encodeGetSecretsCountByWallet(wallet: Address): Hex {
  const selector = SECRETS_CONTROLLER_SELECTORS.getSecretsCountByWallet.slice(2);
  const walletEncoded = encodeAddress(wallet);
  return `0x${selector}${walletEncoded}` as Hex;
}

// ============================================================================
// ABI Decoding Utilities
// ============================================================================

/**
 * Decode a uint256 from hex (32 bytes)
 */
function decodeUint256(hex: string): bigint {
  return BigInt('0x' + hex);
}

/**
 * Decode an address from a 32-byte hex string
 */
function decodeAddress(hex: string): Address {
  // Take last 40 characters (20 bytes) and add 0x prefix
  return `0x${hex.slice(-40)}` as Address;
}

/**
 * Decode a boolean from a 32-byte hex string
 */
function decodeBool(hex: string): boolean {
  return hex !== '0'.repeat(64);
}

/**
 * Decode a string from ABI-encoded data
 */
function decodeString(data: string, offset: number): string {
  // Get the offset to the string data
  const stringOffset = Number(decodeUint256(data.slice(offset, offset + 64)));
  // Get the length of the string
  const length = Number(
    decodeUint256(data.slice(stringOffset * 2, stringOffset * 2 + 64))
  );
  // Get the actual string bytes
  const stringHex = data.slice(
    stringOffset * 2 + 64,
    stringOffset * 2 + 64 + length * 2
  );
  // Convert hex to string
  let result = '';
  for (let i = 0; i < stringHex.length; i += 2) {
    result += String.fromCharCode(parseInt(stringHex.slice(i, i + 2), 16));
  }
  return result;
}

/**
 * Decode secretCreationFee() return value
 */
export function decodeSecretCreationFee(data: Hex): bigint {
  const clean = data.replace('0x', '');
  return decodeUint256(clean);
}

/**
 * Decoded secret state
 */
export interface DecodedSecretState {
  owner: Address;
  delegate: Address;
  isSyncing: boolean;
  clusterId: number;
  secretType: number;
  publicKeyCid: string;
}

/**
 * Decode getSecretState() return value
 */
export function decodeGetSecretState(data: Hex): DecodedSecretState {
  const clean = data.replace('0x', '');

  return {
    owner: decodeAddress(clean.slice(0, 64)),
    delegate: decodeAddress(clean.slice(64, 128)),
    isSyncing: decodeBool(clean.slice(128, 192)),
    clusterId: Number(decodeUint256(clean.slice(192, 256))),
    secretType: Number(decodeUint256(clean.slice(256, 320))),
    publicKeyCid: decodeString(clean, 320),
  };
}

/**
 * Decode getSecretOwner() return value
 */
export function decodeGetSecretOwner(data: Hex): Address {
  const clean = data.replace('0x', '');
  return decodeAddress(clean);
}

/**
 * Decode getDelegate() return value
 */
export function decodeGetDelegate(data: Hex): Address {
  const clean = data.replace('0x', '');
  return decodeAddress(clean);
}

/**
 * Decoded secrets by wallet
 */
export interface DecodedSecretsByWallet {
  owned: bigint[];
  delegated: bigint[];
}

/**
 * Decode getSecretsByWallet() return value
 */
export function decodeGetSecretsByWallet(data: Hex): DecodedSecretsByWallet {
  const clean = data.replace('0x', '');

  // Decode array offsets
  const ownedOffset = Number(decodeUint256(clean.slice(0, 64))) * 2;
  const delegatedOffset = Number(decodeUint256(clean.slice(64, 128))) * 2;

  // Decode owned array
  const ownedLength = Number(
    decodeUint256(clean.slice(ownedOffset, ownedOffset + 64))
  );
  const owned: bigint[] = [];
  for (let i = 0; i < ownedLength; i++) {
    owned.push(
      decodeUint256(
        clean.slice(ownedOffset + 64 + i * 64, ownedOffset + 128 + i * 64)
      )
    );
  }

  // Decode delegated array
  const delegatedLength = Number(
    decodeUint256(clean.slice(delegatedOffset, delegatedOffset + 64))
  );
  const delegated: bigint[] = [];
  for (let i = 0; i < delegatedLength; i++) {
    delegated.push(
      decodeUint256(
        clean.slice(
          delegatedOffset + 64 + i * 64,
          delegatedOffset + 128 + i * 64
        )
      )
    );
  }

  return { owned, delegated };
}

/**
 * Decoded secrets count by wallet
 */
export interface DecodedSecretsCountByWallet {
  ownedCount: bigint;
  delegatedCount: bigint;
}

/**
 * Decode getSecretsCountByWallet() return value
 */
export function decodeGetSecretsCountByWallet(
  data: Hex
): DecodedSecretsCountByWallet {
  const clean = data.replace('0x', '');
  return {
    ownedCount: decodeUint256(clean.slice(0, 64)),
    delegatedCount: decodeUint256(clean.slice(64, 128)),
  };
}

// ============================================================================
// Event Decoding
// ============================================================================

/**
 * Decoded SecretCreated event
 */
export interface SecretCreatedEvent {
  secretId: bigint;
  owner: Address;
  secretType: number;
}

/**
 * Decode SecretCreated event from log
 */
export function decodeSecretCreatedEvent(
  topics: Hex[],
  data: Hex
): SecretCreatedEvent {
  // topic[0] = event signature
  // topic[1] = secretId (indexed)
  // topic[2] = owner (indexed)
  // data = secretType
  return {
    secretId: BigInt(topics[1]),
    owner: `0x${topics[2].slice(-40)}` as Address,
    secretType: Number(BigInt(data)),
  };
}

/**
 * Decoded SecretSynced event
 */
export interface SecretSyncedEvent {
  secretId: bigint;
  clusterId: number;
  publicKeyCid: string;
}

/**
 * Decode SecretSynced event from log
 */
export function decodeSecretSyncedEvent(
  topics: Hex[],
  data: Hex
): SecretSyncedEvent {
  // topic[0] = event signature
  // topic[1] = secretId (indexed)
  // topic[2] = clusterId (indexed)
  // data = publicKeyCid (string)
  const clean = data.replace('0x', '');

  return {
    secretId: BigInt(topics[1]),
    clusterId: Number(BigInt(topics[2])),
    publicKeyCid: decodeString(clean, 0),
  };
}

/**
 * Decoded DelegateUpdated event
 */
export interface DelegateUpdatedEvent {
  secretId: bigint;
  newDelegate: Address;
}

/**
 * Decode DelegateUpdated event from log
 */
export function decodeDelegateUpdatedEvent(topics: Hex[]): DelegateUpdatedEvent {
  return {
    secretId: BigInt(topics[1]),
    newDelegate: `0x${topics[2].slice(-40)}` as Address,
  };
}
