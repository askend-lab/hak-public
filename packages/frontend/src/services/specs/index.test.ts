import { describe, it, expect, vi, beforeEach } from 'vitest';

import { loadCucumberResults, loadTestResults, getFeatures, getFeatureGroups, findGherkinTests, parseCucumberResults } from './index';

describe('specs service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getFeatures', () => {
    it('returns feature files object', () => {
      const features = getFeatures();
      expect(features).toBeDefined();
      expect(typeof features).toBe('object');
    });

    it('contains US-001 feature', () => {
      const features = getFeatures();
      expect(features['US-001-basic-synthesis']).toBeDefined();
      expect(features['US-001-basic-synthesis']).toContain('Feature:');
    });
  });

  describe('loadCucumberResults', () => {
    it('returns null when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const result = await loadCucumberResults();
      expect(result).toBeNull();
    });

    it('returns null when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      const result = await loadCucumberResults();
      expect(result).toBeNull();
    });

    it('returns parsed JSON when fetch succeeds', async () => {
      const mockData = [{
        keyword: 'Feature',
        name: 'Test Feature',
        elements: [{
          keyword: 'Scenario',
          name: 'Test Scenario',
          steps: [{
            keyword: 'Given',
            name: 'a test',
            result: { status: 'passed', duration: 1000000 }
          }]
        }]
      }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await loadCucumberResults();
      expect(result).toEqual(mockData);
    });
  });

  describe('parseCucumberResults', () => {
    it('parses cucumber results into test suites', () => {
      const mockResults = [{
        keyword: 'Feature',
        name: 'Basic synthesis',
        elements: [{
          keyword: 'Scenario',
          name: 'Synthesize a word',
          steps: [
            { keyword: 'Given', name: 'I am on main page', result: { status: 'passed', duration: 1000000 } },
            { keyword: 'When', name: 'I click play', result: { status: 'passed', duration: 2000000 } },
          ]
        }]
      }];

      const suites = parseCucumberResults(mockResults);
      expect(suites).toHaveLength(1);
      expect(suites[0]?.name).toBe('Basic synthesis');
      expect(suites[0]?.tests).toHaveLength(1);
      expect(suites[0]?.tests[0]?.status).toBe('passed');
      expect(suites[0]?.tests[0]?.duration).toBe(3); // 3ms from 3000000ns
    });

    it('marks scenario as failed if any step fails', () => {
      const mockResults = [{
        keyword: 'Feature',
        name: 'Test Feature',
        elements: [{
          keyword: 'Scenario',
          name: 'Failing scenario',
          steps: [
            { keyword: 'Given', name: 'step 1', result: { status: 'passed', duration: 1000000 } },
            { keyword: 'When', name: 'step 2', result: { status: 'failed', duration: 1000000 } },
          ]
        }]
      }];

      const suites = parseCucumberResults(mockResults);
      expect(suites[0]?.tests[0]?.status).toBe('failed');
    });

    it('returns empty array for empty results', () => {
      const suites = parseCucumberResults([]);
      expect(suites).toHaveLength(0);
    });

    it('handles steps without duration', () => {
      const mockResults = [{
        keyword: 'Feature',
        name: 'Test Feature',
        elements: [{
          keyword: 'Scenario',
          name: 'Test scenario',
          steps: [
            { keyword: 'Given', name: 'step 1', result: { status: 'passed' } },
          ]
        }]
      }];

      const suites = parseCucumberResults(mockResults);
      expect(suites[0]?.tests[0]?.duration).toBe(0);
    });
  });

  describe('loadTestResults', () => {
    it('returns null (deprecated)', async () => {
      const result = await loadTestResults();
      expect(result).toBeNull();
    });
  });

  describe('getFeatureGroups', () => {
    it('returns feature groups object', () => {
      const groups = getFeatureGroups();
      expect(groups).toBeDefined();
      expect(typeof groups).toBe('object');
    });
  });

  describe('findGherkinTests', () => {
    it('returns empty array (deprecated)', () => {
      const mockResults = {
        numTotalTests: 0,
        numPassedTests: 0,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [],
      };
      const result = findGherkinTests(mockResults);
      expect(result).toEqual([]);
    });
  });
});
