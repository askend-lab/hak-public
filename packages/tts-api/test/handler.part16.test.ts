// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { VOICE_DEFAULTS } from "../src/env";
import { setupTestEnv, DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should have expected default values", () => {
    expect(VOICE_DEFAULTS.voice).toBe(DEFAULT_VOICE);
    expect(VOICE_DEFAULTS.speed).toBe(DEFAULT_SPEED);
    expect(VOICE_DEFAULTS.pitch).toBe(DEFAULT_PITCH);
  });

});
