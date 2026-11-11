// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Service for loading Gherkin specifications and test results
 */

import { FEATURES, FEATURE_GROUPS } from "./features/index.js";

export interface TestResult {
  name: string;
  fullName: string;
  status: "passed" | "failed" | "pending";
  duration: number;
}

export interface TestSuite {
  name: string;
  status: string;
  tests: TestResult[];
}

interface CucumberResult {
  keyword: string;
  name: string;
  elements: Array<{
    keyword: string;
    name: string;
    steps: Array<{
      keyword: string;
      name: string;
      result: {
        status: string;
        duration?: number;
      };
    }>;
  }>;
}

export async function loadCucumberResults(): Promise<CucumberResult[] | null> {
  try {
    const response = await fetch("/cucumber-results.json");
    if (!response.ok) {return null;}
    return (await response.json()) as CucumberResult[];
  } catch {
    return null;
  }
}

export function getFeatures(): Record<string, string> {
  return FEATURES;
}

export function getFeatureGroups(): Record<string, Record<string, string>> {
  return FEATURE_GROUPS;
}

function parseScenario(featureName: string, scenario: CucumberResult["elements"][0]): TestResult {
  const allPassed = scenario.steps.every((s) => s.result.status === "passed");
  const totalDuration = scenario.steps.reduce((sum, s) => sum + (s.result.duration ?? 0), 0);
  return {
    name: scenario.name,
    fullName: `${featureName} > ${scenario.name}`,
    status: allPassed ? "passed" : "failed",
    duration: totalDuration / 1000000,
  };
}

export function parseCucumberResults(results: CucumberResult[]): TestSuite[] {
  return results.map((feature) => ({
    name: feature.name,
    status: "passed",
    tests: feature.elements.map((scenario) => parseScenario(feature.name, scenario)),
  }));
}
