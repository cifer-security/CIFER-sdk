/**
 * Type definitions for the CIFER SDK.
 *
 * This module re-exports all public types used throughout the SDK.
 * Import types from this module or directly from sub-modules.
 *
 * @example
 * ```typescript
 * import type {
 *   Address,
 *   ChainId,
 *   SecretState,
 *   TxIntent,
 *   SignerAdapter,
 *   CiferSdkConfig,
 * } from 'cifer-sdk';
 * ```
 *
 * @packageDocumentation
 * @module types
 */

// Re-export all types
export * from './common.js';
export * from './tx-intent.js';
export * from './adapters.js';
export * from './config.js';
