// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, afterEach } from "vitest";
import { toBase64Url, generateCodeVerifier, generateCodeChallenge } from "./pkce";

describe("toBase64Url", () => {
  it("replaces + with -", () => {
    expect(toBase64Url("a+b+c")).toBe("a-b-c");
  });

  it("replaces / with _", () => {
    expect(toBase64Url("a/b/c")).toBe("a_b_c");
  });

  it("strips trailing = padding", () => {
    expect(toBase64Url("abc=")).toBe("abc");
    expect(toBase64Url("abc==")).toBe("abc");
  });

  it("does not strip = in the middle", () => {
    expect(toBase64Url("a=b=")).toBe("a=b");
  });

  it("handles all replacements together", () => {
    expect(toBase64Url("a+b/c==")).toBe("a-b_c");
  });

  it("returns unchanged string when no special chars", () => {
    expect(toBase64Url("abcdef")).toBe("abcdef");
  });
});

describe("generateCodeVerifier", () => {
  const origGetRandomValues = crypto.getRandomValues;
  afterEach(() => { crypto.getRandomValues = origGetRandomValues; });

  it("returns non-empty base64url string", () => {
    const result = generateCodeVerifier();
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toMatch(/[+/=]/);
  });

  it("produces deterministic output with mocked random", () => {
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = i;
      return arr;
    }) as typeof crypto.getRandomValues;
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).toBe(b);
  });

  it("replaces + with - when random bytes produce +", () => {
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = 0xF8;
      return arr;
    }) as typeof crypto.getRandomValues;
    const result = generateCodeVerifier();
    expect(result).not.toContain("+");
    expect(result).toContain("-");
  });

  it("replaces / with _ when random bytes produce /", () => {
    crypto.getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = 0xFF;
      return arr;
    }) as typeof crypto.getRandomValues;
    const result = generateCodeVerifier();
    expect(result).not.toContain("/");
    expect(result).toContain("_");
  });
});

describe("generateCodeChallenge", () => {
  const origDigest = crypto.subtle.digest;
  afterEach(() => { crypto.subtle.digest = origDigest; });

  it("returns non-empty base64url string", async () => {
    const result = await generateCodeChallenge("test-verifier");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toMatch(/[+/=]/);
  });

  it("replaces + with - in challenge output", async () => {
    crypto.subtle.digest = vi.fn(async () => {
      const arr = new Uint8Array(32);
      for (let i = 0; i < 32; i++) arr[i] = 0xF8;
      return arr.buffer;
    });
    const result = await generateCodeChallenge("v");
    expect(result).not.toContain("+");
    expect(result).toContain("-");
  });

  it("replaces / with _ in challenge output", async () => {
    crypto.subtle.digest = vi.fn(async () => {
      const arr = new Uint8Array(32);
      for (let i = 0; i < 32; i++) arr[i] = 0xFF;
      return arr.buffer;
    });
    const result = await generateCodeChallenge("v");
    expect(result).not.toContain("/");
    expect(result).toContain("_");
  });

  it("produces different output for different verifiers", async () => {
    const a = await generateCodeChallenge("verifier-a");
    const b = await generateCodeChallenge("verifier-b");
    expect(a).not.toBe(b);
  });
});
