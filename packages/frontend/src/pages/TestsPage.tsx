import { useState } from 'react'

import { Header, Footer } from '../components'
import { TestSuiteCard, UnimplementedFeatures } from '../components/tests'
import { colors, fontFamily, backgrounds, layout, spacing, borderRadius, gap, cursors, fontWeight } from '../styles/colors'

import { useFeatureData, useTestResults, useExpandedState } from './tests/hooks'

 
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
  }) ?? []

  return (
    <div style={{
      minHeight: '100vh',
      background: backgrounds.pageGradient,
      fontFamily: fontFamily.system,
    }}>
      <Header />
      <main style={{ maxWidth: layout.maxWidthContent, margin: '0 auto', padding: spacing.mainPadding }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: fontWeight.bold, color: colors.primary, margin: '0 0 0.5rem 0' }}>
            Feature Tests
          </h1>
          <p style={{ fontSize: '1rem', color: colors.textSecondary, margin: 0 }}>
            Gherkin scenario test results
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: colors.gray }}>Loading...</div>
        )}
        {!loading && error !== null && (
          <div style={{ padding: '2rem', background: colors.errorBg, borderRadius: '12px', color: colors.error }}>
            Error: {error}
          </div>
        )}
        {!loading && error === null && results !== null && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Tests', value: String(results.numTotalTests), color: colors.primary },
                { label: 'Passed', value: String(results.numPassedTests), color: colors.successDark },
                { label: 'Failed', value: String(results.numFailedTests), color: results.numFailedTests > 0 ? colors.error : colors.gray },
                { label: 'Test Suites', value: `${String(results.numPassedTestSuites)}/${String(results.numTotalTestSuites)}`, color: colors.info },
              ].map((stat, idx) => (
                <div key={idx} style={{ background: colors.white, borderRadius: borderRadius.small, padding: '1rem', border: `1px solid ${colors.outlinedNeutral}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: fontWeight.bold, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: colors.gray, textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '1rem 1.5rem',
              background: results.success ? colors.successBg : colors.errorBg,
              borderRadius: borderRadius.small,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>{results.success ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontWeight: fontWeight.semibold, color: results.success ? colors.successDark : colors.error }}>
                  {results.success ? 'All tests passed!' : 'Some tests failed'}
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  {results.numPassedTests} of {results.numTotalTests} tests passed
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: gap.sm }}>
                {(['all', 'passed', 'failed'] as const).map(f => (
                  <button key={f} onClick={() => { setFilter(f); }} style={{
                    padding: '0.5rem 1rem',
                    background: filter === f ? colors.primary : colors.white,
                    border: `1px solid ${filter === f ? colors.primary : colors.outlinedNeutral}`,
                    borderRadius: '20px',
                    color: filter === f ? colors.white : colors.textSecondary,
                    fontSize: '0.875rem',
                    cursor: cursors.pointer,
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
