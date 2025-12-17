import { useState, useEffect } from 'react'
import { Header, Footer } from '../components'
import { colors } from '../styles/colors'
import { TestSuiteCard, UnimplementedFeatures, TestSuiteResult, ParsedFeature } from '../components/tests'

interface JestResults {
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

function parseFeatureContent(content: string): ParsedFeature | null {
  const lines = content.split('\n')
  const feature: ParsedFeature = { name: '', description: '', tags: [], scenarios: [] }
  
  let currentScenario: { name: string; tags: string[]; steps: string[] } | null = null
  let pendingTags: string[] = []
  let inBackground = false
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('@')) {
      pendingTags.push(...trimmed.split(/\s+/).filter(t => t.startsWith('@')))
    } else if (trimmed.startsWith('Feature:')) {
      feature.name = trimmed.replace('Feature:', '').trim()
      feature.tags = [...pendingTags]
      pendingTags = []
    } else if (trimmed.startsWith('Background:')) {
      inBackground = true
      pendingTags = []
    } else if (trimmed.startsWith('Scenario:')) {
      inBackground = false
      if (currentScenario) feature.scenarios.push(currentScenario)
      currentScenario = { name: trimmed.replace('Scenario:', '').trim(), tags: [...pendingTags], steps: [] }
      pendingTags = []
    } else if (currentScenario && !inBackground && /^(Given|When|Then|And|But)/.test(trimmed)) {
      currentScenario.steps.push(trimmed)
    }
  }
  
  if (currentScenario) feature.scenarios.push(currentScenario)
  return feature.name ? feature : null
}

export function TestsPage() {
  const [results, setResults] = useState<JestResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set())
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')
  const [featureData, setFeatureData] = useState<ParsedFeature | null>(null)

  useEffect(() => {
    fetch('/US-020-add-synthesis-to-task.feature')
      .then(res => res.text())
      .then(content => setFeatureData(parseFeatureContent(content)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/jest-results.json')
      .then(res => res.json())
      .then(data => {
        const featureTests = data.testResults.filter((s: TestSuiteResult) => 
          s.name.includes('/features/') || s.name.includes('.feature')
        )
        const counts = featureTests.reduce((acc: { total: number; passed: number }, s: TestSuiteResult) => ({
          total: acc.total + s.assertionResults.length,
          passed: acc.passed + s.assertionResults.filter(t => t.status === 'passed').length
        }), { total: 0, passed: 0 })
        
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

  const toggleSuite = (name: string) => {
    const newExpanded = new Set(expandedSuites)
    newExpanded.has(name) ? newExpanded.delete(name) : newExpanded.add(name)
    setExpandedSuites(newExpanded)
  }

  const toggleTest = (id: string) => {
    const newExpanded = new Set(expandedTests)
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id)
    setExpandedTests(newExpanded)
  }

  const filteredSuites = results?.testResults.filter(s => {
    if (filter === 'all') return true
    return filter === 'passed' ? s.status === 'passed' : s.status === 'failed'
  }) || []

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(to bottom, ${colors.softPrimaryBg} 0%, ${colors.softNeutralBg} 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <Header />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: colors.primary, margin: '0 0 0.5rem 0' }}>
            Feature Tests
          </h1>
          <p style={{ fontSize: '1rem', color: colors.textSecondary, margin: 0 }}>
            Gherkin scenario test results
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: colors.gray }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: '2rem', background: '#FFEBEE', borderRadius: '12px', color: '#C62828' }}>
            Error: {error}
          </div>
        ) : results ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Tests', value: results.numTotalTests, color: colors.primary },
                { label: 'Passed', value: results.numPassedTests, color: '#2E7D32' },
                { label: 'Failed', value: results.numFailedTests, color: results.numFailedTests > 0 ? '#C62828' : colors.gray },
                { label: 'Test Suites', value: `${results.numPassedTestSuites}/${results.numTotalTestSuites}`, color: '#1565C0' },
              ].map((stat, idx) => (
                <div key={idx} style={{ background: colors.white, borderRadius: '8px', padding: '1rem', border: `1px solid ${colors.outlinedNeutral}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: colors.gray, textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '1rem 1.5rem',
              background: results.success ? '#E8F5E9' : '#FFEBEE',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>{results.success ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontWeight: 600, color: results.success ? '#2E7D32' : '#C62828' }}>
                  {results.success ? 'All tests passed!' : 'Some tests failed'}
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  {results.numPassedTests} of {results.numTotalTests} tests passed
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['all', 'passed', 'failed'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '0.5rem 1rem',
                    background: filter === f ? colors.primary : colors.white,
                    border: `1px solid ${filter === f ? colors.primary : colors.outlinedNeutral}`,
                    borderRadius: '20px',
                    color: filter === f ? colors.white : colors.textSecondary,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}>
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              {filteredSuites.map(suite => (
                <TestSuiteCard
                  key={suite.name}
                  suite={suite}
                  isExpanded={expandedSuites.has(suite.name)}
                  onToggle={() => toggleSuite(suite.name)}
                  featureData={featureData}
                  expandedTests={expandedTests}
                  onToggleTest={toggleTest}
                />
              ))}
            </div>

            <UnimplementedFeatures
              expandedScenarios={expandedScenarios}
              setExpandedScenarios={setExpandedScenarios}
            />
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

export default TestsPage
