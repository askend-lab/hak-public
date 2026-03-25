import { CognitoClient, createCognitoClient } from '../src/cognito-client';
import { TaraIdToken, buildFallbackEmail } from '../src/types';

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

describe("cognito-client.test", () => {
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

  describe('findOrCreateUser', () => {
    const taraToken: TaraIdToken = {
      ...baseTaraToken,
      sub: 'EE38001085718',
      given_name: 'John',
      family_name: 'Doe',
      email: 'john@example.com',
    };

    it('should return existing user found by personal code', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [{ Username: 'existing-user' }] }) // findByPersonalCode
        .mockResolvedValueOnce({}); // syncNameAttributes

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('existing-user');
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should find by email and update personal code when not found by personal code', async () => {
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode returns empty
        .mockResolvedValueOnce({ Users: [{ Username: 'email-user' }] }) // findByEmail
        .mockResolvedValueOnce({}) // updatePersonalCode
        .mockResolvedValueOnce({}); // syncNameAttributes

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('email-user');
      expect(mockSend).toHaveBeenCalledTimes(4);
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
        .mockResolvedValueOnce({}) // updatePersonalCode
        .mockResolvedValueOnce({}); // syncNameAttributes

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

    it('should handle UsernameExistsException during createUser and sync name attrs', async () => {
      const { UsernameExistsException, AdminUpdateUserAttributesCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
      AdminUpdateUserAttributesCommand.mockClear();
      mockSend
        .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
        .mockResolvedValueOnce({ Users: [] }) // findByEmail
        .mockRejectedValueOnce(new UsernameExistsException('exists')) // createUser throws UsernameExistsException
        .mockResolvedValueOnce({}); // syncNameAttributes

      const client = new CognitoClient(mockConfig);
      const username = await client.findOrCreateUser(taraToken);
      expect(username).toBe('john@example.com');
      expect(AdminUpdateUserAttributesCommand).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: 'john@example.com',
        UserAttributes: expect.arrayContaining([
          { Name: 'given_name', Value: 'John' },
          { Name: 'family_name', Value: 'Doe' },
          { Name: 'name', Value: 'John Doe' },
        ]),
      });
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
