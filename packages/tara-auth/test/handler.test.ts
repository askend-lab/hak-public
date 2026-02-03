import { APIGatewayProxyEvent } from 'aws-lambda';
import { callbackHandler } from '../src/handler';

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
    requestContext: {} as any,
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
    const locationUrl = new URL(result.headers!.Location as string);
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
});
