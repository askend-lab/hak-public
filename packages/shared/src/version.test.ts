// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { loadVersion } from "./version";

describe("loadVersion", () => {
  it("returns a version string", () => {
    const version = loadVersion();
    expect(typeof version).toBe("string");
    expect(version.length).toBeGreaterThan(0);
  });

  it("returns semver-like format or fallback", () => {
    const version = loadVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
