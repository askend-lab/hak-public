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

import {
  STEP_PATTERN,
  SCENARIO_NAME_PATTERN,
  FEATURE_NAME_PATTERN,
  RULE_NAME_PATTERN,
  TABLE_ROW_PATTERN,
  DOCSTRING_FENCE,
  KEYWORD_PREFIXES,
} from "./constants";

// #3 Line classifier using sorted KEYWORD_PREFIXES (longest-first)
type LineType =
  | "tag"
  | "feature"
  | "background"
  | "scenario"
  | "examples"
  | "rule"
  | "step"
  | "table_row"
  | "docstring_fence"
  | "other";

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

// #4 Generic name extractor replaces three identical functions
function extractName(line: string, pattern: RegExp): string {
  return line.replace(pattern, "");
}

function parseStep(line: string): ParsedStep | null {
  const match = STEP_PATTERN.exec(line);
  if (!match || !match[1] || !match[2]) return null;
  return { keyword: match[1], text: match[2] };
}

function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

// #5 Grouped sub-states for clarity
interface DocStringState {
  active: boolean;
  lines: string[];
}

type SectionContext = "none" | "feature" | "background" | "scenario" | "examples" | "rule";

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

// #2 Extracted addError helper
function addError(state: ParserState, lineNum: number, message: string): void {
  state.feature.errors.push({ line: lineNum, message });
}

function finalizeScenario(state: ParserState): void {
  if (state.currentExamples) {
    if (state.currentScenario) {
      if (!state.currentScenario.examples) state.currentScenario.examples = [];
      state.currentScenario.examples.push(state.currentExamples);
    }
    state.currentExamples = null;
  }
  if (!state.currentScenario) return;
  if (state.currentRule) {
    state.currentRule.scenarios.push(state.currentScenario);
  } else {
    state.feature.scenarios.push(state.currentScenario);
  }
  state.currentScenario = null;
}

function finalizeBackground(state: ParserState): void {
  if (!state.currentBackground) return;
  if (state.currentRule) {
    state.currentRule.background = state.currentBackground;
  } else {
    state.feature.background = state.currentBackground;
  }
  state.currentBackground = null;
}

function finalizeRule(state: ParserState): void {
  finalizeScenario(state);
  finalizeBackground(state);
  if (state.currentRule) {
    state.feature.rules.push(state.currentRule);
    state.currentRule = null;
  }
}

// #9 Extracted finalization from main function
function finalizeState(state: ParserState): void {
  finalizeScenario(state);
  finalizeBackground(state);
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

// #6 Split table row handling into two focused functions
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
  if (lastStep) {
    if (!lastStep.dataTable) lastStep.dataTable = [];
    lastStep.dataTable.push(cells);
  }
}

function createHandlers(state: ParserState): Record<LineType, (line: string, lineNum: number) => void> {
  return {
    tag: (line): void => { state.pendingTags.push(...parseTags(line)); },

    feature: (line, lineNum): void => {
      if (state.feature.name) {
        addError(state, lineNum, "Duplicate Feature: declaration");
        return;
      }
      state.feature.name = extractName(line, FEATURE_NAME_PATTERN);
      state.feature.tags = consumeTags(state.pendingTags);
      state.section = "feature";
    },

    background: (_line, lineNum): void => {
      finalizeScenario(state);
      finalizeBackground(state);
      if (!state.feature.name) {
        addError(state, lineNum, "Background: before Feature:");
      }
      state.currentBackground = { steps: [] };
      consumeTags(state.pendingTags);
      state.section = "background";
    },

    rule: (line, lineNum): void => {
      finalizeRule(state);
      if (!state.feature.name) {
        addError(state, lineNum, "Rule: before Feature:");
      }
      state.currentRule = {
        name: extractName(line, RULE_NAME_PATTERN),
        tags: consumeTags(state.pendingTags),
        scenarios: [],
      };
      state.section = "rule";
    },

    scenario: (line, lineNum): void => {
      finalizeScenario(state);
      if (!state.feature.name) {
        addError(state, lineNum, "Scenario: before Feature:");
      }
      state.currentScenario = {
        name: extractName(line, SCENARIO_NAME_PATTERN),
        tags: consumeTags(state.pendingTags),
        steps: [],
      };
      state.section = "scenario";
    },

    examples: (_line, _lineNum): void => {
      if (state.currentExamples && state.currentScenario) {
        if (!state.currentScenario.examples) state.currentScenario.examples = [];
        state.currentScenario.examples.push(state.currentExamples);
      }
      state.currentExamples = {
        tags: consumeTags(state.pendingTags),
        headers: [],
        rows: [],
      };
      state.section = "examples";
    },

    step: (line): void => {
      const step = parseStep(line);
      if (!step) return;
      if (state.section === "background" && state.currentBackground) {
        state.currentBackground.steps.push(step);
      } else if (state.currentScenario) {
        state.currentScenario.steps.push(step);
      }
    },

    // #6 table_row delegates to focused handlers
    table_row: (line): void => {
      const cells = parseTableRow(line);
      if (state.section === "examples" && state.currentExamples) {
        handleExamplesRow(state, cells);
      } else {
        handleStepDataRow(state, cells);
      }
    },

    // #10 Simplified — inline docString attachment instead of addStepAttachment
    docstring_fence: (): void => {
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

    // #7 Removed dead docString branch — only collects description
    other: (line): void => {
      if (
        state.section === "feature" &&
        !state.currentScenario &&
        !state.currentBackground &&
        line
      ) {
        state.descriptionLines.push(line);
      }
    },
  };
}

export function parseFeatureContent(content: string): ParsedFeature | null {
  const lines = content.split("\n");
  const state = createInitialState();
  const handlers = createHandlers(state);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();
    if (state.docString.active && !trimmed.startsWith(DOCSTRING_FENCE)) {
      state.docString.lines.push(rawLine);
      continue;
    }
    handlers[classifyLine(trimmed)](trimmed, i + 1);
  }

  finalizeState(state);
  return state.feature.name ? state.feature : null;
}
