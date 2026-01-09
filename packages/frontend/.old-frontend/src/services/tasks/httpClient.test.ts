import { describe, it, expect, vi, beforeEach } from 'vitest';

import { setAuthTokenGetter, apiRequest, unwrapResponse } from './httpClient';

vi.mock('../config', () => ({
  API_CONFIG: { baseUrl: 'http://test-api.com' },
}));

describe('httpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthTokenGetter(null as unknown as () => string | null);
  });

  describe('setAuthTokenGetter', () => {
    it('sets the auth token getter function', () => {
      const getter = vi.fn().mockReturnValue('test-token');
      setAuthTokenGetter(getter);
      // Token getter is used internally, verify it's set by making a request
      expect(getter).not.toHaveBeenCalled(); // Not called until request
    });
  });

  describe('apiRequest', () => {
    it('makes request with correct headers', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      await apiRequest('/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('includes auth token when available', async () => {
      setAuthTokenGetter(() => 'my-token');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      await apiRequest('/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        })
      );
    });

    it('does not include auth header when token is null', async () => {
      setAuthTokenGetter(() => null);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      await apiRequest('/test');

      const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs?.[1]?.headers).not.toHaveProperty('Authorization');
    });

    it('does not include auth header when token is empty string', async () => {
      setAuthTokenGetter(() => '');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      await apiRequest('/test');

      const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs?.[1]?.headers).not.toHaveProperty('Authorization');
    });

    it('returns error when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await apiRequest('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('returns data when response is ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: 'success' }),
      });

      const result = await apiRequest<{ value: string }>('/test');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ value: 'success' });
    });
  });

  describe('unwrapResponse', () => {
    it('returns response if successful with data', () => {
      const response = { success: true as const, data: { test: 'value' } };
      const result = unwrapResponse(response);
      expect(result).toEqual(response);
    });

    it('returns error if not successful', () => {
      const response = { success: false as const, error: 'Test error' };
      const result = unwrapResponse(response);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('returns unknown error if no error message', () => {
      const response = { success: false as const };
      const result = unwrapResponse(response);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('returns error if data is undefined', () => {
      const response = { success: true as const, data: undefined };
      const result = unwrapResponse(response);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });
});
