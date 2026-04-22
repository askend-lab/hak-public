import { APIGatewayProxyEvent } from 'aws-lambda';

// Import handlers after mocks are set up
import { startHandler, STATE_COOKIE_NAME } from '../src/handler';
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

});
