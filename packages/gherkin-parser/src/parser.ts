// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { ParsedFeature } from "./types";
import { DOCSTRING_FENCE } from "./constants";
import type { ParserState } from "./parser-state";
import { classifyLine, createInitialState, finalizeState } from "./parser-state";
import { HANDLERS } from "./parser-handlers";

function processLine(rawLine: string, index: number, state: ParserState): void {
  const trimmed = rawLine.trim();
  if (state.docString.active && !trimmed.startsWith(DOCSTRING_FENCE)) {
    state.docString.lines.push(rawLine);
    return;
  }
  HANDLERS[classifyLine(trimmed)]({ trimmed, lineNum: index + 1 }, state);
}

export function parseFeatureContent(content: string): ParsedFeature | null {
  const lines = content.split("\n");
  const state = createInitialState();
  for (let i = 0; i < lines.length; i++) {
    processLine(lines[i] ?? "", i, state);
  }
  finalizeState(state);
  return state.feature.name ? state.feature : null;
}
