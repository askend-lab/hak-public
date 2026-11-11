// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "fs";

// Resolve Chromium executable: env var > Nix store > Playwright default
const NIX_CHROMIUM =
  "/nix/store/6xfxz9kf3n0p28mpf3pyclvysgr7s5bs-playwright-browsers/chromium-1194/chrome-linux/chrome";
const chromiumExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  (existsSync(NIX_CHROMIUM) ? NIX_CHROMIUM : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:5181",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "no-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/unauth.json",
        ...(chromiumExecutable && {
          launchOptions: { executablePath: chromiumExecutable },
        }),
      },
      testMatch: [
        "synthesis.spec.ts",
        "accessibility.spec.ts",
        "accessibility-extended.spec.ts",
      ],
    },
    {
      name: "auth-api",
      use: {
        ...devices["Desktop Chrome"],
        storageState: { cookies: [], origins: [] },
        ...(chromiumExecutable && {
          launchOptions: { executablePath: chromiumExecutable },
        }),
      },
      testMatch: ["tara-auth.spec.ts"],
    },
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
        ...(chromiumExecutable && {
          launchOptions: { executablePath: chromiumExecutable },
        }),
      },
      testMatch: ["tasks-crud.spec.ts"],
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5181",
    reuseExistingServer: !process.env.CI,
  },
});
