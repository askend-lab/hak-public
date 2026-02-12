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
  KEYWORDS,
  STEP_PATTERN,
  SCENARIO_NAME_PATTERN,
  FEATURE_NAME_PATTERN,
  RULE_NAME_PATTERN,
  TABLE_ROW_PATTERN,
  DOCSTRING_FENCE,
} from "./constants";

// #5 Line classifier
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
  if (line.startsWith(KEYWORDS.FEATURE)) return "feature";
  if (line.startsWith(KEYWORDS.BACKGROUND)) return "background";
  if (line.startsWith(KEYWORDS.RULE)) return "rule";
  if (line.startsWith(KEYWORDS.EXAMPLES)) return "examples";
  if (
    line.startsWith(KEYWORDS.SCENARIO_OUTLINE) ||
    line.startsWith(KEYWORDS.SCENARIO)
  )
    return "scenario";
  if (STEP_PATTERN.test(line)) return "step";
  if (TABLE_ROW_PATTERN.test(line)) return "table_row";
  if (line.startsWith(DOCSTRING_FENCE)) return "docstring_fence";
  return "other";
}

// #3 + #4 Consume and clear pending tags
function consumeTags(pendingTags: string[]): string[] {
  const tags = [...pendingTags];
  pendingTags.splice(0);
  return tags;
}

function parseTags(line: string): string[] {
  return line.split(/\s+/).filter((t) => t.startsWith("@"));
}

// #8 Extract name parsers for consistency
function parseFeatureName(line: string): string {
  return line.replace(FEATURE_NAME_PATTERN, "");
}

function parseScenarioName(line: string): string {
  return line.replace(SCENARIO_NAME_PATTERN, "");
}

function parseRuleName(line: string): string {
  return line.replace(RULE_NAME_PATTERN, "");
}

// #1 Parse step into structured ParsedStep
function parseStep(line: string): ParsedStep | null {
  const match = STEP_PATTERN.exec(line);
  if (!match || !match[1] || !match[2]) return null;
  return { keyword: match[1], text: match[2] };
}

// #7 Parse table row
function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

// Parser state machine context
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
  inDocString: boolean;
  docStringLines: string[];
}

function createEmptyFeature(): ParsedFeature {
  return {
    name: "",
    description: "",
    tags: [],
    scenarios: [],
    rules: [],
    errors: [],
  };
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

function addStepAttachment(step: ParsedStep | undefined, type: "dataTable" | "docString", value: string[][] | string): void {
  if (!step) return;
  if (type === "dataTable") {
    step.dataTable = value as string[][];
  } else {
    step.docString = value as string;
  }
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

// #10 Handler map
function createHandlers(state: ParserState): Record<LineType, (line: string, lineNum: number) => void> {
  return {
    tag: (line): void => { state.pendingTags.push(...parseTags(line)); },

    feature: (line, lineNum): void => {
      // #9 Validation: duplicate Feature:
      if (state.feature.name) {
        state.feature.errors.push({
          line: lineNum,
          message: "Duplicate Feature: declaration",
        });
        return;
      }
      state.feature.name = parseFeatureName(line);
      state.feature.tags = consumeTags(state.pendingTags);
      state.section = "feature";
    },

    background: (_line, lineNum): void => {
      finalizeScenario(state);
      finalizeBackground(state);
      // #9 Validation: Feature: must come first
      if (!state.feature.name) {
        state.feature.errors.push({
          line: lineNum,
          message: "Background: before Feature:",
        });
      }
      state.currentBackground = { steps: [] };
      consumeTags(state.pendingTags);
      state.section = "background";
    },

    rule: (line, lineNum): void => {
      finalizeRule(state);
      if (!state.feature.name) {
        state.feature.errors.push({
          line: lineNum,
          message: "Rule: before Feature:",
        });
      }
      state.currentRule = {
        name: parseRuleName(line),
        tags: consumeTags(state.pendingTags),
        scenarios: [],
      };
      state.section = "rule";
    },

    scenario: (line, lineNum): void => {
      finalizeScenario(state);
      if (!state.feature.name) {
        state.feature.errors.push({
          line: lineNum,
          message: "Scenario: before Feature:",
        });
      }
      state.currentScenario = {
        name: parseScenarioName(line),
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

    table_row: (line): void => {
      const cells = parseTableRow(line);
      if (state.section === "examples" && state.currentExamples) {
        if (state.currentExamples.headers.length === 0) {
          state.currentExamples.headers = cells;
        } else {
          state.currentExamples.rows.push(cells);
        }
      } else {
        // Data table attached to last step
        const lastStep = getLastStep(state);
        if (lastStep) {
          if (!lastStep.dataTable) lastStep.dataTable = [];
          lastStep.dataTable.push(cells);
        }
      }
    },

    docstring_fence: (): void => {
      if (state.inDocString) {
        // Closing fence — attach to last step
        const lastStep = getLastStep(state);
        addStepAttachment(lastStep, "docString", state.docStringLines.join("\n"));
        state.docStringLines = [];
        state.inDocString = false;
      } else {
        state.inDocString = true;
        state.docStringLines = [];
      }
    },

    other: (line): void => {
      if (state.inDocString) {
        state.docStringLines.push(line);
        return;
      }
      // #9 Collect description lines between Feature: and first section
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

  const state: ParserState = {
    feature: createEmptyFeature(),
    currentScenario: null,
    currentBackground: null,
    currentRule: null,
    currentExamples: null,
    pendingTags: [],
    section: "none",
    descriptionLines: [],
    inDocString: false,
    docStringLines: [],
  };

  const handlers = createHandlers(state);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();
    // Inside docstring, only check for closing fence
    if (state.inDocString && !trimmed.startsWith(DOCSTRING_FENCE)) {
      state.docStringLines.push(rawLine);
      continue;
    }
    handlers[classifyLine(trimmed)](trimmed, i + 1);
  }

  // Finalize any open sections
  finalizeScenario(state);
  finalizeBackground(state);
  finalizeRule(state);

  state.feature.description = state.descriptionLines.join("\n");
  return state.feature.name ? state.feature : null;
}
