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
      expect(result.length).toBe(3);
      expect(result).toContainEqual({ tag: "kolmas välde", type: "phonetic" });
      expect(result).toContainEqual({ tag: "ebareeglipärane rõhk", type: "phonetic" });
      expect(result).toContainEqual({ tag: "liitsõna piir", type: "boundary" });
    });

    it("does not include default marker when other markers found", () => {
      const result = parsePhoneticMarkers("te<re");
      expect(result.some(m => m.type === "default")).toBe(false);
    });
  });

  describe("generatePronunciationExplanation", () => {
    it("returns default explanation for plain text", () => {
      const result = generatePronunciationExplanation("tere");
      expect(result).toContain("Häälda nii");
    });

    it("explains long vowel marker with uppercase letter", () => {
      const result = generatePronunciationExplanation("te`re");
      expect(result).toBe('"R" on pikk');
    });

    it("explains stress marker with exact letter", () => {
      const result = generatePronunciationExplanation("te´re");
      expect(result).toBe('Rõhk on "r" peal');
    });

    it("explains palatal marker with uppercase letter", () => {
      const result = generatePronunciationExplanation("t'ere");
      expect(result).toBe('"T" on pehme hääldusega');
    });

    it("explains compound word marker", () => {
      const result = generatePronunciationExplanation("liit+sõna");
      expect(result).toBe("Põhirõhk esimesel osal – häälda seda nagu eraldi sõna");
    });

    it("joins multiple explanations with period and space", () => {
      const result = generatePronunciationExplanation("te`re+maailm");
      expect(result).toContain(". ");
      expect(result).toContain('"R" on pikk');
      expect(result).toContain("Põhirõhk");
    });

    it("handles multiple long vowels", () => {
      const result = generatePronunciationExplanation("`a`e");
      expect(result).toContain('"A" on pikk');
      expect(result).toContain('"E" on pikk');
    });
  });
});
