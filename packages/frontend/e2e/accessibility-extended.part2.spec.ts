// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Accessibility E2E Tests - Extended
 *
 * Touch target sizes and screen reader readiness checks
 * for WCAG 2.1 AA compliance.
 *
 * Split from accessibility.spec.ts for maintainability.
 */

import { test, expect, Page } from "@playwright/test";

// Bypass onboarding role selection so tests reach actual pages
const ONBOARDING_STATE = JSON.stringify({
  completed: true,
  selectedRole: "learner",
  completedAt: new Date().toISOString(),
});

async function bypassOnboarding(page: Page) {
  await page.goto("/");
  await page.evaluate(
    (state: string) => {
      localStorage.setItem("eki_onboarding", state);
      localStorage.setItem("hak_cookie_consent", "accepted");
    },
    ONBOARDING_STATE,
  );
}

describe("accessibility-extended.spec", () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });
  // =========================================================================
  // Touch Target Size Verification
  // =========================================================================

  test.describe("Screen Reader Readiness", () => {
    test("page should have proper landmark structure", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const landmarks = await page.evaluate(() => {
        return {
          hasHeader: !!document.querySelector("header"),
          hasNav: !!document.querySelector("nav"),
          hasMain: !!document.querySelector("main"),
          hasFooter: !!document.querySelector("footer"),
          mainHasId: !!document.querySelector("main#main-content"),
          skipLinkExists: !!document.querySelector('a[href="#main-content"]'),
        };
      });

      expect(landmarks.hasHeader).toBeTruthy();
      expect(landmarks.hasNav).toBeTruthy();
      expect(landmarks.hasMain).toBeTruthy();
      expect(landmarks.hasFooter).toBeTruthy();
      expect(landmarks.mainHasId).toBeTruthy();
      expect(landmarks.skipLinkExists).toBeTruthy();
    });

    test("page should have correct heading hierarchy", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const headings = await page.evaluate(() => {
        const hs = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        return [...hs].map((h) => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim().substring(0, 50) || "",
          visible:
            (h as HTMLElement).offsetWidth > 0 &&
            (h as HTMLElement).offsetHeight > 0,
        }));
      });

      // There should be at least one h1
      const h1s = headings.filter((h) => h.level === 1 && h.visible);
      expect(h1s.length).toBeGreaterThanOrEqual(1);

      // Log heading hierarchy for review
      console.log("Heading hierarchy:");
      headings.forEach((h) => {
        console.log(`  ${"  ".repeat(h.level - 1)}h${h.level}: ${h.text}`);
      });
    });

    test("all buttons should have accessible names", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const buttonsWithoutNames = await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        const fails: string[] = [];

        buttons.forEach((btn) => {
          const rect = btn.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {return;} // Skip hidden

          const hasText = btn.textContent?.trim();
          const hasAriaLabel = btn.getAttribute("aria-label");
          const hasAriaLabelledBy = btn.getAttribute("aria-labelledby");
          const hasTitle = btn.getAttribute("title");

          if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
            fails.push(
              `<${btn.tagName} class="${btn.className?.substring(0, 60)}">`,
            );
          }
        });

        return fails;
      });

      if (buttonsWithoutNames.length > 0) {
        console.log("Buttons without accessible names:");
        buttonsWithoutNames.forEach((b) => console.log(`  ${b}`));
      }

      expect(buttonsWithoutNames.length).toBe(0);
    });

    test("all form inputs should have labels", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const inputsWithoutLabels = await page.evaluate(() => {
        const inputs = document.querySelectorAll(
          'input:not([type="hidden"]), textarea, select',
        );
        const fails: string[] = [];

        inputs.forEach((input) => {
          const rect = (input as HTMLElement).getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {return;} // Skip hidden

          const hasAriaLabel = input.getAttribute("aria-label");
          const hasAriaLabelledBy = input.getAttribute("aria-labelledby");
          const id = input.getAttribute("id");
          const hasLabel = id
            ? !!document.querySelector(`label[for="${id}"]`)
            : false;
          const hasWrappingLabel = !!input.closest("label");

          if (!hasAriaLabel && !hasAriaLabelledBy && !hasLabel && !hasWrappingLabel) {
            fails.push(
              `<${input.tagName} class="${(input as HTMLElement).className?.substring(0, 60)}" placeholder="${input.getAttribute("placeholder") || ""}">`,
            );
          }
        });

        return fails;
      });

      if (inputsWithoutLabels.length > 0) {
        console.log("Inputs without labels:");
        inputsWithoutLabels.forEach((i) => console.log(`  ${i}`));
      }

      expect(inputsWithoutLabels.length).toBe(0);
    });

    test("document should have correct language attribute", async ({
      page,
    }) => {
      await page.goto("/");
      const lang = await page.evaluate(() =>
        document.documentElement.getAttribute("lang"),
      );
      expect(lang).toBe("et");
    });

    test("document title should update on navigation", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const synthesisTitle = await page.title();
      expect(synthesisTitle).toContain("Hääldusabiline");

      await page.goto("/tasks");
      await page.waitForLoadState("networkidle");
      const tasksTitle = await page.title();
      expect(tasksTitle).toContain("Ülesanded");
    });

    test("notifications should have live region attributes", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const hasLiveRegion = await page.evaluate(() => {
        const container = document.querySelector(".notification-container");
        return container?.getAttribute("aria-live") === "polite";
      });

      expect(hasLiveRegion).toBeTruthy();
    });
  });

});
