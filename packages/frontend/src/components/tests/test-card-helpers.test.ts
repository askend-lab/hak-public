import { getFileName, getStatusColors, countResults, findScenarioSteps, ParsedFeature, TestAssertion } from './test-card-helpers';

describe('test-card-helpers', () => {
  describe('getFileName', () => {
    it('should extract filename from path', () => {
      expect(getFileName('/path/to/file.ts')).toBe('file.ts');
    });

    it('should return path if no slash', () => {
      expect(getFileName('file.ts')).toBe('file.ts');
    });

    it('should handle empty string', () => {
      expect(getFileName('')).toBe('');
    });
  });

  describe('getStatusColors', () => {
    it('should return green colors for passed', () => {
      const colors = getStatusColors('passed');
      expect(colors.icon).toBe('✓');
      expect(colors.bg).toBe('#E8F5E9');
    });

    it('should return red colors for failed', () => {
      const colors = getStatusColors('failed');
      expect(colors.icon).toBe('✗');
      expect(colors.bg).toBe('#FFEBEE');
    });
  });

  describe('countResults', () => {
    it('should count passed and failed tests', () => {
      const results: TestAssertion[] = [
        { fullName: 'test1', title: 'test1', status: 'passed', duration: 10, ancestorTitles: [], failureMessages: [] },
        { fullName: 'test2', title: 'test2', status: 'failed', duration: 20, ancestorTitles: [], failureMessages: [] },
        { fullName: 'test3', title: 'test3', status: 'passed', duration: 15, ancestorTitles: [], failureMessages: [] },
      ];
      const counts = countResults(results);
      expect(counts.passed).toBe(2);
      expect(counts.failed).toBe(1);
    });

    it('should return zeros for empty array', () => {
      const counts = countResults([]);
      expect(counts.passed).toBe(0);
      expect(counts.failed).toBe(0);
    });
  });

  describe('findScenarioSteps', () => {
    const mockFeature: ParsedFeature = {
      name: 'Test Feature',
      description: '',
      tags: [],
      scenarios: [
        { name: 'User Login', tags: [], steps: ['Given user is on page', 'When user clicks'] },
        { name: 'User Logout', tags: [], steps: ['Given user is logged in'] },
      ],
    };

    it('should find scenario steps by title', () => {
      const steps = findScenarioSteps(mockFeature, 'User Login');
      expect(steps).toHaveLength(2);
    });

    it('should return empty array if no match', () => {
      const steps = findScenarioSteps(mockFeature, 'Unknown Scenario');
      expect(steps).toEqual([]);
    });

    it('should return empty array if featureData is null', () => {
      const steps = findScenarioSteps(null, 'User Login');
      expect(steps).toEqual([]);
    });

    it('should match case-insensitively', () => {
      const steps = findScenarioSteps(mockFeature, 'user login');
      expect(steps).toHaveLength(2);
    });
  });
});
