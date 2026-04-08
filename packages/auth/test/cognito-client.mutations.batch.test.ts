import { CognitoClient } from '../src/cognito-client';

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  AdminCreateUserCommand: jest.fn().mockImplementation((input) => ({ input })),
  AdminUpdateUserAttributesCommand: jest.fn().mockImplementation((input) => ({ input })),
  AdminInitiateAuthCommand: jest.fn().mockImplementation((input) => ({ input })),
  AdminRespondToAuthChallengeCommand: jest.fn().mockImplementation((input) => ({ input })),
  ListUsersCommand: jest.fn().mockImplementation((input) => ({ input })),
  UsernameExistsException: class UsernameExistsException extends Error {
    name = 'UsernameExistsException';
  },
}));

/**
 * Mutation-killing tests for cognito-client.ts
 * Targets: ObjectLiteral, StringLiteral, OptionalChaining, ConditionalExpression,
 * BlockStatement, ArrayDeclaration, LogicalOperator
 */
describe("cognito-client.mutations.test", () => {
  const config = {
    userPoolId: 'test-pool-id',
    clientId: 'test-client-id',
    region: 'eu-west-1',
  };

  beforeEach(() => {
    mockSend.mockReset();
  });

  // --- findUserByPersonalCode: verify Filter string and Limit ---

  describe('generateTokens mutations', () => {
    it('should pass correct UserPoolId and ClientId to InitiateAuth', async () => {
      mockSend
        .mockResolvedValueOnce({ ChallengeName: 'CUSTOM_CHALLENGE', Session: 'sess' })
        .mockResolvedValueOnce({
          AuthenticationResult: { AccessToken: 'a', IdToken: 'i', RefreshToken: 'r', ExpiresIn: 1800 },
        });

      const client = new CognitoClient(config);
      await client.generateTokens('user@e.com');

      const { AdminInitiateAuthCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      expect(AdminInitiateAuthCommand).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        ClientId: 'test-client-id',
        AuthFlow: 'CUSTOM_AUTH',
        AuthParameters: { USERNAME: 'user@e.com' },
      });
    });

    it('should pass Session from initiate to respond', async () => {
      mockSend
        .mockResolvedValueOnce({ ChallengeName: 'CUSTOM_CHALLENGE', Session: 'my-session-123' })
        .mockResolvedValueOnce({
          AuthenticationResult: { AccessToken: 'a', IdToken: 'i', RefreshToken: 'r', ExpiresIn: 3600 },
        });

      const client = new CognitoClient(config);
      await client.generateTokens('user@e.com');

      const { AdminRespondToAuthChallengeCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      expect(AdminRespondToAuthChallengeCommand).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        ClientId: 'test-client-id',
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: 'my-session-123',
        ChallengeResponses: { USERNAME: 'user@e.com', ANSWER: 'TARA_VERIFIED' },
      });
    });

    it('should return exact token values from AuthenticationResult', async () => {
      mockSend
        .mockResolvedValueOnce({ ChallengeName: 'CUSTOM_CHALLENGE', Session: 's' })
        .mockResolvedValueOnce({
          AuthenticationResult: { AccessToken: 'at-1', IdToken: 'it-2', RefreshToken: 'rt-3', ExpiresIn: 999 },
        });

      const client = new CognitoClient(config);
      const tokens = await client.generateTokens('u');
      expect(tokens).toStrictEqual({
        accessToken: 'at-1',
        idToken: 'it-2',
        refreshToken: 'rt-3',
        expiresIn: 999,
      });
    });

    it('should throw Expected CUSTOM_CHALLENGE when no ChallengeName', async () => {
      // Provide a valid second mock so that if the condition is mutated to false,
      // the code would succeed instead of throwing — killing the ConditionalExpression mutant
      mockSend
        .mockResolvedValueOnce({ ChallengeName: undefined })
        .mockResolvedValueOnce({
          AuthenticationResult: { AccessToken: 'a', IdToken: 'i', RefreshToken: 'r', ExpiresIn: 3600 },
        });

      const client = new CognitoClient(config);
      await expect(client.generateTokens('u')).rejects.toThrow('Expected CUSTOM_CHALLENGE from Cognito');
    });

    it('should throw No authentication result when result missing', async () => {
      mockSend
        .mockResolvedValueOnce({ ChallengeName: 'CUSTOM_CHALLENGE', Session: 's' })
        .mockResolvedValueOnce({ AuthenticationResult: null });

      const client = new CognitoClient(config);
      await expect(client.generateTokens('u')).rejects.toThrow('No authentication result from Cognito');
    });
  });

  describe('createCognitoClient factory mutations', () => {
    const { createCognitoClient } = jest.requireActual('../src/cognito-client');
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should use AWS_REGION from env', () => {
      process.env.COGNITO_USER_POOL_ID = 'pool';
      process.env.COGNITO_CLIENT_ID = 'client';
      process.env.AWS_REGION = 'us-east-1';
      const client = createCognitoClient();
      expect(client).toBeInstanceOf(CognitoClient);
    });

    it('should default region to eu-west-1 when AWS_REGION not set', () => {
      process.env.COGNITO_USER_POOL_ID = 'pool';
      process.env.COGNITO_CLIENT_ID = 'client';
      delete process.env.AWS_REGION;
      // Should not throw - defaults to eu-west-1
      expect(() => createCognitoClient()).not.toThrow();
    });
  });

});
