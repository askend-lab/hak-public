// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("parser-advanced.test", () => {
  it("should report duplicate Feature:", () => {
    const content = `
Feature: First
Feature: Second
`;
    const result = parseFeatureContent(content);
    expect(result?.errors).toHaveLength(1);
    expect(result?.errors[0]?.message).toBe("Duplicate Feature: declaration");
  });

  it("should report Scenario before Feature", () => {
    const content = `
Scenario: Orphan
  Given something
Feature: Late
`;
    const result = parseFeatureContent(content);
    expect(result?.errors.some((e) => e.message.includes("before Feature:"))).toBe(true);
  });

  it("should report Background before Feature", () => {
    const content = `
Background:
  Given setup
Feature: Late
`;
    const result = parseFeatureContent(content);
    expect(result?.errors.some((e) => e.message === "Background: before Feature:")).toBe(true);
  });

  it("should report Rule before Feature", () => {
    const content = `
Rule: Orphan rule
  Scenario: Test
    Given setup
Feature: Late
`;
    const result = parseFeatureContent(content);
    expect(result?.errors.some((e) => e.message === "Rule: before Feature:")).toBe(true);
  });

  it("should include line numbers in errors", () => {
    const content = `Feature: A
Feature: B`;
    const result = parseFeatureContent(content);
    expect(result?.errors[0]?.line).toBe(2);
  });

});
