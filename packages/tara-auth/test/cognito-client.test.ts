import { CognitoClient } from '../src/cognito-client';
import { TaraIdToken } from '../src/types';

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
      expect(attributes).toContainEqual({ Name: 'custom:personal_code', Value: 'EE38001085718' });
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
      expect(attributes).toContainEqual({ Name: 'custom:personal_code', Value: 'EE38001085718' });
    });

    it('should generate fallback email when not provided', () => {
      const taraIdToken: TaraIdToken = {
        ...baseTaraToken,
        sub: 'EE38001085718',
      };

      const client = new CognitoClient(mockConfig);
      const attributes = client.buildUserAttributes(taraIdToken);

      expect(attributes).toContainEqual({ Name: 'email', Value: 'EE38001085718@tara.ee' });
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
      expect(secondCall.input.ChallengeResponses.ANSWER).toBe('TARA_VERIFIED');
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
  });
});
