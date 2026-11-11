// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { getVoiceModel, normalizeTags } from "./synthesis";

describe("synthesis types", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("getVoiceModel", () => {
    it("returns efm_s for single word", () => {
      expect(getVoiceModel("hello")).toBe("efm_s");
    });

    it("returns efm_l for multiple words", () => {
      expect(getVoiceModel("hello world")).toBe("efm_l");
    });

    it("returns efm_l for empty string", () => {
      expect(getVoiceModel("")).toBe("efm_l");
    });

    it("returns efm_l for whitespace only", () => {
      expect(getVoiceModel("   ")).toBe("efm_l");
    });

    it("returns efm_l for sentence", () => {
      expect(getVoiceModel("This is a sentence")).toBe("efm_l");
    });

    it("returns efm_s for word with trailing punctuation", () => {
      expect(getVoiceModel("kool.")).toBe("efm_s");
    });
  });

  describe("normalizeTags", () => {
    it("returns empty array for empty input", () => {
      expect(normalizeTags([])).toEqual([]);
    });

    it("returns word tokens unchanged", () => {
      expect(normalizeTags(["hello", "world"])).toEqual(["hello", "world"]);
    });

    it("left-attaches trailing punctuation to previous word", () => {
      expect(normalizeTags(["kool", "."])).toEqual(["kool."]);
    });

    it("right-attaches leading punctuation to next word", () => {
      expect(normalizeTags([".", "kool"])).toEqual([".kool"]);
    });

    it("left-attaches comma to previous word", () => {
      expect(normalizeTags(["tere", ",", "maailm"])).toEqual([
        "tere,",
        "maailm",
      ]);
    });

    it("attaches brackets around a word", () => {
      expect(normalizeTags(["(", "tere", ")"])).toEqual(["(tere)"]);
    });

    it("merges multiple trailing punctuation marks", () => {
      expect(normalizeTags(["Tere", "!!"])).toEqual(["Tere!!"]);
    });

    it("merges consecutive punctuation-only tokens leftward", () => {
      expect(normalizeTags(["kool", ".", "!"])).toEqual(["kool.!"]);
    });

    it("merges leading punctuation tokens then right-attaches", () => {
      expect(normalizeTags([".", ".", "kool"])).toEqual(["..kool"]);
    });

    it("handles punctuation-only input as single token", () => {
      expect(normalizeTags(["..."])).toEqual(["..."]);
    });

    it("handles dash as punctuation (left-attaches)", () => {
      expect(normalizeTags(["tere", "-", "maailm"])).toEqual([
        "tere-",
        "maailm",
      ]);
    });

    it("preserves hyphenated words (no spaces)", () => {
      expect(normalizeTags(["läbi-kukkuja"])).toEqual(["läbi-kukkuja"]);
    });

    it("handles word with embedded punctuation as word token", () => {
      expect(normalizeTags(["U.S.A."])).toEqual(["U.S.A."]);
    });

    it("handles punctuation between two sentences", () => {
      expect(normalizeTags(["kool", ".", "tere", "."])).toEqual([
        "kool.",
        "tere.",
      ]);
    });

    it("handles leading and trailing punctuation around a word", () => {
      expect(normalizeTags(["(", "tere", ")", ".", "maailm"])).toEqual([
        "(tere).",
        "maailm",
      ]);
    });

    it("handles single word unchanged", () => {
      expect(normalizeTags(["hello"])).toEqual(["hello"]);
    });

    it("handles Estonian letters as word characters", () => {
      expect(normalizeTags(["õpilane", ".", "kooli"])).toEqual([
        "õpilane.",
        "kooli",
      ]);
    });
  });

  });

  });

  });

  });

  });

});
