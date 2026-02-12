import { APIGatewayProxyEvent } from 'aws-lambda';
import { callbackHandler, startHandler } from '../src/handler';

// Mock dependencies
jest.mock('../src/tara-client', () => ({
  createTaraClient: jest.fn().mockResolvedValue({
    exchangeCodeForTokens: jest.fn().mockResolvedValue({
      id_token: 'test-tara-id-token',
      access_token: 'test-tara-access-token',
    }),
    verifyIdToken: jest.fn().mockResolvedValue({
      sub: 'EE38001085718',
      email: 'test@example.com',
      given_name: 'Test',
      family_name: 'User',
      iss: 'https://tara-test.ria.ee',
      aud: 'test-client',
      exp: Date.now() / 1000 + 3600,
      iat: Date.now() / 1000,
      nonce: 'test-nonce',
      amr: ['smartid'],
      acr: 'high',
    }),
  }),
}));

jest.mock('../src/cognito-client', () => ({
  createCognitoClient: jest.fn().mockReturnValue({
    findOrCreateUser: jest.fn().mockResolvedValue('test@example.com'),
    generateTokens: jest.fn().mockResolvedValue({
      accessToken: 'cognito-access-token',
      idToken: 'cognito-id-token',
      refreshToken: 'cognito-refresh-token',
      expiresIn: 3600,
    }),
  }),
}));

describe('callbackHandler - HttpOnly Cookie Delivery', () => {
  const validState = {
    state: 'test-state',
    nonce: 'test-nonce',
    redirectUri: 'https://hak-dev.askend-lab.com',
    createdAt: Date.now(),
  };
  const encodedState = Buffer.from(JSON.stringify(validState)).toString('base64url');

  const createEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => ({
    httpMethod: 'GET',
    path: '/auth/tara/callback',
    queryStringParameters: {
      code: 'test-auth-code',
      state: 'test-state',
    },
    headers: {
      Cookie: `tara_auth_state=${encodedState}`,
    },
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

  beforeEach(() => {
    process.env.STAGE = 'dev';
    process.env.FRONTEND_URL_DEV = 'https://hak-dev.askend-lab.com';
  });

  it('should return tokens in HttpOnly cookies, not in URL', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    // Should redirect to frontend
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toBeDefined();

    // Tokens should NOT be in URL params
    const locationUrl = new URL(String(result.headers?.Location ?? ''));
    expect(locationUrl.searchParams.get('access_token')).toBeNull();
    expect(locationUrl.searchParams.get('id_token')).toBeNull();
    expect(locationUrl.searchParams.get('refresh_token')).toBeNull();
  });

  it('should set access_token as HttpOnly Secure cookie', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
    const accessTokenCookie = cookies.find(c => c.startsWith('access_token='));

    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie).toContain('HttpOnly');
    expect(accessTokenCookie).toContain('Secure');
    expect(accessTokenCookie).toContain('SameSite=Strict');
  });

  it('should set id_token as HttpOnly Secure cookie', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
    const idTokenCookie = cookies.find(c => c.startsWith('id_token='));

    expect(idTokenCookie).toBeDefined();
    expect(idTokenCookie).toContain('HttpOnly');
    expect(idTokenCookie).toContain('Secure');
  });

  it('should set refresh_token as HttpOnly Secure cookie', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
    const refreshTokenCookie = cookies.find(c => c.startsWith('refresh_token='));

    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain('HttpOnly');
    expect(refreshTokenCookie).toContain('Secure');
  });

  it('should set is_authenticated cookie (not HttpOnly) for frontend', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
    const authCookie = cookies.find(c => c.startsWith('is_authenticated='));

    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('is_authenticated=true');
    // This cookie should NOT be HttpOnly so JS can read it
    expect(authCookie).not.toContain('HttpOnly');
  });

  it('should redirect with error when TARA returns error param', async () => {
    const event = createEvent({
      queryStringParameters: { error: 'access_denied', error_description: 'User cancelled' },
      headers: { Cookie: `tara_auth_state=${encodedState}` },
    });
    const result = await callbackHandler(event);
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toContain('error=User+cancelled');
  });

  it('should redirect with error when code is missing', async () => {
    const event = createEvent({
      queryStringParameters: { state: 'test-state' },
      headers: { Cookie: `tara_auth_state=${encodedState}` },
    });
    const result = await callbackHandler(event);
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toContain('error=Missing+code+or+state');
  });

  it('should redirect with error when no cookie/session', async () => {
    const event = createEvent({
      headers: {},
    });
    const result = await callbackHandler(event);
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toContain('error=Invalid+session');
  });

  it('should redirect with error on state mismatch', async () => {
    const event = createEvent({
      queryStringParameters: { code: 'test-code', state: 'wrong-state' },
    });
    const result = await callbackHandler(event);
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toContain('error=State+mismatch');
  });

  it('should redirect with error on expired session', async () => {
    const expiredState = {
      state: 'test-state',
      nonce: 'test-nonce',
      redirectUri: 'https://hak-dev.askend-lab.com',
      createdAt: Date.now() - 15 * 60 * 1000, // 15 min ago
    };
    const expiredEncoded = Buffer.from(JSON.stringify(expiredState)).toString('base64url');
    const event = createEvent({
      headers: { Cookie: `tara_auth_state=${expiredEncoded}` },
    });
    const result = await callbackHandler(event);
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toContain('error=Session+expired');
  });

  it('should handle malformed state cookie gracefully', async () => {
    const event = createEvent({
      headers: { Cookie: 'tara_auth_state=not-valid-base64!!!' },
    });
    const result = await callbackHandler(event);
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toContain('error=');
  });
});

describe('startHandler', () => {
  beforeEach(() => {
    process.env.STAGE = 'dev';
  });

  it('should redirect to TARA with state cookie', async () => {
    const { createTaraClient } = require('../src/tara-client');
    createTaraClient.mockResolvedValueOnce({
      buildAuthorizationUrl: jest.fn().mockReturnValue('https://tara-test.ria.ee/authorize?state=x'),
      exchangeCodeForTokens: jest.fn(),
      verifyIdToken: jest.fn(),
    });

    const event = {
      httpMethod: 'GET',
      path: '/auth/tara/start',
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
    } as APIGatewayProxyEvent;

    const result = await startHandler(event);
    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toBeDefined();
    expect(result.headers?.['Set-Cookie']).toContain('tara_auth_state=');
    expect(result.headers?.['Cache-Control']).toBe('no-store');
  });

  it('should return 500 when createTaraClient fails', async () => {
    const { createTaraClient } = require('../src/tara-client');
    createTaraClient.mockRejectedValueOnce(new Error('TARA config error'));

    const event = {
      httpMethod: 'GET',
      path: '/auth/tara/start',
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
    } as APIGatewayProxyEvent;

    const result = await startHandler(event);
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('Failed to start TARA authentication');
  });
});
