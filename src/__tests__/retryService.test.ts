import { describe, it, expect, beforeEach } from '@jest/globals';
import { withRetry, withSyncRetry, withLinearRetry } from '../../utils/retryService';

describe('Retry Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRetry - Exponential Backoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(fn, { maxRetries: 3 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        withRetry(fn, { maxRetries: 2 })
      ).rejects.toThrow('Network error');

      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should respect shouldRetry callback', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce('success');

      const shouldRetry = (error: Error) => !error.message.includes('Not found');

      await expect(
        withRetry(fn, { maxRetries: 3, shouldRetry })
      ).rejects.toThrow('Not found');

      expect(fn).toHaveBeenCalledTimes(1); // No retry for "Not found"
    });

    it('should apply exponential backoff delay', async () => {
      jest.useFakeTimers();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce('success');

      const promise = withRetry(fn, { maxRetries: 2, initialDelayMs: 100, maxDelayMs: 1000 });

      // Fast forward time
      jest.runAllTimers();

      const result = await promise;

      expect(result).toBe('success');
      jest.useRealTimers();
    });
  });

  describe('withSyncRetry - Synchronous Retry', () => {
    it('should succeed on first attempt', () => {
      const fn = jest.fn().mockReturnValue('success');
      const result = withSyncRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', () => {
      const fn = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Error');
        })
        .mockReturnValueOnce('success');

      const result = withSyncRetry(fn, { maxRetries: 2 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries exceeded', () => {
      const fn = jest.fn().mockImplementation(() => {
        throw new Error('Persistent error');
      });

      expect(() => withSyncRetry(fn, { maxRetries: 1 })).toThrow('Persistent error');
      expect(fn).toHaveBeenCalledTimes(2); // initial + 1 retry
    });
  });

  describe('withLinearRetry - Linear Backoff', () => {
    it('should use linear delay increase', async () => {
      jest.useFakeTimers();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce('success');

      const promise = withLinearRetry(fn, { maxRetries: 3, delayMs: 100 });

      // First retry: 100ms, Second retry: 200ms
      jest.runAllTimers();

      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });
  });
});
