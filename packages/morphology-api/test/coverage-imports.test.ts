// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Smoke tests verifying core exports from each source module.
 * Each test exercises real behavior, not just import existence.
 */

import { buildDescription } from "../src/description-builder";
import { healthHandler } from "../src/handler";
import { formatPhoneticText, isDuplicateVariant } from "../src/parser-helpers";
import { extractStressedText } from "../src/parser";
import { parseJsonBody, getFieldError } from "../src/validation";

describe("Module smoke tests", () => {
  it("buildDescription returns default for empty inputs", () => {
    expect(buildDescription("", "", "", "word")).toBe("tavaline");
  });

  it("buildDescription includes POS label for known part of speech", () => {
    expect(buildDescription("koer", "S", "", "koer")).toContain("nimisõna");
  });

  it("healthHandler returns valid JSON with status and version", () => {
    const res = healthHandler();
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("version");
  });

  it("formatPhoneticText joins stem and ending with +", () => {
    expect(formatPhoneticText("koer", "a")).toBe("koer+a");
    expect(formatPhoneticText("koer", "0")).toBe("koer");
    expect(formatPhoneticText("koer", "")).toBe("koer");
  });

  it("isDuplicateVariant detects matching text+description", () => {
    const variant = { text: "koer", description: "nimisõna", morphology: { lemma: "", pos: "", fs: "", stem: "", ending: "" } };
    expect(isDuplicateVariant([variant], variant)).toBe(true);
    expect(isDuplicateVariant([], variant)).toBe(false);
  });

  it("extractStressedText returns original when response has no tokens", () => {
    expect(extractStressedText({}, "tere")).toBe("tere");
  });

  it("parseJsonBody parses valid JSON and rejects invalid", () => {
    expect(parseJsonBody('{"a":1}')).toStrictEqual({ a: 1 });
    expect(parseJsonBody("bad")).toBeNull();
  });

  it("getFieldError returns error for missing field", () => {
    expect(getFieldError(undefined, "text")).toContain("Missing");
    expect(getFieldError("valid", "text")).toBeNull();
  });
});
