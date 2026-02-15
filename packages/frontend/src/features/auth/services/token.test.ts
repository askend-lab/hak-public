// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { parseIdToken, isTokenExpired } from "./token";

function createJwt(payload: Record<string, unknown>): string {
  const h = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const b = btoa(JSON.stringify(payload));
  return `${h}.${b}.sig`;
}

describe("parseIdToken", () => {
  it("returns user from valid token", () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    const user = parseIdToken(token);
    expect(user).toStrictEqual({ id: "u1", email: "a@b.com", name: "a" });
  });

  it("returns null for empty string", () => {
    expect(parseIdToken("")).toBeNull();
  });

  it("returns null for 2-part token", () => {
    const h = btoa(JSON.stringify({ alg: "RS256" }));
    const b = btoa(JSON.stringify({ sub: "u1", exp: Math.floor(Date.now() / 1000) + 3600 }));
    expect(parseIdToken(`${h}.${b}`)).toBeNull();
  });

  it("returns null for 3-part token with invalid base64", () => {
    expect(parseIdToken("a.!!!invalid.c")).toBeNull();
  });

  it("returns null when sub is missing", () => {
    const token = createJwt({ email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(parseIdToken(token)).toBeNull();
  });

  it("returns null when sub is not a string", () => {
    const token = createJwt({ sub: 123, exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(parseIdToken(token)).toBeNull();
  });

  it("returns null when token is expired", () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) - 100 });
    expect(parseIdToken(token)).toBeNull();
  });

  it("accepts token at exact current time (> not >=)", () => {
    const now = Math.floor(Date.now() / 1000) + 1;
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: now });
    expect(parseIdToken(token)).not.toBeNull();
  });

  it("accepts token without exp claim", () => {
    const token = createJwt({ sub: "u1", email: "a@b.com" });
    expect(parseIdToken(token)).toStrictEqual({ id: "u1", email: "a@b.com", name: "a" });
  });

  it("uses name claim when present", () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", name: "Alice", exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(parseIdToken(token)?.name).toBe("Alice");
  });

  it("falls back to email prefix when name is missing", () => {
    const token = createJwt({ sub: "u1", email: "alice@example.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(parseIdToken(token)?.name).toBe("alice");
  });

  it("rejects token without email claim", () => {
    const token = createJwt({ sub: "u1", exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(parseIdToken(token)).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("returns false for token with future exp (beyond buffer)", () => {
    const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isTokenExpired(token)).toBe(false);
  });

  it("returns true for expired token", () => {
    const token = createJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns true for token within buffer (300s default)", () => {
    const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 100 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns false when custom buffer is smaller", () => {
    const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 100 });
    expect(isTokenExpired(token, 10)).toBe(false);
  });

  it("returns true for empty string", () => {
    expect(isTokenExpired("")).toBe(true);
  });

  it("returns true for 2-part token", () => {
    expect(isTokenExpired("a.b")).toBe(true);
  });

  it("returns true for 3-part token with invalid base64", () => {
    expect(isTokenExpired("a.!!!.c")).toBe(true);
  });

  it("returns true for token without exp claim", () => {
    const token = createJwt({ sub: "u1" });
    expect(isTokenExpired(token)).toBe(true);
  });

  it("uses > not >= for comparison", () => {
    // Token expiring in 301 seconds with 300s buffer → exp - buffer = now + 1
    // Date.now()/1000 > (now + 301) - 300 = now + 1 → false (not expired)
    const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 301 });
    expect(isTokenExpired(token, 300)).toBe(false);
  });
});
