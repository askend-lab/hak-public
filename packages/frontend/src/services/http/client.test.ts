import { vi } from 'vitest';
import { httpRequest, httpPost, httpGet, httpPostBlob, HttpError } from './client';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('HTTP Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HttpError', () => {
    it('should create error with status and message', () => {
      const error = new HttpError(404, 'Not found');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('HttpError');
    });
  });

  describe('httpRequest', () => {
    it('should make a request and return JSON', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await httpRequest('/api/test');
      expect(result).toStrictEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }));
    });

    it('should add query params to URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await httpRequest('/api/test', { params: { foo: 'bar', baz: '123' } });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test?foo=bar&baz=123',
        expect.any(Object)
      );
    });

    it('should throw HttpError on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(httpRequest('/api/test')).rejects.toThrow(HttpError);
    });
  });

  describe('httpPost', () => {
    it('should make POST request with body', async () => {
      const body = { name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await httpPost('/api/test', body);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }));
    });
  });

  describe('httpGet', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await httpGet('/api/items');
      expect(global.fetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({
        method: 'GET',
      }));
    });
  });

  describe('httpPostBlob', () => {
    it('should make POST request and return blob', async () => {
      const mockBlob = new Blob(['test'], { type: 'audio/wav' });
      mockFetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await httpPostBlob('/api/audio', { text: 'hello' });
      expect(result).toBe(mockBlob);
    });
  });
});
