import { vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useSentences } from './useSentences';
import { synthesizeText } from '../services/audio';

vi.mock('../services/audio', () => ({
  synthesizeText: vi.fn().mockResolvedValue({ audioUrl: 'mock-url' }),
}));

const mockSynthesizeText = synthesizeText as Mock;

describe('useSentences', () => {
  it('should initialize with default empty sentence', () => {
    const { result } = renderHook(() => useSentences());
    expect(result.current.sentences).toStrictEqual(['']);
  });

  it('should initialize with provided sentences', () => {
    const { result } = renderHook(() => useSentences(['Hello', 'World']));
    expect(result.current.sentences).toStrictEqual(['Hello', 'World']);
  });

  it('should add a new empty sentence', () => {
    const { result } = renderHook(() => useSentences(['Hello']));
    act(() => {
      result.current.addSentence();
    });
    expect(result.current.sentences).toStrictEqual(['Hello', '']);
  });

  it('should update sentence at index', () => {
    const { result } = renderHook(() => useSentences(['Hello', 'World']));
    act(() => {
      result.current.updateSentence(1, 'Updated');
    });
    expect(result.current.sentences).toStrictEqual(['Hello', 'Updated']);
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useSentences());
    expect(result.current.loadingIndex).toBeNull();
    expect(result.current.audioRef).toBeDefined();
    expect(result.current.audioRef.current).toBeNull();
  });

  describe('playSentence', () => {
    const mockPlay = vi.fn();

    beforeEach(() => {
      mockSynthesizeText.mockClear();
      mockPlay.mockClear();
      // Mock audio element
      Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
        writable: true,
        value: mockPlay,
      });
    });

    it('should not play empty sentence', async () => {
      const { result } = renderHook(() => useSentences(['', 'Hello']));
      
      await act(async () => {
        await result.current.playSentence(0);
      });

      expect(mockSynthesizeText).not.toHaveBeenCalled();
      expect(mockPlay).not.toHaveBeenCalled();
      expect(result.current.loadingIndex).toBeNull();
    });

    it('should not play whitespace-only sentence', async () => {
      const { result } = renderHook(() => useSentences(['   ', 'Hello']));
      
      await act(async () => {
        await result.current.playSentence(0);
      });

      expect(mockSynthesizeText).not.toHaveBeenCalled();
      expect(mockPlay).not.toHaveBeenCalled();
      expect(result.current.loadingIndex).toBeNull();
    });

    it('should synthesize and play valid sentence', async () => {
      const { result } = renderHook(() => useSentences(['Hello world']));
      
      // Mock audio ref
      const mockAudioElement = { play: mockPlay, src: '' } as unknown as HTMLAudioElement;
      result.current.audioRef.current = mockAudioElement;
      
      await act(async () => {
        await result.current.playSentence(0);
      });

      expect(mockSynthesizeText).toHaveBeenCalledWith('Hello world');
      expect(mockAudioElement.src).toBe('mock-url');
      expect(mockPlay).toHaveBeenCalled();
      expect(result.current.loadingIndex).toBeNull();
    });

    it('should handle synthesis errors silently', async () => {
      const { result } = renderHook(() => useSentences(['Hello']));
      
      mockSynthesizeText.mockRejectedValueOnce(new Error('Synthesis failed'));
      
      await act(async () => {
        await result.current.playSentence(0);
      });

      // Error handled silently - loading state should reset
      expect(result.current.loadingIndex).toBeNull();
    });

    it('should handle missing audio ref gracefully', async () => {
      const { result } = renderHook(() => useSentences(['Hello']));
      
      await act(async () => {
        await result.current.playSentence(0);
      });

      expect(mockSynthesizeText).toHaveBeenCalledWith('Hello');
      expect(mockPlay).not.toHaveBeenCalled();
      expect(result.current.loadingIndex).toBeNull();
    });
  });
});
