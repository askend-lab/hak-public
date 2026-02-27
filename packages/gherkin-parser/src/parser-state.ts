// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable no-param-reassign -- parser mutates state/tags objects by design */

import type {
  ParsedStep,
  ParsedScenario,
  ParsedRule,
  ParsedFeature,
} from "./types";

import type { KeywordLineType } from "./constants";

import {
  STEP_PATTERN,
  TABLE_ROW_PATTERN,
  DOCSTRING_FENCE,
  KEYWORD_PREFIXES,
} from "./constants";

// --- Types ---

export type LineType = KeywordLineType | "tag" | "step" | "table_row" | "docstring_fence" | "other";
type SectionContext = "none" | "feature" | "background" | "scenario" | "examples" | "rule";

export interface LineContext {
  trimmed: string;
  lineNum: number;
}

export interface ParserState {
  feature: ParsedFeature;
  currentScenario: ParsedScenario | null;
  currentBackground: { steps: ParsedStep[] } | null;
  currentRule: ParsedRule | null;
  currentExamples: { tags: string[]; headers: string[]; rows: string[][] } | null;
  pendingTags: string[];
  section: SectionContext;
  descriptionLines: string[];
  docString: { active: boolean; lines: string[] };
}

// --- Classification ---

function classifyByKeyword(line: string): KeywordLineType | null {
  for (const entry of KEYWORD_PREFIXES) {
    if (line.startsWith(entry.prefix)) {return entry.type;}
  }
  return null;
}

function classifyByPattern(line: string): LineType {
  if (STEP_PATTERN.test(line)) {return "step";}
  if (TABLE_ROW_PATTERN.test(line)) {return "table_row";}
  if (line.startsWith(DOCSTRING_FENCE)) {return "docstring_fence";}
  return "other";
}

export function classifyLine(line: string): LineType {
  if (line.startsWith("@")) {return "tag";}
  return classifyByKeyword(line) ?? classifyByPattern(line);
}

// --- State management ---

export function drainTags(pendingTags: string[]): string[] {
  const tags = [...pendingTags];
  pendingTags.length = 0;
  return tags;
}

export function clearTags(pendingTags: string[]): void {
  pendingTags.length = 0;
}

export function addError(state: ParserState, lineNum: number, message: string): void {
  state.feature.errors.push({ line: lineNum, message });
}

export function requireFeature(state: ParserState, ctx: LineContext, keyword: string): void {
  if (!state.feature.name) {
    addError(state, ctx.lineNum, `${keyword} before Feature:`);
  }
}

function getTargetContainer(state: ParserState): ParsedFeature | ParsedRule {
  return state.currentRule ?? state.feature;
}

export function createInitialState(): ParserState {
  return {
    feature: { name: "", description: "", tags: [], scenarios: [], rules: [], errors: [] },
    currentScenario: null, currentBackground: null, currentRule: null, currentExamples: null,
    pendingTags: [], section: "none", descriptionLines: [],
    docString: { active: false, lines: [] },
  };
}

export function finalizeExamples(state: ParserState): void {
  if (!state.currentExamples) {return;}
  if (state.currentScenario) {
    state.currentScenario.examples.push(state.currentExamples);
  }
  state.currentExamples = null;
}

export function finalizeScenario(state: ParserState): void {
  finalizeExamples(state);
  if (!state.currentScenario) {return;}
  getTargetContainer(state).scenarios.push(state.currentScenario);
  state.currentScenario = null;
}

export function finalizeBackground(state: ParserState): void {
  if (!state.currentBackground) {return;}
  getTargetContainer(state).background = state.currentBackground;
  state.currentBackground = null;
}

export function finalizeRule(state: ParserState): void {
  finalizeScenario(state);
  finalizeBackground(state);
  if (!state.currentRule) {return;}
  state.feature.rules.push(state.currentRule);
  state.currentRule = null;
}

export function finalizeState(state: ParserState): void {
  finalizeRule(state);
  state.feature.description = state.descriptionLines.join("\n");
}

export function getLastStep(state: ParserState): ParsedStep | undefined {
  if (state.section === "background" && state.currentBackground) {
    const { steps } = state.currentBackground;
    return steps[steps.length - 1];
  }
  const steps = state.currentScenario?.steps;
  return steps?.[steps.length - 1];
}

/* eslint-enable no-param-reassign -- end parser state */
