/**
 * @file tests/web2-freshness.test.ts
 * @description Tests that RpcReadClient returns Date.now() for chainId = -1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RpcReadClient } from '../src/internal/adapters/rpc-read-client.js';
import { WEB2_CHAIN_ID } from '../src/types/common.js';
import { withBlockFreshRetry } from '../src/internal/auth/block-freshness.js';
import type { ReadClient } from '../src/types/adapters.js';

describe('Web2 Freshness (chainId = -1)', () => {
  describe('RpcReadClient.getBlockNumber', () => {
    it('should return Date.now() for WEB2_CHAIN_ID', async () => {
      // Create a client — no RPC URLs are needed for chainId = -1
      const client = new RpcReadClient({});

      const before = Date.now();
      const result = await client.getBlockNumber(WEB2_CHAIN_ID);
      const after = Date.now();

      // The result should be a timestamp between before and after
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });

    it('should NOT make an RPC call for WEB2_CHAIN_ID', async () => {
      const mockFetch = vi.fn();
      const client = new RpcReadClient({}, { fetch: mockFetch as unknown as typeof fetch });

      await client.getBlockNumber(WEB2_CHAIN_ID);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return a number (not a string)', async () => {
      const client = new RpcReadClient({});
      const result = await client.getBlockNumber(WEB2_CHAIN_ID);

      expect(typeof result).toBe('number');
    });
  });

  describe('WEB2_CHAIN_ID constant', () => {
    it('should equal -1', () => {
      expect(WEB2_CHAIN_ID).toBe(-1);
    });

    it('should be usable as a ChainId', () => {
      // Type-level check: WEB2_CHAIN_ID satisfies ChainId
      const chainId: number = WEB2_CHAIN_ID;
      expect(chainId).toBe(-1);
    });
  });

  describe('withBlockFreshRetry with Web2 freshness', () => {
    it('should work with WEB2_CHAIN_ID and use timestamps', async () => {
      const mockReadClient: ReadClient = {
        getBlockNumber: vi.fn().mockImplementation(async (chainId: number) => {
          if (chainId === WEB2_CHAIN_ID) return Date.now();
          return 100;
        }),
        getLogs: vi.fn().mockResolvedValue([]),
      };

      let capturedBlock: number | undefined;

      await withBlockFreshRetry(
        async (getFreshBlock) => {
          capturedBlock = await getFreshBlock();
          return 'success';
        },
        mockReadClient,
        WEB2_CHAIN_ID
      );

      // Should have received a timestamp
      expect(capturedBlock).toBeDefined();
      expect(capturedBlock!).toBeGreaterThan(1_000_000_000_000); // milliseconds timestamp
      expect(mockReadClient.getBlockNumber).toHaveBeenCalledWith(WEB2_CHAIN_ID);
    });
  });
});
