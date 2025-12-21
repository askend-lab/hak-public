import { renderHook, act } from '@testing-library/react';
import { useSentences } from './useSentences';

jest.mock('../services/audio', () => ({
  synthesizeText: jest.fn().mockResolvedValue({ audioUrl: 'mock-url' }),
}));

describe('useSentences', () => {
  it('should initialize with default empty sentence', () => {
    const { result } = renderHook(() => useSentences());
    expect(result.current.sentences).toEqual(['']);
  });

  it('should initialize with provided sentences', () => {
    const { result } = renderHook(() => useSentences(['Hello', 'World']));
    expect(result.current.sentences).toEqual(['Hello', 'World']);
  });

  it('should add a new empty sentence', () => {
    const { result } = renderHook(() => useSentences(['Hello']));
    act(() => {
      result.current.addSentence();
    });
    expect(result.current.sentences).toEqual(['Hello', '']);
  });

  it('should update sentence at index', () => {
    const { result } = renderHook(() => useSentences(['Hello', 'World']));
    act(() => {
      result.current.updateSentence(1, 'Updated');
    });
    expect(result.current.sentences).toEqual(['Hello', 'Updated']);
  });

  it('should have loadingIndex as null initially', () => {
    const { result } = renderHook(() => useSentences());
    expect(result.current.loadingIndex).toBeNull();
  });

  it('should have audioRef', () => {
    const { result } = renderHook(() => useSentences());
    expect(result.current.audioRef).toBeDefined();
  });
});
