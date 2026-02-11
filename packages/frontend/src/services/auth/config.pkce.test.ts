// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, beforeEach } from "vitest";
import { getLoginUrl } from "./config";

describe("PKCE code verifier and challenge generation", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("code verifier replaces + with -", async () => {
    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier).not.toContain("+");
    // Verify it's URL-safe base64
    expect(/^[A-Za-z0-9_-]+$/.test(verifier)).toBe(true);
  });

  it("code verifier replaces / with _", async () => {
    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier).not.toContain("/");
  });

  it("code verifier strips trailing = padding", async () => {
    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier).not.toMatch(/=+$/);
    expect(verifier).not.toContain("=");
  });

  it("code challenge in URL is URL-safe base64", async () => {
    const url = await getLoginUrl();
    const params = new URLSearchParams(url.split("?")[1]);
    const challenge = params.get("code_challenge") ?? "";
    expect(challenge.length).toBeGreaterThan(0);
    expect(challenge).not.toContain("+");
    expect(challenge).not.toContain("/");
    expect(challenge).not.toMatch(/=+$/);
    expect(/^[A-Za-z0-9_-]+$/.test(challenge)).toBe(true);
  });

  it("code verifier has sufficient length", async () => {
    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier.length).toBeGreaterThanOrEqual(32);
  });

  it("each call generates different verifier", async () => {
    await getLoginUrl();
    const v1 = sessionStorage.getItem("pkce_code_verifier");
    await getLoginUrl();
    const v2 = sessionStorage.getItem("pkce_code_verifier");
    // They should be different (probabilistically)
    expect(v1).not.toBe(v2);
  });
});
