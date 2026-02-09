// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import {
  parsePhoneticMarkers,
  generatePronunciationExplanation,
} from "./phoneticHelpers";

describe("phoneticHelpers", () => {
  describe("parsePhoneticMarkers", () => {
    it("returns default marker for plain text", () => {
      const result = parsePhoneticMarkers("tere");
      expect(result).toEqual([
        { tag: "rõhk esimesel silbil", type: "default" },
      ]);
    });

    it("detects kolmas välde marker <", () => {
      const result = parsePhoneticMarkers("te<re");
      expect(result).toContainEqual({ tag: "kolmas välde", type: "phonetic" });
    });

    it("detects ebareeglipärane rõhk marker ?", () => {
      const result = parsePhoneticMarkers("te?re");
      expect(result).toContainEqual({
        tag: "ebareeglipärane rõhk",
        type: "phonetic",
      });
    });

    it("detects peenendus marker ]", () => {
      const result = parsePhoneticMarkers("te]re");
      expect(result).toContainEqual({ tag: "peenendus", type: "phonetic" });
    });

    it("detects liitsõna piir marker _", () => {
      const result = parsePhoneticMarkers("liit_sõna");
      expect(result).toContainEqual({ tag: "liitsõna piir", type: "boundary" });
    });

    it("detects multiple markers", () => {
      const result = parsePhoneticMarkers("te<re_maailm?");
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("generatePronunciationExplanation", () => {
    it("returns default explanation for plain text", () => {
      const result = generatePronunciationExplanation("tere");
      expect(result).toContain("Häälda nii");
    });

    it("explains long vowel marker", () => {
      const result = generatePronunciationExplanation("te`re");
      expect(result).toContain("pikk");
    });

    it("explains stress marker", () => {
      const result = generatePronunciationExplanation("te´re");
      expect(result).toContain("Rõhk");
    });

    it("explains palatal marker", () => {
      const result = generatePronunciationExplanation("t'ere");
      expect(result).toContain("pehme");
    });

    it("explains compound word marker", () => {
      const result = generatePronunciationExplanation("liit+sõna");
      expect(result).toContain("Põhirõhk");
    });
  });
});
