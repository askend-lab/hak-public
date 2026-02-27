// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { applySynthesizeDefaults } from "../src/handler";
import { VOICE_DEFAULTS } from "../src/env";
import { setupTestEnv } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should apply all defaults for minimal request", () => {
    const result = applySynthesizeDefaults({ text: "hello" });
    expect(result).toStrictEqual({
      text: "hello",
      voice: VOICE_DEFAULTS.voice,
      speed: VOICE_DEFAULTS.speed,
      pitch: VOICE_DEFAULTS.pitch,
    });
  });

  it("should preserve provided values", () => {
    const result = applySynthesizeDefaults({
      text: "hello",
      voice: "custom",
      speed: 2.0,
      pitch: 3,
    });
    expect(result).toStrictEqual({
      text: "hello",
      voice: "custom",
      speed: 2.0,
      pitch: 3,
    });
  });

});
