/**
 * Retry Service - Implements exponential backoff retry logic
 * Used for resilient API calls to Gemini, GraphHopper, and other external services
 *
 * Features:
 * - Exponential backoff: wait = baseDelay * (multiplier ^ attempt)
 * - Jitter to prevent thundering herd: adds random noise
 * - Max retries and max delay limits
 * - Configurable retry conditions
 * - Detailed logging
 */

interface RetryOptions {
  maxRetries?: number; // Default: 3
  baseDelayMs?: number; // Default: 1000ms (1 second)
  maxDelayMs?: number; // Default: 32000ms (32 seconds)
  multiplier?: number; // Default: 2 (exponential)
  jitterFactor?: number; // Default: 0.1 (10% jitter)
  onRetry?: (attempt: number, delay: number, error: any) => void; // Callback for logging
  shouldRetry?: (error: any, attempt: number) => boolean; // Custom retry condition
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 32000,
  multiplier: 2,
  jitterFactor: 0.1,
};

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  options: RetryOptions
): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const exponentialDelay = opts.baseDelayMs! * Math.pow(opts.multiplier!, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, opts.maxDelayMs!);
  const jitter = cappedDelay * opts.jitterFactor! * Math.random();
  return Math.floor(cappedDelay + jitter);
}

/**
 * Check if error is retryable (default: network errors, 5xx status codes)
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error?.message?.includes("Network") || error?.message?.includes("network")) {
    return true;
  }

  // Timeout errors
  if (error?.message?.includes("timeout") || error?.message?.includes("TIMEOUT")) {
    return true;
  }

  // 5xx server errors (but not 429 - we treat that separately)
  if (error?.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // 429 Too Many Requests (rate limiting)
  if (error?.status === 429) {
    return true;
  }

  // Connection refused, not found errors
  if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND") {
    return true;
  }

  return false;
}

/**
 * Retry async function with exponential backoff
 * @example
 * const data = await withRetry(
 *   () => fetchDataFromAPI(),
 *   { maxRetries: 5, baseDelayMs: 500 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxRetries! + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const customShouldRetry = opts.shouldRetry?.(error, attempt) ?? true;
      const isRetryable = customShouldRetry && isRetryableError(error);

      if (isRetryable && attempt <= opts.maxRetries!) {
        const delay = calculateDelay(attempt, opts);

        // Log retry attempt
        if (opts.onRetry) {
          opts.onRetry(attempt, delay, error);
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else if (attempt <= opts.maxRetries!) {
        // Not retryable, fail immediately
        throw error;
      }
    }
  }

  throw lastError;
}

/**
 * Retry sync function with exponential backoff (no delays)
 * Useful for quick retries of operations that don't involve I/O
 */
export function withSyncRetry<T>(
  fn: () => T,
  options: Omit<RetryOptions, "baseDelayMs"> & { maxRetries?: number } = {}
): T {
  const { maxRetries = 3, shouldRetry } = options;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;

      const customShouldRetry = shouldRetry?.(error, attempt) ?? true;
      if (!customShouldRetry || attempt > maxRetries) {
        throw error;
      }
    }
  }

  throw lastError;
}

/**
 * Retry with simple linear backoff (no exponential growth)
 * Useful for rate-limited APIs where consistent delays are preferred
 */
export async function withLinearRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions & { delayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, onRetry, shouldRetry } = options;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const customShouldRetry = shouldRetry?.(error, attempt) ?? true;
      const isRetryable = customShouldRetry && isRetryableError(error);

      if (isRetryable && attempt <= maxRetries) {
        if (onRetry) {
          onRetry(attempt, delayMs, error);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else if (attempt <= maxRetries) {
        throw error;
      }
    }
  }

  throw lastError;
}

/**
 * Helper to create a retry wrapper for a specific function
 * @example
 * const fetchWithRetry = createRetryWrapper(fetch, { maxRetries: 5 });
 * const response = await fetchWithRetry(url);
 */
export function createRetryWrapper<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    return withRetry(() => fn(...args), options);
  };
}

export const retryService = {
  withRetry,
  withSyncRetry,
  withLinearRetry,
  createRetryWrapper,
  isRetryableError,
  calculateDelay,
};
