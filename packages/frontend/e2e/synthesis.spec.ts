// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { test, expect } from "@playwright/test";

// Bypass onboarding role selection for all tests in this file
const ONBOARDING_STATE = JSON.stringify({
  completed: true,
  selectedRole: "learner",
  completedAt: new Date().toISOString(),
});

test.describe("Speech Synthesis Prototype", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(
      (state) => localStorage.setItem("eki_onboarding", state),
      ONBOARDING_STATE,
    );
  });

  test("unauthenticated user sees landing page with CTA", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Landing page should load with hero heading
    await expect(page.locator("h1")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("h1")).toContainText("häälduse");

    // CTA button should be visible
    const cta = page.locator("button").filter({ hasText: /Hakka harjutama/i });
    await expect(cta).toBeVisible({ timeout: 5000 });

    // Take screenshot for verification
    await page.screenshot({ path: "e2e/screenshots/landing-page-test.png" });
  });

  test("unauthenticated user redirected from /synthesis to landing", async ({ page }) => {
    await page.goto("/synthesis");
    await page.waitForLoadState("networkidle");

    // Should see landing page content, not synthesis input
    await expect(page.locator("h1")).toBeVisible({ timeout: 5000 });
    const input = page.locator(".sentence-synthesis-item input").first();
    await expect(input).not.toBeVisible({ timeout: 2000 });
  });
});
