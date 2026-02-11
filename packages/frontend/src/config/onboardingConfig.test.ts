// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { ROLE_CONFIGS, STORAGE_KEY } from "./onboardingConfig";

describe("onboardingConfig", () => {
  it("exports STORAGE_KEY", () => {
    expect(STORAGE_KEY).toBe("eki_onboarding");
  });

  it("defines all three roles", () => {
    expect(Object.keys(ROLE_CONFIGS)).toEqual(["learner", "teacher", "specialist"]);
  });

  describe("learner role", () => {
    const config = ROLE_CONFIGS.learner;

    it("has correct identity", () => {
      expect(config.id).toBe("learner");
      expect(config.titleEt).toBe("Õppija");
      expect(config.ctaText).toBe("Hakkan õppima");
      expect(config.mascotVariant).toBe("wave");
    });

    it("has description", () => {
      expect(config.descriptionEt).toContain("lause");
    });

    it("has 5 steps", () => {
      expect(config.steps.length).toBe(5);
    });

    it("has correct step ids in order", () => {
      const stepIds = config.steps.map((s) => s.id);
      expect(stepIds).toEqual(["input", "play", "variants", "add-sentence", "save-task"]);
    });

    it("has correct step positions", () => {
      expect(config.steps[0]?.position).toBe("bottom");
      expect(config.steps[1]?.position).toBe("left");
      expect(config.steps[2]?.position).toBe("bottom");
      expect(config.steps[3]?.position).toBe("top");
      expect(config.steps[4]?.position).toBe("bottom");
    });

    it("has target selectors for each step", () => {
      config.steps.forEach((step) => {
        expect(step.targetSelector).toContain("data-onboarding-target");
      });
    });

    it("has titles and descriptions for each step", () => {
      config.steps.forEach((step) => {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("teacher role", () => {
    const config = ROLE_CONFIGS.teacher;

    it("has correct identity", () => {
      expect(config.id).toBe("teacher");
      expect(config.titleEt).toBe("Õpetaja");
      expect(config.ctaText).toBe("Hakkan looma");
      expect(config.mascotVariant).toBe("point");
    });

    it("has 5 steps", () => {
      expect(config.steps.length).toBe(5);
    });

    it("has correct step ids in order", () => {
      const stepIds = config.steps.map((s) => s.id);
      expect(stepIds).toEqual(["input", "play", "add-sentence", "variants", "create-task"]);
    });

    it("has correct step positions", () => {
      expect(config.steps[0]?.position).toBe("bottom");
      expect(config.steps[1]?.position).toBe("left");
      expect(config.steps[2]?.position).toBe("top");
      expect(config.steps[3]?.position).toBe("bottom");
      expect(config.steps[4]?.position).toBe("bottom");
    });
  });

  describe("specialist role", () => {
    const config = ROLE_CONFIGS.specialist;

    it("has correct identity", () => {
      expect(config.id).toBe("specialist");
      expect(config.titleEt).toBe("Uurija");
      expect(config.ctaText).toBe("Hakkan uurima");
      expect(config.mascotVariant).toBe("think");
    });

    it("has 5 steps", () => {
      expect(config.steps.length).toBe(5);
    });

    it("has correct step ids in order", () => {
      const stepIds = config.steps.map((s) => s.id);
      expect(stepIds).toEqual(["input", "play", "add-sentence", "variants", "phonetic-form"]);
    });

    it("has correct step positions", () => {
      expect(config.steps[0]?.position).toBe("bottom");
      expect(config.steps[1]?.position).toBe("left");
      expect(config.steps[2]?.position).toBe("top");
      expect(config.steps[3]?.position).toBe("bottom");
      expect(config.steps[4]?.position).toBe("left");
    });

    it("has phonetic-form step with menu target", () => {
      const phoneticStep = config.steps.find((s) => s.id === "phonetic-form");
      expect(phoneticStep).toBeDefined();
      expect(phoneticStep?.targetSelector).toContain("sentence-0-menu");
      expect(phoneticStep?.title).toContain("foneetilist");
    });
  });

  describe("all roles share common patterns", () => {
    it("all roles start with input step", () => {
      Object.values(ROLE_CONFIGS).forEach((config) => {
        expect(config.steps[0]?.id).toBe("input");
        expect(config.steps[0]?.targetSelector).toContain("sentence-1-input");
      });
    });

    it("all roles have play step second", () => {
      Object.values(ROLE_CONFIGS).forEach((config) => {
        expect(config.steps[1]?.id).toBe("play");
        expect(config.steps[1]?.targetSelector).toContain("sentence-1-play");
      });
    });

    it("all roles have unique ids", () => {
      Object.values(ROLE_CONFIGS).forEach((config) => {
        const ids = config.steps.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  });
});
