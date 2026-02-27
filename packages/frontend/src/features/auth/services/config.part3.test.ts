// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


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
