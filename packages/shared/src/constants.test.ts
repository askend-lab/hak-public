import { TEXT_LIMITS, TIMING } from './constants';

describe('Constants', () => {
  describe('TEXT_LIMITS', () => {
    it('should have MAX_AUDIO_TEXT_LENGTH', () => {
      expect(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBe(1000);
    });

    it('should have MAX_MORPHOLOGY_TEXT_LENGTH', () => {
      expect(TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH).toBe(10000);
    });
  });

  describe('TIMING', () => {
    it('should have POLL_INTERVAL_MS', () => {
      expect(TIMING.POLL_INTERVAL_MS).toBe(1000);
    });

    it('should have ERROR_RETRY_DELAY_MS', () => {
      expect(TIMING.ERROR_RETRY_DELAY_MS).toBe(5000);
    });

    it('should have NOTIFICATION_DURATION_MS', () => {
      expect(TIMING.NOTIFICATION_DURATION_MS).toBe(5000);
    });
  });
});
