import { APIGatewayProxyEvent } from 'aws-lambda';

import { callbackHandler, startHandler } from '../src/handler';

// Mock dependencies
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

/**
 * Mutation-killing tests for handler.ts
 * Targets: string literals, conditional expressions, cookie values, redirect URLs,
 * arithmetic operators, block statements
 */
describe("handler.mutations.test", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.STAGE = 'dev';
    process.env.FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
    process.env.FRONTEND_URL_PROD = 'https://hak.askend-lab.com';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const makeEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    httpMethod: 'GET',
    path: '/auth/tara/callback',
    queryStringParameters: null,
    headers: {},
    body: null,
    isBase64Encoded: false,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as unknown as APIGatewayProxyEvent['requestContext'],
    resource: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    ...overrides,
  });

  const makeStateCookie = (state: Record<string, unknown>): string => {
    return Buffer.from(JSON.stringify(state)).toString('base64url');
  };

  // --- getFrontendUrl mutations ---

  describe('getFrontendUrl', () => {
    it('should use prod URL when STAGE=prod', async () => {
      process.env.STAGE = 'prod';
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');

      const result = await startHandler(makeEvent());
      // startHandler creates state with redirectUri = getFrontendUrl()
      // The cookie contains the state with redirectUri
      const cookie = result.headers?.['Set-Cookie'] as string;
      const encoded = cookie.split('=')[1].split(';')[0];
      const state = JSON.parse(Buffer.from(encoded, 'base64url').toString());
      expect(state.redirectUri).toBe('https://hak.askend-lab.com');
    });

    it('should use dev URL when STAGE=dev', async () => {
      process.env.STAGE = 'dev';
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');

      const result = await startHandler(makeEvent());
      const cookie = result.headers?.['Set-Cookie'] as string;
      const encoded = cookie.split('=')[1].split(';')[0];
      const state = JSON.parse(Buffer.from(encoded, 'base64url').toString());
      expect(state.redirectUri).toBe('https://hak-dev.askend-lab.com');
    });

    it('should default to dev when STAGE is not set', async () => {
      delete process.env.STAGE;
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');

      const result = await startHandler(makeEvent());
      const cookie = result.headers?.['Set-Cookie'] as string;
      const encoded = cookie.split('=')[1].split(';')[0];
      const state = JSON.parse(Buffer.from(encoded, 'base64url').toString());
      expect(state.redirectUri).toBe('https://hak-dev.askend-lab.com');
    });
  });

  describe('startHandler mutations', () => {
    it('should return 302 status code', async () => {
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');
      const result = await startHandler(makeEvent());
      expect(result.statusCode).toBe(302);
    });

    it('should set Location header to auth URL', async () => {
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/oidc/authorize?x=1');
      const result = await startHandler(makeEvent());
      expect(result.headers?.Location).toBe('https://tara.ee/oidc/authorize?x=1');
    });

    it('should set Cache-Control to no-store', async () => {
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');
      const result = await startHandler(makeEvent());
      expect(result.headers?.['Cache-Control']).toBe('no-store');
    });

    it('should set HttpOnly Secure SameSite=Lax cookie', async () => {
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');
      const result = await startHandler(makeEvent());
      const cookie = result.headers?.['Set-Cookie'] as string;
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Max-Age=600');
      expect(cookie).toContain('Path=/');
    });

    it('should have empty body', async () => {
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');
      const result = await startHandler(makeEvent());
      expect(result.body).toBe('');
    });

    it('should pass state and nonce to buildAuthorizationUrl', async () => {
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');
      await startHandler(makeEvent());
      expect(mockBuildAuthorizationUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
      const [state, nonce] = mockBuildAuthorizationUrl.mock.calls[0];
      expect(state.length).toBeGreaterThan(10);
      expect(nonce.length).toBeGreaterThan(10);
      expect(state).not.toBe(nonce);
    });

    it('should include state and nonce in cookie', async () => {
      mockBuildAuthorizationUrl.mockReturnValue('https://tara.ee/auth');
      const result = await startHandler(makeEvent());
      const cookie = result.headers?.['Set-Cookie'] as string;
      const encoded = cookie.split('=')[1].split(';')[0];
      const stateObj = JSON.parse(Buffer.from(encoded, 'base64url').toString());
      expect(stateObj.state).toBeTruthy();
      expect(stateObj.nonce).toBeTruthy();
      expect(stateObj.createdAt).toBeTruthy();
      expect(stateObj.redirectUri).toBeTruthy();
    });
  });

  describe('parseStateCookie mutations', () => {
    it('should handle cookie header with no tara_auth_state', async () => {
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: 'other_cookie=val' },
      });
      const result = await callbackHandler(event);
      expect(result.statusCode).toBe(302);
      expect(result.headers?.Location).toContain('error=');
    });

    it('should handle cookie header with semicolons correctly', async () => {
      const validState = { state: 'test-s', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const encoded = makeStateCookie(validState);
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 'test-s' },
        headers: { Cookie: `other=x; tara_auth_state=${encoded}; another=y` },
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
