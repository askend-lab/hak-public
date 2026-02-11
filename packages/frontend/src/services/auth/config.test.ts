// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import {
  cognitoConfig,
  getLoginUrl,
  getLogoutUrl,
  exchangeCodeForTokens,
} from "./config";

describe("cognitoConfig", () => {
  it("should have required Cognito properties", () => {
    expect(cognitoConfig.region).toBeDefined();
    expect(typeof cognitoConfig.userPoolId).toBe("string");
    expect(typeof cognitoConfig.clientId).toBe("string");
    expect(typeof cognitoConfig.domain).toBe("string");
  });

  it("should have hardcoded defaults for local development", () => {
    expect(cognitoConfig.region).toBe("eu-west-1");
    expect(cognitoConfig.userPoolId).toBe("eu-west-1_wlRtuLkG2");
    expect(cognitoConfig.clientId).toBe("64tf6nf61n6sgftqif6q975hka");
    expect(cognitoConfig.domain).toBe("askend-lab-auth.auth.eu-west-1.amazoncognito.com");
  });

  it("should have exact OAuth scopes", () => {
    expect(cognitoConfig.scopes).toStrictEqual(["email", "openid", "profile"]);
  });

  it("should have redirect URIs configured", () => {
    expect(cognitoConfig.redirectUri).toBeDefined();
    expect(cognitoConfig.logoutUri).toBeDefined();
  });
});

describe("getRedirectUri - environment detection", () => {
  it("should redirect using https for non-localhost hostnames", async () => {
    const { getRedirectUri } = await import("./config");
    const uri = getRedirectUri("app-dev.example.com");
    expect(uri).toBe("https://app-dev.example.com/auth/callback");
  });

  it("should redirect using https for production hostname", async () => {
    const { getRedirectUri } = await import("./config");
    const uri = getRedirectUri("app.example.com");
    expect(uri).toBe("https://app.example.com/auth/callback");
  });

  it("should redirect to localhost when on localhost", async () => {
    const { getRedirectUri } = await import("./config");
    const uri = getRedirectUri("localhost");
    expect(uri).toBe("http://localhost:5181/auth/callback");
  });

  it("should redirect to localhost when on 127.0.0.1", async () => {
    const { getRedirectUri } = await import("./config");
    const uri = getRedirectUri("127.0.0.1");
    expect(uri).toBe("http://localhost:5181/auth/callback");
  });
});

describe("getLogoutUri - environment detection", () => {
  it("should return localhost base for localhost", async () => {
    const { getLogoutUri } = await import("./config");
    expect(getLogoutUri("localhost")).toBe("http://localhost:5181");
  });

  it("should return localhost base for 127.0.0.1", async () => {
    const { getLogoutUri } = await import("./config");
    expect(getLogoutUri("127.0.0.1")).toBe("http://localhost:5181");
  });

  it("should return https base for production hostname", async () => {
    const { getLogoutUri } = await import("./config");
    expect(getLogoutUri("app.example.com")).toBe("https://app.example.com");
  });
});

describe("getLoginUrl", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("should return a URL to Cognito hosted UI", async () => {
    const url = await getLoginUrl();
    expect(url).toContain("/login");
    expect(url).toContain(`https://${cognitoConfig.domain}`);
  });

  it("should include required OAuth parameters", async () => {
    const url = await getLoginUrl();
    expect(url).toContain("client_id=");
    expect(url).toContain("response_type=code");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("code_challenge=");
    expect(url).toContain("code_challenge_method=S256");
    expect(url).toContain("scope=email+openid+profile");
  });

  it("should store PKCE code verifier in sessionStorage", async () => {
    await getLoginUrl();
    expect(sessionStorage.getItem("pkce_code_verifier")).not.toBeNull();
  });
});

describe("getLogoutUrl", () => {
  it("should return a URL to Cognito logout", () => {
    const url = getLogoutUrl();
    expect(url).toContain("/logout");
    expect(url).toContain(`https://${cognitoConfig.domain}`);
  });

  it("should include client_id and logout_uri", () => {
    const url = getLogoutUrl();
    expect(url).toContain("client_id=");
    expect(url).toContain("logout_uri=");
  });
});

describe("getTaraLoginUrl", () => {
  it("should return direct URL to hak-api-dev for TARA auth", async () => {
    const { getTaraLoginUrl } = await import("./config");
    const url = getTaraLoginUrl();
    expect(url).toBe("https://hak-api-dev.askend-lab.com/auth/tara/start");
  });
});

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

    const mockTokens = {
      access_token: "access-token",
      id_token: "id-token",
      refresh_token: "refresh-token",
      expires_in: 3600,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTokens),
    });

    const result = await exchangeCodeForTokens("auth-code");

    expect(result).toStrictEqual({
      accessToken: "access-token",
      idToken: "id-token",
      refreshToken: "refresh-token",
      expiresIn: 3600,
    });
    expect(sessionStorage.getItem("pkce_code_verifier")).toBeNull();
  });

  it("should return null on token exchange failure", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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

  it("should send correct request to token endpoint", async () => {
    sessionStorage.setItem("pkce_code_verifier", "my-verifier");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: "a",
        id_token: "i",
        refresh_token: "r",
        expires_in: 3600,
      }),
    });

    await exchangeCodeForTokens("my-code");

    expect(global.fetch).toHaveBeenCalledWith(
      `https://${cognitoConfig.domain}/oauth2/token`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
    );

    const callArgs = vi.mocked(global.fetch).mock.calls[0] ?? [];
    const body = callArgs[1]?.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("my-code");
    expect(body.get("code_verifier")).toBe("my-verifier");
    expect(body.get("client_id")).toBe(cognitoConfig.clientId);
  });

  it("should return null on network error", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await exchangeCodeForTokens("auth-code");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[Auth] Token exchange error:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("should log missing PKCE verifier error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await exchangeCodeForTokens("code");
    expect(consoleSpy).toHaveBeenCalledWith("[Auth] Missing PKCE code verifier");
    consoleSpy.mockRestore();
  });

  it("should include redirect_uri in token request body", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", refresh_token: "r", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const body = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(body.get("redirect_uri")).toBeTruthy();
  });
});

describe("PKCE code verifier format", () => {
  it("should store base64url-safe verifier without +, /, or = chars", async () => {
    sessionStorage.clear();
    await getLoginUrl();
    const verifier = sessionStorage.getItem("pkce_code_verifier");
    expect(verifier).not.toBeNull();
    expect(verifier).not.toContain("+");
    expect(verifier).not.toContain("/");
    expect(verifier).not.toContain("=");
  });

  it("should generate login URL starting with https and containing /login", async () => {
    const url = await getLoginUrl();
    expect(url.startsWith(`https://${cognitoConfig.domain}/login?`)).toBe(true);
  });

  it("should generate logout URL starting with https and containing /logout", () => {
    const url = getLogoutUrl();
    expect(url.startsWith(`https://${cognitoConfig.domain}/logout?`)).toBe(true);
    expect(url).toContain(`client_id=${cognitoConfig.clientId}`);
  });
});
