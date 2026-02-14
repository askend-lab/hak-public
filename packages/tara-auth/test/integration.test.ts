import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock TARA client - factory avoids loading real module (no TDZ references)
jest.mock('../src/tara-client', () => ({
  createTaraClient: jest.fn(),
}));

// Mock Cognito client
jest.mock('../src/cognito-client', () => ({
  createCognitoClient: jest.fn(),
}));

// Import handlers after mocks are set up
import { callbackHandler, startHandler, STATE_COOKIE_NAME, AUTH_CALLBACK_PATH } from '../src/handler';
import { createTaraClient } from '../src/tara-client';
import { createCognitoClient } from '../src/cognito-client';

const mockBuildAuthorizationUrl = jest.fn();
const mockExchangeCodeForTokens = jest.fn();
const mockVerifyIdToken = jest.fn();

const mockFindOrCreateUser = jest.fn();
const mockGenerateTokens = jest.fn();

describe('TARA Custom Auth Integration Tests', () => {
  const TARA_ISSUER = 'https://tara-test.ria.ee';
  const FRONTEND_URL = 'https://hak-dev.askend-lab.com';

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.TARA_ISSUER = TARA_ISSUER;
    process.env.FRONTEND_URL_DEV = FRONTEND_URL;
    process.env.STAGE = 'dev';

    // Configure TARA client mock
    (createTaraClient as jest.Mock).mockResolvedValue({
      buildAuthorizationUrl: mockBuildAuthorizationUrl,
      exchangeCodeForTokens: mockExchangeCodeForTokens,
      verifyIdToken: mockVerifyIdToken,
    });

    // Configure Cognito client mock
    (createCognitoClient as jest.Mock).mockReturnValue({
      findOrCreateUser: mockFindOrCreateUser,
      generateTokens: mockGenerateTokens,
    });

    // Default mock implementations
    mockBuildAuthorizationUrl.mockReturnValue(
      `${TARA_ISSUER}/oidc/authorize?response_type=code&scope=openid&state=test`
    );
  });

  const createCallbackEvent = (code: string, state: string, stateCookie: string): APIGatewayProxyEvent => ({
    httpMethod: 'GET',
    path: '/auth/tara/callback',
    queryStringParameters: { code, state },
    headers: { Cookie: `${STATE_COOKIE_NAME}=${stateCookie}` },
    body: null,
    isBase64Encoded: false,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as unknown as APIGatewayProxyEvent['requestContext'],
    resource: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
  });

  const createValidState = (): { stateValue: string; nonce: string; encodedCookie: string } => {
    const state = {
      state: 'random-state-value',
      nonce: 'random-nonce-value',
      redirectUri: FRONTEND_URL,
      createdAt: Date.now(),
    };
    return {
      stateValue: state.state,
      nonce: state.nonce,
      encodedCookie: Buffer.from(JSON.stringify(state)).toString('base64url'),
    };
  };

  describe('startHandler', () => {
    it('should redirect to TARA authorization endpoint', async () => {
      const event: APIGatewayProxyEvent = {
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
      };

      const result = await startHandler(event);

      expect(result.statusCode).toBe(302);
      expect(result.headers?.Location).toContain(TARA_ISSUER);
      expect(result.headers?.Location).toContain('/oidc/authorize');
      expect(result.headers?.Location).toContain('response_type=code');
      expect(result.headers?.Location).toContain('scope=openid');
    });

    it('should set state cookie for CSRF protection', async () => {
      const event: APIGatewayProxyEvent = {
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
      };

      const result = await startHandler(event);

      // State cookie is set in headers, not multiValueHeaders
      expect(result.headers?.['Set-Cookie']).toBeDefined();
      expect(result.headers?.['Set-Cookie']).toContain(`${STATE_COOKIE_NAME}=`);
      expect(result.headers?.['Set-Cookie']).toContain('HttpOnly');
      expect(result.headers?.['Set-Cookie']).toContain('Secure');
    });
  });

  describe('callbackHandler - Full Flow', () => {
    const setupSuccessfulMocks = (nonce: string): void => {
      mockExchangeCodeForTokens.mockResolvedValue({
        access_token: 'tara-access-token',
        id_token: 'tara-id-token',
      });
      mockVerifyIdToken.mockResolvedValue({
        sub: 'EE38001085718',
        given_name: 'Mari-Liis',
        family_name: 'Männik',
        email: 'test@example.ee',
        iss: TARA_ISSUER,
        aud: 'test-client',
        nonce,
        amr: ['smartid'],
        acr: 'high',
      });
      mockFindOrCreateUser.mockResolvedValue('test@example.ee');
      mockGenerateTokens.mockResolvedValue({
        accessToken: 'cognito-access-token',
        idToken: 'cognito-id-token',
        refreshToken: 'cognito-refresh-token',
        expiresIn: 3600,
      });
    };

    it('should redirect to frontend callback path on success', async () => {
      const { stateValue, nonce, encodedCookie } = createValidState();
      setupSuccessfulMocks(nonce);

      const event = createCallbackEvent('auth-code-123', stateValue, encodedCookie);
      const result = await callbackHandler(event);

      expect(result.statusCode).toBe(302);
      const url = new URL(String(result.headers?.Location));
      expect(url.pathname).toBe(AUTH_CALLBACK_PATH);
      expect(url.origin).toBe(FRONTEND_URL);
    });

    it('should pass tokens in URL params and set refresh cookie', async () => {
      const { stateValue, nonce, encodedCookie } = createValidState();
      setupSuccessfulMocks(nonce);

      const event = createCallbackEvent('auth-code-123', stateValue, encodedCookie);
      const result = await callbackHandler(event);

      // Tokens in URL
      const url = new URL(String(result.headers?.Location));
      expect(url.searchParams.get('access_token')).toBe('cognito-access-token');
      expect(url.searchParams.get('id_token')).toBe('cognito-id-token');

      // Only refresh token in httpOnly cookie
      const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
      const refreshCookie = cookies.find(c => c.startsWith('hak_refresh_token='));
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('Secure');

      // No access/id cookies
      expect(cookies.find(c => c.startsWith('access_token='))).toBeUndefined();
      expect(cookies.find(c => c.startsWith('is_authenticated='))).toBeUndefined();
    });

    it('should call TARA and Cognito with correct parameters', async () => {
      const { stateValue, nonce, encodedCookie } = createValidState();
      setupSuccessfulMocks(nonce);

      const event = createCallbackEvent('auth-code-123', stateValue, encodedCookie);
      await callbackHandler(event);

      expect(mockExchangeCodeForTokens).toHaveBeenCalledWith('auth-code-123');
      expect(mockVerifyIdToken).toHaveBeenCalledWith('tara-id-token', nonce);
      expect(mockFindOrCreateUser).toHaveBeenCalled();
      expect(mockGenerateTokens).toHaveBeenCalledWith('test@example.ee');
    });

    it('should handle new user creation flow', async () => {
      const { stateValue, nonce, encodedCookie } = createValidState();

      mockExchangeCodeForTokens.mockResolvedValue({
        access_token: 'tara-access-token',
        id_token: 'tara-id-token',
      });

      mockVerifyIdToken.mockResolvedValue({
        sub: 'EE38001085718',
        email: 'newuser@example.ee',
        iss: TARA_ISSUER,
        aud: 'test-client',
        nonce,
        amr: ['smartid'],
        acr: 'high',
      });

      mockFindOrCreateUser.mockResolvedValue('newuser@example.ee');
      mockGenerateTokens.mockResolvedValue({
        accessToken: 'cognito-access-token',
        idToken: 'cognito-id-token',
        refreshToken: 'cognito-refresh-token',
        expiresIn: 3600,
      });

      const event = createCallbackEvent('auth-code-new', stateValue, encodedCookie);
      const result = await callbackHandler(event);

      expect(result.statusCode).toBe(302);
      expect(mockFindOrCreateUser).toHaveBeenCalled();
    });
  });

  describe('callbackHandler - Error Handling', () => {
    it('should redirect with error when state mismatch', async () => {
      const { encodedCookie } = createValidState();

      const event = createCallbackEvent('code', 'wrong-state', encodedCookie);
      const result = await callbackHandler(event);

      // Handler redirects to frontend with error
      expect(result.statusCode).toBe(302);
      expect(result.headers?.Location).toContain('error=');
    });

    it('should redirect with error when TARA token exchange fails', async () => {
      const { stateValue, encodedCookie } = createValidState();

      mockExchangeCodeForTokens.mockRejectedValue(new Error('Token exchange failed'));

      const event = createCallbackEvent('invalid-code', stateValue, encodedCookie);
      const result = await callbackHandler(event);

      expect(result.statusCode).toBe(302);
      expect(result.headers?.Location).toContain('error=');
    });

    it('should redirect with error when Cognito fails', async () => {
      const { stateValue, nonce, encodedCookie } = createValidState();

      mockExchangeCodeForTokens.mockResolvedValue({
        access_token: 'tara-access-token',
        id_token: 'tara-id-token',
      });

      mockVerifyIdToken.mockResolvedValue({
        sub: 'EE38001085718',
        email: 'test@example.ee',
        iss: TARA_ISSUER,
        aud: 'test-client',
        nonce,
        amr: ['smartid'],
        acr: 'high',
      });

      mockFindOrCreateUser.mockRejectedValue(new Error('Cognito error'));

      const event = createCallbackEvent('code', stateValue, encodedCookie);
      const result = await callbackHandler(event);

      expect(result.statusCode).toBe(302);
      expect(result.headers?.Location).toContain('error=');
    });
  });
});
