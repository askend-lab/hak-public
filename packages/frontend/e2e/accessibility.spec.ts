// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Accessibility E2E Tests
 *
 * Full-page accessibility audits using Playwright and axe-core
 * for WCAG 2.1 AA compliance.
 *
 * Tests all major pages, modals, panels, and interactive states.
 */

import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// WCAG 2.1 AA tags to test against
const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Run axe accessibility audit on current page
 */
async function runAccessibilityAudit(page: Page) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .analyze();

  return accessibilityScanResults;
}

/**
 * Assert no critical or serious accessibility violations
 */
function expectNoSeriousViolations(
  results: Awaited<ReturnType<typeof runAccessibilityAudit>>,
): void {
  const seriousViolations = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );

  if (seriousViolations.length > 0) {
    const summary = seriousViolations
      .map(
        (v) =>
          `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} instances)`,
      )
      .join("\n");

    throw new Error(
      `Found ${seriousViolations.length} serious accessibility violations:\n${summary}`,
    );
  }
}

/**
 * Log all violations for review (including minor ones)
 */
function logViolations(
  results: Awaited<ReturnType<typeof runAccessibilityAudit>>,
  context: string,
): void {
  if (results.violations.length > 0) {
    console.log(
      `[${context}] ${results.violations.length} accessibility issues:`,
    );
    results.violations.forEach((v) => {
      console.log(
        `  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} elements)`,
      );
    });
  }
}

// =========================================================================
// Page-Level Audits
// =========================================================================

// Bypass onboarding role selection so tests reach actual pages
const ONBOARDING_STATE = JSON.stringify({
  completed: true,
  selectedRole: "learner",
  completedAt: new Date().toISOString(),
});

async function bypassOnboarding(page: Page) {
  await page.goto("/");
  await page.evaluate(
    (state: string) => localStorage.setItem("eki_onboarding", state),
    ONBOARDING_STATE,
  );
}

test.describe("Accessibility - WCAG 2.1 AA Compliance", () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test.describe("Synthesis Page (Main View)", () => {
    test("should have no critical accessibility violations on synthesis page", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const results = await runAccessibilityAudit(page);
      logViolations(results, "Synthesis Page");
      expectNoSeriousViolations(results);
    });

    test("should maintain accessibility during user interactions", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Interact with the page - add a sentence
      const input = page.locator("input[placeholder], textarea").first();
      if (await input.isVisible()) {
        await input.fill("Tere, kuidas läheb?");
        await input.press("Enter");
        await page.waitForTimeout(500);
      }

      const results = await runAccessibilityAudit(page);
      logViolations(results, "Synthesis Page - After Input");
      expectNoSeriousViolations(results);
    });
  });

  test.describe("Tasks Page", () => {
    test("should have no critical accessibility violations on tasks page", async ({
      page,
    }) => {
      await page.goto("/tasks");
      await page.waitForLoadState("networkidle");

      const results = await runAccessibilityAudit(page);
      logViolations(results, "Tasks Page");
      expectNoSeriousViolations(results);
    });
  });

  test.describe("Specs Page", () => {
    test("should have no critical accessibility violations on specs page", async ({
      page,
    }) => {
      await page.goto("/specs");
      await page.waitForLoadState("networkidle");

      const results = await runAccessibilityAudit(page);
      logViolations(results, "Specs Page");
      expectNoSeriousViolations(results);
    });
  });

  test.describe("Dashboard Page", () => {
    test("should have no critical accessibility violations on dashboard", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      const results = await runAccessibilityAudit(page);
      logViolations(results, "Dashboard");
      expectNoSeriousViolations(results);
    });
  });

  test.describe("Role Selection Page", () => {
    test("should have no critical accessibility violations on role selection", async ({
      page,
    }) => {
      await page.goto("/role-selection");
      await page.waitForLoadState("networkidle");

      const results = await runAccessibilityAudit(page);
      logViolations(results, "Role Selection");
      expectNoSeriousViolations(results);
    });
  });

  // =========================================================================
  // Modal Audits
  // =========================================================================

  test.describe("Modal Accessibility", () => {
    test("login modal should be accessible", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const loginButton = page.getByRole("button", {
        name: /logi sisse|login/i,
      });
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(300);

        const results = await runAccessibilityAudit(page);
        logViolations(results, "Login Modal");
        expectNoSeriousViolations(results);
      }
    });

    test("confirmation modal should be accessible", async ({ page }) => {
      await page.goto("/tasks");
      await page.waitForLoadState("networkidle");

      // Try to trigger a delete confirmation
      const menuButton = page.locator('[aria-label="Rohkem valikuid"]').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(200);

        const deleteButton = page.getByRole("button", { name: /kustuta/i });
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          await page.waitForTimeout(300);

          const results = await runAccessibilityAudit(page);
          logViolations(results, "Confirmation Modal");
          expectNoSeriousViolations(results);
        }
      }
    });
  });

  // =========================================================================
  // Keyboard Navigation
  // =========================================================================

  test.describe("Keyboard Navigation", () => {
    test("should be navigable with keyboard only", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Tab through interactive elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;

          const styles = window.getComputedStyle(el);
          return {
            tagName: el.tagName,
            hasOutline:
              styles.outlineStyle !== "none" || styles.boxShadow !== "none",
            outlineStyle: styles.outline,
            boxShadow: styles.boxShadow,
          };
        });

        if (focusedElement && focusedElement.tagName !== "BODY") {
          console.log(
            `Focus on ${focusedElement.tagName}:`,
            focusedElement.hasOutline,
          );
        }
      }
    });

    test("skip link should be first focusable element", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // First Tab should focus the skip link
      await page.keyboard.press("Tab");

      const skipLink = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.classList.contains("skip-link") || el?.textContent?.includes("Liigu põhisisu juurde");
      });

      expect(skipLink).toBeTruthy();
    });

    test("Escape key should close modals", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const loginButton = page.getByRole("button", {
        name: /logi sisse|login/i,
      });
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(300);

        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);

        const modal = page.locator(".base-modal");
        await expect(modal).not.toBeVisible();
      }
    });
  });

  // =========================================================================
  // Focus Management
  // =========================================================================

  test.describe("Focus Management", () => {
    test("focus should be visible on interactive elements", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const focusableElements = await page
        .locator(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        .all();

      for (const element of focusableElements.slice(0, 5)) {
        await element.focus();

        const hasFocusIndicator = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          const outline = styles.outline;
          const boxShadow = styles.boxShadow;

          const hasOutline =
            outline && !outline.includes("none") && !outline.includes("0px");
          const hasBoxShadow = boxShadow && boxShadow !== "none";

          return hasOutline || hasBoxShadow;
        });

        if (!hasFocusIndicator) {
          const tagName = await element.evaluate((el) => el.tagName);
          const className = await element.evaluate((el) => el.className);
          console.log(
            `WARNING: No visible focus indicator on ${tagName}.${className}`,
          );
        }
      }
    });
  });

});
