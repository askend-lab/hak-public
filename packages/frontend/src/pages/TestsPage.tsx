import { useState } from 'react'

import { Header, Footer } from '../components'
import { TestSuiteCard, UnimplementedFeatures } from '../components/tests'
import { colors } from '../styles/colors'

import { useFeatureData, useTestResults, useExpandedState } from './tests/hooks'

// eslint-disable-next-line max-lines-per-function, complexity -- page component with multiple states
export function TestsPage() {
  const featureData = useFeatureData()
  const { results, loading, error } = useTestResults()
  const { expanded: expandedSuites, toggle: toggleSuite } = useExpandedState<string>()
  const { expanded: expandedTests, toggle: toggleTest } = useExpandedState<string>()
  const { expanded: expandedScenarios, setExpanded: setExpandedScenarios } = useExpandedState<string>()
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')

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

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: colors.gray }}>Loading...</div>
        )}
        {!loading && error && (
          <div style={{ padding: '2rem', background: '#FFEBEE', borderRadius: '12px', color: '#C62828' }}>
            Error: {error}
          </div>
        )}
        {!loading && !error && results && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Tests', value: String(results.numTotalTests), color: colors.primary },
                { label: 'Passed', value: String(results.numPassedTests), color: '#2E7D32' },
                { label: 'Failed', value: String(results.numFailedTests), color: results.numFailedTests > 0 ? '#C62828' : colors.gray },
                { label: 'Test Suites', value: `${String(results.numPassedTestSuites)}/${String(results.numTotalTestSuites)}`, color: '#1565C0' },
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
                  <button key={f} onClick={() => { setFilter(f); }} style={{
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
                  onToggle={() => { toggleSuite(suite.name); }}
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
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TestsPage
