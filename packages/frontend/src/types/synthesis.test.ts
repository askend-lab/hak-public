import { describe, it, expect } from 'vitest';
import { getVoiceModel, convertTextToTags } from './synthesis';

describe('synthesis types', () => {
  describe('getVoiceModel', () => {
    it('returns efm_s for single word', () => {
      expect(getVoiceModel('hello')).toBe('efm_s');
    });

    it('returns efm_l for multiple words', () => {
      expect(getVoiceModel('hello world')).toBe('efm_l');
    });

    it('returns efm_l for empty string', () => {
      expect(getVoiceModel('')).toBe('efm_l');
    });

    it('returns efm_l for whitespace only', () => {
      expect(getVoiceModel('   ')).toBe('efm_l');
    });

    it('returns efm_l for sentence', () => {
      expect(getVoiceModel('This is a sentence')).toBe('efm_l');
    });
  });

  describe('convertTextToTags', () => {
    it('splits text into words', () => {
      expect(convertTextToTags('hello world')).toEqual(['hello', 'world']);
    });

    it('handles multiple spaces', () => {
      expect(convertTextToTags('hello   world')).toEqual(['hello', 'world']);
    });

    it('returns empty array for empty string', () => {
      expect(convertTextToTags('')).toEqual([]);
    });

    it('trims whitespace', () => {
      expect(convertTextToTags('  hello world  ')).toEqual(['hello', 'world']);
    });

    it('handles single word', () => {
      expect(convertTextToTags('hello')).toEqual(['hello']);
    });
  });
});
