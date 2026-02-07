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
      expect(symbols[0]).toHaveProperty("symbol", "`");
      expect(symbols[0]).toHaveProperty("label");
      expect(symbols[0]).toHaveProperty("description");
      expect(symbols.length).toBe(4);
    });
  });

  describe("stripPhoneticMarkers", () => {
    it("removes all phonetic markers from text", () => {
      expect(stripPhoneticMarkers("te`re")).toBe("tere");
      expect(stripPhoneticMarkers("te're")).toBe("tere");
      expect(stripPhoneticMarkers("te+re")).toBe("tere");
    });

    it("returns null for null input", () => {
      expect(stripPhoneticMarkers(null)).toBeNull();
    });
  });

  describe("isVabamorfMarker", () => {
    it("identifies Vabamorf markers", () => {
      expect(isVabamorfMarker("<")).toBe(true);
      expect(isVabamorfMarker("?")).toBe(true);
      expect(isVabamorfMarker("a")).toBe(false);
    });
  });
});
