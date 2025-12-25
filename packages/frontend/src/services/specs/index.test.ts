import { describe, it, expect, vi, beforeEach } from 'vitest';

import { loadTestResults, getFeatures, findGherkinTests, VitestResults } from './index';

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

  describe('loadTestResults', () => {
    it('returns null when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const result = await loadTestResults();
      expect(result).toBeNull();
    });

    it('returns null when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      const result = await loadTestResults();
      expect(result).toBeNull();
    });

    it('returns parsed JSON when fetch succeeds', async () => {
      const mockData: VitestResults = {
        numTotalTests: 10,
        numPassedTests: 9,
        numFailedTests: 1,
        numPendingTests: 0,
        testResults: [],
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await loadTestResults();
      expect(result).toEqual(mockData);
    });
  });

  describe('findGherkinTests', () => {
    it('filters test suites by steps path', () => {
      const mockResults: VitestResults = {
        numTotalTests: 5,
        numPassedTests: 5,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [
          {
            name: '/path/to/steps/test.tsx',
            status: 'passed',
            assertionResults: [
              {
                fullName: 'Test > should work',
                title: 'should work',
                status: 'passed',
                duration: 100,
                ancestorTitles: ['Test'],
              },
            ],
          },
          {
            name: '/path/to/other/test.ts',
            status: 'passed',
            assertionResults: [],
          },
        ],
      };

      const suites = findGherkinTests(mockResults);
      expect(suites).toHaveLength(1);
      expect(suites[0].name).toBe('test.tsx');
      expect(suites[0].tests).toHaveLength(1);
    });

    it('filters test suites by Gherkin in name', () => {
      const mockResults: VitestResults = {
        numTotalTests: 2,
        numPassedTests: 2,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [
          {
            name: '/path/to/Gherkin.test.ts',
            status: 'passed',
            assertionResults: [
              {
                fullName: 'Gherkin > scenario',
                title: 'scenario',
                status: 'passed',
                duration: 50,
                ancestorTitles: ['Gherkin'],
              },
            ],
          },
        ],
      };

      const suites = findGherkinTests(mockResults);
      expect(suites).toHaveLength(1);
    });

    it('returns empty array when no Gherkin tests found', () => {
      const mockResults: VitestResults = {
        numTotalTests: 1,
        numPassedTests: 1,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [
          {
            name: '/path/to/unit.test.ts',
            status: 'passed',
            assertionResults: [],
          },
        ],
      };

      const suites = findGherkinTests(mockResults);
      expect(suites).toHaveLength(0);
    });
  });
});
