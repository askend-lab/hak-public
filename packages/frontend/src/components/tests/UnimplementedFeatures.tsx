import { colors, fontFamily, borderRadius, gap, overflow, fontWeight, lineHeight } from '../../styles/colors'

const UNIMPLEMENTED_SCENARIOS = [
  { name: 'Baseline tasks visible to all users', steps: [
    'Given I am a newly authenticated user',
    'When I navigate to the Tasks view',
    'Then I see pre-loaded example tasks'
  ]},
  { name: 'Baseline tasks marked distinctly', steps: [
    'Given I am viewing the task list',
    'When baseline tasks are displayed',
    'Then they are visually distinguished'
  ]},
  { name: 'Can play baseline task entries', steps: [
    'Given I open a baseline task',
    'When the task detail view loads',
    'Then I can play all entries'
  ]},
  { name: 'Can add entries to baseline tasks', steps: [
    'Given I am viewing a baseline task',
    'When I add a new entry',
    'Then the entry is stored separately'
  ]},
  { name: 'Can hide baseline tasks', steps: [
    'Given I don\'t want to see a baseline task',
    'When I delete the baseline task',
    'Then it is hidden from my view'
  ]},
  { name: 'Cannot edit baseline task metadata', steps: [
    'Given I open a baseline task',
    'When I try to edit the task name',
    'Then the edit is not allowed'
  ]},
  { name: 'Can copy baseline tasks', steps: [
    'Given I want to customize a baseline task',
    'When I click "Copy task"',
    'Then a new user-owned task is created'
  ]},
  { name: 'Baseline tasks persist across sessions', steps: [
    'Given baseline tasks are available',
    'When I log out and log back in',
    'Then the same baseline tasks are available'
  ]},
]

 
export function UnimplementedFeatures({ expandedScenarios, setExpandedScenarios }: {
  expandedScenarios: Set<string>
  setExpandedScenarios: (s: Set<string>) => void
}) {
  const toggleScenario = (idx: number) => {
    const newExpanded = new Set(expandedScenarios)
    const key = `unimpl-${idx.toString()}`
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedScenarios(newExpanded)
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: fontWeight.semibold,
        color: colors.primary,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ color: colors.warning }}>○</span>
        Unimplemented Features
      </h2>
      
      <div style={{
        background: colors.white,
        borderRadius: borderRadius.medium,
        border: `1px solid ${colors.warningBorder}`,
        overflow: overflow.hidden,
      }}>
        <div style={{
          padding: '1.25rem',
          background: colors.warningBg,
          borderBottom: `1px solid ${colors.warningBorder}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: gap.lg }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: colors.warningBg,
              border: `2px solid ${colors.warningBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: colors.warning, fontSize: '12px' }}>○</span>
            </div>
            <div>
              <h3 style={{
                fontSize: '0.9375rem',
                fontWeight: fontWeight.semibold,
                color: colors.primary,
                margin: 0,
                fontFamily: fontFamily.monoSimple,
              }}>
                US-033-baseline-tasks.feature
              </h3>
              <span style={{ fontSize: '0.75rem', color: colors.warning, fontWeight: fontWeight.medium }}>
                @draft @unimplemented • 8 scenarios
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '1rem', background: colors.warningBgLight }}>
          <div style={{
            fontSize: '0.875rem',
            color: colors.primary,
            fontWeight: fontWeight.medium,
            marginBottom: '0.75rem',
          }}>
            Feature: Baseline tasks access (US-033)
          </div>
          <p style={{
            fontSize: '0.8125rem',
            color: colors.textSecondary,
            margin: '0 0 1rem 0',
            fontStyle: 'italic',
          }}>
            As a new user, I want to see example tasks when I first log in.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {UNIMPLEMENTED_SCENARIOS.map((scenario, idx) => {
              const isExpanded = expandedScenarios.has(`unimpl-${idx.toString()}`)
              return (
                <ScenarioItem 
                  key={idx}
                  scenario={scenario}
                  isExpanded={isExpanded}
                  onToggle={() => { toggleScenario(idx); }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

 
function ScenarioItem({ scenario, isExpanded, onToggle }: {
  scenario: { name: string; steps: string[] }
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '6px',
      border: `1px solid ${colors.warningBorder}`,
      overflow: 'hidden',
    }}>
      <div 
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        role="button"
        tabIndex={0}
        style={{
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
        }}
      >
        <span style={{ 
          color: colors.warning, 
          fontSize: '0.75rem',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
        }}>▶</span>
        <span style={{ fontSize: '0.8125rem', color: colors.textSecondary, flex: 1 }}>
          {scenario.name}
        </span>
        <span style={{
          fontSize: '0.625rem',
          color: colors.warning,
          background: colors.warningBg,
          padding: '0.125rem 0.375rem',
          borderRadius: '4px',
        }}>
          @draft
        </span>
      </div>
      {isExpanded && (
        <div style={{
          padding: '0.5rem 0.75rem 0.75rem 1.75rem',
          background: colors.warningBgLight,
          borderTop: `1px solid ${colors.warningBorder}`,
        }}>
          {scenario.steps.map((step, stepIdx) => {
            const keyword = step.split(' ')[0]
            const rest = step.substring(keyword?.length || 0)
            return (
              <div key={stepIdx} style={{
                fontSize: '0.75rem',
                fontFamily: fontFamily.monoSimple,
                lineHeight: lineHeight.relaxed,
                color: colors.textSecondary,
              }}>
                <span style={{ color: colors.warning, fontWeight: fontWeight.semibold }}>{keyword}</span>
                {rest}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
