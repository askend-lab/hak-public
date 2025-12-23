export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delayMs: 1000,
  backoff: true,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, delayMs, backoff } = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop -- sequential retry required
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delay = backoff ? delayMs * (attempt + 1) : delayMs;
        // eslint-disable-next-line no-await-in-loop -- sequential delay required
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

export function sleep(ms: number): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return -- setTimeout return value intentionally ignored
  return new Promise((resolve) => setTimeout(resolve, ms));
}
