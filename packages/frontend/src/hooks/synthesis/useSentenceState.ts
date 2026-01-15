/* eslint-disable max-lines-per-function */
import { useState, useEffect, useCallback } from 'react';
import { SentenceState } from '@/types/synthesis';

const ensureSentenceState = (sentence: Partial<SentenceState> & Pick<SentenceState, 'id' | 'text' | 'tags' | 'isPlaying' | 'isLoading' | 'currentInput'>): SentenceState => ({
  ...sentence,
  phoneticText: sentence.phoneticText ?? null,
  audioUrl: sentence.audioUrl ?? null,
  stressedTags: sentence.stressedTags ?? null
});

const INITIAL_SENTENCE: SentenceState = {
  id: '1',
  text: '',
  tags: [],
  isPlaying: false,
  isLoading: false,
  currentInput: '',
  phoneticText: null,
  audioUrl: null,
  stressedTags: null
};

export function useSentenceState(): {
  sentences: SentenceState[];
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>;
  setDemoSentences: () => void;
  handleTextChange: (id: string, value: string) => void;
  handleClearSentence: (id: string) => void;
  handleAddSentence: () => void;
  handleRemoveSentence: (id: string, revokeUrl?: boolean) => void;
  updateSentence: (id: string, updates: Partial<SentenceState>) => void;
  updateAllSentences: (updates: Partial<SentenceState>) => void;
  getSentence: (id: string) => SentenceState | undefined;
} {
  const [sentences, setSentences] = useState<SentenceState[]>([INITIAL_SENTENCE]);

  useEffect(() => {
    try {
      const storedPlaylist = localStorage.getItem('eki_playlist_entries');
      if (storedPlaylist) {
        const entries = JSON.parse(storedPlaylist);
        if (Array.isArray(entries) && entries.length > 0) {
          const transformed: SentenceState[] = entries.map((entry: { id?: string; text: string; stressedText?: string; audioUrl?: string }) => {
            const words = entry.text.trim().split(/\s+/).filter((w: string) => w.length > 0);
            const stressedWords = entry.stressedText?.trim().split(/\s+/).filter((w: string) => w.length > 0) || [];
            return ensureSentenceState({
              id: entry.id || `entry_${Date.now()}_${Math.random()}`,
              text: entry.text,
              tags: words,
              isPlaying: false,
              isLoading: false,
              currentInput: '',
              stressedTags: stressedWords.length === words.length ? stressedWords : undefined,
              audioUrl: entry.audioUrl,
              phoneticText: entry.stressedText
            });
          });
          setSentences(transformed);
          localStorage.removeItem('eki_playlist_entries');
        }
      }
    } catch (error) {
      console.error('Failed to load playlist from localStorage:', error);
      localStorage.removeItem('eki_playlist_entries');
    }
  }, []);

  const setDemoSentences = useCallback(() => {
    setSentences([
      { id: 'demo-1', text: 'Noormees läks kooli', tags: ['Noormees', 'läks', 'kooli'], isPlaying: false, isLoading: false, currentInput: '', phoneticText: null, audioUrl: null, stressedTags: null },
      { id: 'demo-2', text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '', phoneticText: null, audioUrl: null, stressedTags: null }
    ]);
  }, []);

  const handleTextChange = useCallback((id: string, value: string) => {
    setSentences(prev => prev.map(s => s.id === id ? { ...s, currentInput: value } : s));
  }, []);

  const handleClearSentence = useCallback((id: string) => {
    setSentences(prev => prev.map(s => s.id === id ? { 
      ...s, tags: [], currentInput: '', text: '', stressedTags: null, phoneticText: null, audioUrl: null
    } : s));
  }, []);

  const handleAddSentence = useCallback(() => {
    setSentences(prev => [...prev, { id: Date.now().toString(), text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '', phoneticText: null, audioUrl: null, stressedTags: null }]);
  }, []);

  const handleRemoveSentence = useCallback((id: string, revokeUrl?: boolean) => {
    const sentence = sentences.find(s => s.id === id);
    if (revokeUrl && sentence?.audioUrl) {
      URL.revokeObjectURL(sentence.audioUrl);
    }
    if (sentences.length === 1) {
      setSentences([INITIAL_SENTENCE]);
    } else {
      setSentences(prev => prev.filter(s => s.id !== id));
    }
  }, [sentences]);

  const updateSentence = useCallback((id: string, updates: Partial<SentenceState>) => {
    setSentences(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateAllSentences = useCallback((updates: Partial<SentenceState>) => {
    setSentences(prev => prev.map(s => ({ ...s, ...updates })));
  }, []);

  const getSentence = useCallback((id: string) => {
    return sentences.find(s => s.id === id);
  }, [sentences]);

  return {
    sentences,
    setSentences,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    handleRemoveSentence,
    updateSentence,
    updateAllSentences,
    getSentence
  };
}
