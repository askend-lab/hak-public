// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { cognitoConfig, exchangeCodeForTokens } from "./config";

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
