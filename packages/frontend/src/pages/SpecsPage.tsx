import { useState, useEffect } from 'react';
import { parseFeatureContent, ParsedFeature } from '@hak/specifications';

import { Header, Footer } from '../components';
import { Card } from '../components/ui';
import { loadTestResults, getFeatures, findGherkinTests, TestSuite } from '../services/specs';
import { colors, fontFamily, backgrounds, layout, fontWeight, borderRadius } from '../styles/colors';

const pageStyle = {
  minHeight: '100vh',
  background: backgrounds.pageGradient,
  fontFamily: fontFamily.system,
} as const;

const mainStyle = { 
  maxWidth: layout.maxWidthContent, 
  margin: '0 auto', 
  padding: '2rem 1rem',
} as const;

const h1Style = { 
  fontSize: '1.5rem', 
  fontWeight: fontWeight.bold, 
  color: colors.primary, 
  margin: '0 0 1.5rem 0' 
} as const;

const featureCardStyle = {
  marginBottom: '1rem',
  padding: '1rem',
  borderRadius: borderRadius.medium,
  background: colors.white,
  border: `1px solid ${colors.outlinedNeutral}`,
} as const;

const scenarioStyle = {
  padding: '0.75rem',
  marginTop: '0.5rem',
  borderRadius: borderRadius.small,
  background: colors.softNeutralBg,
} as const;

const stepStyle = {
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  color: colors.textSecondary,
  padding: '0.25rem 0',
} as const;

const badgeStyle = (passed: boolean) => ({
  display: 'inline-block',
  padding: '0.25rem 0.5rem',
  borderRadius: borderRadius.small,
  fontSize: '0.75rem',
  fontWeight: fontWeight.medium,
  background: passed ? colors.successBg : colors.errorBg,
  color: passed ? colors.success : colors.error,
} as const);

export function SpecsPage() {
  const [features, setFeatures] = useState<ParsedFeature[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Load feature files
        const featureFiles = getFeatures();
        const parsed: ParsedFeature[] = [];
        for (const [, content] of Object.entries(featureFiles)) {
          const result = parseFeatureContent(content);
          if (result) parsed.push(result);
        }
        setFeatures(parsed);

        // Load test results
        const results = await loadTestResults();
        if (results) {
          setTestSuites(findGherkinTests(results));
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

  if (loading) {
    return (
      <div style={pageStyle}>
        <Header />
        <main style={mainStyle}>
          <p>Loading specifications...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Header />
      <main style={mainStyle}>
        <h1 style={h1Style}>📋 Specifications</h1>
        
        {/* Test Results Summary */}
        {testSuites.length > 0 && (
          <Card>
            <div style={{ ...featureCardStyle, background: colors.softPrimaryBg }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: colors.primary }}>Test Results</h3>
              {testSuites.map((suite, idx) => (
                <div key={idx} style={{ marginBottom: '0.5rem' }}>
                  <strong>{suite.name}</strong>: {suite.tests.filter(t => t.status === 'passed').length}/{suite.tests.length} passed
                  <span style={{ marginLeft: '0.5rem', color: colors.gray }}>
                    ({suite.tests.reduce((sum, t) => sum + t.duration, 0).toFixed(0)}ms)
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Feature Files */}
        {features.map((feature, idx) => (
          <Card key={idx}>
            <div style={featureCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', color: colors.primary }}>
                  {feature.name}
                </h2>
              </div>
              
              {feature.description && (
                <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: '0.5rem 0', whiteSpace: 'pre-line' }}>
                  {feature.description}
                </p>
              )}

              {feature.scenarios.map((scenario, sIdx) => {
                const result = getTestResult(scenario.name);
                const passed = result?.status === 'passed';
                return (
                  <div key={sIdx} style={scenarioStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: colors.primary }}>{scenario.name}</strong>
                      <div>
                        {result && (
                          <span style={{ fontSize: '0.75rem', color: colors.gray, marginRight: '0.5rem' }}>
                            {result.duration.toFixed(0)}ms
                          </span>
                        )}
                        <span style={badgeStyle(passed)}>
                          {result ? (passed ? '✓' : '✗') : '○'}
                        </span>
                      </div>
                    </div>
                    {scenario.steps.map((step, stepIdx) => {
                      const match = step.match(/^(Given|When|Then|And|But)\s+(.*)$/);
                      const keyword = match?.[1] ?? '';
                      const text = match?.[2] ?? step;
                      return (
                        <div key={stepIdx} style={stepStyle}>
                          <span style={{ color: colors.success, marginRight: '0.5rem' }}>{keyword}</span>
                          {text}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {features.length === 0 && (
          <Card>
            <div style={featureCardStyle}>
              <p style={{ color: colors.textSecondary }}>No feature files found.</p>
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
