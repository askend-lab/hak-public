// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { generateCacheKey } from "../src/handler";
import { setupTestEnv, DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH } from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("handler.test", () => {
  it("should return consistent hash for same input", () => {
    const key1 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    const key2 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    expect(key1).toBe(key2);
  });

  it("should return different hash for different text", () => {
    const key1 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    const key2 = generateCacheKey({ text: "world", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different voice", () => {
    const key1 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    const key2 = generateCacheKey({ text: "hello", voice: "other", speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different speed", () => {
    const key1 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    const key2 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: 1.5, pitch: DEFAULT_PITCH });
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different pitch", () => {
    const key1 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    const key2 = generateCacheKey({ text: "hello", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: 1 });
    expect(key1).not.toBe(key2);
  });

  it("should return a 64-char hex string (sha256)", () => {
    const key = generateCacheKey({ text: "test", voice: DEFAULT_VOICE, speed: DEFAULT_SPEED, pitch: DEFAULT_PITCH });
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });

});
