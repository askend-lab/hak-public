import { CognitoClient } from '../src/cognito-client';
import { TaraIdToken } from '../src/types';

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
describe('CognitoClient mutation kills', () => {
  const config = {
    userPoolId: 'test-pool-id',
    clientId: 'test-client-id',
    region: 'eu-west-1',
  };

  const baseTaraToken = {
    iss: 'https://tara-test.ria.ee',
    aud: 'test-client',
    exp: 123456789,
    iat: 123456789,
    nonce: 'test-nonce',
    amr: ['smartid'],
    acr: 'high',
  };

  beforeEach(() => {
    mockSend.mockReset();
  });

  // --- findUserByPersonalCode: verify Filter string and Limit ---

  describe('findUserByPersonalCode mutations', () => {
    it('should use correct filter with personal_code attribute', async () => {
      mockSend.mockResolvedValueOnce({ Users: [{ Username: 'found-user' }] });
      const client = new CognitoClient(config);
      const taraToken: TaraIdToken = { ...baseTaraToken, sub: 'EE38001085718', email: 'e@e.com' };
      await client.findOrCreateUser(taraToken);

      const { ListUsersCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      expect(ListUsersCommand).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Filter: '"custom:personal_code" = "EE38001085718"',
        Limit: 1,
      });
    });

    it('should return null when Users array is empty', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode - empty
        .mockResolvedValueOnce({ Users: [] }) // findByEmail - empty
        .mockResolvedValueOnce({}); // createUser

      const client = new CognitoClient(config);
      const taraToken: TaraIdToken = { ...baseTaraToken, sub: 'EE38001085718', email: 'e@e.com' };
      const result = await client.findOrCreateUser(taraToken);
      // createUser returns email as username
      expect(result).toBe('e@e.com');
    });

    it('should return Username from first user in response', async () => {
      mockSend.mockResolvedValueOnce({ Users: [{ Username: 'user-1' }, { Username: 'user-2' }] });
      const client = new CognitoClient(config);
      const result = await client.findOrCreateUser({ ...baseTaraToken, sub: 'EE38001085718', email: 'e@e.com' });
      expect(result).toBe('user-1');
    });
  });

  // --- findUserByEmail: verify Filter string ---

  describe('findUserByEmail mutations', () => {
    it('should use correct email filter', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({ Users: [{ Username: 'email-user' }] }) // findByEmail
        .mockResolvedValueOnce({}); // updatePersonalCode

      const client = new CognitoClient(config);
      await client.findOrCreateUser({ ...baseTaraToken, sub: 'EE38001085718', email: 'test@e.com' });

      const { ListUsersCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      // Second call should be email filter
      expect(ListUsersCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Filter: 'email = "test@e.com"',
        })
      );
    });

    it('should skip email search when email not provided', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({}); // createUser (no email search)

      const client = new CognitoClient(config);
      const result = await client.findOrCreateUser({ ...baseTaraToken, sub: 'EE38001085718' });
      expect(result).toBe('EE38001085718@tara.ee');
      // Only 2 calls: findByPersonalCode + createUser (skipped findByEmail)
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  // --- updatePersonalCode: verify command args ---

  describe('updatePersonalCode mutations', () => {
    it('should update personal_code attribute for found email user', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({ Users: [{ Username: 'email-user' }] }) // findByEmail
        .mockResolvedValueOnce({}); // updatePersonalCode

      const client = new CognitoClient(config);
      await client.findOrCreateUser({ ...baseTaraToken, sub: 'EE39901011234', email: 'u@e.com' });

      const { AdminUpdateUserAttributesCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      expect(AdminUpdateUserAttributesCommand).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: 'email-user',
        UserAttributes: [{ Name: 'custom:personal_code', Value: 'EE39901011234' }],
      });
    });
  });

  // --- buildUserAttributes: verify exact attribute structure ---

  describe('buildUserAttributes mutations', () => {
    it('should return exactly 5 attributes when all fields provided', () => {
      const client = new CognitoClient(config);
      const attrs = client.buildUserAttributes({
        ...baseTaraToken,
        sub: 'EE49001011234',
        email: 'e@e.com',
        given_name: 'John',
        family_name: 'Doe',
      });
      expect(attrs).toHaveLength(5);
      expect(attrs).toStrictEqual([
        { Name: 'email', Value: 'e@e.com' },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'custom:personal_code', Value: 'EE49001011234' },
        { Name: 'given_name', Value: 'John' },
        { Name: 'family_name', Value: 'Doe' },
      ]);
    });

    it('should return exactly 3 attributes when no names', () => {
      const client = new CognitoClient(config);
      const attrs = client.buildUserAttributes({ ...baseTaraToken, sub: 'EE49001011234', email: 'e@e.com' });
      expect(attrs).toHaveLength(3);
    });

    it('should use fallback email with @tara.ee suffix', () => {
      const client = new CognitoClient(config);
      const attrs = client.buildUserAttributes({ ...baseTaraToken, sub: 'EE55501011234' });
      expect(attrs[0]).toStrictEqual({ Name: 'email', Value: 'EE55501011234@tara.ee' });
    });

    it('should set email_verified to "true"', () => {
      const client = new CognitoClient(config);
      const attrs = client.buildUserAttributes({ ...baseTaraToken, sub: 'EE60001011234', email: 'a@b.com' });
      const emailVerified = attrs.find(a => a.Name === 'email_verified');
      expect(emailVerified?.Value).toBe('true');
    });
  });

  // --- createUser: verify AdminCreateUserCommand args ---

  describe('createUser mutations', () => {
    it('should call AdminCreateUserCommand with correct args', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({ Users: [] }) // findByEmail
        .mockResolvedValueOnce({}); // createUser

      const client = new CognitoClient(config);
      await client.findOrCreateUser({ ...baseTaraToken, sub: 'EE49001011234', email: 'u@e.com', given_name: 'J' });

      const { AdminCreateUserCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      expect(AdminCreateUserCommand).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: 'u@e.com',
        UserAttributes: expect.arrayContaining([
          { Name: 'email', Value: 'u@e.com' },
          { Name: 'custom:personal_code', Value: 'EE49001011234' },
        ]),
        MessageAction: 'SUPPRESS',
      });
    });
  });

  // --- generateTokens: verify command structure and response field access ---

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

  // --- createCognitoClient factory: env var mutations ---

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
