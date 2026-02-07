import { TEXT_LIMITS, TIMING } from './constants';

describe('Constants', () => {
  describe('TEXT_LIMITS', () => {
    it('should define positive audio text length limit', () => {
      expect(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBeGreaterThan(0);
      expect(typeof TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBe('number');
    });

    it('should define morphology limit larger than audio limit', () => {
      expect(TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH).toBeGreaterThan(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH);
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(TEXT_LIMITS)).toBe(true);
    });
  });

  describe('TIMING', () => {
    it('should define positive poll interval', () => {
      expect(TIMING.POLL_INTERVAL_MS).toBeGreaterThan(0);
    });

    it('should define error retry delay longer than poll interval', () => {
      expect(TIMING.ERROR_RETRY_DELAY_MS).toBeGreaterThanOrEqual(TIMING.POLL_INTERVAL_MS);
    });

    it('should define positive notification duration', () => {
      expect(TIMING.NOTIFICATION_DURATION_MS).toBeGreaterThan(0);
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(TIMING)).toBe(true);
    });
  });
});
