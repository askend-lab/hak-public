import { STATE_COOKIE_NAME, REFRESH_COOKIE_NAME, STATE_TTL_MS, REFRESH_TOKEN_MAX_AGE_S, AUTH_CALLBACK_PATH, DEFAULT_FRONTEND_URL_PROD, DEFAULT_FRONTEND_URL_DEV, TOKEN_COOKIE_OPTIONS, RANDOM_STRING_LENGTH } from '../src/handler';

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
  it('STATE_TTL_MS is between 5 and 15 minutes (reasonable CSRF window)', () => {
    expect(STATE_TTL_MS).toBeGreaterThanOrEqual(5 * 60 * 1000);
    expect(STATE_TTL_MS).toBeLessThanOrEqual(15 * 60 * 1000);
  });

  it('REFRESH_TOKEN_MAX_AGE_S is between 7 and 90 days', () => {
    expect(REFRESH_TOKEN_MAX_AGE_S).toBeGreaterThanOrEqual(7 * 24 * 60 * 60);
    expect(REFRESH_TOKEN_MAX_AGE_S).toBeLessThanOrEqual(90 * 24 * 60 * 60);
  });

  it('AUTH_CALLBACK_PATH starts with /', () => {
    expect(AUTH_CALLBACK_PATH).toMatch(/^\//);
  });

  it('frontend URLs are HTTPS', () => {
    expect(DEFAULT_FRONTEND_URL_PROD).toMatch(/^https:\/\//);
    expect(DEFAULT_FRONTEND_URL_DEV).toMatch(/^https:\/\//);
  });

  it('TOKEN_COOKIE_OPTIONS enforces HttpOnly, Secure, and SameSite=Lax', () => {
    expect(TOKEN_COOKIE_OPTIONS).toContain('HttpOnly');
    expect(TOKEN_COOKIE_OPTIONS).toContain('Secure');
    expect(TOKEN_COOKIE_OPTIONS).toContain('SameSite=Lax');
  });

  it('RANDOM_STRING_LENGTH is at least 16 bytes for CSRF tokens', () => {
    expect(RANDOM_STRING_LENGTH).toBeGreaterThanOrEqual(16);
  });

  it('cookie names are non-empty strings', () => {
    expect(STATE_COOKIE_NAME.length).toBeGreaterThan(0);
    expect(REFRESH_COOKIE_NAME.length).toBeGreaterThan(0);
  });

});
