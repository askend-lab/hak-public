import { renderHook, act } from '@testing-library/react';

import { useFeatureData, useTestResults, useExpandedState } from './hooks';

import type { ParsedFeature } from './feature-parser';

// Mock fetch with proper typing
declare global {
  var fetch: jest.Mock;
}
global.fetch = jest.fn();

// Mock feature-parser
jest.mock('./feature-parser', () => ({
  parseFeatureContent: jest.fn((content: string): ParsedFeature => ({
    name: 'Test Feature',
    description: 'Test Description',
    tags: [],
    scenarios: []
  }))
}));

const mockParseFeatureContent = jest.requireMock('./feature-parser').parseFeatureContent;

describe('hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFeatureData', () => {
    it('should fetch and parse feature data on mount', async () => {
      const mockContent = 'Feature: Test Feature\nScenario: Test';
      const mockParsedData: ParsedFeature = {
        name: 'Test Feature',
        description: 'Test Description',
        tags: [],
        scenarios: []
      };

      global.fetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockContent)
      });
      (mockParseFeatureContent as jest.Mock).mockReturnValue(mockParsedData);

      const { result } = renderHook(() => useFeatureData());

      expect(result.current).toBeNull();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(global.fetch).toHaveBeenCalledWith('/US-020-add-synthesis-to-task.feature');
      expect((mockParseFeatureContent as jest.Mock)).toHaveBeenCalledWith(mockContent);
      expect(result.current).toEqual(mockParsedData);
    });

    it('should handle fetch error gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useFeatureData());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBeNull();
    });

    it('should only fetch once on mount', async () => {
      global.fetch.mockResolvedValue({
        text: () => Promise.resolve('test')
      });

      renderHook(() => useFeatureData());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('useTestResults', () => {
    it('should fetch and process test results', async () => {
      const mockResults = {
        numPassedTests: 10,
        numFailedTests: 5,
        numTotalTests: 15,
        numPassedTestSuites: 2,
        numFailedTestSuites: 1,
        numTotalTestSuites: 3,
        startTime: 1234567890,
        success: true,
        testResults: [
          {
            name: '/features/test1.feature',
            status: 'passed',
            assertionResults: [
              { status: 'passed', fullName: 'test1', title: 'Test 1', duration: 100, ancestorTitles: [], failureMessages: [] },
              { status: 'failed', fullName: 'test2', title: 'Test 2', duration: 200, ancestorTitles: [], failureMessages: ['Error'] }
            ],
            startTime: 1234567890,
            endTime: 1234567895
          },
          {
            name: '/unit/test.test.js',
            status: 'passed',
            assertionResults: [],
            startTime: 1234567890,
            endTime: 1234567895
          }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResults)
      });

      const { result } = renderHook(() => useTestResults());

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.results).toBeNull();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(global.fetch).toHaveBeenCalledWith('/jest-results.json');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.results).toEqual({
        ...mockResults,
        testResults: [mockResults.testResults[0]], // Only feature tests
        numTotalTests: 2,
        numPassedTests: 1,
        numFailedTests: 1,
        numTotalTestSuites: 1,
        numPassedTestSuites: 1,
        numFailedTestSuites: 0
      });
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch';
      global.fetch.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useTestResults());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.results).toBeNull();
    });

    it('should handle empty test results', async () => {
      const mockResults = {
        testResults: []
      };

      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResults)
      });

      const { result } = renderHook(() => useTestResults());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.results).toEqual({
        ...mockResults,
        testResults: [],
        numTotalTests: 0,
        numPassedTests: 0,
        numFailedTests: 0,
        numTotalTestSuites: 0,
        numPassedTestSuites: 0,
        numFailedTestSuites: 0
      });
    });
  });

  describe('useExpandedState', () => {
    it('should initialize with empty set', () => {
      const { result } = renderHook(() => useExpandedState<string>());

      expect(result.current.expanded).toEqual(new Set());
      expect(typeof result.current.toggle).toBe('function');
      expect(typeof result.current.setExpanded).toBe('function');
    });

    it('should toggle item expansion', () => {
      const { result } = renderHook(() => useExpandedState<string>());

      act(() => {
        result.current.toggle('item1');
      });

      expect(result.current.expanded).toEqual(new Set(['item1']));

      act(() => {
        result.current.toggle('item1');
      });

      expect(result.current.expanded).toEqual(new Set());
    });

    it('should set expanded state directly', () => {
      const { result } = renderHook(() => useExpandedState<string>());

      const newSet = new Set(['a', 'b', 'c']);
      
      act(() => {
        result.current.setExpanded(newSet);
      });

      expect(result.current.expanded).toBe(newSet);
    });
  });
});
