// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

describe("config default hostname detection", () => {
  const origHostname = window.location.hostname;

  beforeEach(() => {
    Object.defineProperty(window.location, "hostname", {
      writable: true,
      value: "prod.example.com",
    });
    // Stub required env vars so requireEnv() doesn't throw in non-localhost
    vi.stubEnv("VITE_COGNITO_REGION", "eu-west-1");
    vi.stubEnv("VITE_COGNITO_USER_POOL_ID", "test-pool");
    vi.stubEnv("VITE_COGNITO_CLIENT_ID", "test-client");
    vi.stubEnv("VITE_COGNITO_DOMAIN", "test.auth.example.com");
  });

  afterEach(() => {
    Object.defineProperty(window.location, "hostname", {
      writable: true,
      value: origHostname,
    });
    vi.unstubAllEnvs();
  });

  it("getRedirectUri uses window.location.hostname by default", async () => {
    // Dynamic import to pick up mocked hostname
    const { getRedirectUri } = await import("./config");
    const uri = getRedirectUri();
    // If typeof window check works correctly, hostname = "prod.example.com"
    // → https://prod.example.com/auth/callback
    // Mutant "false": would use "localhost" → http://localhost:5181/auth/callback
    // Mutant "===": would use "localhost" → http://localhost:5181/auth/callback
    expect(uri).toContain("prod.example.com");
    expect(uri.startsWith("https://")).toBe(true);
  });

  it("getLogoutUri uses window.location.hostname by default", async () => {
    const { getLogoutUri } = await import("./config");
    const uri = getLogoutUri();
    expect(uri).toContain("prod.example.com");
    expect(uri.startsWith("https://")).toBe(true);
  });
});
