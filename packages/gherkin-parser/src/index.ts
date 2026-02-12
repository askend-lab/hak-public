// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export interface ParsedScenario {
  name: string;
  tags: string[];
  steps: string[];
}

export interface ParsedFeature {
  name: string;
  description: string;
  tags: string[];
  scenarios: ParsedScenario[];
}

// #7 [OCP] Keywords extracted to constants
const KEYWORDS = {
  FEATURE: "Feature:",
  SCENARIO: "Scenario:",
  SCENARIO_OUTLINE: "Scenario Outline:",
  BACKGROUND: "Background:",
} as const;

const STEP_PATTERN = /^(Given|When|Then|And|But)\b/;
const SCENARIO_NAME_PATTERN = /^Scenario(?: Outline)?:\s*/;

// #5 [SRP/KISS] Line classifier
type LineType = "tag" | "feature" | "background" | "scenario" | "step" | "other";

function classifyLine(line: string): LineType {
  if (line.startsWith("@")) return "tag";
  if (line.startsWith(KEYWORDS.FEATURE)) return "feature";
  if (line.startsWith(KEYWORDS.BACKGROUND)) return "background";
  if (
    line.startsWith(KEYWORDS.SCENARIO_OUTLINE) ||
    line.startsWith(KEYWORDS.SCENARIO)
  )
    return "scenario";
  if (STEP_PATTERN.test(line)) return "step";
  return "other";
}

// #3 + #4 [DRY/KISS] Consume and clear pending tags
function consumeTags(pendingTags: string[]): string[] {
  const tags = [...pendingTags];
  pendingTags.splice(0);
  return tags;
}

// #8 [SOLID] Pure helper — no side-effect mutation
function parseTags(line: string): string[] {
  return line.split(/\s+/).filter((t) => t.startsWith("@"));
}

// #6 [DRY/KISS] Single regex for scenario name extraction
function parseScenarioName(line: string): string {
  return line.replace(SCENARIO_NAME_PATTERN, "");
}

// #1 + #2 [DRY/SRP] Uses ParsedScenario interface, pure creation only
function createScenario(line: string, tags: string[]): ParsedScenario {
  return { name: parseScenarioName(line), tags, steps: [] };
}

// #2 [SRP] Separate finalize responsibility
function finalizeScenario(
  scenario: ParsedScenario | null,
  feature: ParsedFeature,
): void {
  if (scenario) feature.scenarios.push(scenario);
}

// #10 [DRY/OCP] Main parser using keyword→handler map
export function parseFeatureContent(content: string): ParsedFeature | null {
  const lines = content.split("\n");
  const feature: ParsedFeature = {
    name: "",
    description: "",
    tags: [],
    scenarios: [],
  };

  let currentScenario: ParsedScenario | null = null;
  let pendingTags: string[] = [];
  let inBackground = false;
  // #9 [KISS] Collect description lines between Feature: and first section
  const descriptionLines: string[] = [];

  const handlers: Record<LineType, (line: string) => void> = {
    tag: (line) => pendingTags.push(...parseTags(line)),
    feature: (line) => {
      feature.name = line.replace(KEYWORDS.FEATURE, "").trim();
      feature.tags = consumeTags(pendingTags);
    },
    background: () => {
      inBackground = true;
      consumeTags(pendingTags);
    },
    scenario: (line) => {
      finalizeScenario(currentScenario, feature);
      inBackground = false;
      currentScenario = createScenario(line, consumeTags(pendingTags));
    },
    step: (line) => {
      if (currentScenario && !inBackground) {
        currentScenario.steps.push(line);
      }
    },
    other: (line) => {
      if (feature.name && !currentScenario && !inBackground && line) {
        descriptionLines.push(line);
      }
    },
  };

  for (const line of lines) {
    const trimmed = line.trim();
    handlers[classifyLine(trimmed)](trimmed);
  }

  finalizeScenario(currentScenario, feature);
  feature.description = descriptionLines.join("\n");
  return feature.name ? feature : null;
}
