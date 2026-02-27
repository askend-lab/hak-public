// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { MAX_TEXT_LENGTH, SPEED_RANGE, PITCH_RANGE, SynthesizeRequestSchema, CacheKeySchema } from "../src/handler";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should re-export schema constants from handler", () => {
    expect(MAX_TEXT_LENGTH).toBeGreaterThan(0);
    expect(SPEED_RANGE).toHaveProperty("min");
    expect(PITCH_RANGE).toHaveProperty("min");
    expect(SynthesizeRequestSchema.safeParse).toBeDefined();
    expect(CacheKeySchema.safeParse).toBeDefined();
  });

});
