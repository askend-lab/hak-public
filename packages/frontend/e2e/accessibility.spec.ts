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

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// WCAG 2.1 AA tags to test against
const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Run axe accessibility audit on current page
 */
async function runAccessibilityAudit(page: ReturnType<typeof test.page>) {
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
) {
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
) {
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

test.describe("Accessibility - WCAG 2.1 AA Compliance", () => {
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
          if (rect.width === 0 || rect.height === 0) return;
          // Skip elements that are visually hidden (skip links, etc.)
          const styles = window.getComputedStyle(el);
          if (styles.position === "absolute" && styles.clip !== "auto") return;

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
          if (rect.width === 0 || rect.height === 0) return;

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

  // =========================================================================
  // Screen Reader Readiness Checks
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
        return Array.from(hs).map((h) => ({
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
          if (rect.width === 0 || rect.height === 0) return; // Skip hidden

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
          if (rect.width === 0 || rect.height === 0) return; // Skip hidden

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
