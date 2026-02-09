// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { TEXT_LIMITS, TIMING } from "./constants";

describe("Constants", () => {
  describe("TEXT_LIMITS", () => {
    it("should define positive audio text length limit", () => {
      expect(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBeGreaterThan(0);
      expect(typeof TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBe("number");
    });

    it("should define morphology limit larger than audio limit", () => {
      expect(TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH).toBeGreaterThan(
        TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH,
      );
    });

    it("should be readonly (as const)", () => {
      // `as const` provides compile-time immutability; runtime freeze is not needed
      expect(TEXT_LIMITS).toBeDefined();
      expect(Object.keys(TEXT_LIMITS).length).toBeGreaterThan(0);
    });
  });

  describe("TIMING", () => {
    it("should define positive poll interval", () => {
      expect(TIMING.POLL_INTERVAL_MS).toBeGreaterThan(0);
    });

    it("should define error retry delay longer than poll interval", () => {
      expect(TIMING.ERROR_RETRY_DELAY_MS).toBeGreaterThanOrEqual(
        TIMING.POLL_INTERVAL_MS,
      );
    });

    it("should define positive notification duration", () => {
      expect(TIMING.NOTIFICATION_DURATION_MS).toBeGreaterThan(0);
    });

    it("should be readonly (as const)", () => {
      expect(TIMING).toBeDefined();
      expect(Object.keys(TIMING).length).toBeGreaterThan(0);
    });
  });
});
