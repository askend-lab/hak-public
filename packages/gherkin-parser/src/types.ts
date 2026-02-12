// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

// #1 Structured step type instead of plain strings
export interface ParsedStep {
  keyword: string;
  text: string;
  dataTable?: string[][];
  docString?: string;
}

// Background steps preserved for consumers
export interface ParsedBackground {
  steps: ParsedStep[];
}

// Examples table for Scenario Outline
export interface ParsedExamples {
  tags: string[];
  headers: string[];
  rows: string[][];
}

export interface ParsedScenario {
  name: string;
  tags: string[];
  steps: ParsedStep[];
  examples?: ParsedExamples[];
}

// Rule: keyword support (Gherkin 6+)
export interface ParsedRule {
  name: string;
  tags: string[];
  background?: ParsedBackground;
  scenarios: ParsedScenario[];
}

export interface ParseError {
  line: number;
  message: string;
}

export interface ParsedFeature {
  name: string;
  description: string;
  tags: string[];
  background?: ParsedBackground;
  scenarios: ParsedScenario[];
  rules: ParsedRule[];
  errors: ParseError[];
}
