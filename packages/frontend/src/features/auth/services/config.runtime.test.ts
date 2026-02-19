// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";

describe("runtime API URL derivation (non-localhost)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  function stubDeployedEnv(hostname: string): void {
    vi.stubGlobal("location", { hostname, href: "" });
    vi.stubEnv("VITE_COGNITO_REGION", "eu-west-1");
    vi.stubEnv("VITE_COGNITO_USER_POOL_ID", "eu-west-1_test");
    vi.stubEnv("VITE_COGNITO_CLIENT_ID", "test-client-id");
    vi.stubEnv("VITE_COGNITO_DOMAIN", "auth.example.com");
  }

  it("should derive dev API URL from dev frontend hostname", async () => {
    stubDeployedEnv("hak-dev.askend-lab.com");
    const { getAuthApiUrl } = await import("./config");
    expect(getAuthApiUrl()).toBe("https://hak-api-dev.askend-lab.com/auth");
  });

  it("should derive prod API URL from prod frontend hostname", async () => {
    stubDeployedEnv("hak.askend-lab.com");
    const { getAuthApiUrl } = await import("./config");
    expect(getAuthApiUrl()).toBe("https://hak-api.askend-lab.com/auth");
  });

  it("should derive TARA login URL from dev hostname", async () => {
    stubDeployedEnv("hak-dev.askend-lab.com");
    const { getTaraLoginUrlValue } = await import("./config");
    expect(getTaraLoginUrlValue()).toBe("https://hak-api-dev.askend-lab.com/auth/tara/start");
  });

  it("should derive TARA login URL from prod hostname", async () => {
    stubDeployedEnv("hak.askend-lab.com");
    const { getTaraLoginUrlValue } = await import("./config");
    expect(getTaraLoginUrlValue()).toBe("https://hak-api.askend-lab.com/auth/tara/start");
  });

  it("should exchange code via backend on non-localhost", async () => {
    stubDeployedEnv("hak-dev.askend-lab.com");
    sessionStorage.setItem("pkce_code_verifier", "test-verifier");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 3600 }),
    });
    const { exchangeCodeForTokens } = await import("./config");
    const result = await exchangeCodeForTokens("code");
    expect(result).toStrictEqual({ accessToken: "a", idToken: "i", expiresIn: 3600 });
    expect(vi.mocked(global.fetch).mock.calls[0]?.[0]).toBe(
      "https://hak-api-dev.askend-lab.com/auth/tara/exchange-code",
    );
    const opts = vi.mocked(global.fetch).mock.calls[0]?.[1];
    expect(opts?.credentials).toBe("include");
    expect(opts?.headers).toStrictEqual({ "Content-Type": "application/json" });
  });
});
