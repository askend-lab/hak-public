import { useState, useEffect } from 'react'

import { parseFeatureContent, ParsedFeature } from './feature-parser'

interface TestAssertion {
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

export interface JestResults {
  numPassedTests: number
  numFailedTests: number
  numTotalTests: number
  numPassedTestSuites: number
  numFailedTestSuites: number
  numTotalTestSuites: number
  startTime: number
  success: boolean
  testResults: TestSuiteResult[]
}

export function useFeatureData(): ParsedFeature | null {
  const [featureData, setFeatureData] = useState<ParsedFeature | null>(null)

  useEffect(() => {
    fetch('/US-020-add-synthesis-to-task.feature')
      .then(res => res.text())
      .then(content => { setFeatureData(parseFeatureContent(content)); })
      .catch(jest.fn())
  }, [])

  return featureData
}

function isFeatureTest(s: TestSuiteResult): boolean {
  return s.name.includes('/features/') || s.name.includes('.feature')
}

function countTests(featureTests: TestSuiteResult[]): { total: number; passed: number } {
  return featureTests.reduce((acc, s) => ({
    total: acc.total + s.assertionResults.length,
    passed: acc.passed + s.assertionResults.filter(t => t.status === 'passed').length
  }), { total: 0, passed: 0 })
}

export function useTestResults(): { results: JestResults | null; loading: boolean; error: string | null } {
  const [results, setResults] = useState<JestResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/jest-results.json')
      .then(res => res.json())
      .then(data => {
         
        const featureTests = data.testResults.filter(isFeatureTest)
         
        const counts = countTests(featureTests)
        
         
        setResults({
           
          ...data,
           
          testResults: featureTests,
          numTotalTests: counts.total,
          numPassedTests: counts.passed,
          numFailedTests: counts.total - counts.passed,
           
          numTotalTestSuites: featureTests.length,
           
          numPassedTestSuites: featureTests.filter((s: TestSuiteResult) => s.status === 'passed').length,
           
          numFailedTestSuites: featureTests.filter((s: TestSuiteResult) => s.status === 'failed').length,
        })
        setLoading(false)
      })
       
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  return { results, loading, error }
}

export function useExpandedState<T>(): { expanded: Set<T>; toggle: (item: T) => void; setExpanded: React.Dispatch<React.SetStateAction<Set<T>>> } {
  const [expanded, setExpanded] = useState<Set<T>>(new Set())
  
  const toggle = (item: T): void => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(item)) {
      newExpanded.delete(item)
    } else {
      newExpanded.add(item)
    }
    setExpanded(newExpanded)
  }
  
  return { expanded, toggle, setExpanded }
}
