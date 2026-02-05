/**
 * @file tests/jobs-state-machine.test.ts
 * @description Tests for job polling state machine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pollUntilComplete } from '../src/blackbox/jobs.js';
import type { JobInfo, JobStatus } from '../src/types/common.js';

// Mock fetch for testing
const createMockFetch = (responses: Array<{ status: JobStatus; progress: number; error?: string }>) => {
  let callIndex = 0;
  
  return vi.fn().mockImplementation(async () => {
    const response = responses[Math.min(callIndex, responses.length - 1)];
    callIndex++;
    
    return {
      ok: true,
      json: async () => ({
        success: true,
        job: {
          id: 'test-job-id',
          type: 'encrypt',
          status: response.status,
          progress: response.progress,
          secretId: 123,
          chainId: 752025,
          createdAt: Date.now(),
          completedAt: response.status === 'completed' ? Date.now() : undefined,
          error: response.error,
          ttl: 172800000,
        },
      }),
    };
  });
};

describe('Job Polling State Machine', () => {
  describe('pollUntilComplete', () => {
    it('should return immediately if job is completed', async () => {
      const mockFetch = createMockFetch([{ status: 'completed', progress: 100 }]);

      const result = await pollUntilComplete('test-job-id', 'https://blackbox.test', {
        fetch: mockFetch,
        intervalMs: 10,
      });

      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should poll until completed', async () => {
      const mockFetch = createMockFetch([
        { status: 'pending', progress: 0 },
        { status: 'processing', progress: 50 },
        { status: 'processing', progress: 75 },
        { status: 'completed', progress: 100 },
      ]);

      const result = await pollUntilComplete('test-job-id', 'https://blackbox.test', {
        fetch: mockFetch,
        intervalMs: 10,
      });

      expect(result.status).toBe('completed');
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should stop polling on failed status', async () => {
      const mockFetch = createMockFetch([
        { status: 'pending', progress: 0 },
        { status: 'processing', progress: 30 },
        { status: 'failed', progress: 30, error: 'Encryption failed' },
      ]);

      const result = await pollUntilComplete('test-job-id', 'https://blackbox.test', {
        fetch: mockFetch,
        intervalMs: 10,
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Encryption failed');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should stop polling on expired status', async () => {
      const mockFetch = createMockFetch([
        { status: 'processing', progress: 80 },
        { status: 'expired', progress: 80 },
      ]);

      const result = await pollUntilComplete('test-job-id', 'https://blackbox.test', {
        fetch: mockFetch,
        intervalMs: 10,
      });

      expect(result.status).toBe('expired');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should call onProgress callback', async () => {
      const mockFetch = createMockFetch([
        { status: 'pending', progress: 0 },
        { status: 'processing', progress: 50 },
        { status: 'completed', progress: 100 },
      ]);

      const onProgress = vi.fn();

      await pollUntilComplete('test-job-id', 'https://blackbox.test', {
        fetch: mockFetch,
        intervalMs: 10,
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenNthCalledWith(1, expect.objectContaining({ progress: 0 }));
      expect(onProgress).toHaveBeenNthCalledWith(2, expect.objectContaining({ progress: 50 }));
      expect(onProgress).toHaveBeenNthCalledWith(3, expect.objectContaining({ progress: 100 }));
    });

    it('should timeout after maxAttempts', async () => {
      const mockFetch = createMockFetch([
        { status: 'processing', progress: 50 },
        { status: 'processing', progress: 50 },
        { status: 'processing', progress: 50 },
      ]);

      await expect(
        pollUntilComplete('test-job-id', 'https://blackbox.test', {
          fetch: mockFetch,
          intervalMs: 10,
          maxAttempts: 2,
        })
      ).rejects.toThrow('timed out');
    });

    it('should respect abort signal', async () => {
      const mockFetch = createMockFetch([
        { status: 'processing', progress: 50 },
        { status: 'processing', progress: 60 },
        { status: 'processing', progress: 70 },
        { status: 'completed', progress: 100 },
      ]);

      const controller = new AbortController();
      
      // Abort after first poll
      setTimeout(() => controller.abort(), 50);

      await expect(
        pollUntilComplete('test-job-id', 'https://blackbox.test', {
          fetch: mockFetch,
          intervalMs: 100,
          abortSignal: controller.signal,
        })
      ).rejects.toThrow('aborted');
    });
  });

  describe('Job Status Transitions', () => {
    it('should handle pending -> processing -> completed', async () => {
      const transitions: JobStatus[] = [];
      const mockFetch = createMockFetch([
        { status: 'pending', progress: 0 },
        { status: 'processing', progress: 50 },
        { status: 'completed', progress: 100 },
      ]);

      await pollUntilComplete('test-job-id', 'https://blackbox.test', {
        fetch: mockFetch,
        intervalMs: 10,
        onProgress: (job) => transitions.push(job.status),
      });

      expect(transitions).toEqual(['pending', 'processing', 'completed']);
    });

    it('should handle direct pending -> failed', async () => {
      const transitions: JobStatus[] = [];
      const mockFetch = createMockFetch([
        { status: 'pending', progress: 0 },
        { status: 'failed', progress: 0, error: 'Invalid file' },
      ]);

      await pollUntilComplete('test-job-id', 'https://blackbox.test', {
        fetch: mockFetch,
        intervalMs: 10,
        onProgress: (job) => transitions.push(job.status),
      });

      expect(transitions).toEqual(['pending', 'failed']);
    });
  });
});
