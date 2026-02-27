import { CognitoClient } from '../src/cognito-client';
import { TARA_VERIFIED } from '../src/types';

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

});
