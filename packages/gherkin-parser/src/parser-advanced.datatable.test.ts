// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("parser-advanced: data tables", () => {
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
