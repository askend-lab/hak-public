import { ParsedFeature } from '@hak/specifications';
import { TestSuite } from '../../services/specs';

interface FeatureGroup {
  name: string;
  features: ParsedFeature[];
}

interface SpecsNavProps {
  groups: FeatureGroup[];
  testSuites: TestSuite[];
  selectedFeature: string | null;
  expandedGroups: Set<string>;
  expandedFeatures: Set<string>;
  onToggleGroup: (name: string) => void;
  onToggleFeature: (name: string) => void;
  onSelectFeature: (name: string) => void;
}

function getBadgeClass(status: 'passed' | 'failed' | 'skipped' | 'pending'): string {
  return `specs-badge specs-badge--${status}`;
}

function getTestResult(testSuites: TestSuite[], scenarioName: string) {
  for (const suite of testSuites) {
    const test = suite.tests.find(t => t.name.includes(scenarioName) || t.fullName.includes(scenarioName));
    if (test) return test;
  }
  return null;
}

function getFeatureStats(feature: ParsedFeature, testSuites: TestSuite[]) {
  let passed = 0, total = 0;
  for (const scenario of feature.scenarios) {
    total++;
    const result = getTestResult(testSuites, scenario.name);
    if (result?.status === 'passed') passed++;
  }
  return { passed, total };
}

 
export default function SpecsNav({ groups, testSuites, selectedFeature, expandedGroups, expandedFeatures, onToggleGroup, onToggleFeature, onSelectFeature }: SpecsNavProps) {
  const totalFeatures = groups.flatMap(g => g.features).length;

  return (
    <nav className="specs-page__nav">
      <div className="specs-page__nav-header">
        <strong className="specs-page__nav-title">📋 Features</strong>
        <span className="specs-page__nav-count">{totalFeatures} total</span>
      </div>
      
      { }
      {groups.map((group) => {
        const isGroupExpanded = expandedGroups.has(group.name);
        const groupStats = group.features.reduce(
          (acc, f) => { const s = getFeatureStats(f, testSuites); return { passed: acc.passed + s.passed, total: acc.total + s.total }; },
          { passed: 0, total: 0 }
        );
        
        return (
          <div key={group.name}>
            <div className={`specs-group__header ${isGroupExpanded ? 'specs-group__header--expanded' : ''}`} onClick={() => onToggleGroup(group.name)}>
              <span>{isGroupExpanded ? '📂' : '📁'} {group.name}</span>
              <span className={getBadgeClass(groupStats.passed === groupStats.total ? 'passed' : 'pending')}>{groupStats.passed}/{groupStats.total}</span>
            </div>
            
            {isGroupExpanded && group.features.map((feature) => {
              const isSkipped = feature.tags.includes('@skip');
              const isFeatureExpanded = expandedFeatures.has(feature.name);
              const stats = getFeatureStats(feature, testSuites);
              
              return (
                <div key={feature.name}>
                  <div className={`specs-feature__item ${selectedFeature === feature.name ? 'specs-feature__item--selected' : ''} ${isSkipped ? 'specs-feature__item--skipped' : ''}`}
                    onClick={() => { onToggleFeature(feature.name); onSelectFeature(feature.name); }}>
                    <span className="specs-feature__name">{isFeatureExpanded ? '▼' : '▶'} {feature.name.replace(/\s*\(US-\d+\)/, '')}</span>
                    {isSkipped ? <span className={getBadgeClass('skipped')}>skip</span> : <span className={getBadgeClass(stats.passed === stats.total ? 'passed' : 'pending')}>{stats.passed}/{stats.total}</span>}
                  </div>
                  
                  {isFeatureExpanded && feature.scenarios.map((scenario) => {
                    const result = getTestResult(testSuites, scenario.name);
                    const status = isSkipped ? 'skipped' : (result?.status === 'passed' ? 'passed' : 'pending');
                    return (
                      <div key={scenario.name} className="specs-scenario__item" onClick={() => onSelectFeature(feature.name)}>
                        <span className={getBadgeClass(status)}>{status === 'passed' ? '✓' : '○'}</span>
                        <span className="specs-scenario__name">{scenario.name}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
