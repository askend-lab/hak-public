// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("parser-advanced: edge cases", () => {
  it("should return null for content without Feature:", () => {
    const result = parseFeatureContent("just some text\nno feature here");
    expect(result).toBeNull();
  });

  it("should handle empty scenario", () => {
    const content = `
Feature: Test
  Scenario: Empty
  Scenario: With step
    Given something
`;
    const result = parseFeatureContent(content);
    expect(result?.scenarios).toHaveLength(2);
    expect(result?.scenarios[0]?.steps).toHaveLength(0);
    expect(result?.scenarios[1]?.steps).toHaveLength(1);
  });

  it("should handle multiple Feature: in file (report error)", () => {
    const content = `
Feature: First
  Scenario: A
    Given x
Feature: Second
  Scenario: B
    Given y
`;
    const result = parseFeatureContent(content);
    expect(result?.name).toBe("First");
    expect(result?.errors.length).toBeGreaterThan(0);
  });

  it("should handle tags with special characters", () => {
    const content = `
@wip @jira-123 @priority:high
Feature: Tagged
  Scenario: Test
    Given setup
`;
    const result = parseFeatureContent(content);
    expect(result?.tags).toContain("@wip");
    expect(result?.tags).toContain("@jira-123");
    expect(result?.tags).toContain("@priority:high");
  });

  it("should provide empty errors array for valid input", () => {
    const content = `
Feature: Valid
  Scenario: Test
    Given setup
`;
    const result = parseFeatureContent(content);
    expect(result?.errors).toStrictEqual([]);
  });

  it("should provide empty rules array when no rules", () => {
    const content = `
Feature: Simple
  Scenario: Test
    Given setup
`;
    const result = parseFeatureContent(content);
    expect(result?.rules).toStrictEqual([]);
  });

});
