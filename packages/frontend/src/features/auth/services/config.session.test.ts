// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


describe("localhost auth defaults", () => {
  it("should default getAuthApiUrl to /auth on localhost", async () => {
    const { getAuthApiUrl } = await import("./config");
    expect(getAuthApiUrl()).toBe("/auth");
  });

  it("should default getTaraLoginUrlValue to /auth/tara/start on localhost", async () => {
    const { getTaraLoginUrlValue } = await import("./config");
    expect(getTaraLoginUrlValue()).toBe("/auth/tara/start");
  });

});
