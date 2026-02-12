// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export const KEYWORDS = {
  FEATURE: "Feature:",
  SCENARIO: "Scenario:",
  SCENARIO_OUTLINE: "Scenario Outline:",
  BACKGROUND: "Background:",
  EXAMPLES: "Examples:",
  RULE: "Rule:",
} as const;

export const STEP_KEYWORDS = ["Given", "When", "Then", "And", "But"] as const;
export const STEP_PATTERN = new RegExp(`^(${STEP_KEYWORDS.join("|")})\\b\\s*(.*)`);

export const SCENARIO_NAME_PATTERN = /^Scenario(?: Outline)?:\s*/;
export const FEATURE_NAME_PATTERN = /^Feature:\s*/;
export const RULE_NAME_PATTERN = /^Rule:\s*/;
export const TABLE_ROW_PATTERN = /^\|.*\|$/;
export const DOCSTRING_FENCE = '"""';

// #3 Keyword prefixes sorted longest-first for safe startsWith matching
export const KEYWORD_PREFIXES = [
  { prefix: KEYWORDS.SCENARIO_OUTLINE, type: "scenario" },
  { prefix: KEYWORDS.BACKGROUND, type: "background" },
  { prefix: KEYWORDS.EXAMPLES, type: "examples" },
  { prefix: KEYWORDS.FEATURE, type: "feature" },
  { prefix: KEYWORDS.SCENARIO, type: "scenario" },
  { prefix: KEYWORDS.RULE, type: "rule" },
] as const;
