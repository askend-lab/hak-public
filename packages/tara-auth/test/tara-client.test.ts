import { createTaraClient, DEFAULT_TARA_ISSUER, DEFAULT_CALLBACK_URL } from '../src/tara-client';
import * as jose from 'jose';

// Mock jose
jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn().mockReturnValue('mock-jwks'),
  jwtVerify: jest.fn(),
}));

const mockJwtVerify = jose.jwtVerify as jest.Mock;

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('createTaraClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.TARA_ISSUER = 'https://tara-test.ria.ee';
    process.env.TARA_CLIENT_ID = 'test-client-id';
    process.env.TARA_CLIENT_SECRET = 'test-secret';
    process.env.TARA_CALLBACK_URL = 'https://auth.example.com/callback';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create a client object with all methods', async () => {
    const client = await createTaraClient();
    expect(client).toHaveProperty('buildAuthorizationUrl');
    expect(client).toHaveProperty('exchangeCodeForTokens');
    expect(client).toHaveProperty('verifyIdToken');
  });

  describe('buildAuthorizationUrl', () => {
    it('should build correct authorization URL with all params', async () => {
      const client = await createTaraClient();
      const url = client.buildAuthorizationUrl('my-state', 'my-nonce');

      expect(url).toContain('https://tara-test.ria.ee/oidc/authorize?');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fauth.example.com%2Fcallback');
      expect(url).toContain('scope=openid');
      expect(url).toContain('state=my-state');
      expect(url).toContain('nonce=my-nonce');
      expect(url).toContain('ui_locales=et');
    });

    it('should use env issuer in URL', async () => {
      process.env.TARA_ISSUER = 'https://custom-tara.example.com';
      const client = await createTaraClient();
      const url = client.buildAuthorizationUrl('s', 'n');
      expect(url).toContain('https://custom-tara.example.com/oidc/authorize');
    });

    it('should use default issuer when env not set', async () => {
      delete process.env.TARA_ISSUER;
      const client = await createTaraClient();
      const url = client.buildAuthorizationUrl('s', 'n');
      expect(url).toContain('https://tara-test.ria.ee/oidc/authorize');
    });

    it('should use default callback URL when env not set', async () => {
      delete process.env.TARA_CALLBACK_URL;
      const client = await createTaraClient();
      const url = client.buildAuthorizationUrl('s', 'n');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('auth.askend-lab.com');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should call fetch with correct URL and headers', async () => {
      const mockTokens = { id_token: 'id-tok', access_token: 'acc-tok' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokens),
      });

      const client = await createTaraClient();
      const result = await client.exchangeCodeForTokens('auth-code-123');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://tara-test.ria.ee/oidc/token');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
      expect(options.headers.Authorization).toMatch(/^Basic /);
      expect(options.body).toContain('grant_type=authorization_code');
      expect(options.body).toContain('code=auth-code-123');
      expect(options.body).toContain('redirect_uri=');
      expect(result).toStrictEqual(mockTokens);
    });

    it('should encode credentials as base64', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const client = await createTaraClient();
      await client.exchangeCodeForTokens('code');

      const authHeader = mockFetch.mock.calls[0][1].headers.Authorization;
      const decoded = Buffer.from(authHeader.replace('Basic ', ''), 'base64').toString();
      expect(decoded).toBe('test-client-id:test-secret');
    });

    it('should throw on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      });

      const client = await createTaraClient();
      await expect(client.exchangeCodeForTokens('bad-code')).rejects.toThrow(
        'Token exchange failed: 400 Bad Request'
      );
    });

    it('should use correct token URL from issuer', async () => {
      process.env.TARA_ISSUER = 'https://custom.ria.ee';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const client = await createTaraClient();
      await client.exchangeCodeForTokens('code');

      expect(mockFetch.mock.calls[0][0]).toBe('https://custom.ria.ee/oidc/token');
    });
  });

  describe('verifyIdToken', () => {
    it('should verify JWT and return payload as TaraIdToken', async () => {
      const mockPayload = {
        sub: 'EE38001085718',
        nonce: 'correct-nonce',
        iss: 'https://tara-test.ria.ee',
        aud: 'test-client-id',
      };
      mockJwtVerify.mockResolvedValueOnce({ payload: mockPayload });

      const client = await createTaraClient();
      const result = await client.verifyIdToken('jwt-token', 'correct-nonce');

      expect(result).toStrictEqual(mockPayload);
      expect(mockJwtVerify).toHaveBeenCalledWith('jwt-token', 'mock-jwks', {
        issuer: 'https://tara-test.ria.ee',
        audience: 'test-client-id',
      });
    });

    it('should throw on nonce mismatch', async () => {
      mockJwtVerify.mockResolvedValueOnce({
        payload: { sub: 'EE38001085718', nonce: 'wrong-nonce' },
      });

      const client = await createTaraClient();
      await expect(client.verifyIdToken('jwt-token', 'expected-nonce')).rejects.toThrow(
        'Nonce mismatch in TARA id_token'
      );
    });

    it('should pass issuer and audience to jwtVerify', async () => {
      process.env.TARA_ISSUER = 'https://custom-issuer.ee';
      process.env.TARA_CLIENT_ID = 'my-aud';
      mockJwtVerify.mockResolvedValueOnce({
        payload: { nonce: 'n' },
      });

      const client = await createTaraClient();
      await client.verifyIdToken('tok', 'n');

      expect(mockJwtVerify).toHaveBeenCalledWith('tok', 'mock-jwks', {
        issuer: 'https://custom-issuer.ee',
        audience: 'my-aud',
      });
    });
  });

  describe('constants', () => {
    it('DEFAULT_TARA_ISSUER should be tara-test URL', () => {
      expect(DEFAULT_TARA_ISSUER).toBe('https://tara-test.ria.ee');
    });

    it('DEFAULT_CALLBACK_URL should be askend-lab callback', () => {
      expect(DEFAULT_CALLBACK_URL).toContain('auth.askend-lab.com');
    });
  });
});
