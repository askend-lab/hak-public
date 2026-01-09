 
import { describe, it, expect } from 'vitest';
import { transformToUI, transformToVabamorf } from './phoneticMarkers';

describe('phoneticMarkers', () => {
  describe('transformToUI', () => {
    it('returns null for null input', () => {
      expect(transformToUI(null)).toBeNull();
    });

    it('returns empty string for empty input', () => {
      expect(transformToUI('')).toBe('');
    });

    it('transforms Vabamorf markers to UI markers', () => {
      expect(transformToUI('te<re')).toBe('te`re');
      expect(transformToUI('te?re')).toBe('te´re');
      expect(transformToUI('te]re')).toBe("te're");
      expect(transformToUI('te_re')).toBe('te+re');
    });

    it('handles text without markers', () => {
      expect(transformToUI('tere')).toBe('tere');
    });
  });

  describe('transformToVabamorf', () => {
    it('returns null for null input', () => {
      expect(transformToVabamorf(null)).toBeNull();
    });

    it('returns empty string for empty input', () => {
      expect(transformToVabamorf('')).toBe('');
    });

    it('transforms UI markers to Vabamorf markers', () => {
      expect(transformToVabamorf('te`re')).toBe('te<re');
      expect(transformToVabamorf('te´re')).toBe('te?re');
      expect(transformToVabamorf("te're")).toBe('te]re');
      expect(transformToVabamorf('te+re')).toBe('te_re');
    });

    it('handles text without markers', () => {
      expect(transformToVabamorf('tere')).toBe('tere');
    });
  });
});
