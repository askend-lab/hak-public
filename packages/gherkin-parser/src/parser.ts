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

// #6 LineType = keyword types + non-keyword types
type LineType = KeywordLineType | "tag" | "step" | "table_row" | "docstring_fence" | "other";

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

function consumeTags(pendingTags: string[]): string[] {
  const tags = [...pendingTags];
  pendingTags.splice(0);
  return tags;
}

function parseTags(line: string): string[] {
  return line.split(/\s+/).filter((t) => t.startsWith("@"));
}

function extractName(line: string, pattern: RegExp): string {
  return line.replace(pattern, "");
}

// #1 Cast to StepKeyword for type-safe structured steps
function parseStep(line: string): ParsedStep | null {
  const match = STEP_PATTERN.exec(line);
  if (!match || !match[1] || !match[2]) return null;
  return { keyword: match[1] as StepKeyword, text: match[2] };
}

function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

interface DocStringState {
  active: boolean;
  lines: string[];
}

type SectionContext = "none" | "feature" | "background" | "scenario" | "examples" | "rule";

// #8 Line context passed to handlers — rawLine for docstring/description
interface LineContext {
  trimmed: string;
  rawLine: string;
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

function addError(state: ParserState, lineNum: number, message: string): void {
  state.feature.errors.push({ line: lineNum, message });
}

// #9 Flattened with guard clauses and early returns
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
  const target = state.currentRule ?? state.feature;
  target.scenarios.push(state.currentScenario);
  state.currentScenario = null;
}

function finalizeBackground(state: ParserState): void {
  if (!state.currentBackground) return;
  const target = state.currentRule ?? state.feature;
  target.background = state.currentBackground;
  state.currentBackground = null;
}

function finalizeRule(state: ParserState): void {
  finalizeScenario(state);
  finalizeBackground(state);
  if (!state.currentRule) return;
  state.feature.rules.push(state.currentRule);
  state.currentRule = null;
}

// #3 finalizeState only calls finalizeRule (which chains the rest)
function finalizeState(state: ParserState): void {
  finalizeRule(state);
  state.feature.description = state.descriptionLines.join("\n");
}

function getLastStep(state: ParserState): ParsedStep | undefined {
  if (state.section === "background" && state.currentBackground) {
    return state.currentBackground.steps[state.currentBackground.steps.length - 1];
  }
  if (state.currentScenario) {
    return state.currentScenario.steps[state.currentScenario.steps.length - 1];
  }
  return undefined;
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

// #7 Handler type uses LineContext — no unused params
type Handler = (ctx: LineContext, state: ParserState) => void;

function createHandlers(): Record<LineType, Handler> {
  return {
    tag: (ctx, state): void => { state.pendingTags.push(...parseTags(ctx.trimmed)); },

    feature: (ctx, state): void => {
      if (state.feature.name) {
        addError(state, ctx.lineNum, "Duplicate Feature: declaration");
        return;
      }
      state.feature.name = extractName(ctx.trimmed, FEATURE_NAME_PATTERN);
      state.feature.tags = consumeTags(state.pendingTags);
      state.section = "feature";
    },

    background: (ctx, state): void => {
      finalizeScenario(state);
      finalizeBackground(state);
      if (!state.feature.name) {
        addError(state, ctx.lineNum, "Background: before Feature:");
      }
      state.currentBackground = { steps: [] };
      consumeTags(state.pendingTags);
      state.section = "background";
    },

    rule: (ctx, state): void => {
      finalizeRule(state);
      if (!state.feature.name) {
        addError(state, ctx.lineNum, "Rule: before Feature:");
      }
      state.currentRule = {
        name: extractName(ctx.trimmed, RULE_NAME_PATTERN),
        tags: consumeTags(state.pendingTags),
        scenarios: [],
      };
      state.section = "rule";
    },

    // #5 examples initialized at scenario creation
    scenario: (ctx, state): void => {
      finalizeScenario(state);
      if (!state.feature.name) {
        addError(state, ctx.lineNum, "Scenario: before Feature:");
      }
      state.currentScenario = {
        name: extractName(ctx.trimmed, SCENARIO_NAME_PATTERN),
        tags: consumeTags(state.pendingTags),
        steps: [],
        examples: [],
      };
      state.section = "scenario";
    },

    examples: (_ctx, state): void => {
      finalizeExamples(state);
      state.currentExamples = {
        tags: consumeTags(state.pendingTags),
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

    table_row: (ctx, state): void => {
      const cells = parseTableRow(ctx.trimmed);
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

    // #10 Description uses trimmed line for consistency with other text fields
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
}

// #8 DocString handling unified — only the main loop manages docString lines
export function parseFeatureContent(content: string): ParsedFeature | null {
  const lines = content.split("\n");
  const state = createInitialState();
  const handlers = createHandlers();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();
    if (state.docString.active && !trimmed.startsWith(DOCSTRING_FENCE)) {
      state.docString.lines.push(rawLine);
      continue;
    }
    const ctx: LineContext = { trimmed, rawLine, lineNum: i + 1 };
    handlers[classifyLine(trimmed)](ctx, state);
  }

  finalizeState(state);
  return state.feature.name ? state.feature : null;
}
