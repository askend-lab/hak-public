// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  AnalyzeRequestSchema,
  VariantsRequestSchema,
  AnalyzeResponseSchema,
  VariantsResponseSchema,
  HealthResponseSchema,
  MAX_TEXT_LENGTH,
} from "../src/schemas";

describe("AnalyzeRequestSchema", () => {
  it("should accept valid text", () => {
    const result = AnalyzeRequestSchema.safeParse({ text: "tere" });
    expect(result.success).toBe(true);
  });

  it("should reject empty text", () => {
    const result = AnalyzeRequestSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing text", () => {
    const result = AnalyzeRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject text exceeding max length", () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: "a".repeat(MAX_TEXT_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("should accept text at max length", () => {
    const result = AnalyzeRequestSchema.safeParse({
      text: "a".repeat(MAX_TEXT_LENGTH),
    });
    expect(result.success).toBe(true);
  });
});

describe("VariantsRequestSchema", () => {
  it("should accept valid word", () => {
    const result = VariantsRequestSchema.safeParse({ word: "koer" });
    expect(result.success).toBe(true);
  });

  it("should reject empty word", () => {
    const result = VariantsRequestSchema.safeParse({ word: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing word", () => {
    const result = VariantsRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("AnalyzeResponseSchema", () => {
  it("should accept valid response", () => {
    const result = AnalyzeResponseSchema.safeParse({
      stressedText: "t'ere",
      originalText: "tere",
    });
    expect(result.success).toBe(true);
  });
});

describe("VariantsResponseSchema", () => {
  it("should accept valid response with variants", () => {
    const result = VariantsResponseSchema.safeParse({
      word: "koer",
      variants: [
        {
          text: "koer",
          description: "noun, singular nominative",
          morphology: {
            lemma: "koer",
            pos: "S",
            fs: "sg n",
            stem: "koer",
            ending: "0",
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should accept response with empty variants", () => {
    const result = VariantsResponseSchema.safeParse({
      word: "xyz",
      variants: [],
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
