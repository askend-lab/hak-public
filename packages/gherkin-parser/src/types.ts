// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { StepKeyword } from "./constants";

export interface ParsedStep {
  keyword: StepKeyword;
  text: string;
  dataTable?: string[][];
  docString?: string;
}

export interface ParsedBackground {
  steps: ParsedStep[];
}

export interface ParsedExamples {
  tags: string[];
  headers: string[];
  rows: string[][];
}

export interface ParsedScenario {
  name: string;
  tags: string[];
  steps: ParsedStep[];
  examples: ParsedExamples[];
}

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
