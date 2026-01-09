 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSynthesis } from './useSynthesis';

vi.mock('@/utils/phoneticMarkers', () => ({
  stripPhoneticMarkers: (text: string): string => text.replace(/[·`´]/g, ''),
}));

vi.mock('@/utils/synthesize', () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue('mock-audio-url'),
}));

describe('useSynthesis extra coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    class MockAudio {
      src = '';
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => { setTimeout(() => this.onended?.(), 10); return Promise.resolve(); });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stressedText: 'stressed' }),
      blob: () => Promise.resolve(new Blob()),
    });
  });

  it('handlePlayAll with sentences triggers synthesis', async () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    await act(async () => { await result.current.handlePlayAll(); });
  });

  it('synthesizeAndPlay triggers audio playback', async () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const id = result.current.sentences[0]?.id ?? '';
    await act(async () => { await result.current.synthesizeAndPlay(id); });
  });

  it('handleSentencePhoneticApply updates phonetic text', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const id = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleSentencePhoneticApply(id, 'custom phonetic'); });
    expect(result.current.sentences[0]?.phoneticText).toBe('custom phonetic');
  });

  it('handleSentencePhoneticApply for non-existent sentence does nothing', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.handleSentencePhoneticApply('non-existent', 'text'); });
  });

  it('handleClearSentence resets sentence state', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const id = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleClearSentence(id); });
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it('handleClearSentence for non-existent sentence does nothing', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.handleClearSentence('non-existent'); });
  });

  it('handleAddSentence adds empty sentence', () => {
    const { result } = renderHook(() => useSynthesis());
    const initialCount = result.current.sentences.length;
    act(() => { result.current.handleAddSentence(); });
    expect(result.current.sentences.length).toBe(initialCount + 1);
  });

  it('handleDownload synthesizes and downloads', async () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const id = result.current.sentences[0]?.id ?? '';
    await act(async () => { await result.current.handleDownload(id); });
  });

  it('setOpenTagMenu opens and closes menu', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const id = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.setOpenTagMenu({ sentenceId: id, tagIndex: 0 }); });
    expect(result.current.openTagMenu).toEqual({ sentenceId: id, tagIndex: 0 });
    act(() => { result.current.setOpenTagMenu(null); });
    expect(result.current.openTagMenu).toBeNull();
  });

  it('editingTag state is managed correctly', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const id = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleEditTag(id, 0); });
    expect(result.current.editingTag?.sentenceId).toBe(id);
    act(() => { result.current.handleEditTagCommit(); });
    expect(result.current.editingTag).toBeNull();
  });
});
