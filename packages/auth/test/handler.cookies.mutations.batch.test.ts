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

describe("handler.cookies.mutations.test", () => {
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
