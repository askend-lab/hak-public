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

  test("should load synthesis page and accept input", async ({ page }) => {
    await page.goto("/synthesis");
    await page.waitForLoadState("networkidle");

    // Synthesis page should load with heading
    await expect(page.locator("h1")).toBeVisible({ timeout: 5000 });

    // Find the first text input (TagsInput uses a plain input element)
    const input = page.locator(".sentence-synthesis-item input").first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill("tere");

    // Press Enter to commit the sentence — creates a tag
    await input.press("Enter");

    // Tag should be visible (text committed as word tag)
    await expect(page.locator(".sentence-synthesis-item")).toBeVisible();

    // Take screenshot for verification
    await page.screenshot({ path: "e2e/screenshots/synthesis-test.png" });
  });
});
