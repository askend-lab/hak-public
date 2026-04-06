import { APIGatewayProxyEvent } from 'aws-lambda';

import { callbackHandler } from '../src/handler';

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

  describe('callbackHandler error message mutations', () => {
    it('should include specific error_description from TARA', async () => {
      const event = makeEvent({
        queryStringParameters: { error: 'access_denied', error_description: 'User cancelled auth' },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('error=User+cancelled+auth');
    });

    it('should fall back to error code when no error_description', async () => {
      const event = makeEvent({
        queryStringParameters: { error: 'server_error' },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('error=server_error');
    });

    it('should include "Missing code or state" error text', async () => {
      const validState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const event = makeEvent({
        queryStringParameters: { state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(validState)}` },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('Missing+code+or+state');
    });

    it('should redirect to home on state mismatch', async () => {
      const validState = { state: 'correct', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 'wrong' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(validState)}` },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('error=');
    });

    it('should redirect with error on expired session', async () => {
      const expiredState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() - 11 * 60 * 1000 };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(expiredState)}` },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('error=');
    });

    it('should NOT expire session at exactly 10 minutes', async () => {
      const borderState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() - 10 * 60 * 1000 + 100 };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(borderState)}` },
      });
      mockExchangeCodeForTokens.mockResolvedValue({ id_token: 'id', access_token: 'at' });
      mockVerifyIdToken.mockResolvedValue({ sub: 'EE123', nonce: 'n' });
      mockFindOrCreateUser.mockResolvedValue('u@e.com');
      mockGenerateTokens.mockResolvedValue({ accessToken: 'a', idToken: 'i', refreshToken: 'r', expiresIn: 3600 });

      const result = await callbackHandler(event);
      expect(result.headers?.Location).not.toContain('error=');
    });

    it('should include "Authentication failed" on catch error', async () => {
      const validState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(validState)}` },
      });
      mockExchangeCodeForTokens.mockRejectedValue(new Error('fail'));
      const result = await callbackHandler(event);
      expect(result.headers?.Location).toContain('Authentication+failed');
    });

    it('should clear state cookie on catch error', async () => {
      const validState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(validState)}` },
      });
      mockExchangeCodeForTokens.mockRejectedValue(new Error('fail'));
      const result = await callbackHandler(event);
      expect(result.headers?.['Set-Cookie']).toContain('Max-Age=0');
    });
  });

  describe('redirectToFrontend mutations', () => {
    it('should redirect to /auth/callback path', async () => {
      const validState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const event = makeEvent({
        queryStringParameters: { error: 'test_error' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(validState)}` },
      });
      const result = await callbackHandler(event);
      const location = result.headers?.Location as string;
      expect(location).toContain('/auth/callback');
      expect(location).toContain('error=test_error');
    });

    it('should include Set-Cookie when provided', async () => {
      const validState = { state: 's', nonce: 'n', redirectUri: 'https://hak-dev.askend-lab.com', createdAt: Date.now() };
      const event = makeEvent({
        queryStringParameters: { code: 'c', state: 's' },
        headers: { Cookie: `tara_auth_state=${makeStateCookie(validState)}` },
      });
      mockExchangeCodeForTokens.mockRejectedValue(new Error('fail'));
      const result = await callbackHandler(event);
      // Should have Set-Cookie with clear cookie (Max-Age=0)
      expect(result.headers?.['Set-Cookie']).toBeDefined();
    });

    it('should NOT include Set-Cookie for non-catch error redirects', async () => {
      const event = makeEvent({
        queryStringParameters: { error: 'access_denied' },
      });
      const result = await callbackHandler(event);
      expect(result.headers?.['Set-Cookie']).toBeUndefined();
    });
  });

});
