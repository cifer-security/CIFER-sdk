/**
 * @file tests/block-freshness.test.ts
 * @description Tests for block freshness validation and retry logic
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateBlockFreshness,
  parseBlockFreshnessError,
  withBlockFreshRetry,
} from '../src/internal/auth/block-freshness.js';
import { BlockStaleError, AuthError } from '../src/internal/errors/index.js';
import type { ReadClient } from '../src/types/adapters.js';

describe('Block Freshness Validation', () => {
  describe('validateBlockFreshness', () => {
    it('should pass for block within window', () => {
      const result = validateBlockFreshness(100, 105, 100);
      expect(result).toBe(true);
    });

    it('should pass for current block', () => {
      const result = validateBlockFreshness(100, 100, 100);
      expect(result).toBe(true);
    });

    it('should throw BlockStaleError for too old block', () => {
      expect(() => validateBlockFreshness(1, 200, 100)).toThrow(BlockStaleError);
    });

    it('should throw AuthError for future block', () => {
      expect(() => validateBlockFreshness(110, 100, 100)).toThrow(AuthError);
    });

    it('should allow up to 5 blocks in future', () => {
      const result = validateBlockFreshness(105, 100, 100);
      expect(result).toBe(true);
    });

    it('should reject more than 5 blocks in future', () => {
      expect(() => validateBlockFreshness(106, 100, 100)).toThrow(AuthError);
    });
  });

  describe('parseBlockFreshnessError', () => {
    it('should parse "too old" error messages', () => {
      const message =
        'Block number 100 is too old (current: 300, max window: 150)';
      const error = parseBlockFreshnessError(message);

      expect(error).toBeInstanceOf(BlockStaleError);
      expect(error?.blockNumber).toBe(100);
      expect(error?.currentBlock).toBe(300);
      expect(error?.maxWindow).toBe(150);
    });

    it('should parse "in the future" error messages', () => {
      const message = 'Block number 500 is in the future (current: 400)';
      const error = parseBlockFreshnessError(message);

      expect(error).toBeInstanceOf(BlockStaleError);
      expect(error?.blockNumber).toBe(500);
      expect(error?.currentBlock).toBe(400);
    });

    it('should return null for unrelated messages', () => {
      const error = parseBlockFreshnessError('Some other error');
      expect(error).toBeNull();
    });
  });
});

describe('Block Freshness Retry Logic', () => {
  it('should call function with getFreshBlock callback', async () => {
    const mockReadClient: ReadClient = {
      getBlockNumber: vi.fn().mockResolvedValue(100),
      getLogs: vi.fn().mockResolvedValue([]),
    };

    let capturedBlock: number | undefined;

    await withBlockFreshRetry(
      async (getFreshBlock) => {
        capturedBlock = await getFreshBlock();
        return 'success';
      },
      mockReadClient,
      752025
    );

    expect(capturedBlock).toBe(100);
    expect(mockReadClient.getBlockNumber).toHaveBeenCalledWith(752025);
  });

  it('should retry on BlockStaleError', async () => {
    let attempt = 0;
    const mockReadClient: ReadClient = {
      getBlockNumber: vi.fn().mockResolvedValue(100 + attempt++),
      getLogs: vi.fn().mockResolvedValue([]),
    };

    let callCount = 0;

    await withBlockFreshRetry(
      async (getFreshBlock) => {
        callCount++;
        const block = await getFreshBlock();
        if (callCount === 1) {
          throw new BlockStaleError(block, block + 200, 100);
        }
        return 'success';
      },
      mockReadClient,
      752025,
      { maxRetries: 3, retryDelayMs: 10 }
    );

    expect(callCount).toBe(2);
  });

  it('should throw after max retries', async () => {
    const mockReadClient: ReadClient = {
      getBlockNumber: vi.fn().mockResolvedValue(100),
      getLogs: vi.fn().mockResolvedValue([]),
    };

    await expect(
      withBlockFreshRetry(
        async () => {
          throw new BlockStaleError(50, 200, 100);
        },
        mockReadClient,
        752025,
        { maxRetries: 2, retryDelayMs: 10 }
      )
    ).rejects.toThrow(BlockStaleError);
  });

  it('should not retry on non-BlockStaleError', async () => {
    const mockReadClient: ReadClient = {
      getBlockNumber: vi.fn().mockResolvedValue(100),
      getLogs: vi.fn().mockResolvedValue([]),
    };

    let callCount = 0;

    await expect(
      withBlockFreshRetry(
        async () => {
          callCount++;
          throw new Error('Some other error');
        },
        mockReadClient,
        752025,
        { maxRetries: 3, retryDelayMs: 10 }
      )
    ).rejects.toThrow('Some other error');

    expect(callCount).toBe(1);
  });

  it('should call onRetry callback', async () => {
    const mockReadClient: ReadClient = {
      getBlockNumber: vi.fn().mockResolvedValue(100),
      getLogs: vi.fn().mockResolvedValue([]),
    };

    const onRetry = vi.fn();
    let callCount = 0;

    await withBlockFreshRetry(
      async () => {
        callCount++;
        if (callCount < 3) {
          throw new BlockStaleError(50, 200, 100);
        }
        return 'success';
      },
      mockReadClient,
      752025,
      { maxRetries: 3, retryDelayMs: 10, onRetry }
    );

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(BlockStaleError));
    expect(onRetry).toHaveBeenCalledWith(2, expect.any(BlockStaleError));
  });
});
