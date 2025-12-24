import { colors, fontFamily, borderRadius, gap, overflow, cursors, fontWeight, lineHeight } from '../../styles/colors'

import { 
  TestSuiteResult, 
  ParsedFeature, 
  getFileName, 
  getStatusColors, 
  countResults, 
  findScenarioSteps 
} from './test-card-helpers'

 
export function TestSuiteCard({ suite, isExpanded, onToggle, featureData, expandedTests, onToggleTest }: {
  suite: TestSuiteResult
  isExpanded: boolean
  onToggle: () => void
  featureData: ParsedFeature | null
  expandedTests: Set<string>
  onToggleTest: (id: string) => void
}) {
  const { passed, failed } = countResults(suite.assertionResults)
  const statusColor = getStatusColors(suite.status)

  return (
    <div style={{
      background: colors.white,
      borderRadius: borderRadius.medium,
      border: `1px solid ${statusColor.border}`,
      marginBottom: gap.lg,
      overflow: overflow.hidden,
    }}>
      <div 
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        role="button"
        tabIndex={0}
        style={{
          padding: '1.25rem',
          cursor: cursors.pointer,
          display: 'flex',
          alignItems: 'center',
          gap: gap.lg,
        }}
      >
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: statusColor.bg,
          border: `2px solid ${statusColor.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {suite.status === 'passed' ? (
            <span style={{ color: statusColor.text, fontSize: '16px' }}>✓</span>
          ) : (
            <span style={{ color: statusColor.text, fontSize: '16px' }}>✗</span>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '0.9375rem',
            fontWeight: fontWeight.semibold,
            color: colors.primary,
            margin: 0,
            fontFamily: fontFamily.mono,
          }}>
            {getFileName(suite.name)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: colors.successDark }}>✓ {passed} passed</span>
            {failed > 0 && <span style={{ fontSize: '0.75rem', color: colors.error }}>✗ {failed} failed</span>}
          </div>
        </div>
        
        <div style={{
          color: colors.gray,
          fontSize: '1.25rem',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
        }}>
          ▼
        </div>
      </div>
      
      {isExpanded && (
        <div style={{
          borderTop: `1px solid ${colors.outlinedNeutral}`,
          padding: '1rem',
          background: colors.softNeutralBg,
        }}>
          {suite.assertionResults.length === 0 ? (
            <div style={{
              padding: '1rem',
              background: colors.errorBg,
              borderRadius: '8px',
              color: colors.error,
              fontSize: '0.875rem',
            }}>
              {suite.message === undefined ? 'No tests executed' : suite.message.substring(0, 500)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              { }
              {suite.assertionResults.map((test, idx) => {
                const testStatusColor = test.status === 'passed'
                  ? { bg: colors.successBg, text: colors.successDark, icon: '✓' }
                  : { bg: colors.errorBg, text: colors.error, icon: '✗' }
                
                const testId = `${suite.name}-${idx.toString()}`
                const isTestExpanded = expandedTests.has(testId)
                const steps = findScenarioSteps(featureData, test.title)
                
                return (
                  <div key={idx} style={{
                    background: colors.white,
                    borderRadius: '6px',
                    border: `1px solid ${colors.outlinedNeutral}`,
                    overflow: 'hidden',
                  }}>
                    <div 
                      onClick={() => {
                        if (steps.length > 0) {
                          onToggleTest(testId);
                        }
                      }}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter' || e.key === ' ') { 
                          if (steps.length > 0) {
                            onToggleTest(testId);
                          }
                        } 
                      }}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: steps.length > 0 ? 'pointer' : 'default',
                      }}
                    >
                      {steps.length > 0 && (
                        <span style={{ 
                          color: testStatusColor.text, 
                          fontSize: '0.75rem',
                          transform: isTestExpanded ? 'rotate(90deg)' : 'rotate(0)',
                          transition: 'transform 0.2s',
                        }}>▶</span>
                      )}
                      <span style={{ color: testStatusColor.text, fontSize: '0.875rem', fontWeight: fontWeight.semibold }}>
                        {testStatusColor.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', color: colors.primary }}>
                          {test.title}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: colors.gray }}>{test.duration}ms</span>
                    </div>
                    {isTestExpanded && steps.length > 0 && (
                      <div style={{
                        padding: '0.5rem 1rem 0.75rem 3rem',
                        background: testStatusColor.bg,
                        borderTop: `1px solid ${colors.outlinedNeutral}`,
                      }}>
                        {steps.map((step, stepIdx) => {
                          const keyword = step.split(' ')[0]
                          const rest = step.substring(keyword?.length || 0)
                          return (
                            <div key={stepIdx} style={{
                              fontSize: '0.75rem',
                              fontFamily: fontFamily.monoSimple,
                              lineHeight: lineHeight.relaxed,
                              color: colors.textSecondary,
                            }}>
                              <span style={{ color: testStatusColor.text, fontWeight: fontWeight.semibold }}>{keyword}</span>
                              {rest}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export type { TestSuiteResult, ParsedFeature }
