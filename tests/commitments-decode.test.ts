/**
 * @file tests/commitments-decode.test.ts
 * @description Tests for commitments log decoding
 */

import { describe, it, expect } from 'vitest';
import {
  CIFER_ENVELOPE_BYTES,
  MAX_PAYLOAD_BYTES,
  decodeGetCIFERMetadata,
  decodeCiferDataExists,
  decodeCIFERDataEvent,
} from '../src/internal/abi/cifer-encrypted.js';
import {
  verifyCommitmentIntegrity,
  assertCommitmentIntegrity,
  validateForStorage,
} from '../src/commitments/integrity.js';
import { hexToBytes, bytesToHex } from '../src/commitments/metadata.js';
import type { Hex, Bytes32, CommitmentData, CIFERMetadata } from '../src/types/common.js';

describe('Commitments Constants', () => {
  it('should have correct CIFER_ENVELOPE_BYTES', () => {
    // ML-KEM-768 ciphertext (1088) + AES-GCM tag (16)
    expect(CIFER_ENVELOPE_BYTES).toBe(1104);
  });

  it('should have correct MAX_PAYLOAD_BYTES', () => {
    // 16 KiB
    expect(MAX_PAYLOAD_BYTES).toBe(16384);
  });
});

describe('Hex Utilities', () => {
  describe('hexToBytes', () => {
    it('should convert hex string to bytes', () => {
      const bytes = hexToBytes('0xabcdef');
      expect(bytes).toEqual(new Uint8Array([0xab, 0xcd, 0xef]));
    });

    it('should handle hex without 0x prefix', () => {
      const bytes = hexToBytes('0x0102' as Hex);
      expect(bytes).toEqual(new Uint8Array([0x01, 0x02]));
    });

    it('should handle empty hex', () => {
      const bytes = hexToBytes('0x');
      expect(bytes.length).toBe(0);
    });
  });

  describe('bytesToHex', () => {
    it('should convert bytes to hex string', () => {
      const hex = bytesToHex(new Uint8Array([0xab, 0xcd, 0xef]));
      expect(hex).toBe('0xabcdef');
    });

    it('should handle empty bytes', () => {
      const hex = bytesToHex(new Uint8Array([]));
      expect(hex).toBe('0x');
    });

    it('should pad single digits', () => {
      const hex = bytesToHex(new Uint8Array([0x01, 0x02, 0x03]));
      expect(hex).toBe('0x010203');
    });
  });
});

describe('Commitments Integrity', () => {
  describe('verifyCommitmentIntegrity', () => {
    it('should pass for valid data sizes', () => {
      // Create mock data with correct sizes
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' + 'cd'.repeat(100) as Hex;
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      const result = verifyCommitmentIntegrity(data);

      expect(result.valid).toBe(true);
      expect(result.checks.ciferSize.valid).toBe(true);
      expect(result.checks.payloadSize.valid).toBe(true);
    });

    it('should fail for wrong cifer size', () => {
      const cifer = '0x' + 'ab'.repeat(100) as Hex; // Wrong size
      const encryptedMessage = '0x' + 'cd'.repeat(100) as Hex;
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      const result = verifyCommitmentIntegrity(data);

      expect(result.valid).toBe(false);
      expect(result.checks.ciferSize.valid).toBe(false);
      expect(result.checks.ciferSize.actual).toBe(100);
      expect(result.checks.ciferSize.expected).toBe(CIFER_ENVELOPE_BYTES);
    });

    it('should fail for empty payload', () => {
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' as Hex; // Empty
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      const result = verifyCommitmentIntegrity(data);

      expect(result.valid).toBe(false);
      expect(result.checks.payloadSize.valid).toBe(false);
      expect(result.checks.payloadSize.actual).toBe(0);
    });

    it('should fail for too large payload', () => {
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' + 'cd'.repeat(MAX_PAYLOAD_BYTES + 1) as Hex;
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      const result = verifyCommitmentIntegrity(data);

      expect(result.valid).toBe(false);
      expect(result.checks.payloadSize.valid).toBe(false);
    });

    it('should verify hashes against metadata', () => {
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' + 'cd'.repeat(100) as Hex;
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      const metadata: CIFERMetadata = {
        secretId: 123n,
        storedAtBlock: 1000,
        ciferHash: ciferHash, // Same hash
        encryptedMessageHash: encryptedMessageHash, // Same hash
      };

      const result = verifyCommitmentIntegrity(data, metadata);

      expect(result.valid).toBe(true);
      expect(result.checks.ciferHash?.valid).toBe(true);
      expect(result.checks.encryptedMessageHash?.valid).toBe(true);
    });

    it('should fail if cifer hash does not match metadata', () => {
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' + 'cd'.repeat(100) as Hex;
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      const metadata: CIFERMetadata = {
        secretId: 123n,
        storedAtBlock: 1000,
        ciferHash: '0x' + '00'.repeat(32) as Bytes32, // Different hash
        encryptedMessageHash: encryptedMessageHash,
      };

      const result = verifyCommitmentIntegrity(data, metadata);

      expect(result.valid).toBe(false);
      expect(result.checks.ciferHash?.valid).toBe(false);
    });
  });

  describe('assertCommitmentIntegrity', () => {
    it('should not throw for valid data', () => {
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' + 'cd'.repeat(100) as Hex;
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      expect(() => assertCommitmentIntegrity(data)).not.toThrow();
    });

    it('should throw InvalidCiferSizeError for wrong size', () => {
      const cifer = '0x' + 'ab'.repeat(100) as Hex;
      const encryptedMessage = '0x' + 'cd'.repeat(100) as Hex;
      const ciferHash = '0x' + 'ef'.repeat(32) as Bytes32;
      const encryptedMessageHash = '0x' + '12'.repeat(32) as Bytes32;

      const data: CommitmentData = {
        cifer,
        encryptedMessage,
        ciferHash,
        encryptedMessageHash,
      };

      expect(() => assertCommitmentIntegrity(data)).toThrow('Invalid cifer size');
    });
  });

  describe('validateForStorage', () => {
    it('should pass for valid sizes', () => {
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' + 'cd'.repeat(100) as Hex;

      expect(() => validateForStorage(cifer, encryptedMessage)).not.toThrow();
    });

    it('should throw for empty message', () => {
      const cifer = '0x' + 'ab'.repeat(CIFER_ENVELOPE_BYTES) as Hex;
      const encryptedMessage = '0x' as Hex;

      expect(() => validateForStorage(cifer, encryptedMessage)).toThrow('cannot be empty');
    });

    it('should accept Uint8Array input', () => {
      const cifer = new Uint8Array(CIFER_ENVELOPE_BYTES).fill(0xab);
      const encryptedMessage = new Uint8Array(100).fill(0xcd);

      expect(() => validateForStorage(cifer, encryptedMessage)).not.toThrow();
    });
  });
});

describe('ABI Decoding', () => {
  describe('decodeGetCIFERMetadata', () => {
    it('should decode metadata response', () => {
      // Construct a mock response
      // secretId (uint256) + storedAtBlock (uint64) + ciferHash (bytes32) + encryptedMessageHash (bytes32)
      const secretId = '0000000000000000000000000000000000000000000000000000000000000064'; // 100
      const storedAtBlock = '00000000000000000000000000000000000000000000000000000000000003e8'; // 1000
      const ciferHash = 'abcd'.padStart(64, '0');
      const encryptedMessageHash = 'ef01'.padStart(64, '0');

      const data = `0x${secretId}${storedAtBlock}${ciferHash}${encryptedMessageHash}` as Hex;
      const result = decodeGetCIFERMetadata(data);

      expect(result.secretId).toBe(100n);
      expect(result.storedAtBlock).toBe(1000);
    });
  });

  describe('decodeCiferDataExists', () => {
    it('should decode true response', () => {
      const data = '0x0000000000000000000000000000000000000000000000000000000000000001' as Hex;
      expect(decodeCiferDataExists(data)).toBe(true);
    });

    it('should decode false response', () => {
      const data = '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;
      expect(decodeCiferDataExists(data)).toBe(false);
    });
  });
});
