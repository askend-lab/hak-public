import { _resetSecretsCache, DEFAULT_TARA_ISSUER, DEFAULT_CALLBACK_URL, OIDC_AUTHORIZE_PATH, OIDC_TOKEN_PATH, OIDC_JWKS_PATH, CONTENT_TYPE_FORM_URLENCODED, UI_LOCALE } from '../src/tara-client';
// Mock jose
jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn().mockReturnValue('mock-jwks'),
  jwtVerify: jest.fn(),
}));


// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("tara-client.test", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    _resetSecretsCache();
    process.env = { ...originalEnv };
    process.env.STAGE = 'dev';
    process.env.TARA_ISSUER = 'https://tara-test.ria.ee';
    process.env.TARA_CLIENT_ID = 'test-client-id';
    process.env.TARA_CLIENT_SECRET = 'test-secret';
    process.env.TARA_CALLBACK_URL = 'https://auth.example.com/callback';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('OIDC constants — protocol contracts', () => {
    it('DEFAULT_TARA_ISSUER is a valid HTTPS URL', () => {
      expect(DEFAULT_TARA_ISSUER).toMatch(/^https:\/\/.+/);
    });

    it('DEFAULT_CALLBACK_URL is a valid HTTPS URL', () => {
      expect(DEFAULT_CALLBACK_URL).toMatch(/^https:\/\/.+/);
    });

    it('OIDC paths follow /oidc/* convention', () => {
      expect(OIDC_AUTHORIZE_PATH).toMatch(/^\/oidc\//);
      expect(OIDC_TOKEN_PATH).toMatch(/^\/oidc\//);
      expect(OIDC_JWKS_PATH).toMatch(/^\/oidc\//);
    });

    it('CONTENT_TYPE_FORM_URLENCODED is valid Content-Type header', () => {
      expect(CONTENT_TYPE_FORM_URLENCODED).toMatch(/^application\//);
    });

    it('UI_LOCALE is a 2-letter language code', () => {
      expect(UI_LOCALE).toMatch(/^[a-z]{2}$/);
    });
  });

});
