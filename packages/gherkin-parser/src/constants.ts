// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

// #7 [OCP] Keywords extracted to constants
export const KEYWORDS = {
  FEATURE: "Feature:",
  SCENARIO: "Scenario:",
  SCENARIO_OUTLINE: "Scenario Outline:",
  BACKGROUND: "Background:",
  EXAMPLES: "Examples:",
  RULE: "Rule:",
} as const;

export const STEP_KEYWORDS = ["Given", "When", "Then", "And", "But"] as const;
export const STEP_PATTERN = /^(Given|When|Then|And|But)\b\s*(.*)/;
export const SCENARIO_NAME_PATTERN = /^Scenario(?: Outline)?:\s*/;
export const FEATURE_NAME_PATTERN = /^Feature:\s*/;
export const RULE_NAME_PATTERN = /^Rule:\s*/;
export const TAG_PATTERN = /^@\S+/;
export const TABLE_ROW_PATTERN = /^\|.*\|$/;
export const DOCSTRING_FENCE = '"""';
