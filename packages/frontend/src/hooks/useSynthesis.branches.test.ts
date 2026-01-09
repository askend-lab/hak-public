import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSynthesis } from './useSynthesis';

vi.mock('@/utils/phoneticMarkers', () => ({
  stripPhoneticMarkers: (text: string): string => text.replace(/[·`´]/g, ''),
}));

vi.mock('@/utils/synthesize', () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue('mock-audio-url'),
}));

const setupMocks = (): void => {
  global.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    src: '',
    onended: null,
    onerror: null,
    onloadeddata: null,
  }));
  global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
  global.URL.revokeObjectURL = vi.fn();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ stressedText: 'mock stressed' }),
    blob: () => Promise.resolve(new Blob()),
  });
};

describe('useSynthesis keyboard handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupMocks();
  });

  it('processes space key when input has content and tags exist', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleTextChange(sentenceId, 'newword'); });
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown({ key: ' ', preventDefault } as unknown as React.KeyboardEvent, sentenceId);
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags).toContain('newword');
  });

  it('does not process space when no input', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    const initialTags = [...(result.current.sentences[0]?.tags ?? [])];
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown({ key: ' ', preventDefault } as unknown as React.KeyboardEvent, sentenceId);
    });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags).toEqual(initialTags);
  });

  it('removes last tag on backspace when input is empty', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown({ key: 'Backspace', preventDefault } as unknown as React.KeyboardEvent, sentenceId);
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount - 1);
    expect(result.current.sentences[0]?.currentInput).toBe('kooli');
  });

  it('does not remove tag when input has content', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleTextChange(sentenceId, 'typing'); });
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown({ key: 'Backspace', preventDefault } as unknown as React.KeyboardEvent, sentenceId);
    });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount);
  });

  it('returns early when sentence not found', () => {
    const { result } = renderHook(() => useSynthesis());
    const preventDefault = vi.fn();
    act(() => {
      result.current.handleKeyDown({ key: 'Enter', preventDefault } as unknown as React.KeyboardEvent, 'non-existent-id');
    });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('removes tag when edit value is empty', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    act(() => { result.current.handleEditTag(sentenceId, 0); });
    act(() => { result.current.handleEditTagChange(''); });
    act(() => { result.current.handleEditTagCommit(); });
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount - 1);
  });

  it('splits multiple words when editing tag', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    const initialTagCount = result.current.sentences[0]?.tags.length ?? 0;
    act(() => { result.current.handleEditTag(sentenceId, 0); });
    act(() => { result.current.handleEditTagChange('word1 word2 word3'); });
    act(() => { result.current.handleEditTagCommit(); });
    expect(result.current.sentences[0]?.tags.length).toBe(initialTagCount + 2);
  });

  it('handleEditTagCommit does nothing when no editingTag', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.handleEditTagCommit(); });
    expect(result.current.editingTag).toBeNull();
  });

  it('handleEditTagChange does nothing when no editingTag', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.handleEditTagChange('test'); });
    expect(result.current.editingTag).toBeNull();
  });

  it('handleEditTag returns early when sentence not found', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.handleEditTag('non-existent', 0); });
    expect(result.current.editingTag).toBeNull();
  });

  it('handleEditTagKeyDown commits on space key', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleEditTag(sentenceId, 0); });
    act(() => { result.current.handleEditTagChange('Modified'); });
    const preventDefault = vi.fn();
    act(() => { result.current.handleEditTagKeyDown({ key: ' ', preventDefault } as unknown as React.KeyboardEvent); });
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.editingTag).toBeNull();
  });

  it('handleUseVariant does nothing when selectedSentenceId is null', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const initialStressedTags = result.current.sentences[0]?.stressedTags;
    act(() => { result.current.handleUseVariant('variant', null, 0); });
    expect(result.current.sentences[0]?.stressedTags).toEqual(initialStressedTags);
  });

  it('handleUseVariant does nothing when selectedTagIndex is null', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    const initialStressedTags = result.current.sentences[0]?.stressedTags;
    act(() => { result.current.handleUseVariant('variant', sentenceId, null); });
    expect(result.current.sentences[0]?.stressedTags).toEqual(initialStressedTags);
  });

  it('handlePlay processes currentInput before playing', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleTextChange(sentenceId, 'extraword'); });
    act(() => { result.current.handlePlay(sentenceId); });
    expect(result.current.sentences[0]?.tags).toContain('extraword');
  });

  it('handlePlay returns early when sentence not found', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.handlePlay('non-existent-id'); });
  });

  it('handleDownload returns early when sentence not found', async () => {
    const { result } = renderHook(() => useSynthesis());
    await act(async () => { await result.current.handleDownload('non-existent-id'); });
  });

  it('handleRemoveSentence revokes object URL when audio exists', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => {
      result.current.setSentences([
        { id: 'test-1', text: 'Test', tags: ['Test'], isPlaying: false, isLoading: false, currentInput: '', audioUrl: 'blob:test-url' },
        { id: 'test-2', text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '' }
      ]);
    });
    act(() => { result.current.handleRemoveSentence('test-1'); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });

  it('handleInputBlur returns early when sentence not found', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.handleInputBlur('non-existent'); });
  });

  it('handleInputBlur returns early when input is empty', () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleInputBlur(sentenceId); });
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it('handleInputBlur returns early when tags are empty', () => {
    const { result } = renderHook(() => useSynthesis());
    const sentenceId = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleTextChange(sentenceId, 'some input'); });
    act(() => { result.current.handleInputBlur(sentenceId); });
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it('handleInputBlur appends input to existing tags', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    act(() => { result.current.handleTextChange(sentenceId, 'blurword'); });
    act(() => { result.current.handleInputBlur(sentenceId); });
    expect(result.current.sentences[0]?.tags).toContain('blurword');
  });

  it('loads entries with audioUrl from localStorage', () => {
    localStorage.setItem('eki_playlist_entries', JSON.stringify([{ id: 's1', text: 'Hello', stressedText: 'Hello', audioUrl: 'blob:audio' }]));
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences[0]?.audioUrl).toBe('blob:audio');
  });

  it('generates id when not provided in stored entry', () => {
    localStorage.setItem('eki_playlist_entries', JSON.stringify([{ text: 'No ID', stressedText: 'No ID' }]));
    const { result } = renderHook(() => useSynthesis());
    expect(result.current.sentences[0]?.id).toContain('entry_');
  });

  it('synthesizes when Enter pressed with existing tags and no input', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const sentenceId = result.current.sentences[0]?.id ?? '';
    const preventDefault = vi.fn();
    act(() => { result.current.handleKeyDown({ key: 'Enter', preventDefault } as unknown as React.KeyboardEvent, sentenceId); });
    expect(preventDefault).toHaveBeenCalled();
  });

  it('handleDeleteTag leaves other sentences unchanged', () => {
    const { result } = renderHook(() => useSynthesis());
    act(() => { result.current.setDemoSentences(); });
    const initialTags = [...(result.current.sentences[0]?.tags ?? [])];
    act(() => { result.current.handleDeleteTag('non-existent-id', 0); });
    expect(result.current.sentences[0]?.tags).toEqual(initialTags);
  });
});
