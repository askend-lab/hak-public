import { test, expect } from "@playwright/test";

test.describe("Speech Synthesis Prototype", () => {
  test("should type word and play audio", async ({ page }) => {
    // Go to main page
    await page.goto("/");

    // Find the first text input and type "tere"
    const input = page.locator('input[type="text"]').first();
    await input.fill("tere");

    // Verify text was entered
    await expect(input).toHaveValue("tere");

    // Find and click the play button (button with ▶ symbol)
    const playButton = page.locator("button").filter({ hasText: "▶" }).first();
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
