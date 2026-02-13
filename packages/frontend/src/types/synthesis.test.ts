// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import {
  getVoiceModel,
  convertTextToTags,
  normalizeTags,
  stripPunctuationForLookup,
} from "./synthesis";

describe("synthesis types", () => {
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

  describe("convertTextToTags", () => {
    it("splits text into words", () => {
      expect(convertTextToTags("hello world")).toEqual(["hello", "world"]);
    });

    it("handles multiple spaces", () => {
      expect(convertTextToTags("hello   world")).toEqual(["hello", "world"]);
    });

    it("returns empty array for empty string", () => {
      expect(convertTextToTags("")).toEqual([]);
    });

    it("trims whitespace", () => {
      expect(convertTextToTags("  hello world  ")).toEqual(["hello", "world"]);
    });

    it("handles single word", () => {
      expect(convertTextToTags("hello")).toEqual(["hello"]);
    });

    it("attaches trailing period to previous word", () => {
      expect(convertTextToTags("kool .")).toEqual(["kool."]);
    });

    it("attaches leading period to next word", () => {
      expect(convertTextToTags(". kool")).toEqual([".kool"]);
    });

    it("attaches comma to previous word", () => {
      expect(convertTextToTags("tere , maailm")).toEqual(["tere,", "maailm"]);
    });

    it("preserves already-attached punctuation", () => {
      expect(convertTextToTags("kool.")).toEqual(["kool."]);
    });

    it("attaches spaced dash to previous word", () => {
      expect(convertTextToTags("tere - maailm")).toEqual([
        "tere-",
        "maailm",
      ]);
    });

    it("preserves hyphenated compound words", () => {
      expect(convertTextToTags("läbi-kukkuja")).toEqual(["läbi-kukkuja"]);
    });

    it("attaches brackets around a word", () => {
      expect(convertTextToTags("( tere )")).toEqual(["(tere)"]);
    });

    it("handles multiple exclamation marks", () => {
      expect(convertTextToTags("Tere !!")).toEqual(["Tere!!"]);
    });

    it("handles ellipsis as separate tokens", () => {
      expect(convertTextToTags(". . .")).toEqual(["..."]);
    });

    it("handles punctuation-only input", () => {
      expect(convertTextToTags("...")).toEqual(["..."]);
    });

    it("handles multiple sentences with trailing periods", () => {
      expect(convertTextToTags("kool . tere .")).toEqual(["kool.", "tere."]);
    });

    it("is idempotent through join-and-re-split", () => {
      const input = "kool . tere , maailm !";
      const tags = convertTextToTags(input);
      const rejoined = tags.join(" ");
      expect(convertTextToTags(rejoined)).toEqual(tags);
    });
  });

  describe("stripPunctuationForLookup", () => {
    it("strips trailing period", () => {
      expect(stripPunctuationForLookup("kool.")).toBe("kool");
    });

    it("strips leading period", () => {
      expect(stripPunctuationForLookup(".kool")).toBe("kool");
    });

    it("strips both leading and trailing punctuation", () => {
      expect(stripPunctuationForLookup("(kool)")).toBe("kool");
    });

    it("preserves dashes (compound words)", () => {
      expect(stripPunctuationForLookup("läbi-kukkuja")).toBe("läbi-kukkuja");
    });

    it("preserves internal punctuation", () => {
      expect(stripPunctuationForLookup("U.S.A.")).toBe("U.S.A");
    });

    it("returns empty string for punctuation-only input", () => {
      expect(stripPunctuationForLookup("...")).toBe("");
    });

    it("preserves clean words unchanged", () => {
      expect(stripPunctuationForLookup("tere")).toBe("tere");
    });

    it("strips exclamation mark", () => {
      expect(stripPunctuationForLookup("Tere!")).toBe("Tere");
    });

    it("strips comma", () => {
      expect(stripPunctuationForLookup("tere,")).toBe("tere");
    });

    it("preserves leading dash", () => {
      expect(stripPunctuationForLookup("-kool")).toBe("-kool");
    });

    it("preserves trailing dash", () => {
      expect(stripPunctuationForLookup("e-")).toBe("e-");
    });

    it("handles Estonian characters", () => {
      expect(stripPunctuationForLookup("õpilane.")).toBe("õpilane");
    });
  });
});
