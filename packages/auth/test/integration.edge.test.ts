import { APIGatewayProxyEvent } from 'aws-lambda';

// Import handlers after mocks are set up
import { callbackHandler, STATE_COOKIE_NAME } from '../src/handler';
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

  describe('callbackHandler - Error Handling', () => {
    it('should redirect to home when state mismatch', async () => {
      const { encodedCookie } = createValidState();

      const event = createCallbackEvent('code', 'wrong-state', encodedCookie);
      const result = await callbackHandler(event);

      // Handler redirects to frontend with error (state mismatch)
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
