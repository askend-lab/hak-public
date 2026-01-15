import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSynthesisOrchestrator } from './useSynthesisOrchestrator';

vi.mock('./useSentenceState');
vi.mock('./useAudioPlayer');
vi.mock('./useSynthesisAPI');

describe('useSynthesisOrchestrator', () => {
  let mockSentenceState: any;
  let mockAudioPlayer: any;
  let mockSynthesisAPI: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockSentenceState = {
      sentences: [
        { id: 'test-1', text: 'Hello world', tags: [], audioUrl: null, phoneticText: null }
      ],
      updateSentence: vi.fn(),
      getSentence: vi.fn((id) => mockSentenceState.sentences.find((s: any) => s.id === id)),
      addSentence: vi.fn(),
      deleteSentence: vi.fn()
    };

    mockAudioPlayer = {
      currentAudio: null,
      stopCurrentAudio: vi.fn(),
      playAudio: vi.fn().mockResolvedValue(true),
      playWithAbort: vi.fn().mockResolvedValue(true)
    };

    mockSynthesisAPI = {
      synthesizeText: vi.fn().mockResolvedValue({
        audioUrl: 'https://example.com/audio.mp3',
        phoneticText: 'ˈhɛloʊ wɝld',
        stressedTags: []
      }),
      synthesizeWithCache: vi.fn().mockResolvedValue({
        audioUrl: 'https://example.com/audio.mp3',
        phoneticText: 'ˈhɛloʊ wɝld'
      })
    };

    const { useSentenceState } = await import('./useSentenceState');
    const { useAudioPlayer } = await import('./useAudioPlayer');
    const { useSynthesisAPI } = await import('./useSynthesisAPI');

    (useSentenceState as ReturnType<typeof vi.fn>).mockReturnValue(mockSentenceState);
    (useAudioPlayer as ReturnType<typeof vi.fn>).mockReturnValue(mockAudioPlayer);
    (useSynthesisAPI as ReturnType<typeof vi.fn>).mockReturnValue(mockSynthesisAPI);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('playSingleSentence', () => {
    it('should return false if sentence has no text', async () => {
      mockSentenceState.getSentence.mockReturnValue({ id: 'test-1', text: '  ', tags: [] });
      const { result } = renderHook(() => useSynthesisOrchestrator());

      const success = await act(async () => {
        return result.current.playSingleSentence('test-1');
      });

      expect(success).toBe(false);
    });

    it('should play existing audio if available', async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        audioUrl: 'https://example.com/cached.mp3',
        tags: []
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.playSingleSentence('test-1');
      });

      expect(mockAudioPlayer.playAudio).toHaveBeenCalledWith(
        'https://example.com/cached.mp3',
        expect.any(Object)
      );
    });

    it('should synthesize audio if not cached', async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        audioUrl: null,
        phoneticText: null,
        tags: []
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.playSingleSentence('test-1');
      });

      expect(mockSynthesisAPI.synthesizeWithCache).toHaveBeenCalledWith('Hello', null, null);
      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith('test-1', {
        audioUrl: 'https://example.com/audio.mp3'
      });
    });

    it('should return false if aborted before synthesis', async () => {
      const abortController = new AbortController();
      abortController.abort();

      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        audioUrl: null,
        tags: []
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      const success = await act(async () => {
        return result.current.playSingleSentence('test-1', abortController.signal);
      });

      expect(success).toBe(false);
    });

    it('should handle synthesis error', async () => {
      mockSynthesisAPI.synthesizeWithCache.mockRejectedValue(new Error('Synthesis failed'));
      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        audioUrl: null,
        tags: []
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useSynthesisOrchestrator());

      const success = await act(async () => {
        return result.current.playSingleSentence('test-1');
      });

      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should use playWithAbort when abort signal provided', async () => {
      const abortController = new AbortController();
      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        audioUrl: 'https://example.com/cached.mp3',
        tags: []
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.playSingleSentence('test-1', abortController.signal);
      });

      expect(mockAudioPlayer.playWithAbort).toHaveBeenCalledWith(
        'https://example.com/cached.mp3',
        abortController.signal,
        expect.any(Object)
      );
    });
  });

  describe('synthesizeAndPlay', () => {
    it('should return early if no text', async () => {
      mockSentenceState.sentences = [{ id: 'test-1', text: '  ', tags: [] }];
      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeAndPlay('test-1');
      });

      expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
    });

    it('should play cached audio if available', async () => {
      mockSentenceState.sentences = [{
        id: 'test-1',
        text: 'Hello',
        audioUrl: 'https://example.com/cached.mp3',
        phoneticText: 'test',
        tags: []
      }];

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeAndPlay('test-1');
      });

      expect(mockAudioPlayer.stopCurrentAudio).toHaveBeenCalled();
      expect(mockAudioPlayer.playAudio).toHaveBeenCalled();
    });

    it('should synthesize new audio if not cached', async () => {
      mockSentenceState.sentences = [{ id: 'test-1', text: 'Hello', tags: [] }];
      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeAndPlay('test-1');
      });

      expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith('Hello', undefined);
      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith('test-1', {
        tags: expect.any(Array),
        isLoading: true,
        isPlaying: false
      });
    });

    it('should handle synthesis error', async () => {
      mockSynthesisAPI.synthesizeText.mockRejectedValue(new Error('Failed'));
      mockSentenceState.sentences = [{ id: 'test-1', text: 'Hello', tags: [] }];

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeAndPlay('test-1');
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith('test-1', {
        isLoading: false,
        isPlaying: false
      });
      consoleSpy.mockRestore();
    });
  });

  describe('synthesizeWithText', () => {
    it('should play cached audio if text matches', async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        audioUrl: 'https://example.com/cached.mp3',
        phoneticText: 'test',
        tags: []
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText('test-1', 'Hello');
      });

      expect(mockAudioPlayer.stopCurrentAudio).toHaveBeenCalled();
      expect(mockAudioPlayer.playAudio).toHaveBeenCalled();
      expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
    });

    it('should synthesize new audio if text differs', async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        audioUrl: 'https://example.com/cached.mp3',
        phoneticText: 'test',
        tags: []
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText('test-1', 'Goodbye');
      });

      expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith('Goodbye', 'test');
    });

    it('should handle synthesis error', async () => {
      mockSynthesisAPI.synthesizeText.mockRejectedValue(new Error('Failed'));
      mockSentenceState.getSentence.mockReturnValue({
        id: 'test-1',
        text: 'Hello',
        tags: []
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText('test-1', 'New text');
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith('test-1', {
        isLoading: false,
        isPlaying: false
      });
      consoleSpy.mockRestore();
    });
  });
});
