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
export type StepKeyword = (typeof STEP_KEYWORDS)[number];
// eslint-disable-next-line security/detect-non-literal-regexp -- built from compile-time constants
export const STEP_PATTERN = new RegExp(`^(${STEP_KEYWORDS.join("|")})\\b\\s*(.*)`);

// #2 Name patterns derived from KEYWORDS — single source of truth
function namePattern(keyword: string): RegExp {
  // eslint-disable-next-line security/detect-non-literal-regexp -- built from compile-time constants
  return new RegExp(`^${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`);
}

// #5 Scenario pattern derived from both SCENARIO and SCENARIO_OUTLINE keywords
// eslint-disable-next-line security/detect-non-literal-regexp -- built from compile-time constants
export const SCENARIO_NAME_PATTERN = new RegExp(
  `^(?:${[KEYWORDS.SCENARIO_OUTLINE, KEYWORDS.SCENARIO].map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*`,
);
export const FEATURE_NAME_PATTERN = namePattern(KEYWORDS.FEATURE);
export const RULE_NAME_PATTERN = namePattern(KEYWORDS.RULE);
export const TABLE_ROW_PATTERN = /^\|.*\|$/;
export const DOCSTRING_FENCE = '"""';

// #6 Typed keyword→LineType mapping, sorted longest-first
export type KeywordLineType = "feature" | "background" | "scenario" | "examples" | "rule";

export const KEYWORD_PREFIXES: ReadonlyArray<{ prefix: string; type: KeywordLineType }> = [
  { prefix: KEYWORDS.SCENARIO_OUTLINE, type: "scenario" },
  { prefix: KEYWORDS.BACKGROUND, type: "background" },
  { prefix: KEYWORDS.EXAMPLES, type: "examples" },
  { prefix: KEYWORDS.FEATURE, type: "feature" },
  { prefix: KEYWORDS.SCENARIO, type: "scenario" },
  { prefix: KEYWORDS.RULE, type: "rule" },
];
