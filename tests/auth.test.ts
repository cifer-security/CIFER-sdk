/**
 * @file tests/auth.test.ts
 * @description Tests for auth string construction and signing
 */

import { describe, it, expect } from 'vitest';
import {
  buildDataString,
  buildEncryptPayloadDataString,
  buildDecryptPayloadDataString,
  buildFileOperationDataString,
  buildJobDownloadDataString,
  buildJobDeleteDataString,
  buildJobsListDataString,
} from '../src/internal/auth/data-string.js';

describe('Auth Data String Construction', () => {
  describe('buildDataString', () => {
    it('should join parts with underscores', () => {
      const result = buildDataString(['a', 'b', 'c']);
      expect(result).toBe('a_b_c');
    });

    it('should handle single part', () => {
      const result = buildDataString(['single']);
      expect(result).toBe('single');
    });

    it('should handle empty array', () => {
      const result = buildDataString([]);
      expect(result).toBe('');
    });

    it('should preserve underscores in parts', () => {
      const result = buildDataString(['a_b', 'c_d']);
      expect(result).toBe('a_b_c_d');
    });
  });

  describe('buildEncryptPayloadDataString', () => {
    it('should build correct format: chainId_secretId_signer_blockNumber_plainText', () => {
      const result = buildEncryptPayloadDataString({
        chainId: 752025,
        secretId: 123n,
        signer: '0xAbcDef1234567890AbcDef1234567890AbcDef12',
        blockNumber: 4200000,
        plaintext: 'my secret message',
      });

      expect(result).toBe(
        '752025_123_0xAbcDef1234567890AbcDef1234567890AbcDef12_4200000_my secret message'
      );
    });

    it('should handle plaintext with underscores', () => {
      const result = buildEncryptPayloadDataString({
        chainId: 752025,
        secretId: 123n,
        signer: '0x1234',
        blockNumber: 100,
        plaintext: 'secret_with_underscores',
      });

      expect(result).toBe('752025_123_0x1234_100_secret_with_underscores');
      // The server reconstructs plaintext by joining parts after index 4
    });

    it('should handle numeric secretId', () => {
      const result = buildEncryptPayloadDataString({
        chainId: 752025,
        secretId: 456, // number instead of bigint
        signer: '0x1234',
        blockNumber: 100,
        plaintext: 'test',
      });

      expect(result).toBe('752025_456_0x1234_100_test');
    });
  });

  describe('buildDecryptPayloadDataString', () => {
    it('should build correct format: chainId_secretId_signer_blockNumber_encryptedMessage', () => {
      const result = buildDecryptPayloadDataString({
        chainId: 11155111,
        secretId: 789n,
        signer: '0xUserAddress',
        blockNumber: 5000000,
        encryptedMessage: '0xabcdef123456',
      });

      expect(result).toBe('11155111_789_0xUserAddress_5000000_0xabcdef123456');
    });
  });

  describe('buildFileOperationDataString', () => {
    it('should build correct format: chainId_secretId_signer_blockNumber', () => {
      const result = buildFileOperationDataString({
        chainId: 752025,
        secretId: 100n,
        signer: '0xSigner',
        blockNumber: 12345,
      });

      expect(result).toBe('752025_100_0xSigner_12345');
    });
  });

  describe('buildJobDownloadDataString', () => {
    it('should build correct format with _download suffix', () => {
      const result = buildJobDownloadDataString({
        chainId: 752025,
        secretId: 123n,
        signer: '0xSigner',
        blockNumber: 1000,
        jobId: 'job-abc-123',
      });

      expect(result).toBe('752025_123_0xSigner_1000_job-abc-123_download');
    });
  });

  describe('buildJobDeleteDataString', () => {
    it('should build correct format with _delete suffix', () => {
      const result = buildJobDeleteDataString({
        chainId: 752025,
        secretId: 123n,
        signer: '0xSigner',
        blockNumber: 1000,
        jobId: 'job-xyz-789',
      });

      expect(result).toBe('752025_123_0xSigner_1000_job-xyz-789_delete');
    });
  });

  describe('buildJobsListDataString', () => {
    it('should build same format as file operations', () => {
      const result = buildJobsListDataString({
        chainId: 752025,
        secretId: 0n, // Ignored by server
        signer: '0xSigner',
        blockNumber: 2000,
      });

      expect(result).toBe('752025_0_0xSigner_2000');
    });
  });
});

describe('Auth Signing', () => {
  // Note: Full signing tests require a mock signer
  // These are placeholder tests that would be expanded with mocks
  
  it('should export signDataString function', async () => {
    const { signDataString } = await import('../src/internal/auth/signer.js');
    expect(typeof signDataString).toBe('function');
  });

  it('should export normalizeAddress function', async () => {
    const { normalizeAddress } = await import('../src/internal/auth/signer.js');
    expect(normalizeAddress('0xAbCdEf')).toBe('0xabcdef');
  });

  it('should correctly compare addresses', async () => {
    const { addressesEqual } = await import('../src/internal/auth/signer.js');
    expect(addressesEqual('0xAbCdEf', '0xabcdef')).toBe(true);
    expect(addressesEqual('0xAbCdEf', '0x123456')).toBe(false);
  });
});
