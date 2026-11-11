import { APIGatewayProxyEvent } from 'aws-lambda';
import { startHandler, STATE_COOKIE_NAME } from '../src/handler';

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
    expect(result.headers?.['Set-Cookie']).toContain(`${STATE_COOKIE_NAME}=`);
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
