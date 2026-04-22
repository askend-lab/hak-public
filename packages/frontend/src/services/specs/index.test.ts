// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loadCucumberResults,
  getFeatures,
  getFeatureGroups,
  parseCucumberResults,
} from "./index";

describe("specs service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadCucumberResults", () => {
    it("returns results when fetch succeeds", async () => {
      const mockResults = [{ keyword: "Feature", name: "Test", elements: [] }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResults),
      });

      const result = await loadCucumberResults();
      expect(result).toEqual(mockResults);
      expect(fetch).toHaveBeenCalledWith("/cucumber-results.json");
    });

    it("returns null when fetch fails with non-ok response", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const result = await loadCucumberResults();
      expect(result).toBeNull();
    });

    it("returns null when fetch throws error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await loadCucumberResults();
      expect(result).toBeNull();
    });
  });

  describe("getFeatures", () => {
    it("returns a non-empty record of feature files", () => {
      const features = getFeatures();
      expect(typeof features).toBe("object");
      const keys = Object.keys(features);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach((key) => {
        expect(typeof features[key]).toBe("string");
      });
    });
  });

  describe("getFeatureGroups", () => {
    it("returns a non-empty record of grouped feature files", () => {
      const groups = getFeatureGroups();
      expect(typeof groups).toBe("object");
      const groupNames = Object.keys(groups);
      expect(groupNames.length).toBeGreaterThan(0);
      groupNames.forEach((name) => {
        expect(typeof groups[name]).toBe("object");
      });
    });
  });

  describe("parseCucumberResults", () => {
    it("parses cucumber results into test suites", () => {
      const cucumberResults = [
        {
          keyword: "Feature",
          name: "Login Feature",
          elements: [
            {
              keyword: "Scenario",
              name: "User logs in",
              steps: [
                {
                  keyword: "Given",
                  name: "user exists",
                  result: { status: "passed", duration: 1000000 },
                },
                {
                  keyword: "When",
                  name: "user logs in",
                  result: { status: "passed", duration: 2000000 },
                },
              ],
            },
          ],
        },
      ];

      const result = parseCucumberResults(cucumberResults);

      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("Login Feature");
      expect(result[0]?.tests).toHaveLength(1);
      expect(result[0]?.tests[0]?.name).toBe("User logs in");
      expect(result[0]?.tests[0]?.status).toBe("passed");
      expect(result[0]?.tests[0]?.duration).toBe(3); // 3000000ns = 3ms
    });

    it("marks test as failed when any step fails", () => {
      const cucumberResults = [
        {
          keyword: "Feature",
          name: "Test Feature",
          elements: [
            {
              keyword: "Scenario",
              name: "Failing scenario",
              steps: [
                {
                  keyword: "Given",
                  name: "step1",
                  result: { status: "passed" },
                },
                {
                  keyword: "When",
                  name: "step2",
                  result: { status: "failed" },
                },
              ],
            },
          ],
        },
      ];

      const result = parseCucumberResults(cucumberResults);
      expect(result[0]?.tests[0]?.status).toBe("failed");
    });

    it("handles steps without duration", () => {
      const cucumberResults = [
        {
          keyword: "Feature",
          name: "Test",
          elements: [
            {
              keyword: "Scenario",
              name: "Test scenario",
              steps: [
                {
                  keyword: "Given",
                  name: "step",
                  result: { status: "passed" },
                },
              ],
            },
          ],
        },
      ];

      const result = parseCucumberResults(cucumberResults);
      expect(result[0]?.tests[0]?.duration).toBe(0);
    });
  });
});
