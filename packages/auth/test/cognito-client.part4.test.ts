import { CognitoClient } from '../src/cognito-client';
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

describe('profile_attributes fallback', () => {
  const mockConfig = {
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

  it('should extract names from profile_attributes when top-level fields are missing', async () => {
    const { UsernameExistsException, AdminUpdateUserAttributesCommand } = jest.requireMock('@aws-sdk/client-cognito-identity-provider');
    AdminUpdateUserAttributesCommand.mockClear();
    const tokenWithProfileAttrs: TaraIdToken = {
      ...baseTaraToken,
      sub: 'EE38001085718',
      profile_attributes: { given_name: 'Mari', family_name: 'Tamm' },
    };
    mockSend
      .mockResolvedValueOnce({ Users: [] }) // findByPersonalCode
      .mockRejectedValueOnce(new UsernameExistsException('exists')) // createUser (findByEmail skipped — no email)
      .mockResolvedValueOnce({}); // syncNameAttributes

    const client = new CognitoClient(mockConfig);
    const username = await client.findOrCreateUser(tokenWithProfileAttrs);
    const expectedEmail = buildFallbackEmail('EE38001085718');
    expect(username).toBe(expectedEmail);
    expect(AdminUpdateUserAttributesCommand).toHaveBeenCalledWith({
      UserPoolId: 'test-pool-id',
      Username: expectedEmail,
      UserAttributes: expect.arrayContaining([
        { Name: 'given_name', Value: 'Mari' },
        { Name: 'family_name', Value: 'Tamm' },
        { Name: 'name', Value: 'Mari Tamm' },
      ]),
    });
  });
});
