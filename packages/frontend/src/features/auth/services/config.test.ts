// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { logger } from "@hak/shared";
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

  it("should use dev defaults on localhost when env vars are not set", () => {
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
  it("should return TARA login URL (localhost default via proxy)", async () => {
    const { getTaraLoginUrl } = await import("./config");
    const url = getTaraLoginUrl();
    expect(url).toBe("/auth/tara/start");
  });
});

describe("localhost auth defaults", () => {
  it("should default AUTH_API_URL to /auth on localhost", async () => {
    const { AUTH_API_URL } = await import("./config");
    expect(AUTH_API_URL).toBe("/auth");
  });

  it("should default TARA_LOGIN_URL to /auth/tara/start on localhost", async () => {
    const { TARA_LOGIN_URL } = await import("./config");
    expect(TARA_LOGIN_URL).toBe("/auth/tara/start");
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

  // Regression: backend once returned only { expires_in } without tokens in body,
  // causing "Invalid token exchange response shape". Tokens MUST be in body because
  // cross-domain fetch (hak-api-dev → hak-dev) cannot read Set-Cookie headers.
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

describe("local dev direct Cognito exchange", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("should use /oauth2/token path (not backend endpoint) on localhost", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const url = vi.mocked(global.fetch).mock.calls[0]?.[0] as string;
    expect(url).toBe("/oauth2/token");
    expect(url).not.toContain("/tara/exchange-code");
  });

  it("should use form-urlencoded content type (not JSON)", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const opts = vi.mocked(global.fetch).mock.calls[0]?.[1];
    expect(opts?.headers).toStrictEqual({ "Content-Type": "application/x-www-form-urlencoded" });
  });

  it("should send client_id in request body", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const body = new URLSearchParams(vi.mocked(global.fetch).mock.calls[0]?.[1]?.body as string);
    expect(body.get("client_id")).toBe(cognitoConfig.clientId);
  });

  it("should send localhost redirect_uri matching cognitoConfig", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const body = new URLSearchParams(vi.mocked(global.fetch).mock.calls[0]?.[1]?.body as string);
    expect(body.get("redirect_uri")).toBe("http://localhost:5181/auth/callback");
  });

  it("should not send credentials: include (no httpOnly cookies in direct exchange)", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const opts = vi.mocked(global.fetch).mock.calls[0]?.[1];
    expect(opts?.credentials).toBeUndefined();
  });

  it("should send grant_type=authorization_code", async () => {
    sessionStorage.setItem("pkce_code_verifier", "v");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
    });
    await exchangeCodeForTokens("c");
    const body = new URLSearchParams(vi.mocked(global.fetch).mock.calls[0]?.[1]?.body as string);
    expect(body.get("grant_type")).toBe("authorization_code");
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
