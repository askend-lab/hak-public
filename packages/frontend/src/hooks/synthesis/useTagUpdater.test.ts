import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagUpdater } from './useTagUpdater';

describe('useTagUpdater', () => {
  it('should update sentence tags using transformer', () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.updateSentenceTags('test-1', () => ({ text: 'updated text' }));
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should delete tag at specific index', () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.deleteTag('test-1', 1);
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should replace tag at specific index', () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.replaceTag('test-1', 0, ['hi', 'there']);
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update stressed tag', () => {
    const mockSetSentences = vi.fn();
    const { result } = renderHook(() => useTagUpdater(mockSetSentences));

    act(() => {
      result.current.updateStressedTag('test-1', 0, 'stressed-hello');
    });

    expect(mockSetSentences).toHaveBeenCalledWith(expect.any(Function));
  });
});
