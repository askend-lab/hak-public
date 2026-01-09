import { vi, Mock, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';

import { useAudioPlayback } from './useAudioPlayback';
import { synthesizeText } from '../services/audio';

vi.mock('../services/audio', () => ({
  synthesizeText: vi.fn().mockResolvedValue({ audioUrl: 'mock-url' }),
  playAudio: vi.fn().mockResolvedValue(undefined),
}));

const mockSynthesizeText = synthesizeText as Mock;

describe('useAudioPlayback', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentId).toBeNull();
    expect(result.current.loadingId).toBeNull();
    expect(result.current.isPlayingSequence).toBe(false);
  });

  it('should have audioRef defined', () => {
    const { result } = renderHook(() => useAudioPlayback());
    expect(result.current.audioRef).toBeDefined();
  });

  it('should reset all playback state on stop', () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    act(() => {
      result.current.stop();
    });
    
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentId).toBeNull();
    expect(result.current.loadingId).toBeNull();
  });

  it('should not play empty text', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    await act(async () => {
      await result.current.play('');
    });
    
    expect(mockSynthesizeText).not.toHaveBeenCalled();
  });

  it('should not play whitespace-only text', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    await act(async () => {
      await result.current.play('   ');
    });
    
    expect(mockSynthesizeText).not.toHaveBeenCalled();
  });

  it('should stop sequence playback', () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    act(() => {
      result.current.stopSequence();
    });
    
    expect(result.current.isPlayingSequence).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });

  it('should not play empty sequence', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    await act(async () => {
      await result.current.playSequence([]);
    });
    
    expect(result.current.isPlayingSequence).toBe(false);
  });

  it('should set state when playing from url', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    await act(async () => {
      result.current.playFromUrl('http://test.mp3', 'url-id');
    });
    
    expect(result.current.currentId).toBe('url-id');
    expect(result.current.isPlaying).toBe(true);
  });

  it('should set loading state during play', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    await act(async () => {
      await result.current.play('test text', 'play-id');
    });
    
    expect(mockSynthesizeText).toHaveBeenCalledWith('test text');
  });

  it('should play sequence with cached urls', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    const items = [
      { id: '1', text: 'text1', cachedUrl: 'http://cached1.mp3' },
    ];
    
    await act(async () => {
      result.current.playSequence(items);
    });
    
    expect(result.current.isPlayingSequence).toBe(true);
  });

  it('should play sequence without cached urls', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    const items = [
      { id: '1', text: 'text1' },
    ];
    
    await act(async () => {
      result.current.playSequence(items);
    });
    
    expect(mockSynthesizeText).toHaveBeenCalledWith('text1');
  });

  it('should handle playFromUrl without id', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    await act(async () => {
      result.current.playFromUrl('http://test.mp3');
    });
    
    expect(result.current.currentId).toBeNull();
    expect(result.current.isPlaying).toBe(true);
  });

  it('should handle play without id', async () => {
    const { result } = renderHook(() => useAudioPlayback());
    
    await act(async () => {
      await result.current.play('hello');
    });
    
    expect(mockSynthesizeText).toHaveBeenCalledWith('hello');
  });
});
