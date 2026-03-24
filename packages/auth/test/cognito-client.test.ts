import { CognitoClient } from '../src/cognito-client';
import { TaraIdToken, PERSONAL_CODE_ATTR, buildFallbackEmail } from '../src/types';

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
      expect(attributes).toContainEqual({ Name: 'name', Value: 'John Doe' });
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
      expect(attributes).toContainEqual({ Name: 'name', Value: 'Doe' });
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
      expect(attributes).toContainEqual({ Name: 'name', Value: 'John' });
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
      expect(attributes).not.toContainEqual(expect.objectContaining({ Name: 'name' }));
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

});
