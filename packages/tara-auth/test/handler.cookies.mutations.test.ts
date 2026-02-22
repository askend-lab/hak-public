import { APIGatewayProxyEvent } from 'aws-lambda';

import { callbackHandler } from '../src/handler';

const mockBuildAuthorizationUrl = jest.fn();
const mockExchangeCodeForTokens = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockFindOrCreateUser = jest.fn();
const mockGenerateTokens = jest.fn();

jest.mock('../src/tara-client', () => ({
  createTaraClient: jest.fn().mockResolvedValue({
    buildAuthorizationUrl: (...args: unknown[]) => mockBuildAuthorizationUrl(...args),
    exchangeCodeForTokens: (...args: unknown[]) => mockExchangeCodeForTokens(...args),
    verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
  }),
}));

jest.mock('../src/cognito-client', () => ({
  createCognitoClient: jest.fn().mockReturnValue({
    findOrCreateUser: (...args: unknown[]) => mockFindOrCreateUser(...args),
    generateTokens: (...args: unknown[]) => mockGenerateTokens(...args),
  }),
}));

describe('handler.ts cookie mutation kills', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.STAGE = 'dev';
    process.env.FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
  });

  afterAll(() => { process.env = originalEnv; });

  const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    httpMethod: 'GET', path: '/auth/tara/callback', queryStringParameters: null,
    headers: {}, body: null, isBase64Encoded: false, pathParameters: null,
    stageVariables: null, requestContext: {} as unknown as APIGatewayProxyEvent['requestContext'],
    resource: '', multiValueHeaders: {}, multiValueQueryStringParameters: null,
    ...overrides,
  });

  const makeStateCookie = (state: Record<string, unknown>): string =>
    Buffer.from(JSON.stringify(state)).toString('base64url');

  const setupSuccessFlow = () => {
    const validState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
    mockExchangeCodeForTokens.mockResolvedValue({ id_token: 'id', access_token: 'at' });
    mockVerifyIdToken.mockResolvedValue({ sub: 'EE123', nonce: 'n' });
    mockFindOrCreateUser.mockResolvedValue('u@e.com');
    mockGenerateTokens.mockResolvedValue({ accessToken: 'acc-tok', idToken: 'id-tok', refreshToken: 'ref-tok', expiresIn: 7200 });
    return makeEvent({
      queryStringParameters: { code: 'c', state: 's' },
      headers: { Cookie: `tara_auth_state=${makeStateCookie(validState)}` },
    });
  };

  describe('redirectToFrontendWithCookies', () => {
    it('should set access_token and id_token as Secure cookies, not URL params', async () => {
      const event = setupSuccessFlow();
      const result = await callbackHandler(event);
      const url = new URL(String(result.headers?.Location));
      expect(url.searchParams.get('access_token')).toBeNull();
      expect(url.searchParams.get('id_token')).toBeNull();
      expect(url.searchParams.get('auth')).toBe('success');
      const cookies = result.multiValueHeaders?.['Set-Cookie'] as string[];
      const accessCookie = cookies.find(x => x.startsWith('hak_access_token='));
      const idCookie = cookies.find(x => x.startsWith('hak_id_token='));
      expect(accessCookie).toContain('Secure');
      expect(accessCookie).toContain('SameSite=Lax');
      expect(accessCookie).not.toContain('HttpOnly');
      expect(idCookie).toContain('Secure');
      expect(idCookie).not.toContain('HttpOnly');
    });

    it('should set hak_refresh_token cookie with 30-day max-age', async () => {
      const event = setupSuccessFlow();
      const result = await callbackHandler(event);
      const cookies = result.multiValueHeaders?.['Set-Cookie'] as string[];
      const c = cookies.find(x => x.startsWith('hak_refresh_token='));
      expect(c).toContain('ref-tok');
      expect(c).toContain('Max-Age=2592000');
      expect(c).toContain('HttpOnly');
      expect(c).toContain('Secure');
      expect(c).toContain('SameSite=Lax');
    });

    it('should NOT set is_authenticated cookie or bare access_token/id_token cookies', async () => {
      const event = setupSuccessFlow();
      const result = await callbackHandler(event);
      const cookies = result.multiValueHeaders?.['Set-Cookie'] as string[];
      expect(cookies.find(x => x.startsWith('is_authenticated='))).toBeUndefined();
      expect(cookies.find(x => x.startsWith('access_token='))).toBeUndefined();
      expect(cookies.find(x => x.startsWith('id_token='))).toBeUndefined();
    });

    it('should clear state cookie in success cookies', async () => {
      const event = setupSuccessFlow();
      const result = await callbackHandler(event);
      const cookies = result.multiValueHeaders?.['Set-Cookie'] as string[];
      const c = cookies.find(x => x.includes('tara_auth_state='));
      expect(c).toContain('Max-Age=0');
    });

    it('should have 4 cookies total (refresh + access + id + clear state)', async () => {
      const event = setupSuccessFlow();
      const result = await callbackHandler(event);
      const cookies = result.multiValueHeaders?.['Set-Cookie'] as string[];
      expect(cookies).toHaveLength(4);
    });

    it('should set no-store cache control', async () => {
      const event = setupSuccessFlow();
      const result = await callbackHandler(event);
      expect(result.headers?.['Cache-Control']).toBe('no-store');
    });

    it('should redirect to /auth/callback with token params', async () => {
      const event = setupSuccessFlow();
      const result = await callbackHandler(event);
      const url = new URL(String(result.headers?.Location));
      expect(url.pathname).toBe('/auth/callback');
      expect(url.origin).toBe('https://hak-dev.askend-lab.com');
    });
  });

  describe('STATE_TTL_MS boundary', () => {
    it('session at 9 minutes should be valid', async () => {
      const state = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() - 9 * 60 * 1000 };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(state)}` },
      });
      mockExchangeCodeForTokens.mockResolvedValue({ id_token: 'id', access_token: 'at' });
      mockVerifyIdToken.mockResolvedValue({ sub: 'EE123', nonce: 'n' });
      mockFindOrCreateUser.mockResolvedValue('u@e.com');
      mockGenerateTokens.mockResolvedValue({ accessToken: 'a', idToken: 'i', refreshToken: 'r', expiresIn: 3600 });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).not.toContain('error=');
    });

    it('session at 11 minutes should be expired', async () => {
      const state = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() - 11 * 60 * 1000 };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(state)}` },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('Session+expired');
    });

    it('session at exactly 10 minutes (> boundary) should still be valid', async () => {
      const NOW = 1700000000000;
      const realDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(NOW);
      const TTL = 10 * 60 * 1000;
      const state = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: NOW - TTL };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(state)}` },
      });
      mockExchangeCodeForTokens.mockResolvedValue({ id_token: 'id', access_token: 'at' });
      mockVerifyIdToken.mockResolvedValue({ sub: 'EE123', nonce: 'n' });
      mockFindOrCreateUser.mockResolvedValue('u@e.com');
      mockGenerateTokens.mockResolvedValue({ accessToken: 'a', idToken: 'i', refreshToken: 'r', expiresIn: 3600 });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).not.toContain('error=');
      Date.now = realDateNow; // eslint-disable-line require-atomic-updates -- test cleanup restores Date.now
    });

    it('session at 10min + 1ms should be expired', async () => {
      const NOW = 1700000000000;
      const realDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(NOW);
      const TTL = 10 * 60 * 1000;
      const state = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: NOW - TTL - 1 };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(state)}` },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('Session+expired');
      Date.now = realDateNow; // eslint-disable-line require-atomic-updates -- test cleanup restores Date.now
    });
  });

  describe('cookie header case', () => {
    it('should read lowercase cookie header', async () => {
      const validState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { cookie: `tara_auth_state=${makeStateCookie(validState)}` },
      });
      mockExchangeCodeForTokens.mockResolvedValue({ id_token: 'id', access_token: 'at' });
      mockVerifyIdToken.mockResolvedValue({ sub: 'EE123', nonce: 'n' });
      mockFindOrCreateUser.mockResolvedValue('u@e.com');
      mockGenerateTokens.mockResolvedValue({ accessToken: 'a', idToken: 'i', refreshToken: 'r', expiresIn: 3600 });
      const result = await callbackHandler(event);
      expect(result.statusCode).toBe(302);
      expect(result.headers?.Location).not.toContain('error=');
    });
  });
});
