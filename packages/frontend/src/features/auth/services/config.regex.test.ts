// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getLoginUrl, cognitoConfig } from "./config";

describe("PKCE regex replacement precision", () => {
  const origGetRandomValues = crypto.getRandomValues;
  const origSubtleDigest = crypto.subtle.digest;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    crypto.getRandomValues = origGetRandomValues;
    crypto.subtle.digest = origSubtleDigest;
  });

  it("replaces + with - (not empty string) in code verifier", async () => {
    // Mock getRandomValues to produce bytes that generate + in base64
    // 0xF8 = 11111000, groups of 6 bits: 111110 = index 62 = '+'
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {arr[i] = 0xF8;}
      return arr;
    }) as typeof crypto.getRandomValues;

    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier).not.toContain("+");
    // If + was replaced with "" instead of "-", the string would be shorter
    // With 32 bytes of 0xF8, base64 has specific length; replacing + with - keeps length
    expect(verifier).toContain("-");
  });

  it("replaces / with _ (not empty string) in code verifier", async () => {
    // 0xFF bytes produce / in base64 (6-bit group 111111 = index 63 = '/')
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {arr[i] = 0xFF;}
      return arr;
    }) as typeof crypto.getRandomValues;

    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier).not.toContain("/");
    expect(verifier).toContain("_");
  });

  it("strips trailing = padding from code verifier", async () => {
    // Ensure we get padding: 32 bytes → base64 has 44 chars with ==
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {arr[i] = 0x00;}
      return arr;
    }) as typeof crypto.getRandomValues;

    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier).not.toContain("=");
    // If /=+$/ was mutated to /=+/ it would strip = from middle too
    // If /=$/ it would only strip single = not ==
  });

  it("replaces + with - in code challenge", async () => {
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {arr[i] = 0x42;}
      return arr;
    }) as typeof crypto.getRandomValues;

    // Mock SHA-256 to return bytes that produce + in base64
    crypto.subtle.digest = vi.fn(async () => {
      const result = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {result[i] = 0xF8;}
      return result.buffer;
    });

    const url = await getLoginUrl();
    const params = new URLSearchParams(url.split("?")[1]);
    const challenge = params.get("code_challenge") ?? "";
    expect(challenge).not.toContain("+");
    expect(challenge).toContain("-");
  });

  it("replaces / with _ in code challenge", async () => {
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {arr[i] = 0x42;}
      return arr;
    }) as typeof crypto.getRandomValues;

    crypto.subtle.digest = vi.fn(async () => {
      const result = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {result[i] = 0xFF;}
      return result.buffer;
    });

    const url = await getLoginUrl();
    const params = new URLSearchParams(url.split("?")[1]);
    const challenge = params.get("code_challenge") ?? "";
    expect(challenge).not.toContain("/");
    expect(challenge).toContain("_");
  });

  it("strips = from code challenge", async () => {
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {arr[i] = 0x42;}
      return arr;
    }) as typeof crypto.getRandomValues;

    crypto.subtle.digest = vi.fn(async () => {
      const result = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {result[i] = 0x00;}
      return result.buffer;
    });

    const url = await getLoginUrl();
    const params = new URLSearchParams(url.split("?")[1]);
    const challenge = params.get("code_challenge") ?? "";
    expect(challenge).not.toContain("=");
  });

  it("generateCodeVerifier body is not empty", async () => {
    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier") ?? "";
    expect(verifier.length).toBeGreaterThan(0);
  });

  it("generateCodeChallenge body is not empty", async () => {
    const url = await getLoginUrl();
    const params = new URLSearchParams(url.split("?")[1]);
    const challenge = params.get("code_challenge") ?? "";
    expect(challenge.length).toBeGreaterThan(0);
  });

  it("login URL uses exact cognito domain", async () => {
    const url = await getLoginUrl();
    expect(url).toBe(
      `https://${cognitoConfig.domain}/login?` + url.split("?")[1],
    );
  });
});
