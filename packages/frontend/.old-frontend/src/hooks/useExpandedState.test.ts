import { renderHook, act } from '@testing-library/react';

import { useExpandedState } from './useExpandedState';

describe('useExpandedState', () => {
  it('should initialize with empty set', () => {
    const { result } = renderHook(() => useExpandedState<string>());
    expect(result.current.expanded.size).toBe(0);
  });

  it('should add item when toggling non-existing item', () => {
    const { result } = renderHook(() => useExpandedState<string>());
    
    act(() => {
      result.current.toggle('item1');
    });
    
    expect(result.current.expanded.has('item1')).toBe(true);
    expect(result.current.expanded.size).toBe(1);
  });

  it('should remove item when toggling existing item', () => {
    const { result } = renderHook(() => useExpandedState<string>());
    
    act(() => {
      result.current.toggle('item1');
    });
    
    expect(result.current.expanded.has('item1')).toBe(true);
    
    act(() => {
      result.current.toggle('item1');
    });
    
    expect(result.current.expanded.has('item1')).toBe(false);
    expect(result.current.expanded.size).toBe(0);
  });

  it('should handle multiple items', () => {
    const { result } = renderHook(() => useExpandedState<number>());
    
    act(() => {
      result.current.toggle(1);
    });
    act(() => {
      result.current.toggle(2);
    });
    act(() => {
      result.current.toggle(3);
    });
    
    expect(result.current.expanded.size).toBe(3);
    expect(result.current.expanded.has(1)).toBe(true);
    expect(result.current.expanded.has(2)).toBe(true);
    expect(result.current.expanded.has(3)).toBe(true);
  });

  it('should provide setExpanded for direct manipulation', () => {
    const { result } = renderHook(() => useExpandedState<string>());
    
    act(() => {
      result.current.setExpanded(new Set(['a', 'b', 'c']));
    });
    
    expect(result.current.expanded.size).toBe(3);
    expect(result.current.expanded.has('a')).toBe(true);
    expect(result.current.expanded.has('b')).toBe(true);
    expect(result.current.expanded.has('c')).toBe(true);
  });
});
