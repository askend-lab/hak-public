// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("parser-advanced.test", () => {
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
