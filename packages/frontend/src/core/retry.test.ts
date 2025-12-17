import { withRetry, sleep } from './retry';

describe('sleep', () => {
  it('resolves after specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

describe('withRetry', () => {
  it('returns result on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3, delayMs: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3, delayMs: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries exhausted', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('persistent fail'));
    await expect(withRetry(fn, { maxRetries: 2, delayMs: 10 })).rejects.toThrow('persistent fail');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses default options', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
  });

  it('handles non-Error throws', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce('string error')
      .mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 2, delayMs: 10 });
    expect(result).toBe('success');
  });

  it('uses backoff when enabled', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    const start = Date.now();
    await withRetry(fn, { maxRetries: 3, delayMs: 20, backoff: true });
    const elapsed = Date.now() - start;
    // backoff: 20ms + 40ms = 60ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(50);
  });

  it('uses fixed delay when backoff disabled', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    const start = Date.now();
    await withRetry(fn, { maxRetries: 2, delayMs: 20, backoff: false });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(15);
  });

  it('throws fallback error when lastError is null', async () => {
    // This tests the edge case where lastError might be null
    const fn = jest.fn().mockRejectedValue(null);
    await expect(withRetry(fn, { maxRetries: 1, delayMs: 1 })).rejects.toThrow();
  });

  it('converts non-Error to Error', async () => {
    const fn = jest.fn().mockRejectedValue('string error');
    await expect(withRetry(fn, { maxRetries: 1, delayMs: 1 })).rejects.toThrow('string error');
  });
});
