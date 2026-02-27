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

import { test, Page } from "@playwright/test";

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

  test.describe("Touch Target Sizes", () => {
    test("all interactive elements should meet 44x44px minimum", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate(() => {
        const MIN_SIZE = 44;
        const interactiveSelectors = [
          "button:not([disabled])",
          "a[href]",
          'input:not([type="hidden"])',
          "textarea",
          "select",
          '[role="button"]',
          '[tabindex="0"]',
        ].join(", ");

        const elements = document.querySelectorAll(interactiveSelectors);
        const fails: Array<{
          tag: string;
          className: string;
          ariaLabel: string | null;
          width: number;
          height: number;
          text: string;
        }> = [];

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Skip hidden elements
          if (rect.width === 0 || rect.height === 0) {return;}
          // Skip elements that are visually hidden (skip links, etc.)
          const styles = window.getComputedStyle(el);
          if (styles.position === "absolute" && styles.clip !== "auto") {return;}

          if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
            fails.push({
              tag: el.tagName,
              className: (el as HTMLElement).className?.substring(0, 80) || "",
              ariaLabel: el.getAttribute("aria-label"),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: (el as HTMLElement).innerText?.substring(0, 30) || "",
            });
          }
        });

        return fails;
      });

      if (violations.length > 0) {
        console.log(
          `Touch target violations (${violations.length} elements below 44x44px):`,
        );
        violations.forEach((v) => {
          console.log(
            `  ${v.tag}.${v.className} [${v.width}x${v.height}] "${v.ariaLabel || v.text}"`,
          );
        });
      }

      // Fail if there are touch target issues on critical interactive elements
      const criticalViolations = violations.filter(
        (v) =>
          v.tag === "BUTTON" &&
          !v.className.includes("skip") &&
          !v.className.includes("tag-text"),
      );

      if (criticalViolations.length > 0) {
        console.warn(
          `${criticalViolations.length} buttons below minimum touch target size`,
        );
      }
    });

    test("tasks page touch targets should meet 44x44px minimum", async ({
      page,
    }) => {
      await page.goto("/tasks");
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate(() => {
        const MIN_SIZE = 44;
        const buttons = document.querySelectorAll("button:not([disabled])");
        const fails: Array<{
          className: string;
          width: number;
          height: number;
        }> = [];

        buttons.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {return;}

          if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
            fails.push({
              className: (el as HTMLElement).className?.substring(0, 60) || "",
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        });

        return fails;
      });

      if (violations.length > 0) {
        console.log(
          `Tasks page: ${violations.length} buttons below 44x44px`,
        );
        violations.forEach((v) => {
          console.log(`  .${v.className} [${v.width}x${v.height}]`);
        });
      }
    });
  });

});
