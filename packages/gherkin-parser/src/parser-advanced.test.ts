// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("parser-advanced.test", () => {
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
