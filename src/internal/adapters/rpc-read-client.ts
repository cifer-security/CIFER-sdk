/**
 * @module internal/adapters/rpc-read-client
 * @description RPC read client for blockchain queries
 */

import type { Address, ChainId, Hex, Log, LogFilter } from '../../types/common.js';
import type {
  ReadClient,
  CallRequest,
  RpcReadClientConfig,
} from '../../types/adapters.js';
import { ConfigError } from '../errors/index.js';

/**
 * JSON-RPC request structure
 */
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

/**
 * JSON-RPC response structure
 */
interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * RPC read client for making blockchain queries
 *
 * This client makes standard JSON-RPC calls to Ethereum-compatible nodes.
 * It supports multiple chains by mapping chain IDs to RPC URLs.
 *
 * @example
 * ```typescript
 * const readClient = new RpcReadClient({
 *   rpcUrlByChainId: {
 *     752025: 'https://mainnet.ternoa.network',
 *     11155111: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
 *   },
 * });
 *
 * const blockNumber = await readClient.getBlockNumber(752025);
 * const logs = await readClient.getLogs(752025, {
 *   address: '0x...',
 *   fromBlock: 1000,
 *   toBlock: 'latest',
 * });
 * ```
 */
export class RpcReadClient implements ReadClient {
  private rpcUrlByChainId: Record<ChainId, string>;
  private fetchFn: typeof fetch;
  private requestId = 0;

  /**
   * Create a new RPC read client
   *
   * @param config - Configuration with RPC URLs per chain
   */
  constructor(config: RpcReadClientConfig) {
    this.rpcUrlByChainId = { ...config.rpcUrlByChainId };
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Add or update an RPC URL for a chain
   *
   * @param chainId - The chain ID
   * @param rpcUrl - The RPC URL
   */
  setRpcUrl(chainId: ChainId, rpcUrl: string): void {
    this.rpcUrlByChainId[chainId] = rpcUrl;
  }

  /**
   * Get the current block number for a chain
   *
   * @param chainId - The chain ID
   * @returns The current block number
   */
  async getBlockNumber(chainId: ChainId): Promise<number> {
    const result = await this.rpcCall<Hex>(chainId, 'eth_blockNumber', []);
    return parseInt(result, 16);
  }

  /**
   * Get logs matching a filter
   *
   * @param chainId - The chain ID
   * @param filter - The log filter
   * @returns Array of matching logs
   */
  async getLogs(chainId: ChainId, filter: LogFilter): Promise<Log[]> {
    const rpcFilter: Record<string, unknown> = {};

    if (filter.address) {
      rpcFilter.address = filter.address;
    }

    if (filter.topics) {
      rpcFilter.topics = filter.topics;
    }

    if (filter.fromBlock !== undefined) {
      rpcFilter.fromBlock =
        filter.fromBlock === 'latest'
          ? 'latest'
          : `0x${filter.fromBlock.toString(16)}`;
    }

    if (filter.toBlock !== undefined) {
      rpcFilter.toBlock =
        filter.toBlock === 'latest'
          ? 'latest'
          : `0x${filter.toBlock.toString(16)}`;
    }

    const result = await this.rpcCall<RpcLog[]>(chainId, 'eth_getLogs', [
      rpcFilter,
    ]);

    return result.map((log) => ({
      address: log.address as Address,
      topics: log.topics as Hex[],
      data: log.data as Hex,
      blockNumber: parseInt(log.blockNumber, 16),
      transactionHash: log.transactionHash as Hex,
      logIndex: parseInt(log.logIndex, 16),
      transactionIndex: parseInt(log.transactionIndex, 16),
    }));
  }

  /**
   * Make an eth_call to read contract state
   *
   * @param chainId - The chain ID
   * @param callRequest - The call request
   * @returns The return data as a hex string
   */
  async call(chainId: ChainId, callRequest: CallRequest): Promise<Hex> {
    const rpcCall: Record<string, unknown> = {
      to: callRequest.to,
      data: callRequest.data,
    };

    const blockTag =
      callRequest.blockTag === undefined
        ? 'latest'
        : typeof callRequest.blockTag === 'number'
          ? `0x${callRequest.blockTag.toString(16)}`
          : callRequest.blockTag;

    const result = await this.rpcCall<Hex>(chainId, 'eth_call', [
      rpcCall,
      blockTag,
    ]);

    return result;
  }

  /**
   * Get the RPC URL for a chain
   */
  private getRpcUrl(chainId: ChainId): string {
    const rpcUrl = this.rpcUrlByChainId[chainId];
    if (!rpcUrl) {
      throw new ConfigError(
        `No RPC URL configured for chain ${chainId}. ` +
          'Add it via RpcReadClient constructor or setRpcUrl().'
      );
    }
    return rpcUrl;
  }

  /**
   * Make a JSON-RPC call
   */
  private async rpcCall<T>(
    chainId: ChainId,
    method: string,
    params: unknown[]
  ): Promise<T> {
    const rpcUrl = this.getRpcUrl(chainId);
    const id = ++this.requestId;

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    let response: Response;
    try {
      response = await this.fetchFn(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
    } catch (error) {
      throw new ConfigError(
        `RPC request failed for chain ${chainId}: ${error instanceof Error ? error.message : 'Network error'}`,
        error instanceof Error ? error : undefined
      );
    }

    if (!response.ok) {
      throw new ConfigError(
        `RPC request failed with status ${response.status}: ${response.statusText}`
      );
    }

    let json: JsonRpcResponse<T>;
    try {
      json = (await response.json()) as JsonRpcResponse<T>;
    } catch (error) {
      throw new ConfigError(
        'Failed to parse RPC response as JSON',
        error instanceof Error ? error : undefined
      );
    }

    if (json.error) {
      throw new ConfigError(
        `RPC error: ${json.error.message} (code: ${json.error.code})`
      );
    }

    if (json.result === undefined) {
      throw new ConfigError('RPC response missing result');
    }

    return json.result;
  }
}

/**
 * Raw RPC log structure
 */
interface RpcLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  transactionIndex: string;
}

/**
 * Create a read client from discovery result
 *
 * @param chains - Array of chain configs from discovery
 * @returns Configured RpcReadClient
 *
 * @example
 * ```typescript
 * const discovery = await discover('https://cifer-blackbox.ternoa.dev:3010');
 * const readClient = createReadClientFromDiscovery(discovery.chains);
 * ```
 */
export function createReadClientFromDiscovery(
  chains: Array<{ chainId: ChainId; rpcUrl: string }>,
  options?: { fetch?: typeof fetch }
): RpcReadClient {
  const rpcUrlByChainId: Record<ChainId, string> = {};

  for (const chain of chains) {
    rpcUrlByChainId[chain.chainId] = chain.rpcUrl;
  }

  return new RpcReadClient({ rpcUrlByChainId, fetch: options?.fetch });
}
