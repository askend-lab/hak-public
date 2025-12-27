import { useState, useEffect } from 'react';
import { parseFeatureContent, ParsedFeature } from '@hak/specifications';

import { Header, Footer } from '../components';
import { loadCucumberResults, getFeatureGroups, parseCucumberResults, TestSuite } from '../services/specs';
import { colors, fontFamily, backgrounds, fontWeight, borderRadius } from '../styles/colors';

const pageStyle = {
  minHeight: '100vh',
  background: backgrounds.pageGradient,
  fontFamily: fontFamily.system,
} as const;

const splitLayoutStyle = {
  display: 'flex',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '1rem',
  gap: '1rem',
  minHeight: 'calc(100vh - 180px)',
} as const;

const navPanelStyle = {
  width: '320px',
  flexShrink: 0,
  background: colors.white,
  borderRadius: borderRadius.medium,
  border: `1px solid ${colors.outlinedNeutral}`,
  overflow: 'auto',
  maxHeight: 'calc(100vh - 200px)',
} as const;

const contentPanelStyle = {
  flex: 1,
  background: colors.white,
  borderRadius: borderRadius.medium,
  border: `1px solid ${colors.outlinedNeutral}`,
  padding: '1.5rem',
  overflow: 'auto',
  maxHeight: 'calc(100vh - 200px)',
} as const;

const groupHeaderStyle = (isExpanded: boolean) => ({
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  borderBottom: `1px solid ${colors.outlinedNeutral}`,
  background: isExpanded ? colors.softPrimaryBg : colors.softNeutralBg,
  fontWeight: fontWeight.bold,
  fontSize: '0.85rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  transition: 'background 0.15s',
} as const);

const featureItemStyle = (isSelected: boolean, isSkipped: boolean) => ({
  padding: '0.5rem 1rem 0.5rem 1.5rem',
  cursor: 'pointer',
  borderBottom: `1px solid ${colors.outlinedNeutral}`,
  background: isSelected ? colors.softPrimaryBg : 'transparent',
  opacity: isSkipped ? 0.6 : 1,
  transition: 'background 0.15s',
} as const);

const scenarioItemStyle = {
  padding: '0.5rem 1rem 0.5rem 2rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  borderBottom: `1px solid ${colors.softNeutralBg}`,
} as const;

const stepStyle = {
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  color: colors.textSecondary,
  padding: '0.25rem 0',
  lineHeight: 1.6,
} as const;

const badgeStyle = (status: 'passed' | 'failed' | 'skipped' | 'pending') => ({
  display: 'inline-block',
  padding: '0.15rem 0.4rem',
  borderRadius: borderRadius.small,
  fontSize: '0.7rem',
  fontWeight: fontWeight.medium,
  marginLeft: '0.5rem',
  background: status === 'passed' ? colors.successBg 
    : status === 'failed' ? colors.errorBg 
    : status === 'skipped' ? colors.warningBg 
    : colors.softNeutralBg,
  color: status === 'passed' ? colors.success 
    : status === 'failed' ? colors.error 
    : status === 'skipped' ? colors.warning 
    : colors.gray,
} as const);

interface FeatureGroup {
  name: string;
  features: ParsedFeature[];
}

export function SpecsPage() {
  const [groups, setGroups] = useState<FeatureGroup[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const featureGroups = getFeatureGroups();
        const parsedGroups: FeatureGroup[] = [];
        
        for (const [groupName, featureFiles] of Object.entries(featureGroups)) {
          const features: ParsedFeature[] = [];
          for (const [, content] of Object.entries(featureFiles)) {
            const result = parseFeatureContent(content);
            if (result) features.push(result);
          }
          if (features.length > 0) {
            parsedGroups.push({ name: groupName, features });
          }
        }
        
        setGroups(parsedGroups);
        const firstGroup = parsedGroups[0];
        const firstFeature = firstGroup?.features[0];
        if (firstGroup && firstFeature) {
          setExpandedGroups(new Set([firstGroup.name]));
          setSelectedFeature(firstFeature.name);
          setExpandedFeatures(new Set([firstFeature.name]));
        }

        const cucumberResults = await loadCucumberResults();
        if (cucumberResults) {
          setTestSuites(parseCucumberResults(cucumberResults));
        }
      } catch (error) {
        console.error('Failed to load specs:', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const getTestResult = (scenarioName: string) => {
    for (const suite of testSuites) {
      const test = suite.tests.find(t => t.name.includes(scenarioName) || t.fullName.includes(scenarioName));
      if (test) return test;
    }
    return null;
  };

  const getFeatureStats = (feature: ParsedFeature) => {
    let passed = 0, total = 0;
    for (const scenario of feature.scenarios) {
      total++;
      const result = getTestResult(scenario.name);
      if (result?.status === 'passed') passed++;
    }
    return { passed, total };
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleFeature = (name: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const allFeatures = groups.flatMap(g => g.features);
  const selectedFeatureData = allFeatures.find(f => f.name === selectedFeature);
  const totalFeatures = allFeatures.length;

  if (loading) {
    return (
      <div style={pageStyle}>
        <Header />
        <main style={splitLayoutStyle}>
          <p>Loading specifications...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Header />
      <main style={splitLayoutStyle}>
        {/* Left Navigation Panel */}
        <nav style={navPanelStyle}>
          <div style={{ padding: '1rem', borderBottom: `1px solid ${colors.outlinedNeutral}`, background: colors.softPrimaryBg }}>
            <strong style={{ color: colors.primary }}>📋 Features</strong>
            <span style={{ float: 'right', fontSize: '0.8rem', color: colors.gray }}>
              {totalFeatures} total
            </span>
          </div>
          
          {groups.map((group) => {
            const isGroupExpanded = expandedGroups.has(group.name);
            const groupStats = group.features.reduce(
              (acc, f) => {
                const s = getFeatureStats(f);
                return { passed: acc.passed + s.passed, total: acc.total + s.total };
              },
              { passed: 0, total: 0 }
            );
            
            return (
              <div key={group.name}>
                <div 
                  style={groupHeaderStyle(isGroupExpanded)}
                  onClick={() => toggleGroup(group.name)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      {isGroupExpanded ? '📂' : '📁'} {group.name}
                    </span>
                    <span style={badgeStyle(groupStats.passed === groupStats.total ? 'passed' : 'pending')}>
                      {groupStats.passed}/{groupStats.total}
                    </span>
                  </div>
                </div>
                
                {isGroupExpanded && group.features.map((feature) => {
                  const isSkipped = feature.tags.includes('@skip');
                  const isFeatureExpanded = expandedFeatures.has(feature.name);
                  const stats = getFeatureStats(feature);
                  
                  return (
                    <div key={feature.name}>
                      <div 
                        style={featureItemStyle(selectedFeature === feature.name, isSkipped)}
                        onClick={() => { toggleFeature(feature.name); setSelectedFeature(feature.name); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: fontWeight.medium }}>
                            {isFeatureExpanded ? '▼' : '▶'} {feature.name.replace(/\s*\(US-\d+\)/, '')}
                          </span>
                          {isSkipped ? (
                            <span style={badgeStyle('skipped')}>skip</span>
                          ) : (
                            <span style={badgeStyle(stats.passed === stats.total ? 'passed' : 'pending')}>
                              {stats.passed}/{stats.total}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {isFeatureExpanded && feature.scenarios.map((scenario) => {
                        const result = getTestResult(scenario.name);
                        const status = isSkipped ? 'skipped' : (result?.status === 'passed' ? 'passed' : 'pending');
                        return (
                          <div 
                            key={scenario.name}
                            style={{ ...scenarioItemStyle, paddingLeft: '2.5rem' }}
                            onClick={() => setSelectedFeature(feature.name)}
                          >
                            <span style={badgeStyle(status)}>
                              {status === 'passed' ? '✓' : '○'}
                            </span>
                            <span style={{ marginLeft: '0.5rem', color: colors.textSecondary }}>
                              {scenario.name}
                            </span>
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

        {/* Right Content Panel */}
        <section style={contentPanelStyle}>
          {selectedFeatureData ? (
            <>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: colors.primary }}>
                {selectedFeatureData.name}
              </h1>
              {selectedFeatureData.description && (
                <p style={{ color: colors.textSecondary, fontSize: '0.9rem', margin: '0 0 1.5rem 0', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                  {selectedFeatureData.description}
                </p>
              )}

              {selectedFeatureData.scenarios.map((scenario, sIdx) => {
                const result = getTestResult(scenario.name);
                const status = selectedFeatureData.tags.includes('@skip') ? 'skipped' 
                  : (result?.status === 'passed' ? 'passed' : 'pending');
                return (
                  <div key={sIdx} style={{ marginBottom: '1.5rem', padding: '1rem', background: colors.softNeutralBg, borderRadius: borderRadius.small }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <strong style={{ color: colors.primary }}>{scenario.name}</strong>
                      <span style={badgeStyle(status)}>
                        {status === 'passed' ? '✓ passed' : status === 'skipped' ? '○ skipped' : '○ pending'}
                        {result && ` ${result.duration.toFixed(0)}ms`}
                      </span>
                    </div>
                    {scenario.steps.map((step, stepIdx) => {
                      const match = step.match(/^(Given|When|Then|And|But)\s+(.*)$/);
                      const keyword = match?.[1] ?? '';
                      const text = match?.[2] ?? step;
                      return (
                        <div key={stepIdx} style={stepStyle}>
                          <span style={{ color: colors.success, fontWeight: fontWeight.medium, marginRight: '0.5rem' }}>{keyword}</span>
                          {text}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ) : (
            <p style={{ color: colors.textSecondary }}>Select a feature to view its details.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
