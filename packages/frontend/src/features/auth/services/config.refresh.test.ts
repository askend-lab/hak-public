// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { logger } from "@hak/shared";
import { exchangeCodeForTokens } from "./config";

describe("exchangeCodeForTokens", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("should return null if no code verifier in sessionStorage", async () => {
    const result = await exchangeCodeForTokens("some-code");
    expect(result).toBeNull();
  });

  it("should exchange code for tokens using PKCE", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: "access-token",
        id_token: "id-token",
        expires_in: 3600,
      }),
    });

    const result = await exchangeCodeForTokens("auth-code");

    expect(result).toStrictEqual({
      accessToken: "access-token",
      idToken: "id-token",
      expiresIn: 3600,
    });
    expect(sessionStorage.getItem("pkce_code_verifier")).toBeNull();
  });

  it("should return null on token exchange failure", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("error"),
    });

    const result = await exchangeCodeForTokens("auth-code");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[Auth] Token exchange failed:",
      400,
      "error",
    );
    consoleSpy.mockRestore();
  });

  it("should send correct request to Cognito token endpoint on localhost", async () => {
    sessionStorage.setItem("pkce_code_verifier", "my-verifier");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: "a",
        id_token: "i",
        expires_in: 3600,
      }),
    });

    await exchangeCodeForTokens("my-code");

    expect(global.fetch).toHaveBeenCalledWith(
      "/oauth2/token",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
    );

    const callArgs = vi.mocked(global.fetch).mock.calls[0] ?? [];
    const body = new URLSearchParams(callArgs[1]?.body as string);
    expect(body.get("code")).toBe("my-code");
    expect(body.get("code_verifier")).toBe("my-verifier");
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("redirect_uri")).toContain("/auth/callback");
  });

  it("should return null on network error", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    const result = await exchangeCodeForTokens("auth-code");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[Auth] Token exchange error:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("should log missing PKCE verifier error", async () => {
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    await exchangeCodeForTokens("code");
    expect(consoleSpy).toHaveBeenCalledWith("[Auth] Missing PKCE code verifier");
    consoleSpy.mockRestore();
  });

  it("should return null for invalid response shape", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ unexpected: "data" }),
    });
    const result = await exchangeCodeForTokens("auth-code");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("[Auth] Invalid token exchange response shape");
    consoleSpy.mockRestore();
  });

  it("should reject response with only expires_in (no tokens in body)", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ expires_in: 3600 }),
    });
    const result = await exchangeCodeForTokens("auth-code");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("[Auth] Invalid token exchange response shape");
    consoleSpy.mockRestore();
  });

  it("should include redirect_uri in local dev direct Cognito exchange", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const body = new URLSearchParams((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.body as string);
    expect(body.get("redirect_uri")).toContain("/auth/callback");
  });

});
