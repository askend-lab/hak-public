import { renderHook, act, waitFor } from '@testing-library/react';
import { useExpandedState } from './hooks';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('hooks', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('useExpandedState', () => {
    it('should start with empty set', () => {
      const { result } = renderHook(() => useExpandedState<string>());
      expect(result.current.expanded.size).toBe(0);
    });

    it('should add item when toggled', () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.toggle('item1');
      });
      expect(result.current.expanded.has('item1')).toBe(true);
    });

    it('should remove item when toggled twice', () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.toggle('item1');
      });
      act(() => {
        result.current.toggle('item1');
      });
      expect(result.current.expanded.has('item1')).toBe(false);
    });

    it('should allow setting expanded directly', () => {
      const { result } = renderHook(() => useExpandedState<string>());
      act(() => {
        result.current.setExpanded(new Set(['a', 'b']));
      });
      expect(result.current.expanded.size).toBe(2);
    });
  });
});
