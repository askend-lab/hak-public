import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalState } from './useModalState';

describe('useModalState', () => {
  it('starts with no active modal', () => {
    const { result } = renderHook(() => useModalState());
    
    expect(result.current.activeModal).toBeNull();
    expect(result.current.task).toBeNull();
  });

  it('opens modal without task', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.open('create');
    });
    
    expect(result.current.activeModal).toBe('create');
    expect(result.current.showTaskCreationModal).toBe(true);
    expect(result.current.task).toBeNull();
  });

  it('opens modal with task data', () => {
    const { result } = renderHook(() => useModalState());
    const task = { id: '1', name: 'Test Task', description: 'Test description' };
    
    act(() => {
      result.current.open('edit', task);
    });
    
    expect(result.current.activeModal).toBe('edit');
    expect(result.current.showTaskEditModal).toBe(true);
    expect(result.current.task).toEqual(task);
    expect(result.current.taskToEdit).toEqual(task);
  });

  it('closes modal and resets state', () => {
    const { result } = renderHook(() => useModalState());
    const task = { id: '1', name: 'Test Task' };
    
    act(() => {
      result.current.open('delete', task);
    });
    
    expect(result.current.showDeleteConfirmation).toBe(true);
    expect(result.current.taskToDelete).toEqual(task);
    
    act(() => {
      result.current.close();
    });
    
    expect(result.current.activeModal).toBeNull();
    expect(result.current.task).toBeNull();
    expect(result.current.showDeleteConfirmation).toBe(false);
  });

  it('isOpen returns correct boolean', () => {
    const { result } = renderHook(() => useModalState());
    
    expect(result.current.isOpen('share')).toBe(false);
    
    act(() => {
      result.current.open('share', { id: '1', name: 'Task', shareToken: 'abc' });
    });
    
    expect(result.current.isOpen('share')).toBe(true);
    expect(result.current.isOpen('edit')).toBe(false);
    expect(result.current.showShareTaskModal).toBe(true);
    expect(result.current.taskToShare).toEqual({ id: '1', name: 'Task', shareToken: 'abc' });
  });

  it('updateTask updates task data', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.open('edit', { id: '1', name: 'Original' });
    });
    
    act(() => {
      result.current.updateTask({ id: '1', name: 'Updated', description: 'New desc' });
    });
    
    expect(result.current.task?.name).toBe('Updated');
    expect(result.current.task?.description).toBe('New desc');
  });

  it('handles addTask modal type', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.open('addTask');
    });
    
    expect(result.current.showAddTaskModal).toBe(true);
  });

  it('handles addToTaskDropdown modal type', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.open('addToTaskDropdown');
    });
    
    expect(result.current.showAddToTaskDropdown).toBe(true);
  });

  it('taskToEdit is null when modal is not edit', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.open('share', { id: '1', name: 'Task' });
    });
    
    expect(result.current.taskToEdit).toBeNull();
  });

  it('taskToShare is null when modal is not share', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.open('edit', { id: '1', name: 'Task' });
    });
    
    expect(result.current.taskToShare).toBeNull();
  });

  it('taskToDelete is null when modal is not delete', () => {
    const { result } = renderHook(() => useModalState());
    
    act(() => {
      result.current.open('create');
    });
    
    expect(result.current.taskToDelete).toBeNull();
  });
});
