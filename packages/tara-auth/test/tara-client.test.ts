import { TaraClient } from '../src/tara-client';

describe('TaraClient', () => {
  const mockConfig = {
    issuer: 'https://tara-test.ria.ee',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'https://example.com/callback',
  };

  describe('buildAuthorizationUrl', () => {
    it('should build correct authorization URL', () => {
      const client = new TaraClient(mockConfig);
      const state = 'test-state';
      const nonce = 'test-nonce';

      const url = client.buildAuthorizationUrl(state, nonce);

      expect(url).toContain('https://tara-test.ria.ee/oidc/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid');
      expect(url).toContain(`state=${state}`);
      expect(url).toContain(`nonce=${nonce}`);
    });
  });

  describe('extractPersonalCode', () => {
    it('should extract country code and personal code from TARA sub', () => {
      const client = new TaraClient(mockConfig);
      
      const result = client.extractPersonalCode('EE38001085718');
      
      expect(result.countryCode).toBe('EE');
      expect(result.personalCode).toBe('38001085718');
    });
  });
});
