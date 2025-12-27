/**
 * Service for loading Gherkin specifications and test results
 */

import { FEATURES, FEATURE_GROUPS } from './features/index.js';

export interface TestResult {
  name: string;
  fullName: string;
  status: 'passed' | 'failed' | 'pending';
  duration: number;
}

export interface TestSuite {
  name: string;
  status: string;
  tests: TestResult[];
}

export interface VitestResults {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  testResults: Array<{
    name: string;
    status: string;
    assertionResults: Array<{
      fullName: string;
      title: string;
      status: string;
      duration: number;
      ancestorTitles: string[];
    }>;
  }>;
}


// Cucumber results format
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

export async function loadTestResults(): Promise<VitestResults | null> {
  // No longer loading jest results - cucumber results are shown differently
  return null;
}

export async function loadCucumberResults(): Promise<CucumberResult[] | null> {
  try {
    const response = await fetch('/cucumber-results.json');
    if (!response.ok) return null;
    return await response.json() as CucumberResult[];
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

export function findGherkinTests(_results: VitestResults): TestSuite[] {
  // Deprecated - use cucumber results instead
  return [];
}

export function parseCucumberResults(results: CucumberResult[]): TestSuite[] {
  return results.map(feature => ({
    name: feature.name,
    status: 'passed',
    tests: feature.elements.map(scenario => {
      const allPassed = scenario.steps.every(s => s.result.status === 'passed');
      const totalDuration = scenario.steps.reduce((sum, s) => sum + (s.result.duration ?? 0), 0);
      return {
        name: scenario.name,
        fullName: `${feature.name} > ${scenario.name}`,
        status: allPassed ? 'passed' as const : 'failed' as const,
        duration: totalDuration / 1000000, // Convert from nanoseconds to ms
      };
    }),
  }));
}
