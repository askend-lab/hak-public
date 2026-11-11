// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { buildAudioUrl } from "../src/s3";
import { setupTestEnv, TEST_REGION, TEST_BUCKET } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("buildAudioUrl", () => {
  it("should construct correct S3 URL with exact format", () => {
    const url = buildAudioUrl("abc123");
    expect(url).toBe(
      `https://${TEST_BUCKET}.s3.${TEST_REGION}.amazonaws.com/cache/abc123.wav`,
    );
  });

});
