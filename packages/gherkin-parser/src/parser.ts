// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type {
  ParsedStep,
  ParsedBackground,
  ParsedExamples,
  ParsedScenario,
  ParsedRule,
  ParsedFeature,
} from "./types";

import type { StepKeyword, KeywordLineType } from "./constants";

import {
  STEP_PATTERN,
  SCENARIO_NAME_PATTERN,
  FEATURE_NAME_PATTERN,
  RULE_NAME_PATTERN,
  TABLE_ROW_PATTERN,
  DOCSTRING_FENCE,
  KEYWORD_PREFIXES,
} from "./constants";

// --- Internal types (#9 grouped at top) ---

type LineType = KeywordLineType | "tag" | "step" | "table_row" | "docstring_fence" | "other";
type SectionContext = "none" | "feature" | "background" | "scenario" | "examples" | "rule";

interface DocStringState {
  active: boolean;
  lines: string[];
}

// #1 Removed dead rawLine — handlers only need trimmed + lineNum
interface LineContext {
  trimmed: string;
  lineNum: number;
}

interface ParserState {
  feature: ParsedFeature;
  currentScenario: ParsedScenario | null;
  currentBackground: ParsedBackground | null;
  currentRule: ParsedRule | null;
  currentExamples: ParsedExamples | null;
  pendingTags: string[];
  section: SectionContext;
  descriptionLines: string[];
  docString: DocStringState;
}

type Handler = (ctx: LineContext, state: ParserState) => void;

// --- Pure utility functions ---

function classifyLine(line: string): LineType {
  if (line.startsWith("@")) return "tag";
  for (const entry of KEYWORD_PREFIXES) {
    if (line.startsWith(entry.prefix)) return entry.type;
  }
  if (STEP_PATTERN.test(line)) return "step";
  if (TABLE_ROW_PATTERN.test(line)) return "table_row";
  if (line.startsWith(DOCSTRING_FENCE)) return "docstring_fence";
  return "other";
}

// #4 drainTags — consume-and-clear: returns accumulated tags, resets array
function drainTags(pendingTags: string[]): string[] {
  const tags = [...pendingTags];
  pendingTags.length = 0;
  return tags;
}

// #10 clearTags — discard-only variant, no allocation
function clearTags(pendingTags: string[]): void {
  pendingTags.length = 0;
}

function parseTags(line: string): string[] {
  return line.split(/\s+/).filter((t) => t.startsWith("@"));
}

function extractName(line: string, pattern: RegExp): string {
  return line.replace(pattern, "");
}

function parseStep(line: string): ParsedStep | null {
  const match = STEP_PATTERN.exec(line);
  if (!match || !match[1] || !match[2]) return null;
  return { keyword: match[1] as StepKeyword, text: match[2] };
}

// #8 Validates table row has at least one cell
function parseTableRow(line: string): string[] | null {
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
  return cells.length > 0 ? cells : null;
}

// --- State helpers ---

function addError(state: ParserState, lineNum: number, message: string): void {
  state.feature.errors.push({ line: lineNum, message });
}

// #6 Extracted repeated !state.feature.name check
function requireFeature(state: ParserState, ctx: LineContext, keyword: string): void {
  if (!state.feature.name) {
    addError(state, ctx.lineNum, `${keyword} before Feature:`);
  }
}

// #2 Extracted repeated target-container pattern
function getTargetContainer(state: ParserState): ParsedFeature | ParsedRule {
  return state.currentRule ?? state.feature;
}

function createInitialState(): ParserState {
  return {
    feature: {
      name: "",
      description: "",
      tags: [],
      scenarios: [],
      rules: [],
      errors: [],
    },
    currentScenario: null,
    currentBackground: null,
    currentRule: null,
    currentExamples: null,
    pendingTags: [],
    section: "none",
    descriptionLines: [],
    docString: { active: false, lines: [] },
  };
}

function finalizeExamples(state: ParserState): void {
  if (!state.currentExamples) return;
  if (state.currentScenario) {
    state.currentScenario.examples.push(state.currentExamples);
  }
  state.currentExamples = null;
}

function finalizeScenario(state: ParserState): void {
  finalizeExamples(state);
  if (!state.currentScenario) return;
  getTargetContainer(state).scenarios.push(state.currentScenario);
  state.currentScenario = null;
}

function finalizeBackground(state: ParserState): void {
  if (!state.currentBackground) return;
  getTargetContainer(state).background = state.currentBackground;
  state.currentBackground = null;
}

function finalizeRule(state: ParserState): void {
  finalizeScenario(state);
  finalizeBackground(state);
  if (!state.currentRule) return;
  state.feature.rules.push(state.currentRule);
  state.currentRule = null;
}

function finalizeState(state: ParserState): void {
  finalizeRule(state);
  state.feature.description = state.descriptionLines.join("\n");
}

// #7 Simplified with optional chaining
function getLastStep(state: ParserState): ParsedStep | undefined {
  if (state.section === "background" && state.currentBackground) {
    const { steps } = state.currentBackground;
    return steps[steps.length - 1];
  }
  const steps = state.currentScenario?.steps;
  return steps?.[steps.length - 1];
}

function handleExamplesRow(state: ParserState, cells: string[]): void {
  if (!state.currentExamples) return;
  if (state.currentExamples.headers.length === 0) {
    state.currentExamples.headers = cells;
  } else {
    state.currentExamples.rows.push(cells);
  }
}

function handleStepDataRow(state: ParserState, cells: string[]): void {
  const lastStep = getLastStep(state);
  if (!lastStep) return;
  if (!lastStep.dataTable) lastStep.dataTable = [];
  lastStep.dataTable.push(cells);
}

// #3 Module-level handler map — created once, not per parse
const HANDLERS: Record<LineType, Handler> = {
  tag: (ctx, state): void => { state.pendingTags.push(...parseTags(ctx.trimmed)); },

  feature: (ctx, state): void => {
    if (state.feature.name) {
      addError(state, ctx.lineNum, "Duplicate Feature: declaration");
      return;
    }
    state.feature.name = extractName(ctx.trimmed, FEATURE_NAME_PATTERN);
    state.feature.tags = drainTags(state.pendingTags);
    state.section = "feature";
  },

  background: (ctx, state): void => {
    finalizeScenario(state);
    finalizeBackground(state);
    requireFeature(state, ctx, "Background:");
    state.currentBackground = { steps: [] };
    clearTags(state.pendingTags);
    state.section = "background";
  },

  rule: (ctx, state): void => {
    finalizeRule(state);
    requireFeature(state, ctx, "Rule:");
    state.currentRule = {
      name: extractName(ctx.trimmed, RULE_NAME_PATTERN),
      tags: drainTags(state.pendingTags),
      scenarios: [],
    };
    state.section = "rule";
  },

  scenario: (ctx, state): void => {
    finalizeScenario(state);
    requireFeature(state, ctx, "Scenario:");
    state.currentScenario = {
      name: extractName(ctx.trimmed, SCENARIO_NAME_PATTERN),
      tags: drainTags(state.pendingTags),
      steps: [],
      examples: [],
    };
    state.section = "scenario";
  },

  examples: (_ctx, state): void => {
    finalizeExamples(state);
    state.currentExamples = {
      tags: drainTags(state.pendingTags),
      headers: [],
      rows: [],
    };
    state.section = "examples";
  },

  step: (ctx, state): void => {
    const step = parseStep(ctx.trimmed);
    if (!step) return;
    if (state.section === "background" && state.currentBackground) {
      state.currentBackground.steps.push(step);
    } else if (state.currentScenario) {
      state.currentScenario.steps.push(step);
    }
  },

  // #8 Skips malformed table rows
  table_row: (ctx, state): void => {
    const cells = parseTableRow(ctx.trimmed);
    if (!cells) return;
    if (state.section === "examples" && state.currentExamples) {
      handleExamplesRow(state, cells);
    } else {
      handleStepDataRow(state, cells);
    }
  },

  docstring_fence: (_ctx, state): void => {
    if (state.docString.active) {
      const lastStep = getLastStep(state);
      if (lastStep) {
        lastStep.docString = state.docString.lines.join("\n");
      }
      state.docString = { active: false, lines: [] };
    } else {
      state.docString = { active: true, lines: [] };
    }
  },

  other: (ctx, state): void => {
    if (
      state.section === "feature" &&
      !state.currentScenario &&
      !state.currentBackground &&
      ctx.trimmed
    ) {
      state.descriptionLines.push(ctx.trimmed);
    }
  },
};

export function parseFeatureContent(content: string): ParsedFeature | null {
  const lines = content.split("\n");
  const state = createInitialState();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();
    if (state.docString.active && !trimmed.startsWith(DOCSTRING_FENCE)) {
      state.docString.lines.push(rawLine);
      continue;
    }
    HANDLERS[classifyLine(trimmed)]({ trimmed, lineNum: i + 1 }, state);
  }

  finalizeState(state);
  return state.feature.name ? state.feature : null;
}
