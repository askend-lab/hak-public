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

  it("should have OAuth scopes", () => {
    expect(cognitoConfig.scopes).toContain("email");
    expect(cognitoConfig.scopes).toContain("openid");
    expect(cognitoConfig.scopes).toContain("profile");
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
  it("should return relative path for TARA auth", async () => {
    const { getTaraLoginUrl } = await import("./config");
    const url = getTaraLoginUrl();
    expect(url).toBe("/auth/tara/start");
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

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("error"),
    });

    const result = await exchangeCodeForTokens("auth-code");
    expect(result).toBeNull();
  });

  it("should return null on network error", async () => {
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await exchangeCodeForTokens("auth-code");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
