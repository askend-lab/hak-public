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
describe("cognito-client.mutations.test", () => {
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

});
