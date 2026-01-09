import { useState, useEffect } from 'react';
import { parseFeatureContent, ParsedFeature } from '@hak/specifications';

import { Header, Footer } from '../components';
import { loadCucumberResults, getFeatureGroups, parseCucumberResults, TestSuite } from '../services/specs';

interface FeatureGroup {
  name: string;
  features: ParsedFeature[];
}

function getBadgeClass(status: 'passed' | 'failed' | 'skipped' | 'pending'): string {
  return `specs-badge specs-badge--${status}`;
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
      } catch {
        // Silent failure - specs page will show empty state
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
      <div className="specs-page">
        <Header />
        <main className="specs-page__layout">
          <p>Loading specifications...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="specs-page">
      <Header />
      <main className="specs-page__layout">
        <nav className="specs-page__nav">
          <div className="specs-page__nav-header">
            <strong className="specs-page__nav-title">📋 Features</strong>
            <span className="specs-page__nav-count">{totalFeatures} total</span>
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
            const groupHeaderClasses = ['specs-group__header', isGroupExpanded && 'specs-group__header--expanded'].filter(Boolean).join(' ');
            
            return (
              <div key={group.name}>
                <div className={groupHeaderClasses} onClick={() => toggleGroup(group.name)}>
                  <span>{isGroupExpanded ? '📂' : '📁'} {group.name}</span>
                  <span className={getBadgeClass(groupStats.passed === groupStats.total ? 'passed' : 'pending')}>
                    {groupStats.passed}/{groupStats.total}
                  </span>
                </div>
                
                {isGroupExpanded && group.features.map((feature) => {
                  const isSkipped = feature.tags.includes('@skip');
                  const isFeatureExpanded = expandedFeatures.has(feature.name);
                  const stats = getFeatureStats(feature);
                  const featureClasses = [
                    'specs-feature__item',
                    selectedFeature === feature.name && 'specs-feature__item--selected',
                    isSkipped && 'specs-feature__item--skipped'
                  ].filter(Boolean).join(' ');
                  
                  return (
                    <div key={feature.name}>
                      <div className={featureClasses} onClick={() => { toggleFeature(feature.name); setSelectedFeature(feature.name); }}>
                        <span className="specs-feature__name">
                          {isFeatureExpanded ? '▼' : '▶'} {feature.name.replace(/\s*\(US-\d+\)/, '')}
                        </span>
                        {isSkipped ? (
                          <span className={getBadgeClass('skipped')}>skip</span>
                        ) : (
                          <span className={getBadgeClass(stats.passed === stats.total ? 'passed' : 'pending')}>
                            {stats.passed}/{stats.total}
                          </span>
                        )}
                      </div>
                      
                      {isFeatureExpanded && feature.scenarios.map((scenario) => {
                        const result = getTestResult(scenario.name);
                        const status = isSkipped ? 'skipped' : (result?.status === 'passed' ? 'passed' : 'pending');
                        return (
                          <div key={scenario.name} className="specs-scenario__item" onClick={() => setSelectedFeature(feature.name)}>
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

        <section className="specs-page__content">
          {selectedFeatureData ? (
            <>
              <h1 className="specs-page__feature-title">{selectedFeatureData.name}</h1>
              {selectedFeatureData.description && (
                <p className="specs-page__feature-desc">{selectedFeatureData.description}</p>
              )}

              {selectedFeatureData.scenarios.map((scenario, sIdx) => {
                const result = getTestResult(scenario.name);
                const status = selectedFeatureData.tags.includes('@skip') ? 'skipped' 
                  : (result?.status === 'passed' ? 'passed' : 'pending');
                return (
                  <div key={sIdx} className="specs-scenario__card">
                    <div className="specs-scenario__header">
                      <strong className="specs-scenario__title">{scenario.name}</strong>
                      <span className={getBadgeClass(status)}>
                        {status === 'passed' ? '✓ passed' : status === 'skipped' ? '○ skipped' : '○ pending'}
                        {result && ` ${result.duration.toFixed(0)}ms`}
                      </span>
                    </div>
                    {scenario.steps.map((step, stepIdx) => {
                      const match = step.match(/^(Given|When|Then|And|But)\s+(.*)$/);
                      const keyword = match?.[1] ?? '';
                      const text = match?.[2] ?? step;
                      return (
                        <div key={stepIdx} className="specs-step">
                          <span className="specs-step__keyword">{keyword}</span>
                          {text}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ) : (
            <p className="specs-page__empty">Select a feature to view its details.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
