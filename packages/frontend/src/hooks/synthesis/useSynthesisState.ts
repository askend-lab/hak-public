import { useState, useEffect, useCallback, useRef } from 'react';
import { SentenceState } from '@/types/synthesis';

// Helper to ensure optional properties are null instead of undefined
export const ensureSentenceState = (sentence: Partial<SentenceState> & Pick<SentenceState, 'id' | 'text' | 'tags' | 'isPlaying' | 'isLoading' | 'currentInput'>): SentenceState => ({
  ...sentence,
  phoneticText: sentence.phoneticText ?? null,
  audioUrl: sentence.audioUrl ?? null,
  stressedTags: sentence.stressedTags ?? null
});

export const INITIAL_SENTENCE: SentenceState = {
  id: '1', text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '',
  phoneticText: null, audioUrl: null, stressedTags: null
};

export interface UseSynthesisStateReturn {
  sentences: SentenceState[];
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>;
  sentencesRef: React.MutableRefObject<SentenceState[]>;
  setDemoSentences: () => void;
  handleTextChange: (id: string, value: string) => void;
  handleClearSentence: (id: string) => void;
  handleAddSentence: () => void;
  handleRemoveSentence: (id: string) => void;
  handleInputBlur: (id: string) => void;
}

// eslint-disable-next-line max-lines-per-function
export function useSynthesisState(): UseSynthesisStateReturn {
  const [sentences, setSentences] = useState<SentenceState[]>([INITIAL_SENTENCE]);
  const sentencesRef = useRef<SentenceState[]>(sentences);
  sentencesRef.current = sentences;

  // Load from localStorage on mount
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
              id: entry.id || `entry_${Date.now()}_${Math.random()}`, text: entry.text, tags: words,
              isPlaying: false, isLoading: false, currentInput: '',
              stressedTags: stressedWords.length === words.length ? stressedWords : undefined,
              audioUrl: entry.audioUrl, phoneticText: entry.stressedText
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

  const setDemoSentences = useCallback((): void => {
    setSentences([
      { id: 'demo-1', text: 'Noormees läks kooli', tags: ['Noormees', 'läks', 'kooli'], isPlaying: false, isLoading: false, currentInput: '', phoneticText: null, audioUrl: null, stressedTags: null },
      { id: 'demo-2', text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '', phoneticText: null, audioUrl: null, stressedTags: null }
    ]);
  }, []);

  const handleTextChange = useCallback((id: string, value: string): void => {
    setSentences(prev => prev.map(s => s.id === id ? { ...s, currentInput: value } : s));
  }, []);

  const handleClearSentence = useCallback((id: string): void => {
    setSentences(prev => prev.map(s => s.id === id ? { ...s, tags: [], currentInput: '', text: '', stressedTags: null, phoneticText: null, audioUrl: null } : s));
  }, []);

  const handleAddSentence = useCallback((): void => {
    setSentences(prev => [...prev, { id: Date.now().toString(), text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '', phoneticText: null, audioUrl: null, stressedTags: null }]);
  }, []);

  const handleRemoveSentence = useCallback((id: string): void => {
    setSentences(prev => {
      const sentence = prev.find(s => s.id === id);
      if (sentence?.audioUrl) URL.revokeObjectURL(sentence.audioUrl);
      if (prev.length === 1) return [INITIAL_SENTENCE];
      return prev.filter(s => s.id !== id);
    });
  }, []);

  const handleInputBlur = useCallback((id: string): void => {
    setSentences(prev => {
      const sentence = prev.find(s => s.id === id);
      if (!sentence || !sentence.currentInput.trim() || sentence.tags.length === 0) return prev;
      const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
      const allTags = [...sentence.tags, ...inputWords];
      const newText = allTags.join(' ');
      return prev.map(s => s.id === id ? { ...s, tags: allTags, currentInput: '', text: newText, phoneticText: undefined, audioUrl: undefined } : s);
    });
  }, []);

  return { sentences, setSentences, sentencesRef, setDemoSentences, handleTextChange, handleClearSentence, handleAddSentence, handleRemoveSentence, handleInputBlur };
}
