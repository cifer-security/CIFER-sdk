/**
 * @module internal/adapters
 * @description Built-in adapters for wallet and RPC abstraction
 */

export { Eip1193SignerAdapter } from './eip1193-signer.js';
export { RpcReadClient, createReadClientFromDiscovery } from './rpc-read-client.js';
