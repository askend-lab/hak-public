// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { chromium, FullConfig } from "@playwright/test";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { writeFileSync } from "fs";

const STORAGE_STATE_PATH = "e2e/.auth/user.json";
const UNAUTH_STATE_PATH = "e2e/.auth/unauth.json";
const SECRET_ID = process.env.E2E_SECRET_ID ?? "test/e2e-credentials";

const EMPTY_STORAGE_STATE = JSON.stringify({ cookies: [], origins: [] });

async function getTestCredentials(): Promise<{
  username: string;
  password: string;
} | null> {
  // 1. Try environment variables first
  const envUser = process.env.E2E_USERNAME;
  const envPass = process.env.E2E_PASSWORD;
  if (envUser && envPass) {
    return { username: envUser, password: envPass };
  }

  // 2. Try AWS Secrets Manager
  try {
    const client = new SecretsManagerClient({ region: "eu-west-1" });
    const command = new GetSecretValueCommand({ SecretId: SECRET_ID });
    const response = await client.send(command);

    if (!response.SecretString) {
      console.warn("⚠ Secret not found or empty");
      return null;
    }

    const secrets = JSON.parse(response.SecretString) as Record<string, string>;
    const username = secrets["COGNITO_TEST_USER"];
    const password = secrets["COGNITO_TEST_PASSWORD"];

    if (!username || !password) {
      console.warn("⚠ COGNITO_TEST_USER or COGNITO_TEST_PASSWORD not found in secret");
      return null;
    }

    return { username, password };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠ Cannot access Secrets Manager: ${message}`);
    return null;
  }
}

async function globalSetup(_config: FullConfig): Promise<void> {
  // Always create unauthenticated storage state for no-auth tests
  writeFileSync(UNAUTH_STATE_PATH, EMPTY_STORAGE_STATE);

  console.log("🔐 Setting up E2E authentication...");

  const credentials = await getTestCredentials();

  if (!credentials) {
    console.warn("⚠ No test credentials available — authenticated tests will be skipped");
    console.warn("  Set E2E_USERNAME/E2E_PASSWORD env vars or grant Secrets Manager access");
    // Create empty auth state so Playwright config doesn't error
    writeFileSync(STORAGE_STATE_PATH, EMPTY_STORAGE_STATE);
    return;
  }

  const { username, password } = credentials;

  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    // Navigate to tasks page which will redirect to Cognito login
    await page.goto("http://localhost:5181/tasks");

    // Wait for Cognito login page
    await page.waitForURL(/cognito/);
    await page.waitForLoadState("networkidle");

    // Fill credentials - use filter for visible elements
    await page
      .locator('input[name="username"]')
      .filter({ visible: true })
      .fill(username);
    await page
      .locator('input[name="password"]')
      .filter({ visible: true })
      .fill(password);

    // Submit login form
    await page
      .locator('input[name="signInSubmitButton"]')
      .filter({ visible: true })
      .click();

    // Wait for redirect back to app and auth callback to complete
    await page.waitForURL(/localhost:5181/, { timeout: 30000 });

    // Wait for auth to fully complete (page should be loaded with content)
    await page.waitForLoadState("networkidle");

    // Navigate to tasks to ensure we're authenticated
    await page.goto("http://localhost:5181/tasks");
    await page.waitForSelector("h1", { timeout: 10000 });

    // Save authentication state (now includes localhost localStorage)
    await page.context().storageState({ path: STORAGE_STATE_PATH });

    console.log("✅ E2E authentication setup complete");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠ Authentication setup failed: ${message}`);
    console.warn("  Authenticated tests will be skipped");
    writeFileSync(STORAGE_STATE_PATH, EMPTY_STORAGE_STATE);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
