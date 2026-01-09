import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSentenceMenu } from './useSentenceMenu';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', name: 'Test User' },
    isAuthenticated: true,
  })),
}));

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getUserTasks: vi.fn().mockResolvedValue([
        { id: 'task-1', name: 'Task 1' },
        { id: 'task-2', name: 'Task 2' },
      ]),
    })),
  },
}));

describe('useSentenceMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null openMenuId', () => {
    const { result } = renderHook(() => useSentenceMenu());
    expect(result.current.openMenuId).toBeNull();
  });

  it('should initialize with empty menuAnchorEl', () => {
    const { result } = renderHook(() => useSentenceMenu());
    expect(result.current.menuAnchorEl).toEqual({});
  });

  it('should initialize with empty menuTasks', () => {
    const { result } = renderHook(() => useSentenceMenu());
    expect(result.current.menuTasks).toEqual([]);
  });

  it('should initialize with empty menuSearchQuery', () => {
    const { result } = renderHook(() => useSentenceMenu());
    expect(result.current.menuSearchQuery).toBe('');
  });

  it('should open menu and load tasks', async () => {
    const { result } = renderHook(() => useSentenceMenu());

    const mockElement = document.createElement('button');
    const mockEvent = {
      currentTarget: mockElement,
    } as unknown as React.MouseEvent;

    await act(async () => {
      await result.current.handleMenuOpen(mockEvent, 'sentence-1');
    });

    expect(result.current.openMenuId).toBe('sentence-1');
    expect(result.current.menuAnchorEl['sentence-1']).toBe(mockElement);

    await waitFor(() => {
      expect(result.current.menuTasks.length).toBe(2);
    });
  });

  it('should close menu and clear search query', () => {
    const { result } = renderHook(() => useSentenceMenu());

    act(() => {
      result.current.setMenuSearchQuery('test query');
    });

    expect(result.current.menuSearchQuery).toBe('test query');

    act(() => {
      result.current.handleMenuClose();
    });

    expect(result.current.openMenuId).toBeNull();
    expect(result.current.menuSearchQuery).toBe('');
  });

  it('should update menuSearchQuery', () => {
    const { result } = renderHook(() => useSentenceMenu());

    act(() => {
      result.current.setMenuSearchQuery('new search');
    });

    expect(result.current.menuSearchQuery).toBe('new search');
  });
});
