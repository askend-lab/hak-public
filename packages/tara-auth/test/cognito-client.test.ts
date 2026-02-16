import { CognitoClient, createCognitoClient } from '../src/cognito-client';
import { TaraIdToken, TARA_VERIFIED, PERSONAL_CODE_ATTR, buildFallbackEmail } from '../src/types';

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  AdminCreateUserCommand: jest.fn(),
  AdminUpdateUserAttributesCommand: jest.fn(),
  AdminInitiateAuthCommand: jest.fn().mockImplementation((input) => ({ input })),
  AdminRespondToAuthChallengeCommand: jest.fn().mockImplementation((input) => ({ input })),
  ListUsersCommand: jest.fn(),
  UsernameExistsException: class UsernameExistsException extends Error {
    name = 'UsernameExistsException';
  },
}));

describe('CognitoClient', () => {
  const mockConfig = {
    userPoolId: 'test-pool-id',
    clientId: 'test-client-id',
    region: 'eu-west-1',
  };

  beforeEach(() => {
    mockSend.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const baseTaraToken = {
    iss: 'https://tara-test.ria.ee',
    aud: 'test-client',
    exp: 123456789,
    iat: 123456789,
    nonce: 'test-nonce',
    amr: ['smartid'],
    acr: 'high',
  };

  describe('buildUserAttributes', () => {
    it('should include all attributes when provided', () => {
      const taraIdToken: TaraIdToken = {
        ...baseTaraToken,
        sub: 'EE38001085718',
        given_name: 'John',
        family_name: 'Doe',
        email: 'john@example.com',
      };

      const client = new CognitoClient(mockConfig);
      const attributes = client.buildUserAttributes(taraIdToken);

      expect(attributes).toContainEqual({ Name: 'email', Value: 'john@example.com' });
      expect(attributes).toContainEqual({ Name: 'email_verified', Value: 'true' });
      expect(attributes).toContainEqual({ Name: 'given_name', Value: 'John' });
      expect(attributes).toContainEqual({ Name: 'family_name', Value: 'Doe' });
      expect(attributes).toContainEqual({ Name: PERSONAL_CODE_ATTR, Value: 'EE38001085718' });
    });

    it('should exclude given_name when not provided', () => {
      const taraIdToken: TaraIdToken = {
        ...baseTaraToken,
        sub: 'EE38001085718',
        family_name: 'Doe',
        email: 'john@example.com',
      };

      const client = new CognitoClient(mockConfig);
      const attributes = client.buildUserAttributes(taraIdToken);

      expect(attributes).not.toContainEqual(expect.objectContaining({ Name: 'given_name' }));
      expect(attributes).toContainEqual({ Name: 'family_name', Value: 'Doe' });
    });

    it('should exclude family_name when not provided', () => {
      const taraIdToken: TaraIdToken = {
        ...baseTaraToken,
        sub: 'EE38001085718',
        given_name: 'John',
        email: 'john@example.com',
      };

      const client = new CognitoClient(mockConfig);
      const attributes = client.buildUserAttributes(taraIdToken);

      expect(attributes).toContainEqual({ Name: 'given_name', Value: 'John' });
      expect(attributes).not.toContainEqual(expect.objectContaining({ Name: 'family_name' }));
    });

    it('should exclude both names when neither provided', () => {
      const taraIdToken: TaraIdToken = {
        ...baseTaraToken,
        sub: 'EE38001085718',
        email: 'john@example.com',
      };

      const client = new CognitoClient(mockConfig);
      const attributes = client.buildUserAttributes(taraIdToken);

      expect(attributes).not.toContainEqual(expect.objectContaining({ Name: 'given_name' }));
      expect(attributes).not.toContainEqual(expect.objectContaining({ Name: 'family_name' }));
      expect(attributes).toContainEqual({ Name: 'email', Value: 'john@example.com' });
      expect(attributes).toContainEqual({ Name: PERSONAL_CODE_ATTR, Value: 'EE38001085718' });
    });

    it('should generate fallback email when not provided', () => {
      const taraIdToken: TaraIdToken = {
        ...baseTaraToken,
        sub: 'EE38001085718',
      };

      const client = new CognitoClient(mockConfig);
      const attributes = client.buildUserAttributes(taraIdToken);

      expect(attributes).toContainEqual({ Name: 'email', Value: buildFallbackEmail('EE38001085718') });
    });
  });

  describe('generateTokens with CUSTOM_AUTH', () => {
    it('should use CUSTOM_AUTH flow instead of ADMIN_USER_PASSWORD_AUTH', async () => {
      // Mock the CUSTOM_AUTH flow responses
      mockSend
        .mockResolvedValueOnce({
          // First call: AdminInitiateAuth with CUSTOM_AUTH
          ChallengeName: 'CUSTOM_CHALLENGE',
          Session: 'test-session',
          ChallengeParameters: {},
        })
        .mockResolvedValueOnce({
          // Second call: AdminRespondToAuthChallenge
          AuthenticationResult: {
            AccessToken: 'test-access-token',
            IdToken: 'test-id-token',
            RefreshToken: 'test-refresh-token',
            ExpiresIn: 3600,
          },
        });

      const client = new CognitoClient(mockConfig);
      const tokens = await client.generateTokens('test@example.com');

      // Verify CUSTOM_AUTH was used
      expect(mockSend).toHaveBeenCalledTimes(2);

      const firstCall = mockSend.mock.calls[0][0];
      expect(firstCall.input.AuthFlow).toBe('CUSTOM_AUTH');
      expect(firstCall.input.AuthParameters.USERNAME).toBe('test@example.com');

      // Verify tokens are returned
      expect(tokens.accessToken).toBe('test-access-token');
      expect(tokens.idToken).toBe('test-id-token');
      expect(tokens.refreshToken).toBe('test-refresh-token');
    });

    it('should send TARA_VERIFIED as challenge answer', async () => {
      mockSend
        .mockResolvedValueOnce({
          ChallengeName: 'CUSTOM_CHALLENGE',
          Session: 'test-session',
          ChallengeParameters: {},
        })
        .mockResolvedValueOnce({
          AuthenticationResult: {
            AccessToken: 'test-access-token',
            IdToken: 'test-id-token',
            RefreshToken: 'test-refresh-token',
            ExpiresIn: 3600,
          },
        });

      const client = new CognitoClient(mockConfig);
      await client.generateTokens('test@example.com');

      const secondCall = mockSend.mock.calls[1][0];
      expect(secondCall.input.ChallengeResponses.ANSWER).toBe(TARA_VERIFIED);
    });

    it('should not use password-based authentication', async () => {
      mockSend
        .mockResolvedValueOnce({
          ChallengeName: 'CUSTOM_CHALLENGE',
          Session: 'test-session',
        })
        .mockResolvedValueOnce({
          AuthenticationResult: {
            AccessToken: 'test-access-token',
            IdToken: 'test-id-token',
            RefreshToken: 'test-refresh-token',
            ExpiresIn: 3600,
          },
        });

      const client = new CognitoClient(mockConfig);
      await client.generateTokens('test@example.com');

      const firstCall = mockSend.mock.calls[0][0];
      // Should NOT have PASSWORD in AuthParameters
      expect(firstCall.input.AuthParameters.PASSWORD).toBeUndefined();
    });

    it('should throw when no ChallengeName returned', async () => {
      mockSend.mockResolvedValueOnce({ ChallengeName: undefined });

      const client = new CognitoClient(mockConfig);
      await expect(client.generateTokens('test@example.com')).rejects.toThrow('Token generation failed');
    });

    it('should throw when no AuthenticationResult returned', async () => {
      mockSend
        .mockResolvedValueOnce({ ChallengeName: 'CUSTOM_CHALLENGE', Session: 's' })
        .mockResolvedValueOnce({ AuthenticationResult: undefined });

      const client = new CognitoClient(mockConfig);
      await expect(client.generateTokens('test@example.com')).rejects.toThrow('Token generation failed');
    });

    it('should wrap underlying errors in Token generation failed', async () => {
      mockSend.mockRejectedValueOnce(new Error('Network error'));

      const client = new CognitoClient(mockConfig);
      await expect(client.generateTokens('test@example.com')).rejects.toThrow('Token generation failed');
    });

    it('should throw when token fields are missing', async () => {
      mockSend
        .mockResolvedValueOnce({ ChallengeName: 'CUSTOM_CHALLENGE', Session: 's' })
        .mockResolvedValueOnce({
          AuthenticationResult: {
            AccessToken: undefined,
            IdToken: undefined,
            RefreshToken: undefined,
            ExpiresIn: undefined,
          },
        });

      const client = new CognitoClient(mockConfig);
      await expect(client.generateTokens('test@example.com')).rejects.toThrow('Cognito returned incomplete tokens');
    });
  });

  describe('findOrCreateUser', () => {
    const taraToken: TaraIdToken = {
      ...baseTaraToken,
      sub: 'EE38001085718',
      given_name: 'John',
      family_name: 'Doe',
      email: 'john@example.com',
    };

    it('should return existing user found by personal code', async () => {
      mockSend.mockResolvedValueOnce({
        Users: [{ Username: 'existing-user' }],
      });

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('existing-user');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should find by email and update personal code when not found by personal code', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode returns empty
        .mockResolvedValueOnce({ Users: [{ Username: 'email-user' }] }) // findByEmail
        .mockResolvedValueOnce({}); // updatePersonalCode

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('email-user');
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should create new user when not found by personal code or email', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({ Users: [] }) // findByEmail
        .mockResolvedValueOnce({}); // createUser

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('john@example.com');
    });

    it('should create user with fallback email when no email provided', async () => {
      const tokenNoEmail: TaraIdToken = { ...baseTaraToken, sub: 'EE38001085718' };
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({}); // createUser (skips email search since no email)

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(tokenNoEmail);
      expect(username).toBe(buildFallbackEmail('EE38001085718'));
    });

    it('should handle findByPersonalCode returning null on error', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('ListUsers failed')) // findByPersonalCode throws
        .mockResolvedValueOnce({ Users: [{ Username: 'email-user' }] }) // findByEmail
        .mockResolvedValueOnce({}); // updatePersonalCode

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('email-user');
    });

    it('should handle findByEmail returning null on error', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockRejectedValueOnce(new Error('ListUsers failed')) // findByEmail throws
        .mockResolvedValueOnce({}); // createUser

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('john@example.com');
    });

    it('should handle UsernameExistsException during createUser', async () => {
      const { UsernameExistsException } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({ Users: [] }) // findByEmail
        .mockRejectedValueOnce(new UsernameExistsException('exists')); // createUser throws UsernameExistsException

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('john@example.com');
    });

    it('should rethrow non-UsernameExistsException errors during createUser', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({ Users: [] }) // findByEmail
        .mockRejectedValueOnce(new Error('Some other error')); // createUser throws other error

      const client = new CognitoClient(mockConfig);
      await expect(client.findOrCreateUser(taraToken)).rejects.toThrow('Some other error');
    });

    it('should handle findByPersonalCode returning null for empty Users', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: undefined }) // findByPersonalCode - no Users field
        .mockResolvedValueOnce({ Users: [] }) // findByEmail
        .mockResolvedValueOnce({}); // createUser

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('john@example.com');
    });
  });

  describe('createCognitoClient', () => {
    const originalEnv = process.env;
    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });
    it('should create client when env vars are set', () => {
      process.env.COGNITO_USER_POOL_ID = 'pool-id';
      process.env.COGNITO_CLIENT_ID = 'client-id';
      process.env.AWS_REGION = 'eu-west-1';

      const client = createCognitoClient();
      expect(client).toBeInstanceOf(CognitoClient);
    });
    it('should throw when COGNITO_USER_POOL_ID is missing', () => {
      process.env.COGNITO_USER_POOL_ID = '';
      process.env.COGNITO_CLIENT_ID = 'client-id';

      expect(() => createCognitoClient()).toThrow('COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set');
    });

    it('should throw when COGNITO_CLIENT_ID is missing', () => {
      process.env.COGNITO_USER_POOL_ID = 'pool-id';
      process.env.COGNITO_CLIENT_ID = '';

      expect(() => createCognitoClient()).toThrow('COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set');
    });

    it('should default region to eu-west-1', () => {
      process.env.COGNITO_USER_POOL_ID = 'pool-id';
      process.env.COGNITO_CLIENT_ID = 'client-id';
      delete process.env.AWS_REGION;

      const client = createCognitoClient();
      expect(client).toBeInstanceOf(CognitoClient);
    });
  });
});
