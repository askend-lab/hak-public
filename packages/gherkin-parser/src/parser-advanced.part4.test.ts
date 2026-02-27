// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";

describe("parser-advanced.test", () => {
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
