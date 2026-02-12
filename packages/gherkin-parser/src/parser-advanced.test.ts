// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("Scenario Outline with Examples (#3)", () => {
  it("should parse examples table", () => {
    const content = `
Feature: Login
  Scenario Outline: Login with <role>
    Given user is a <role>
    When user logs in with <password>
    Then user sees <page>

    Examples:
      | role  | password | page      |
      | admin | secret   | dashboard |
      | user  | pass123  | home      |
`;
    const result = parseFeatureContent(content);
    const scenario = result?.scenarios[0];
    expect(scenario?.examples).toHaveLength(1);
    expect(scenario?.examples?.[0]?.headers).toStrictEqual(["role", "password", "page"]);
    expect(scenario?.examples?.[0]?.rows).toHaveLength(2);
    expect(scenario?.examples?.[0]?.rows[0]).toStrictEqual(["admin", "secret", "dashboard"]);
    expect(scenario?.examples?.[0]?.rows[1]).toStrictEqual(["user", "pass123", "home"]);
  });

  it("should parse multiple examples blocks", () => {
    const content = `
Feature: Test
  Scenario Outline: Test <x>
    Given value <x>

    @positive
    Examples:
      | x |
      | 1 |

    @negative
    Examples:
      | x  |
      | -1 |
`;
    const result = parseFeatureContent(content);
    const scenario = result?.scenarios[0];
    expect(scenario?.examples).toHaveLength(2);
    expect(scenario?.examples?.[0]?.tags).toContain("@positive");
    expect(scenario?.examples?.[1]?.tags).toContain("@negative");
  });
});

describe("Rule: keyword (#6)", () => {
  it("should parse rules with scenarios", () => {
    const content = `
Feature: Account
  Rule: User must be authenticated
    Scenario: Login required
      Given user is not logged in
      When user accesses dashboard
      Then user is redirected to login
`;
    const result = parseFeatureContent(content);
    expect(result?.rules).toHaveLength(1);
    expect(result?.rules[0]?.name).toBe("User must be authenticated");
    expect(result?.rules[0]?.scenarios).toHaveLength(1);
  });

  it("should parse rule with background", () => {
    const content = `
Feature: Account
  Rule: Admin actions
    Background:
      Given user is admin
    Scenario: Delete user
      When admin deletes user
      Then user is removed
`;
    const result = parseFeatureContent(content);
    expect(result?.rules[0]?.background?.steps).toHaveLength(1);
    expect(result?.rules[0]?.scenarios).toHaveLength(1);
  });

  it("should parse tagged rules", () => {
    const content = `
Feature: Test
  @important
  Rule: Critical rule
    Scenario: Test
      Given setup
`;
    const result = parseFeatureContent(content);
    expect(result?.rules[0]?.tags).toContain("@important");
  });
});

describe("Data Tables (#7)", () => {
  it("should attach data table to step", () => {
    const content = `
Feature: Test
  Scenario: Users
    Given the following users:
      | name  | role  |
      | Alice | admin |
      | Bob   | user  |
`;
    const result = parseFeatureContent(content);
    const step = result?.scenarios[0]?.steps[0];
    expect(step?.dataTable).toHaveLength(3);
    expect(step?.dataTable?.[0]).toStrictEqual(["name", "role"]);
    expect(step?.dataTable?.[1]).toStrictEqual(["Alice", "admin"]);
    expect(step?.dataTable?.[2]).toStrictEqual(["Bob", "user"]);
  });
});

describe("DocStrings (#7)", () => {
  it("should attach docstring to step", () => {
    const content = `Feature: Test
  Scenario: API
    Given the following JSON:
      """
      {"key": "value"}
      """
`;
    const result = parseFeatureContent(content);
    const step = result?.scenarios[0]?.steps[0];
    expect(step?.docString).toContain('{"key": "value"}');
  });
});

describe("background data table and docstring", () => {
  it("should attach data table to background step", () => {
    const content = `
Feature: Test
  Background:
    Given the following config:
      | key   | value |
      | debug | true  |
  Scenario: Test
    Given setup
`;
    const result = parseFeatureContent(content);
    const bgStep = result?.background?.steps[0];
    expect(bgStep?.dataTable).toHaveLength(2);
    expect(bgStep?.dataTable?.[0]).toStrictEqual(["key", "value"]);
  });

  it("should attach docstring to background step", () => {
    const content = `Feature: Test
  Background:
    Given the following config:
      """
      some config
      multi line
      """
  Scenario: Test
    Given setup
`;
    const result = parseFeatureContent(content);
    const bgStep = result?.background?.steps[0];
    expect(bgStep?.docString).toContain("some config");
    expect(bgStep?.docString).toContain("multi line");
  });
});

describe("error reporting (#5)", () => {
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

describe("edge cases (#10)", () => {
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
