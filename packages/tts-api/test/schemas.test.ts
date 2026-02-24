// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  SynthesizeRequestSchema,
  CacheKeySchema,
  SynthesizeResponseSchema,
  StatusResponseSchema,
  HealthResponseSchema,
  MAX_TEXT_LENGTH,
  SPEED_RANGE,
  PITCH_RANGE,
} from "../src/schemas";

describe("SynthesizeRequestSchema", () => {
  it("should accept valid minimal request (text only)", () => {
    const result = SynthesizeRequestSchema.safeParse({ text: "hello" });
    expect(result.success).toBe(true);
  });

  it("should accept full request with all fields", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "hello",
      voice: "efm_l",
      speed: 1.5,
      pitch: 100,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("hello");
      expect(result.data.voice).toBe("efm_l");
      expect(result.data.speed).toBe(1.5);
      expect(result.data.pitch).toBe(100);
    }
  });

  it("should reject empty text", () => {
    const result = SynthesizeRequestSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("should reject single-character text (Merlin TTS crashes on 1-char input)", () => {
    const result = SynthesizeRequestSchema.safeParse({ text: "a" });
    expect(result.success).toBe(false);
  });

  it("should accept two-character text", () => {
    const result = SynthesizeRequestSchema.safeParse({ text: "aa" });
    expect(result.success).toBe(true);
  });

  it("should reject missing text", () => {
    const result = SynthesizeRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject non-string text", () => {
    const result = SynthesizeRequestSchema.safeParse({ text: 123 });
    expect(result.success).toBe(false);
  });

  it("should reject text exceeding MAX_TEXT_LENGTH", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "a".repeat(MAX_TEXT_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("should accept text at exactly MAX_TEXT_LENGTH", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "a".repeat(MAX_TEXT_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it("should reject speed below minimum", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "hello",
      speed: SPEED_RANGE.min - 0.1,
    });
    expect(result.success).toBe(false);
  });

  it("should reject speed above maximum", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "hello",
      speed: SPEED_RANGE.max + 0.1,
    });
    expect(result.success).toBe(false);
  });

  it("should accept speed at boundaries", () => {
    expect(
      SynthesizeRequestSchema.safeParse({ text: "hello", speed: SPEED_RANGE.min }).success,
    ).toBe(true);
    expect(
      SynthesizeRequestSchema.safeParse({ text: "hello", speed: SPEED_RANGE.max }).success,
    ).toBe(true);
  });

  it("should reject pitch below minimum", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "hello",
      pitch: PITCH_RANGE.min - 1,
    });
    expect(result.success).toBe(false);
  });

  it("should reject pitch above maximum", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "hello",
      pitch: PITCH_RANGE.max + 1,
    });
    expect(result.success).toBe(false);
  });

  it("should accept pitch at boundaries", () => {
    expect(
      SynthesizeRequestSchema.safeParse({ text: "hello", pitch: PITCH_RANGE.min }).success,
    ).toBe(true);
    expect(
      SynthesizeRequestSchema.safeParse({ text: "hello", pitch: PITCH_RANGE.max }).success,
    ).toBe(true);
  });

  it("should strip unknown fields", () => {
    const result = SynthesizeRequestSchema.safeParse({
      text: "hello",
      unknown: "field",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>)["unknown"]).toBeUndefined();
    }
  });
});

describe("CacheKeySchema", () => {
  it("should accept valid 64-char hex string", () => {
    const result = CacheKeySchema.safeParse("a".repeat(64));
    expect(result.success).toBe(true);
  });

  it("should reject short string", () => {
    const result = CacheKeySchema.safeParse("a".repeat(63));
    expect(result.success).toBe(false);
  });

  it("should reject long string", () => {
    const result = CacheKeySchema.safeParse("a".repeat(65));
    expect(result.success).toBe(false);
  });

  it("should reject non-hex characters", () => {
    const result = CacheKeySchema.safeParse("g".repeat(64));
    expect(result.success).toBe(false);
  });

  it("should reject uppercase hex", () => {
    const result = CacheKeySchema.safeParse("A".repeat(64));
    expect(result.success).toBe(false);
  });
});

describe("SynthesizeResponseSchema", () => {
  it("should accept ready response", () => {
    const result = SynthesizeResponseSchema.safeParse({
      status: "ready",
      cacheKey: "a".repeat(64),
      audioUrl: "https://example.com/audio.wav",
    });
    expect(result.success).toBe(true);
  });

  it("should accept processing response", () => {
    const result = SynthesizeResponseSchema.safeParse({
      status: "processing",
      cacheKey: "a".repeat(64),
      audioUrl: "https://example.com/audio.wav",
    });
    expect(result.success).toBe(true);
  });
});

describe("StatusResponseSchema", () => {
  it("should accept ready response with audioUrl", () => {
    const result = StatusResponseSchema.safeParse({
      status: "ready",
      cacheKey: "a".repeat(64),
      audioUrl: "https://example.com/audio.wav",
    });
    expect(result.success).toBe(true);
  });

  it("should accept processing response with null audioUrl", () => {
    const result = StatusResponseSchema.safeParse({
      status: "processing",
      cacheKey: "a".repeat(64),
      audioUrl: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("HealthResponseSchema", () => {
  it("should accept valid health response", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      version: "0.1.0",
    });
    expect(result.success).toBe(true);
  });
});
