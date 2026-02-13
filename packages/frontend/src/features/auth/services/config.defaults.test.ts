// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, afterEach, beforeEach } from "vitest";

describe("config default hostname detection", () => {
  const origHostname = window.location.hostname;

  beforeEach(() => {
    Object.defineProperty(window.location, "hostname", {
      writable: true,
      value: "prod.example.com",
    });
  });

  afterEach(() => {
    Object.defineProperty(window.location, "hostname", {
      writable: true,
      value: origHostname,
    });
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
