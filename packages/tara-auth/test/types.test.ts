import {
  TARA_VERIFIED,
  CUSTOM_CHALLENGE,
  TARA_AUTH_METADATA,
  FALLBACK_EMAIL_DOMAIN,
  buildFallbackEmail,
} from '../src/types';

describe('types constants and helpers', () => {
  describe('TARA_VERIFIED', () => {
    it('should be TARA_VERIFIED', () => {
      expect(TARA_VERIFIED).toBe('TARA_VERIFIED');
    });
  });

  describe('CUSTOM_CHALLENGE', () => {
    it('should be CUSTOM_CHALLENGE', () => {
      expect(CUSTOM_CHALLENGE).toBe('CUSTOM_CHALLENGE');
    });
  });

  describe('TARA_AUTH_METADATA', () => {
    it('should be TARA_AUTH', () => {
      expect(TARA_AUTH_METADATA).toBe('TARA_AUTH');
    });
  });

  describe('FALLBACK_EMAIL_DOMAIN', () => {
    it('should be tara.ee', () => {
      expect(FALLBACK_EMAIL_DOMAIN).toBe('tara.ee');
    });
  });

  describe('buildFallbackEmail', () => {
    it('should build email from personal code', () => {
      expect(buildFallbackEmail('EE38001085718')).toBe('EE38001085718@tara.ee');
    });

    it('should use FALLBACK_EMAIL_DOMAIN', () => {
      expect(buildFallbackEmail('TEST')).toContain(`@${FALLBACK_EMAIL_DOMAIN}`);
    });
  });
});
