import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayback } from './useAudioPlayback';

vi.mock('@/utils/synthesize', () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue('blob:audio-url'),
}));

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const mockEntry = (id: string, text = 'test', audioUrl: string | null = null, audioBlob: Blob | null = null) => ({
  id, text, stressedText: text, audioUrl, audioBlob, taskId: 't1', order: 0, createdAt: new Date(),
});

describe('useAudioPlayback initialization', () => {
  it('initializes with null states', () => {
    const { result } = renderHook(() => useAudioPlayback([]));
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });
});

describe('useAudioPlayback handlePlayEntry', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('does nothing for non-existent entry', () => {
    const { result } = renderHook(() => useAudioPlayback([mockEntry('1')]));
    act(() => { result.current.handlePlayEntry('999'); });
    expect(result.current.currentPlayingId).toBeNull();
  });

  it('synthesizes audio when no audioUrl or audioBlob', async () => {
    const entries = [mockEntry('1', 'hello world')];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => { result.current.handlePlayEntry('1'); });
    expect(result.current.currentLoadingId).toBe('1');
  });
});

describe('useAudioPlayback handlePlayAll', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('does nothing with empty entries', async () => {
    const { result } = renderHook(() => useAudioPlayback([]));
    await act(async () => { await result.current.handlePlayAll(); });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it('starts loading when called with entries', async () => {
    const entries = [mockEntry('1', 'test')];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { result.current.handlePlayAll(); });
    expect(result.current.isLoadingPlayAll).toBe(true);
  });
});

describe('getVoiceModel logic', () => {
  it('uses efm_s for single word', async () => {
    const entries = [mockEntry('1', 'word')];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => { result.current.handlePlayEntry('1'); });
    const { synthesizeWithPolling } = await import('@/utils/synthesize');
    expect(synthesizeWithPolling).toHaveBeenCalledWith('word', 'efm_s');
  });

  it('uses efm_l for multiple words', async () => {
    const entries = [mockEntry('1', 'hello world')];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => { result.current.handlePlayEntry('1'); });
    const { synthesizeWithPolling } = await import('@/utils/synthesize');
    expect(synthesizeWithPolling).toHaveBeenCalledWith('hello world', 'efm_l');
  });
});

describe('useAudioPlayback with existing audio', () => {
  it('plays entry with audioUrl directly', async () => {
    const entries = [mockEntry('1', 'test', 'http://audio.mp3')];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { result.current.handlePlayEntry('1'); });
    expect(result.current.currentPlayingId).toBe('1');
  });

  it('plays entry with audioBlob', async () => {
    const blob = new Blob(['audio'], { type: 'audio/wav' });
    const entries = [mockEntry('1', 'test', null, blob)];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { result.current.handlePlayEntry('1'); });
    expect(result.current.currentPlayingId).toBe('1');
  });
});
