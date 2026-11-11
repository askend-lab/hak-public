// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { parseFeatureContent } from "./index";
import { HANDLERS } from "./parser-handlers";
import { createInitialState } from "./parser-state";

describe("parser-handlers branch coverage", () => {
  it("step keyword with no text returns null from parseStep (lines 41, 123)", () => {
    const content = `
Feature: Test
  Scenario: Edge
    Given
    Then do something
`;
    const result = parseFeatureContent(content);
    expect(result?.scenarios[0]?.steps).toHaveLength(1);
    expect(result?.scenarios[0]?.steps[0]?.keyword).toBe("Then");
  });

  it("data table row without preceding step is ignored (line 61)", () => {
    const content = `
Feature: Test
  Scenario: No step before table
    | col1 | col2 |
    | a    | b    |
    Given something
`;
    const result = parseFeatureContent(content);
    expect(result?.scenarios[0]?.steps).toHaveLength(1);
    expect(result?.scenarios[0]?.steps[0]?.dataTable).toBeUndefined();
  });

  it("handleExamplesRow with null currentExamples is no-op (line 51)", () => {
    const state = createInitialState();
    state.section = "examples";
    state.currentExamples = null;
    HANDLERS.table_row({ trimmed: "| a | b |", lineNum: 1 }, state);
    expect(state.currentExamples).toBeNull();
  });

  it("parseTableRow returns null for empty cells (line 47)", () => {
    const state = createInitialState();
    state.section = "scenario";
    state.currentScenario = { name: "T", tags: [], steps: [{ keyword: "Given", text: "x" }], examples: [] };
    HANDLERS.table_row({ trimmed: "|", lineNum: 1 }, state);
    expect(state.currentScenario.steps[0]?.dataTable).toBeUndefined();
  });
});
