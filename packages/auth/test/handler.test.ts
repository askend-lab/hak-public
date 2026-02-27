import { APIGatewayProxyEvent } from 'aws-lambda';
import { callbackHandler, STATE_COOKIE_NAME, REFRESH_COOKIE_NAME } from '../src/handler';

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

describe("handler.test", () => {
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
      Cookie: `${STATE_COOKIE_NAME}=${encodedState}`,
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

  it('should not include tokens in URL params', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    expect(result.statusCode).toBe(302);
    expect(result.headers?.Location).toBeDefined();

    const locationUrl = new URL(String(result.headers?.Location ?? ''));
    expect(locationUrl.searchParams.get('access_token')).toBeNull();
    expect(locationUrl.searchParams.get('id_token')).toBeNull();
    expect(locationUrl.searchParams.get('auth')).toBe('success');
  });

  it('should set access/id tokens as Secure (non-HttpOnly) cookies', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
    const accessCookie = cookies.find(c => c.startsWith('hak_access_token='));
    const idCookie = cookies.find(c => c.startsWith('hak_id_token='));
    expect(accessCookie).toContain('cognito-access-token');
    expect(accessCookie).toContain('Secure');
    expect(accessCookie).not.toContain('HttpOnly');
    expect(idCookie).toContain('cognito-id-token');
    expect(idCookie).toContain('Secure');
    expect(idCookie).not.toContain('HttpOnly');
  });

  it('should set refresh_token as HttpOnly Secure cookie with domain', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
    const refreshCookie = cookies.find(c => c.startsWith(`${REFRESH_COOKIE_NAME}=`));

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('cognito-refresh-token');
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('Secure');
    expect(refreshCookie).toContain('SameSite=Lax');
    expect(refreshCookie).toContain('Domain=');
  });

  it('should NOT set bare access_token/id_token or is_authenticated cookies', async () => {
    const event = createEvent();
    const result = await callbackHandler(event);

    const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
    expect(cookies.find(c => c.startsWith('access_token='))).toBeUndefined();
    expect(cookies.find(c => c.startsWith('id_token='))).toBeUndefined();
    expect(cookies.find(c => c.startsWith('is_authenticated='))).toBeUndefined();
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
