// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


describe("getTaraLoginUrl", () => {
  it("should return TARA login URL (localhost default via proxy)", async () => {
    const { getTaraLoginUrl } = await import("./config");
    const url = getTaraLoginUrl();
    expect(url).toBe("/auth/tara/start");
  });

});
