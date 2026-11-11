// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";

function stubDeployedEnv(hostname: string): void {
  vi.stubGlobal("location", { hostname, href: "" });
  vi.stubEnv("VITE_COGNITO_REGION", "eu-west-1");
  vi.stubEnv("VITE_COGNITO_USER_POOL_ID", "eu-west-1_test");
  vi.stubEnv("VITE_COGNITO_CLIENT_ID", "test-client-id");
  vi.stubEnv("VITE_COGNITO_DOMAIN", "auth.example.com");
}

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

  it("should use relative /auth path on dev hostname (same CloudFront domain)", async () => {
    stubDeployedEnv("hak-dev.askend-lab.com");
    const { getAuthApiUrl } = await import("./config");
    expect(getAuthApiUrl()).toBe("/auth");
  });

  it("should use relative /auth path on prod hostname (same CloudFront domain)", async () => {
    stubDeployedEnv("hak.askend-lab.com");
    const { getAuthApiUrl } = await import("./config");
    expect(getAuthApiUrl()).toBe("/auth");
  });

  it("should use relative TARA login URL on dev hostname", async () => {
    stubDeployedEnv("hak-dev.askend-lab.com");
    const { getTaraLoginUrlValue } = await import("./config");
    expect(getTaraLoginUrlValue()).toBe("/auth/tara/start");
  });

  it("should use relative TARA login URL on prod hostname", async () => {
    stubDeployedEnv("hak.askend-lab.com");
    const { getTaraLoginUrlValue } = await import("./config");
    expect(getTaraLoginUrlValue()).toBe("/auth/tara/start");
  });

  it("should exchange code via backend on non-localhost (same-origin)", async () => {
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
      "/auth/tara/exchange-code",
    );
    const opts = vi.mocked(global.fetch).mock.calls[0]?.[1];
    expect(opts?.credentials).toBe("include");
    expect(opts?.headers).toStrictEqual({ "Content-Type": "application/json" });
  });
});

// =============================================================================
// REGRESSION: Auth API must NEVER use a custom domain (hak-api-*)
//
// PR #704 removed the hak-api-{env}.askend-lab.com custom domain.
// Auth API is now routed through CloudFront on the SAME origin (/auth/tara/*).
// Using an absolute URL with hak-api-* causes ERR_NAME_NOT_RESOLVED and
// breaks login completely.
//
// If you are reading this because a test failed — DO NOT change the test.
// The auth API MUST use a relative path. If you need a different domain,
// you broke the architecture. Talk to the team first.
// =============================================================================
describe("REGRESSION: auth API must use same-origin relative path, never a custom domain", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  const deployedHostnames = [
    "hak-dev.askend-lab.com",
    "hak.askend-lab.com",
    "haaldusabiline.eki.ee",
    "any-other-domain.example.com",
  ];

  for (const hostname of deployedHostnames) {
    it(`getAuthApiUrl() on ${hostname} must be relative path (not absolute URL)`, async () => {
      stubDeployedEnv(hostname);
      const { getAuthApiUrl } = await import("./config");
      const url = getAuthApiUrl();
      expect(url).toBe("/auth");
      expect(url).not.toContain("://");
      expect(url).not.toContain("hak-api");
    });

    it(`getTaraLoginUrlValue() on ${hostname} must be relative path`, async () => {
      stubDeployedEnv(hostname);
      const { getTaraLoginUrlValue } = await import("./config");
      const url = getTaraLoginUrlValue();
      expect(url).toBe("/auth/tara/start");
      expect(url).not.toContain("://");
      expect(url).not.toContain("hak-api");
    });

    it(`exchange-code on ${hostname} must call same-origin /auth/tara/exchange-code`, async () => {
      stubDeployedEnv(hostname);
      sessionStorage.setItem("pkce_code_verifier", "v");
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: "a", id_token: "i", expires_in: 1 }),
      });
      const { exchangeCodeForTokens } = await import("./config");
      await exchangeCodeForTokens("c");
      const fetchUrl = vi.mocked(global.fetch).mock.calls[0]?.[0] as string;
      expect(fetchUrl).toBe("/auth/tara/exchange-code");
      expect(fetchUrl).not.toContain("://");
      expect(fetchUrl).not.toContain("hak-api");
    });
  }
});
