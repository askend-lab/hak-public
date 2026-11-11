import { APIGatewayProxyEvent } from 'aws-lambda';

// Import handlers after mocks are set up
import { callbackHandler, STATE_COOKIE_NAME, AUTH_CALLBACK_PATH } from '../src/handler';
import { createTaraClient } from '../src/tara-client';
import { createCognitoClient } from '../src/cognito-client';

// Mock TARA client - factory avoids loading real module (no TDZ references)
jest.mock('../src/tara-client', () => ({
  createTaraClient: jest.fn(),
}));

// Mock Cognito client
jest.mock('../src/cognito-client', () => ({
  createCognitoClient: jest.fn(),
}));

const mockBuildAuthorizationUrl = jest.fn();
const mockExchangeCodeForTokens = jest.fn();
const mockVerifyIdToken = jest.fn();

const mockFindOrCreateUser = jest.fn();
const mockGenerateTokens = jest.fn();

describe("integration.test", () => {
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

    it('should not pass tokens in URL params', async () => {
      const { stateValue, nonce, encodedCookie } = createValidState();
      setupSuccessfulMocks(nonce);

      const event = createCallbackEvent('auth-code-123', stateValue, encodedCookie);
      const result = await callbackHandler(event);

      const url = new URL(String(result.headers?.Location));
      expect(url.searchParams.get('access_token')).toBeNull();
      expect(url.searchParams.get('id_token')).toBeNull();
      expect(url.searchParams.get('auth')).toBe('success');
    });

    it('should set tokens as Secure cookies with correct attributes', async () => {
      const { stateValue, nonce, encodedCookie } = createValidState();
      setupSuccessfulMocks(nonce);

      const event = createCallbackEvent('auth-code-123', stateValue, encodedCookie);
      const result = await callbackHandler(event);

      const cookies = (result.multiValueHeaders?.['Set-Cookie'] || []) as string[];
      const refreshCookie = cookies.find(c => c.startsWith('hak_refresh_token='));
      const accessCookie = cookies.find(c => c.startsWith('hak_access_token='));
      const idCookie = cookies.find(c => c.startsWith('hak_id_token='));
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('Secure');
      expect(accessCookie).toContain('cognito-access-token');
      expect(accessCookie).not.toContain('HttpOnly');
      expect(idCookie).toContain('cognito-id-token');
      expect(idCookie).not.toContain('HttpOnly');
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

});
