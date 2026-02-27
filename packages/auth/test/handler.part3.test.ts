import { generateRandomString } from '../src/handler';

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
  it('should generate string of specified length', () => {
    const result = generateRandomString(16);
    expect(result).toHaveLength(16);
  });

  it('should generate different strings each call', () => {
    const a = generateRandomString(32);
    const b = generateRandomString(32);
    expect(a).not.toBe(b);
  });

});
