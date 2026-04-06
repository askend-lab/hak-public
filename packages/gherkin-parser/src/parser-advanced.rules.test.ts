// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("parser-advanced: rules", () => {
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
