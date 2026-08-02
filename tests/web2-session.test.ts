/**
 * @file tests/web2-session.test.ts
 * @description Tests for Web2 session creation and management
 */

import { describe, it, expect, vi } from 'vitest';
import { useExistingSessionKey } from '../src/web2/session.js';
import { Web2SessionError } from '../src/internal/errors/index.js';

describe('Web2 Session', () => {
  describe('useExistingSessionKey', () => {
    // Use a known test private key (DO NOT use in production)
    const testPrivateKey =
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    it('should create a session with the provided private key', () => {
      const session = useExistingSessionKey({
        sessionPrivateKey: testPrivateKey,
        principalId: 'test-principal-uuid',
      });

      expect(session.principalId).toBe('test-principal-uuid');
      expect(session.isManaged).toBe(false);
      expect(session.signer).toBeDefined();
      expect(session.expiresAt).toBe('');
    });

    it('should have a signer that can getAddress', async () => {
      const session = useExistingSessionKey({
        sessionPrivateKey: testPrivateKey,
      });

      const address = await session.signer.getAddress();
      expect(address).toMatch(/^0x[0-9a-f]{40}$/);
    });

    it('should have a signer that can signMessage', async () => {
      const session = useExistingSessionKey({
        sessionPrivateKey: testPrivateKey,
      });

      const signature = await session.signer.signMessage('Hello, Web2!');
      expect(signature).toMatch(/^0x[0-9a-f]+$/);
      expect(signature.length).toBe(132); // 0x + 130 hex chars (65 bytes)
    });

    it('should throw Web2SessionError on renew()', async () => {
      const session = useExistingSessionKey({
        sessionPrivateKey: testPrivateKey,
      });

      await expect(session.renew()).rejects.toThrow(Web2SessionError);
      await expect(session.renew()).rejects.toThrow('Cannot renew session');
    });

    it('should NOT throw on ensureValid() (no-op)', async () => {
      const session = useExistingSessionKey({
        sessionPrivateKey: testPrivateKey,
      });

      // Should not throw
      await expect(session.ensureValid()).resolves.toBeUndefined();
    });

    it('should default principalId to empty string if not provided', () => {
      const session = useExistingSessionKey({
        sessionPrivateKey: testPrivateKey,
      });

      expect(session.principalId).toBe('');
    });

    it('should accept private key without 0x prefix', () => {
      const session = useExistingSessionKey({
        sessionPrivateKey: testPrivateKey.slice(2), // no 0x prefix
      });

      expect(session.signer).toBeDefined();
    });
  });
});
