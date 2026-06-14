/**
 * @file tests/blackbox-public-key.test.ts
 * @description Tests for getSecretPublicKey blackbox client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSecretPublicKey } from '../src/blackbox/publicKey.js';
import type { SignerAdapter, ReadClient } from '../src/types/adapters.js';
import type { Address, Hex } from '../src/types/common.js';

function createMockSigner(): SignerAdapter {
  return {
    getAddress: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890' as Address),
    signMessage: vi.fn().mockResolvedValue(('0x' + 'ab'.repeat(65)) as Hex),
  };
}

function createMockReadClient(blockNumber = 12345): ReadClient {
  return {
    getBlockNumber: vi.fn().mockResolvedValue(blockNumber),
    getLogs: vi.fn().mockResolvedValue([]),
  };
}

describe('getSecretPublicKey', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs to /secret-public-key and returns publicKey', async () => {
    const mockPk = 'B'.repeat(1584);
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ success: true, chainId: 11155111, secretId: 7, publicKey: mockPk }),
        { status: 200 }
      )
    );

    const result = await getSecretPublicKey({
      blackboxUrl: 'http://localhost:3010',
      chainId: 11155111,
      secretId: 7,
      signer: createMockSigner(),
      readClient: createMockReadClient(),
    });

    expect(result.publicKey).toBe(mockPk);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3010/secret-public-key',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
