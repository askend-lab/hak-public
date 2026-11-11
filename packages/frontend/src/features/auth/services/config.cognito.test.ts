// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


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
