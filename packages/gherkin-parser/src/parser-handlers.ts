// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable no-param-reassign -- parser mutates state/tags objects by design */

import type { ParsedStep } from "./types";
import type { StepKeyword } from "./constants";

import {
  STEP_PATTERN,
  SCENARIO_NAME_PATTERN,
  FEATURE_NAME_PATTERN,
  RULE_NAME_PATTERN,
} from "./constants";

import type { LineType, LineContext, ParserState } from "./parser-state";
import {
  drainTags,
  clearTags,
  addError,
  requireFeature,
  finalizeScenario,
  finalizeBackground,
  finalizeRule,
  finalizeExamples,
  getLastStep,
} from "./parser-state";

type Handler = (ctx: LineContext, state: ParserState) => void;

function parseTags(line: string): string[] {
  return line.split(/\s+/).filter((t) => t.startsWith("@"));
}

function extractName(line: string, pattern: RegExp): string {
  return line.replace(pattern, "");
}

function parseStep(line: string): ParsedStep | null {
  const match = STEP_PATTERN.exec(line);
  if (!match || !match[1] || !match[2]) {return null;}
  return { keyword: match[1] as StepKeyword, text: match[2] };
}

function parseTableRow(line: string): string[] | null {
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  return cells.length > 0 ? cells : null;
}

function handleExamplesRow(state: ParserState, cells: string[]): void {
  if (!state.currentExamples) {return;}
  if (state.currentExamples.headers.length === 0) {
    state.currentExamples.headers = cells;
  } else {
    state.currentExamples.rows.push(cells);
  }
}

function handleStepDataRow(state: ParserState, cells: string[]): void {
  const lastStep = getLastStep(state);
  if (!lastStep) {return;}
  if (!lastStep.dataTable) {lastStep.dataTable = [];}
  lastStep.dataTable.push(cells);
}

export const HANDLERS: Record<LineType, Handler> = {
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
    if (!step) {return;}
    if (state.section === "background" && state.currentBackground) {
      state.currentBackground.steps.push(step);
    } else if (state.currentScenario) {
      state.currentScenario.steps.push(step);
    }
  },

  table_row: (ctx, state): void => {
    const cells = parseTableRow(ctx.trimmed);
    if (!cells) {return;}
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

/* eslint-enable no-param-reassign -- end parser handlers */
