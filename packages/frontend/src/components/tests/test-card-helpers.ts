export interface TestAssertion {
  fullName: string
  title: string
  status: 'passed' | 'failed' | 'pending'
  duration: number
  ancestorTitles: string[]
  failureMessages: string[]
}

export interface TestSuiteResult {
  name: string
  status: 'passed' | 'failed'
  assertionResults: TestAssertion[]
  startTime: number
  endTime: number
  message?: string
}

export interface ParsedScenario {
  name: string
  tags: string[]
  steps: string[]
}

export interface ParsedFeature {
  name: string
  description: string
  tags: string[]
  scenarios: ParsedScenario[]
}

export function getFileName(path: string): string {
  return path.split('/').pop() ?? path
}

export function getStatusColors(status: 'passed' | 'failed'): { bg: string; text: string; border: string; icon: string } {
  return status === 'passed' 
    ? { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7', icon: '✓' }
    : { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A', icon: '✗' }
}

export function countResults(results: TestAssertion[]): { passed: number; failed: number } {
  return {
    passed: results.filter(t => t.status === 'passed').length,
    failed: results.filter(t => t.status === 'failed').length
  }
}

export function findScenarioSteps(featureData: ParsedFeature | null, testTitle: string): string[] {
  if (!featureData) return []
  const scenario = featureData.scenarios.find(s => 
    testTitle.toLowerCase().includes(s.name.toLowerCase()) ||
    s.name.toLowerCase().includes(testTitle.toLowerCase())
  )
  return scenario?.steps ?? []
}
