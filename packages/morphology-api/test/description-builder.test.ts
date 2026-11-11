// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { buildDescription } from "../src/description-builder";

describe("buildDescription", () => {
  it.each([
    ["S", "nimisõna"],
    ["V", "tegusõna"],
    ["A", "omadussõna"],
    ["D", "määrsõna"],
    ["P", "asesõna"],
    ["K", "sidesõna"],
    ["J", "kaassõna"],
    ["I", "hüüdsõna"],
    ["Y", "lühend"],
  ])("should map POS %s to %s", (pos, expected) => {
    const result = buildDescription({ lemma: "word", pos, fs: "" }, "word");
    expect(result).toBe(expected);
  });

  it("should return 'tavaline' when no parts", () => {
    const result = buildDescription({ lemma: "word", pos: "", fs: "" }, "word");
    expect(result).toBe("tavaline");
  });

  it("should include lemma when different from word", () => {
    const result = buildDescription({ lemma: "lemma", pos: "S", fs: "" }, "word");
    expect(result).toContain("lemma: lemma");
    expect(result).toContain("nimisõna");
  });

  it("should not include lemma when same as word (case insensitive)", () => {
    const result = buildDescription({ lemma: "Word", pos: "S", fs: "" }, "word");
    expect(result).not.toContain("lemma:");
    expect(result).toBe("nimisõna");
  });

  it("should not include empty lemma", () => {
    const result = buildDescription({ lemma: "", pos: "S", fs: "" }, "word");
    expect(result).not.toContain("lemma:");
  });

  it("should include fs when provided", () => {
    const result = buildDescription({ lemma: "word", pos: "S", fs: "sg n" }, "word");
    expect(result).toContain("sg n");
  });

  it("should join all parts with comma", () => {
    const result = buildDescription({ lemma: "lemma", pos: "V", fs: "da" }, "word");
    expect(result).toBe("lemma: lemma, tegusõna, da");
  });

  it("should handle unknown POS", () => {
    const result = buildDescription({ lemma: "word", pos: "X", fs: "" }, "word");
    expect(result).toBe("tavaline");
  });

  it("should handle only fs", () => {
    const result = buildDescription({ lemma: "word", pos: "", fs: "sg g" }, "word");
    expect(result).toBe("sg g");
  });
});
