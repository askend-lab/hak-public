// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import {
  stripPhoneticMarkers,
  transformToUI,
  transformToVabamorf,
} from "./phoneticMarkers";

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
