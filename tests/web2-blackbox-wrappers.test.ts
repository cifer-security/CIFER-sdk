/**
 * @file tests/web2-blackbox-wrappers.test.ts
 * @description Tests for Web2 blackbox wrappers verifying they delegate
 * correctly to core blackbox functions with chainId = -1
 */

import { describe, it, expect, vi } from 'vitest';
import { WEB2_CHAIN_ID } from '../src/types/common.js';
import type { Web2Session } from '../src/types/web2.js';
import type { SignerAdapter, ReadClient } from '../src/types/adapters.js';
import type { Address, Hex } from '../src/types/common.js';

// ============================================================================
// Mock helpers
// ============================================================================

function createMockSigner(): SignerAdapter {
  return {
    getAddress: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890' as Address),
    signMessage: vi.fn().mockResolvedValue('0x' + '00'.repeat(65) as Hex),
  };
}

function createMockReadClient(): ReadClient {
  return {
    getBlockNumber: vi.fn().mockResolvedValue(Date.now()),
    getLogs: vi.fn().mockResolvedValue([]),
  };
}

function createMockSession(overrides?: Partial<Web2Session>): Web2Session {
  return {
    principalId: 'test-principal',
    sessionAddress: '0x1234567890123456789012345678901234567890' as Address,
    expiresAt: new Date(Date.now() + 900_000).toISOString(),
    signer: createMockSigner(),
    isManaged: true,
    renew: vi.fn().mockResolvedValue(undefined),
    ensureValid: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('Web2 Blackbox Wrappers', () => {
  describe('session.ensureValid() is called', () => {
    it('payload.encryptPayload calls ensureValid', async () => {
      const session = createMockSession();

      // We can't easily mock the core function, but we can verify ensureValid is called
      // by checking the mock was called even if the actual encrypt call fails
      const { encryptPayload } = await import('../src/web2/blackbox/payload.js');

      try {
        await encryptPayload({
          session,
          secretId: 42,
          plaintext: 'test',
          blackboxUrl: 'http://localhost:3010',
          readClient: createMockReadClient(),
        });
      } catch {
        // Expected to fail since we're not mocking fetch
      }

      expect(session.ensureValid).toHaveBeenCalled();
    });

    it('payload.decryptPayload calls ensureValid', async () => {
      const session = createMockSession();
      const { decryptPayload } = await import('../src/web2/blackbox/payload.js');

      try {
        await decryptPayload({
          session,
          secretId: 42,
          encryptedMessage: 'test',
          cifer: 'test',
          blackboxUrl: 'http://localhost:3010',
          readClient: createMockReadClient(),
        });
      } catch {
        // Expected to fail
      }

      expect(session.ensureValid).toHaveBeenCalled();
    });

    it('files.encryptFile calls ensureValid', async () => {
      const session = createMockSession();
      const { encryptFile } = await import('../src/web2/blackbox/files.js');

      try {
        await encryptFile({
          session,
          secretId: 42,
          file: new Blob(['test']),
          blackboxUrl: 'http://localhost:3010',
          readClient: createMockReadClient(),
        });
      } catch {
        // Expected to fail
      }

      expect(session.ensureValid).toHaveBeenCalled();
    });

    it('jobs.list calls ensureValid', async () => {
      const session = createMockSession();
      const { list } = await import('../src/web2/blackbox/jobs.js');

      try {
        await list({
          session,
          blackboxUrl: 'http://localhost:3010',
          readClient: createMockReadClient(),
        });
      } catch {
        // Expected to fail
      }

      expect(session.ensureValid).toHaveBeenCalled();
    });
  });

  describe('WEB2_CHAIN_ID is used', () => {
    it('should pass chainId = -1 to the core function', async () => {
      const mockReadClient = createMockReadClient();
      const session = createMockSession();

      const { encryptPayload } = await import('../src/web2/blackbox/payload.js');

      try {
        await encryptPayload({
          session,
          secretId: 42,
          plaintext: 'test',
          blackboxUrl: 'http://localhost:3010',
          readClient: mockReadClient,
        });
      } catch {
        // Expected to fail
      }

      // Verify readClient.getBlockNumber was called with WEB2_CHAIN_ID
      expect(mockReadClient.getBlockNumber).toHaveBeenCalledWith(WEB2_CHAIN_ID);
    });
  });

  describe('re-exports from jobs', () => {
    it('should re-export getStatus', async () => {
      const { getStatus } = await import('../src/web2/blackbox/jobs.js');
      expect(typeof getStatus).toBe('function');
    });

    it('should re-export pollUntilComplete', async () => {
      const { pollUntilComplete } = await import('../src/web2/blackbox/jobs.js');
      expect(typeof pollUntilComplete).toBe('function');
    });
  });
});
