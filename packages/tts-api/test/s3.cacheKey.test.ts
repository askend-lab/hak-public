// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { buildCacheKey } from "../src/s3";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("buildCacheKey", () => {
  it("should return cache path with .wav extension", () => {
    expect(buildCacheKey("abc123")).toBe("cache/abc123.wav");
  });

  it("should include the cacheKey in the path", () => {
    const key = buildCacheKey("test-key");
    expect(key).toContain("test-key");
    expect(key).toMatch(/^cache\/.+\.wav$/);
  });

});
