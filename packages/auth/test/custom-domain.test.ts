import { APIGatewayProxyEvent } from 'aws-lambda';

import {
  getFrontendUrl,
  getAllowedFrontendUrls,
  getCookieDomain,
  createRefreshCookie,
  createAccessTokenCookie,
  createIdTokenCookie,
  clearRefreshCookie,
} from '../src/cookies';

import {
  getRequestOrigin,
  validateCsrfOrigin,
  corsResponseHeaders,
} from '../src/middleware';

describe('custom-domain multi-origin support', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.STAGE = 'prod';
    process.env.FRONTEND_URL_PROD = 'https://hak.askend-lab.com';
    process.env.FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
    process.env.CUSTOM_FRONTEND_URL = 'https://haaldusabiline.eki.ee';
    process.env.ALLOWED_ORIGIN = 'https://hak.askend-lab.com,https://haaldusabiline.eki.ee';
  });

  afterAll(() => { process.env = originalEnv; });

  const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    httpMethod: 'POST', path: '/auth/tara/exchange-code',
    queryStringParameters: null, headers: {}, body: null,
    isBase64Encoded: false, pathParameters: null, stageVariables: null,
    requestContext: {} as unknown as APIGatewayProxyEvent['requestContext'],
    resource: '', multiValueHeaders: {}, multiValueQueryStringParameters: null,
    ...overrides,
  });

  describe('getAllowedFrontendUrls', () => {
    it('returns both primary and custom URLs when CUSTOM_FRONTEND_URL is set', () => {
      const urls = getAllowedFrontendUrls();
      expect(urls).toContain('https://hak.askend-lab.com');
      expect(urls).toContain('https://haaldusabiline.eki.ee');
    });

    it('returns only primary URL when CUSTOM_FRONTEND_URL is empty', () => {
      process.env.CUSTOM_FRONTEND_URL = '';
      const urls = getAllowedFrontendUrls();
      expect(urls).toStrictEqual(['https://hak.askend-lab.com']);
    });
  });

  describe('getFrontendUrl', () => {
    it('returns custom domain when requestOrigin matches', () => {
      expect(getFrontendUrl('https://haaldusabiline.eki.ee')).toBe('https://haaldusabiline.eki.ee');
    });

    it('returns primary domain when requestOrigin matches', () => {
      expect(getFrontendUrl('https://hak.askend-lab.com')).toBe('https://hak.askend-lab.com');
    });

    it('returns custom domain when requestOrigin is unknown', () => {
      expect(getFrontendUrl('https://evil.com')).toBe('https://haaldusabiline.eki.ee');
    });

    it('returns custom domain when requestOrigin is undefined', () => {
      expect(getFrontendUrl()).toBe('https://haaldusabiline.eki.ee');
    });
  });

  describe('getCookieDomain', () => {
    it('returns custom hostname for custom domain origin', () => {
      expect(getCookieDomain('https://haaldusabiline.eki.ee')).toBe('haaldusabiline.eki.ee');
    });

    it('returns primary hostname for primary origin', () => {
      expect(getCookieDomain('https://hak.askend-lab.com')).toBe('hak.askend-lab.com');
    });

    it('returns custom hostname when no origin (CUSTOM_FRONTEND_URL is default)', () => {
      expect(getCookieDomain()).toBe('haaldusabiline.eki.ee');
    });
  });

  describe('cookie functions with requestOrigin', () => {
    it('createRefreshCookie uses custom domain', () => {
      const cookie = createRefreshCookie('tok', 'https://haaldusabiline.eki.ee');
      expect(cookie).toContain('Domain=haaldusabiline.eki.ee');
    });

    it('createAccessTokenCookie uses custom domain', () => {
      const cookie = createAccessTokenCookie('tok', 'https://haaldusabiline.eki.ee');
      expect(cookie).toContain('Domain=haaldusabiline.eki.ee');
    });

    it('createIdTokenCookie uses custom domain', () => {
      const cookie = createIdTokenCookie('tok', 'https://haaldusabiline.eki.ee');
      expect(cookie).toContain('Domain=haaldusabiline.eki.ee');
    });

    it('clearRefreshCookie uses custom domain', () => {
      const cookie = clearRefreshCookie('https://haaldusabiline.eki.ee');
      expect(cookie).toContain('Domain=haaldusabiline.eki.ee');
    });
  });

  describe('getRequestOrigin', () => {
    it('extracts Origin header', () => {
      const event = makeEvent({ headers: { Origin: 'https://haaldusabiline.eki.ee' } });
      expect(getRequestOrigin(event)).toBe('https://haaldusabiline.eki.ee');
    });

    it('extracts lowercase origin header', () => {
      const event = makeEvent({ headers: { origin: 'https://haaldusabiline.eki.ee' } });
      expect(getRequestOrigin(event)).toBe('https://haaldusabiline.eki.ee');
    });

    it('returns undefined when no Origin header', () => {
      const event = makeEvent({ headers: {} });
      expect(getRequestOrigin(event)).toBeUndefined();
    });
  });

  describe('validateCsrfOrigin', () => {
    it('accepts primary origin', () => {
      const event = makeEvent({ headers: { Origin: 'https://hak.askend-lab.com' } });
      expect(validateCsrfOrigin(event)).toBe(true);
    });

    it('accepts custom domain origin', () => {
      const event = makeEvent({ headers: { Origin: 'https://haaldusabiline.eki.ee' } });
      expect(validateCsrfOrigin(event)).toBe(true);
    });

    it('rejects unknown origin', () => {
      const event = makeEvent({ headers: { Origin: 'https://evil.com' } });
      expect(validateCsrfOrigin(event)).toBe(false);
    });

    it('rejects missing origin', () => {
      const event = makeEvent({ headers: {} });
      expect(validateCsrfOrigin(event)).toBe(false);
    });
  });

  describe('corsResponseHeaders', () => {
    it('reflects custom domain origin in CORS header', () => {
      const headers = corsResponseHeaders('https://haaldusabiline.eki.ee');
      expect(headers['Access-Control-Allow-Origin']).toBe('https://haaldusabiline.eki.ee');
    });

    it('reflects primary origin in CORS header', () => {
      const headers = corsResponseHeaders('https://hak.askend-lab.com');
      expect(headers['Access-Control-Allow-Origin']).toBe('https://hak.askend-lab.com');
    });

    it('returns first origin when requestOrigin not provided', () => {
      const headers = corsResponseHeaders();
      expect(headers['Access-Control-Allow-Origin']).toBe('https://hak.askend-lab.com');
    });

    it('includes Allow-Credentials header', () => {
      const headers = corsResponseHeaders('https://haaldusabiline.eki.ee');
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
  });
});
