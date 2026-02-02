import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskForm } from './useTaskForm';

describe('useTaskForm', () => {
  it('initializes with default empty values', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    expect(result.current.name).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('initializes with provided initial values', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useTaskForm({
      onSubmit,
      initialValues: { name: 'Test Task', description: 'Test Description' }
    }));
    
    expect(result.current.name).toBe('Test Task');
    expect(result.current.description).toBe('Test Description');
    expect(result.current.isValid).toBe(true);
  });

  it('setName updates name and validity', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    act(() => {
      result.current.setName('New Task');
    });
    
    expect(result.current.name).toBe('New Task');
    expect(result.current.isValid).toBe(true);
  });

  it('setDescription updates description', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    act(() => {
      result.current.setDescription('New Description');
    });
    
    expect(result.current.description).toBe('New Description');
  });

  it('handleSubmit prevents submission with empty name', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Ülesande nimi on kohustuslik');
  });

  it('handleSubmit calls onSubmit with trimmed values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    act(() => {
      result.current.setName('  Test Task  ');
      result.current.setDescription('  Test Description  ');
    });
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });
    
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Task',
      description: 'Test Description'
    });
  });

  it('handleSubmit resets form on success when resetOnSuccess is true', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useTaskForm({ 
      onSubmit, 
      resetOnSuccess: true 
    }));
    
    act(() => {
      result.current.setName('Test Task');
      result.current.setDescription('Description');
    });
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });
    
    expect(result.current.name).toBe('');
    expect(result.current.description).toBe('');
  });

  it('handleSubmit does not reset form when resetOnSuccess is false', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useTaskForm({ 
      onSubmit, 
      resetOnSuccess: false 
    }));
    
    act(() => {
      result.current.setName('Test Task');
      result.current.setDescription('Description');
    });
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });
    
    expect(result.current.name).toBe('Test Task');
    expect(result.current.description).toBe('Description');
  });

  it('handleSubmit handles Error exceptions', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Test error'));
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    act(() => {
      result.current.setName('Test Task');
    });
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });
    
    expect(result.current.error).toBe('Test error');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleSubmit handles non-Error exceptions', async () => {
    const onSubmit = vi.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    act(() => {
      result.current.setName('Test Task');
    });
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });
    
    expect(result.current.error).toBe('Viga ülesande salvestamisel');
  });

  it('reset restores initial values', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useTaskForm({
      onSubmit,
      initialValues: { name: 'Initial', description: 'Initial Desc' }
    }));
    
    act(() => {
      result.current.setName('Changed');
      result.current.setDescription('Changed Desc');
      result.current.setError('Some error');
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.name).toBe('Initial');
    expect(result.current.description).toBe('Initial Desc');
    expect(result.current.error).toBeNull();
  });

  it('setError updates error state', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    act(() => {
      result.current.setError('Custom error');
    });
    
    expect(result.current.error).toBe('Custom error');
    
    act(() => {
      result.current.setError(null);
    });
    
    expect(result.current.error).toBeNull();
  });

  it('updates values when initialValues change', () => {
    const onSubmit = vi.fn();
    const { result, rerender } = renderHook(
      ({ initialValues }) => useTaskForm({ onSubmit, initialValues }),
      { initialProps: { initialValues: { name: 'First', description: 'First Desc' } } }
    );
    
    expect(result.current.name).toBe('First');
    
    rerender({ initialValues: { name: 'Second', description: 'Second Desc' } });
    
    expect(result.current.name).toBe('Second');
    expect(result.current.description).toBe('Second Desc');
  });

  it('isSubmitting is true during submission', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>(resolve => {
      resolveSubmit = resolve;
    });
    const onSubmit = vi.fn().mockReturnValue(submitPromise);
    const { result } = renderHook(() => useTaskForm({ onSubmit }));
    
    act(() => {
      result.current.setName('Test Task');
    });
    
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    
    act(() => {
      result.current.handleSubmit(mockEvent);
    });
    
    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });
    
    await act(async () => {
      resolveSubmit!();
      await submitPromise;
    });
    
    expect(result.current.isSubmitting).toBe(false);
  });
});
