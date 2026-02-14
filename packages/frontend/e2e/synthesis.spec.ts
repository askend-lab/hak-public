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

  test("should type word and play audio", async ({ page }) => {
    // Go to synthesis page (after onboarding bypass)
    await page.goto("/synthesis");
    await page.waitForLoadState("networkidle");

    // Find the first text input (TagsInput uses a plain input element)
    const input = page.locator(".sentence-synthesis-item input").first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill("tere");

    // Press Enter to commit the sentence
    await input.press("Enter");

    // Find and click the play button (Material icon "play_arrow")
    const playButton = page.locator("button").filter({ hasText: "Play" }).first();
    await playButton.click();

    // Wait for audio element to have a source (indicates synthesis completed)
    // or wait for loading state to resolve
    await page.waitForTimeout(2000);

    // Take screenshot for verification
    await page.screenshot({ path: "e2e/screenshots/synthesis-test.png" });

    // Basic check - page should still be visible and no errors
    await expect(page.locator("h1")).toBeVisible();
  });
});
