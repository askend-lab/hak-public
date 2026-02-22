// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  formatPhoneticText,
  extractTokenText,
  createVariantFromMrf,
  isDuplicateVariant,
} from "../src/parser-helpers";
import type { MorphologyInfo } from "../src/types";

describe("parser-helpers", () => {
  describe("formatPhoneticText", () => {
    it("should combine stem and ending with +", () => {
      expect(formatPhoneticText("maja", "s")).toBe("maja+s");
    });

    it("should return stem only when ending is empty", () => {
      expect(formatPhoneticText("maja", "")).toBe("maja");
    });

    it("should return stem only when ending is '0'", () => {
      expect(formatPhoneticText("maja", "0")).toBe("maja");
    });
  });

  describe("extractTokenText", () => {
    it("should extract formatted text from mrf", () => {
      const result = extractTokenText({
        features: { mrf: [{ stem: "maja", ending: "s" }] },
      });
      expect(result).toBe("maja+s");
    });

    it("should return null for empty mrf array", () => {
      expect(extractTokenText({ features: { mrf: [] } })).toBeNull();
    });

    it("should return null for null mrf", () => {
      expect(extractTokenText({ features: { mrf: undefined } })).toBeNull();
    });

    it("should fall back to token when mrf has no stem", () => {
      expect(extractTokenText({ features: { mrf: [{}], token: "word" } })).toBe("word");
    });

    it("should return null when no mrf and no token", () => {
      expect(extractTokenText({ features: {} })).toBeNull();
    });

    it("should handle mrf with stem but no ending", () => {
      const result = extractTokenText({
        features: { mrf: [{ stem: "maja" }] },
      });
      expect(result).toBe("maja");
    });
  });

  describe("createVariantFromMrf", () => {
    it("should create variant from mrf data", () => {
      const result = createVariantFromMrf(
        { stem: "maja", ending: "s", pos: "S", lemma: "maja", fs: "sg g" },
        "majas"
      );
      expect(result).not.toBeNull();
      expect(result?.text).toBe("maja+s");
      expect(result?.morphology.lemma).toBe("maja");
    });

    it("should return null when stem is missing", () => {
      expect(createVariantFromMrf({ ending: "s" }, "word")).toBeNull();
    });

    it("should handle missing optional fields", () => {
      const result = createVariantFromMrf({ stem: "maja" }, "maja");
      expect(result).not.toBeNull();
      expect(result?.text).toBe("maja");
    });
  });

  describe("isDuplicateVariant", () => {
    const existing = [
      { text: "maja+s", description: "nimisõna", morphology: {} as unknown as MorphologyInfo },
    ];

    it("should return true for duplicate", () => {
      expect(isDuplicateVariant(existing, { text: "maja+s", description: "nimisõna", morphology: {} as unknown as MorphologyInfo })).toBe(true);
    });

    it("should return false for different text", () => {
      expect(isDuplicateVariant(existing, { text: "maja+d", description: "nimisõna", morphology: {} as unknown as MorphologyInfo })).toBe(false);
    });

    it("should return false for different description", () => {
      expect(isDuplicateVariant(existing, { text: "maja+s", description: "tegusõna", morphology: {} as unknown as MorphologyInfo })).toBe(false);
    });

    it("should return false for empty variants array", () => {
      expect(isDuplicateVariant([], { text: "maja+s", description: "nimisõna", morphology: {} as unknown as MorphologyInfo })).toBe(false);
    });
  });
});
