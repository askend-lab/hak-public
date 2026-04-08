import {
  TARA_VERIFIED,
  CUSTOM_CHALLENGE,
  TARA_AUTH_METADATA,
  FALLBACK_EMAIL_DOMAIN,
  PERSONAL_CODE_ATTR,
  DEFAULT_EXPIRES_IN,
  buildFallbackEmail,
} from '../src/types';
import { DEFAULT_REGION } from '../src/cognito-client';

describe('types constants and helpers', () => {
  describe('auth protocol constants are non-empty strings used in Cognito flows', () => {
    it('TARA_VERIFIED is a non-empty string for challenge answer', () => {
      expect(TARA_VERIFIED.length).toBeGreaterThan(0);
      expect(typeof TARA_VERIFIED).toBe('string');
    });

    it('CUSTOM_CHALLENGE matches Cognito challenge type', () => {
      expect(CUSTOM_CHALLENGE).toBe('CUSTOM_CHALLENGE');
    });

    it('TARA_AUTH_METADATA is used as challengeMetadata key', () => {
      expect(typeof TARA_AUTH_METADATA).toBe('string');
      expect(TARA_AUTH_METADATA.length).toBeGreaterThan(0);
    });
  });

  describe('PERSONAL_CODE_ATTR follows Cognito custom attribute format', () => {
    it('starts with custom: prefix', () => {
      expect(PERSONAL_CODE_ATTR).toMatch(/^custom:/);
    });
  });

  describe('DEFAULT_EXPIRES_IN represents token TTL in seconds', () => {
    it('is exactly 1 hour', () => {
      expect(DEFAULT_EXPIRES_IN).toBe(3600);
    });
  });

  describe('DEFAULT_REGION is a valid AWS region', () => {
    it('matches AWS region format', () => {
      expect(DEFAULT_REGION).toMatch(/^[a-z]+-[a-z]+-\d+$/);
    });
  });

  describe('buildFallbackEmail', () => {
    it('builds email from personal code using FALLBACK_EMAIL_DOMAIN', () => {
      expect(buildFallbackEmail('EE38001085718')).toBe(`EE38001085718@${FALLBACK_EMAIL_DOMAIN}`);
    });

    it('produces valid email format', () => {
      const email = buildFallbackEmail('TEST123');
      expect(email).toMatch(/^.+@.+\..+$/);
    });

    it('preserves personal code as local part', () => {
      const code = 'EE38001085718';
      const email = buildFallbackEmail(code);
      expect(email.split('@')[0]).toBe(code);
    });
  });
});
