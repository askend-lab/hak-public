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

  describe('PERSONAL_CODE_ATTR', () => {
    it('should be custom:personal_code', () => {
      expect(PERSONAL_CODE_ATTR).toBe('custom:personal_code');
    });
  });

  describe('DEFAULT_EXPIRES_IN', () => {
    it('should be 3600', () => {
      expect(DEFAULT_EXPIRES_IN).toBe(3600);
    });
  });

  describe('DEFAULT_REGION', () => {
    it('should be eu-west-1', () => {
      expect(DEFAULT_REGION).toBe('eu-west-1');
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
