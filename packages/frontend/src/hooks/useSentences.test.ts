import { vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useSentences } from './useSentences';
import { synthesizeText } from '../services/audio';

vi.mock('../services/audio', () => ({
  synthesizeText: vi.fn().mockResolvedValue({ audioUrl: 'mock-url' }),
}));

const mockSynthesizeText = synthesizeText as Mock;

const getTexts = (sentences: { text: string }[]): string[] => sentences.map(s => s.text);

describe('useSentences', () => {
  it('should initialize with default empty sentence with unique id', () => {
    const { result } = renderHook(() => useSentences());
    expect(result.current.sentences).toHaveLength(1);
    expect(result.current.sentences[0]).toHaveProperty('id');
    expect(result.current.sentences[0]).toHaveProperty('text', '');
  });

  it('should initialize with provided sentences with unique ids', () => {
    const { result } = renderHook(() => useSentences(['Hello', 'World']));
    expect(result.current.sentences).toHaveLength(2);
    expect(result.current.sentences[0]).toHaveProperty('text', 'Hello');
    expect(result.current.sentences[1]).toHaveProperty('text', 'World');
    expect(result.current.sentences[0]?.id).not.toBe(result.current.sentences[1]?.id);
  });

  it('should add a new empty sentence', () => {
    const { result } = renderHook(() => useSentences(['Hello']));
    act(() => {
      result.current.addSentence();
    });
    expect(getTexts(result.current.sentences)).toStrictEqual(['Hello', '']);
  });

  it('should update sentence at index', () => {
    const { result } = renderHook(() => useSentences(['Hello', 'World']));
    act(() => {
      result.current.updateSentence(1, 'Updated');
    });
    expect(getTexts(result.current.sentences)).toStrictEqual(['Hello', 'Updated']);
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

  describe('removeSentence', () => {
    it('should remove sentence at index', () => {
      const { result } = renderHook(() => useSentences(['Hello', 'World', 'Test']));
      act(() => {
        result.current.removeSentence(1);
      });
      expect(getTexts(result.current.sentences)).toStrictEqual(['Hello', 'Test']);
    });

    it('should reset to empty string when removing last sentence', () => {
      const { result } = renderHook(() => useSentences(['Only']));
      act(() => {
        result.current.removeSentence(0);
      });
      expect(getTexts(result.current.sentences)).toStrictEqual(['']);
    });
  });

  describe('stopAll', () => {
    it('should stop playing and reset audio', () => {
      const { result } = renderHook(() => useSentences(['Hello']));
      
      const mockAudioElement = { 
        pause: vi.fn(), 
        currentTime: 10,
        src: 'test'
      } as unknown as HTMLAudioElement;
      result.current.audioRef.current = mockAudioElement;
      
      act(() => {
        result.current.stopAll();
      });

      expect(result.current.isPlayingAll).toBe(false);
      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockAudioElement.currentTime).toBe(0);
    });

    it('should handle missing audio ref', () => {
      const { result } = renderHook(() => useSentences(['Hello']));
      
      act(() => {
        result.current.stopAll();
      });

      expect(result.current.isPlayingAll).toBe(false);
    });
  });

  describe('isPlayingAll state', () => {
    it('should have isPlayingAll initially false', () => {
      const { result } = renderHook(() => useSentences(['Hello']));
      expect(result.current.isPlayingAll).toBe(false);
    });
  });

  describe('reorderSentences (drag & drop)', () => {
    it('should reorder sentences when dragging from index 0 to index 2', () => {
      const { result } = renderHook(() => useSentences(['A', 'B', 'C']));
      act(() => {
        result.current.reorderSentences(0, 2);
      });
      expect(getTexts(result.current.sentences)).toStrictEqual(['B', 'C', 'A']);
    });

    it('should reorder sentences when dragging from index 2 to index 0', () => {
      const { result } = renderHook(() => useSentences(['A', 'B', 'C']));
      act(() => {
        result.current.reorderSentences(2, 0);
      });
      expect(getTexts(result.current.sentences)).toStrictEqual(['C', 'A', 'B']);
    });

    it('should not change order when dragging to same position', () => {
      const { result } = renderHook(() => useSentences(['A', 'B', 'C']));
      act(() => {
        result.current.reorderSentences(1, 1);
      });
      expect(getTexts(result.current.sentences)).toStrictEqual(['A', 'B', 'C']);
    });

    it('should preserve sentence ids when reordering', () => {
      const { result } = renderHook(() => useSentences(['A', 'B', 'C']));
      const originalIds = result.current.sentences.map(s => s.id);
      act(() => {
        result.current.reorderSentences(0, 2);
      });
      const newIds = result.current.sentences.map(s => s.id);
      // After moving A from 0 to 2: [B, C, A]
      expect(newIds[0]).toBe(originalIds[1]); // B's id
      expect(newIds[1]).toBe(originalIds[2]); // C's id
      expect(newIds[2]).toBe(originalIds[0]); // A's id
    });
  });

});
