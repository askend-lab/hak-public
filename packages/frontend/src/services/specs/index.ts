/**
 * Service for loading Gherkin specifications and test results
 */

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

// Feature files content (will be populated by Vite plugin or build script)
const FEATURES: Record<string, string> = {
  'US-001-basic-synthesis': `Feature: Basic text synthesis (US-001)
  As a user
  I want to enter text and hear it synthesized
  So that I can learn Estonian pronunciation

  Scenario: Synthesize a word
    Given I am on the main page
    When I enter "Tere" in the text input
    And I click the play button
    Then I hear the synthesized audio
    And the audio player shows the audio is playing`,
};

export async function loadTestResults(): Promise<VitestResults | null> {
  try {
    // In dev mode, fetch from the file system via Vite
    const response = await fetch('/jest-results.json');
    if (!response.ok) return null;
    return await response.json() as VitestResults;
  } catch {
    return null;
  }
}

export function getFeatures(): Record<string, string> {
  return FEATURES;
}

export function findGherkinTests(results: VitestResults): TestSuite[] {
  return results.testResults
    .filter(suite => suite.name.includes('/steps/') || suite.name.includes('Gherkin'))
    .map(suite => ({
      name: suite.name.split('/').pop() ?? suite.name,
      status: suite.status,
      tests: suite.assertionResults.map(test => ({
        name: test.title,
        fullName: test.fullName,
        status: test.status as TestResult['status'],
        duration: test.duration,
      })),
    }));
}
