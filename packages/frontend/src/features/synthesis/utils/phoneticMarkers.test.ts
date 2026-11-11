// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import {
  transformToUI,
  transformToVabamorf,
  getUISymbols,
  stripPhoneticMarkers,
  isVabamorfMarker,
} from "./phoneticMarkers";

describe("phoneticMarkers", () => {
  describe("transformToUI", () => {
    it("returns null for null input", () => {
      expect(transformToUI(null)).toBeNull();
    });

    it("returns empty string for empty input", () => {
      expect(transformToUI("")).toBe("");
    });

    it("transforms Vabamorf markers to UI markers", () => {
      expect(transformToUI("te<re")).toBe("te`re");
      expect(transformToUI("te?re")).toBe("te´re");
      expect(transformToUI("te]re")).toBe("te're");
      expect(transformToUI("te_re")).toBe("te+re");
    });

    it("handles text without markers", () => {
      expect(transformToUI("tere")).toBe("tere");
    });
  });

  describe("transformToVabamorf", () => {
    it("returns null for null input", () => {
      expect(transformToVabamorf(null)).toBeNull();
    });

    it("returns empty string for empty input", () => {
      expect(transformToVabamorf("")).toBe("");
    });

    it("transforms UI markers to Vabamorf markers", () => {
      expect(transformToVabamorf("te`re")).toBe("te<re");
      expect(transformToVabamorf("te´re")).toBe("te?re");
      expect(transformToVabamorf("te're")).toBe("te]re");
      expect(transformToVabamorf("te+re")).toBe("te_re");
    });

    it("handles text without markers", () => {
      expect(transformToVabamorf("tere")).toBe("tere");
    });
  });

  describe("transformToUI - unmapped markers", () => {
    it("omits unmapped Vabamorf markers", () => {
      // Characters like ~ are Vabamorf markers not in mapping → should be omitted
      expect(transformToUI("te~re")).toBe("tere");
    });
  });

  describe("getUISymbols", () => {
    it("returns array of UI symbol objects", () => {
      const symbols = getUISymbols();
      expect(Array.isArray(symbols)).toBe(true);
      expect(symbols.length).toBe(4);
    });

    it("returns exact symbols in order", () => {
      const symbols = getUISymbols();
      expect(symbols[0]).toStrictEqual({ symbol: "`", label: "Kolmas välde", description: "Third pitch accent" });
      expect(symbols[1]).toStrictEqual({ symbol: "´", label: "Rõhuline silp", description: "Stressed syllable" });
      expect(symbols[2]).toStrictEqual({ symbol: "'", label: "Palatalisatsioon", description: "Palatalization" });
      expect(symbols[3]).toStrictEqual({ symbol: "+", label: "Liitsõna piir", description: "Compound word boundary" });
    });
  });

  describe("stripPhoneticMarkers", () => {
    it("removes all phonetic markers from text", () => {
      expect(stripPhoneticMarkers("te`re")).toBe("tere");
      expect(stripPhoneticMarkers("te're")).toBe("tere");
      expect(stripPhoneticMarkers("te+re")).toBe("tere");
    });

    it("removes Vabamorf markers (< ? ] ~ _ = [ . ´)", () => {
      expect(stripPhoneticMarkers("te<re")).toBe("tere");
      expect(stripPhoneticMarkers("te?re")).toBe("tere");
      expect(stripPhoneticMarkers("te]re")).toBe("tere");
      expect(stripPhoneticMarkers("te~re")).toBe("tere");
      expect(stripPhoneticMarkers("te_re")).toBe("tere");
      expect(stripPhoneticMarkers("te=re")).toBe("tere");
      expect(stripPhoneticMarkers("te[re")).toBe("tere");
      expect(stripPhoneticMarkers("te.re")).toBe("tere");
      expect(stripPhoneticMarkers("te´re")).toBe("tere");
    });

    it("returns null for null input", () => {
      expect(stripPhoneticMarkers(null)).toBeNull();
    });

    it("returns empty string for empty input", () => {
      expect(stripPhoneticMarkers("")).toBe("");
    });

    it("handles text with multiple markers", () => {
      expect(stripPhoneticMarkers("m<ee_s")).toBe("mees");
    });
  });

  describe("isVabamorfMarker", () => {
    it("identifies all known Vabamorf markers", () => {
      const markers = ["<", "?", "]", "~", "+", "_", "=", "[", "'", ".", "´", "`"];
      for (const m of markers) {
        expect(isVabamorfMarker(m)).toBe(true);
      }
    });

    it("rejects non-marker characters", () => {
      expect(isVabamorfMarker("a")).toBe(false);
      expect(isVabamorfMarker("1")).toBe(false);
      expect(isVabamorfMarker(" ")).toBe(false);
      expect(isVabamorfMarker("-")).toBe(false);
    });
  });
});

// --- Merged from phoneticMarkers.full.test.ts ---

describe("phoneticMarkers full coverage", () => {
  describe("stripPhoneticMarkers", () => {
    it("strips grave accent", () => {
      expect(stripPhoneticMarkers("te`st")).toBe("test");
    });
    it("strips acute accent", () => {
      expect(stripPhoneticMarkers("te´st")).toBe("test");
    });
    it("strips apostrophe", () => {
      expect(stripPhoneticMarkers("te'st")).toBe("test");
    });
    it("strips plus sign", () => {
      expect(stripPhoneticMarkers("te+st")).toBe("test");
    });
    it("handles multiple markers", () => {
      expect(stripPhoneticMarkers("te`s´t+a")).toBe("testa");
    });
    it("handles empty string", () => {
      expect(stripPhoneticMarkers("")).toBe("");
    });
    it("handles no markers", () => {
      expect(stripPhoneticMarkers("hello")).toBe("hello");
    });
  });

  describe("transformToUI", () => {
    it("transforms < to grave", () => {
      expect(transformToUI("te<st")).toBe("te`st");
    });
    it("transforms ? to acute", () => {
      expect(transformToUI("te?st")).toBe("te´st");
    });
    it("transforms _ to plus", () => {
      expect(transformToUI("te_st")).toBe("te+st");
    });
    it("handles null", () => {
      expect(transformToUI(null)).toBeNull();
    });
    it("handles empty string", () => {
      expect(transformToUI("")).toBe("");
    });
    it("handles multiple transformations", () => {
      expect(transformToUI("a<b?c_d")).toBe("a`b´c+d");
    });
  });

  describe("transformToVabamorf", () => {
    it("transforms grave to <", () => {
      expect(transformToVabamorf("te`st")).toBe("te<st");
    });
    it("transforms acute to ?", () => {
      expect(transformToVabamorf("te´st")).toBe("te?st");
    });
    it("transforms plus to _", () => {
      expect(transformToVabamorf("te+st")).toBe("te_st");
    });
    it("handles null", () => {
      expect(transformToVabamorf(null)).toBeNull();
    });
    it("handles empty string", () => {
      expect(transformToVabamorf("")).toBe("");
    });
    it("handles multiple transformations", () => {
      expect(transformToVabamorf("a`b´c+d")).toBe("a<b?c_d");
    });
  });
});
