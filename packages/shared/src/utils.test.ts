// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { sleep, isNonEmpty, isEmpty } from './utils';

describe('utils', () => {
  describe('sleep', () => {
    it('delays execution', async () => {
      const start = Date.now();
      await sleep(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45);
    });
  });

  describe('isNonEmpty', () => {
    it('returns true for non-empty strings', () => {
      expect(isNonEmpty('hello')).toBe(true);
      expect(isNonEmpty('  hello  ')).toBe(true);
    });

    it('returns false for empty strings', () => {
      expect(isNonEmpty('')).toBe(false);
      expect(isNonEmpty('   ')).toBe(false);
    });

    it('returns false for null and undefined', () => {
      expect(isNonEmpty(null)).toBe(false);
      expect(isNonEmpty(undefined)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('returns false for non-empty strings', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    it('returns true for empty strings', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('returns true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });
  });
});
