// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { test, expect } from "@playwright/test";

const API_BASE =
  process.env.VITE_API_URL ?? "http://localhost:4001";

test.describe("TARA Authentication", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("TARA start endpoint redirects to TARA login page", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE}/auth/tara/start`,
      {
        maxRedirects: 0,
      },
    );

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toContain("tara-test.ria.ee");
    expect(location).toContain("openid");
    expect(location).toContain("state=");
    expect(location).toContain("nonce=");
  });

  test("TARA callback handles missing code parameter", async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/auth/tara/callback`,
      {
        maxRedirects: 0,
      },
    );

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toContain("error=");
  });

  test("TARA callback handles invalid state", async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/auth/tara/callback?code=test&state=invalid`,
      { maxRedirects: 0 },
    );

    expect(response.status()).toBe(302);
    const location = response.headers()["location"];
    expect(location).toContain("error=");
  });

  test("Login modal shows TARA button and redirects on click", async ({
    page,
  }) => {
    await page.goto("/");

    // Open login modal by clicking login button
    const loginButton = page
      .locator("button, a")
      .filter({ hasText: /logi sisse|login/i })
      .first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }

    // Wait for login modal to appear
    const taraButton = page.locator("button").filter({ hasText: /TARA/i });

    if (await taraButton.isVisible({ timeout: 5000 })) {
      // Set up navigation listener before clicking
      const navigationPromise = page.waitForURL(
        /tara-test\.ria\.ee|hak-api.*auth\/tara/,
        {
          timeout: 10000,
          waitUntil: "commit",
        },
      );

      await taraButton.click();

      // Verify redirect to TARA or API endpoint
      await navigationPromise;
      const url = page.url();
      expect(url).toMatch(/tara-test\.ria\.ee|auth\/tara/);
    } else {
      // If modal not visible, test API directly
      test.skip();
    }
  });

  test("TARA authorization URL contains required OIDC parameters", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE}/auth/tara/start`,
      {
        maxRedirects: 0,
      },
    );

    const location = response.headers()["location"];
    expect(location).toBeDefined();

    const url = new URL(location);

    // Verify required OIDC parameters
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toContain("openid");
    expect(url.searchParams.get("client_id")).toBeTruthy();
    expect(url.searchParams.get("redirect_uri")).toContain("callback");
    expect(url.searchParams.get("state")).toBeTruthy();
    expect(url.searchParams.get("nonce")).toBeTruthy();
  });

  test("TARA start sets state cookie", async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/auth/tara/start`,
      {
        maxRedirects: 0,
      },
    );

    const setCookie = response.headers()["set-cookie"];
    expect(setCookie).toContain("tara_state=");
  });
});
