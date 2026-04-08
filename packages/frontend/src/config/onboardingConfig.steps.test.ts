// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { ROLE_CONFIGS } from "./onboardingConfig";

describe("onboardingConfig", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
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
      expect(phoneticStep?.targetSelector).toBe('[data-onboarding-target="sentence-0-menu"]');
      expect(phoneticStep?.title).toBe("Uuri häälduskuju");
      expect(phoneticStep?.description).toContain("häälduskuju");
    });

    it("has exact specialist step titles", () => {
      expect(config.steps[3]?.title).toBe("Uuri hääldusvariandid");
      expect(config.steps[3]?.description).toContain("hääldusvariant");
    });

    it("has correct descriptionEt", () => {
      expect(config.descriptionEt).toContain("Helinda");
    });

    it("has exact step titles for specialist", () => {
      expect(config.steps[0]?.title).toBe("Sisesta lause");
      expect(config.steps[1]?.title).toBe("Kuula hääldust");
      expect(config.steps[2]?.title).toBe("Lisa rohkem lauseid");
    });

    it("has exact step descriptions for specialist", () => {
      expect(config.steps[0]?.description).toBe("Kirjuta siia sõna või lause, mille hääldust soovid kuulata.");
      expect(config.steps[1]?.description).toBe("Vajuta, et kuulata sisestatud teksti korrektset hääldust.");
      expect(config.steps[2]?.description).toBe("Lisa mitu lauset ja kuula neid järjest.");
    });

    it("has exact step targetSelectors for specialist", () => {
      expect(config.steps[2]?.targetSelector).toBe('[data-onboarding-target="add-sentence-button"]');
      expect(config.steps[3]?.targetSelector).toBe('[data-onboarding-target="sentence-0-tag-0"]');
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

  });

  });

  });

  });

});
