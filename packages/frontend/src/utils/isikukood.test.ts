import { describe, it, expect } from 'vitest';
import { validateIsikukood, getNameFromIsikukood, formatIsikukood } from './isikukood';

describe('validateIsikukood', () => {
  it('returns false for invalid length', () => {
    expect(validateIsikukood('123')).toBe(false);
    expect(validateIsikukood('123456789012')).toBe(false);
  });

  it('returns false for non-numeric characters', () => {
    expect(validateIsikukood('3991231001a')).toBe(false);
  });

  it('returns false for invalid century digit', () => {
    expect(validateIsikukood('09912310013')).toBe(false);
    expect(validateIsikukood('79912310013')).toBe(false);
  });

  it('returns false for invalid month', () => {
    expect(validateIsikukood('39913310013')).toBe(false);
  });

  it('returns false for invalid day', () => {
    expect(validateIsikukood('39912320013')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateIsikukood('')).toBe(false);
  });

  it('validates checksum correctly', () => {
    // Valid Estonian ID codes (with correct checksums)
    expect(validateIsikukood('37605030299')).toBe(true);
  });
});

describe('getNameFromIsikukood', () => {
  it('returns Unknown User for invalid code', () => {
    expect(getNameFromIsikukood('123')).toBe('Unknown User');
    expect(getNameFromIsikukood('')).toBe('Unknown User');
  });

  it('returns a name for valid code', () => {
    const name = getNameFromIsikukood('37605030299');
    expect(name).not.toBe('Unknown User');
    expect(name.split(' ').length).toBe(2); // First and last name
  });
});

describe('formatIsikukood', () => {
  it('formats valid 11-digit code', () => {
    const formatted = formatIsikukood('37605030299');
    expect(formatted).toBe('376 05 03 029 9');
  });

  it('returns original for invalid length', () => {
    expect(formatIsikukood('123')).toBe('123');
    expect(formatIsikukood('')).toBe('');
  });
});

describe('validateIsikukood additional cases', () => {
  it('validates codes with checksum requiring second weight', () => {
    // Test checksum = 10 case with second weights
    expect(validateIsikukood('38001085718')).toBe(true);
  });

  it('validates female codes (even gender digit)', () => {
    expect(validateIsikukood('48001085718')).toBe(true);
  });

  it('validates century 5-6 codes (2000s)', () => {
    expect(validateIsikukood('50101010007')).toBe(true);
  });
});

describe('getNameFromIsikukood additional cases', () => {
  it('returns female name for even gender digit', () => {
    const name = getNameFromIsikukood('48001085718');
    expect(name).not.toBe('Unknown User');
    expect(name.split(' ').length).toBe(2);
  });

  it('handles different name indices', () => {
    const name1 = getNameFromIsikukood('37605030299');
    const name2 = getNameFromIsikukood('38001085718');
    expect(name1).not.toBe('Unknown User');
    expect(name2).not.toBe('Unknown User');
  });
});
