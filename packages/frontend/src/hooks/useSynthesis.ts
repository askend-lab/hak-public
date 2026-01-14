import { useState, useEffect, useCallback, useRef } from 'react';
import { SentenceState, EditingTag, OpenTagMenu, getVoiceModel, convertTextToTags } from '@/types/synthesis';
import { stripPhoneticMarkers } from '@/utils/phoneticMarkers';
import { synthesizeWithPolling } from '@/utils/synthesize';

// Helper to ensure optional properties are null instead of undefined
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function useSynthesis() {
  const [sentences, setSentences] = useState<SentenceState[]>([INITIAL_SENTENCE]);
  // Ref to always have access to the latest sentences value (avoids stale closure issues)
  const sentencesRef = useRef<SentenceState[]>(sentences);
  sentencesRef.current = sentences;
  
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] = useState<AbortController | null>(null);
  const [editingTag, setEditingTag] = useState<EditingTag>(null);
  const [openTagMenu, setOpenTagMenu] = useState<OpenTagMenu>(null);

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

  const handleRemoveSentence = useCallback((id: string) => {
    const sentence = sentences.find(s => s.id === id);
    if (sentence?.audioUrl) URL.revokeObjectURL(sentence.audioUrl);
    if (sentences.length === 1) {
      setSentences([INITIAL_SENTENCE]);
    } else {
      setSentences(prev => prev.filter(s => s.id !== id));
    }
  }, [sentences]);

  const handleInputBlur = useCallback((id: string) => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence || !sentence.currentInput.trim() || sentence.tags.length === 0) return;
    const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
    const allTags = [...sentence.tags, ...inputWords];
    const newText = allTags.join(' ');
    setSentences(prev => prev.map(s => s.id === id
      ? { ...s, tags: allTags, currentInput: '', text: newText, phoneticText: undefined, audioUrl: undefined }
      : s
    ));
  }, [sentences]);

  const playSingleSentence = useCallback(async (id: string, abortSignal?: AbortSignal, retryCount = 0): Promise<boolean> => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence?.text.trim()) return false;
    let audioUrl = sentence.audioUrl;

    if (!audioUrl) {
      try {
        if (abortSignal?.aborted) return false;
        audioUrl = await synthesizeWithPolling(sentence.text, getVoiceModel(sentence.text));
        if (abortSignal?.aborted) return false;
        setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl } : s));
      } catch (error) {
        console.error('Failed to synthesize audio:', error);
        return false;
      }
    }
    if (abortSignal?.aborted) return false;

    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: true } : { ...s, isPlaying: false }));

      const cleanup = (): void => {
        setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s));
        setCurrentAudio(null);
      };

      audio.onended = (): void => { cleanup(); resolve(true); };
      audio.onerror = (): void => {
        cleanup();
        if (retryCount === 0 && sentence.audioUrl) {
          setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s));
          setTimeout(async () => { const success = await playSingleSentence(id, abortSignal, 1); resolve(success); }, 100);
        } else {
          resolve(false);
        }
      };

      if (abortSignal) {
        abortSignal.addEventListener('abort', () => { audio.pause(); cleanup(); resolve(false); });
      }
      audio.play().catch(() => {
        cleanup();
        if (retryCount === 0 && sentence.audioUrl) {
          setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s));
          setTimeout(async () => { const success = await playSingleSentence(id, abortSignal, 1); resolve(success); }, 100);
        } else {
          resolve(false);
        }
      });
    });
  }, [sentences]);

  const synthesizeAndPlay = useCallback(async (id: string) => {
    // Use ref to get the latest sentences value (avoids stale closure when called after state updates)
    const sentence = sentencesRef.current.find(s => s.id === id);
    if (!sentence?.text.trim()) return;

    if (currentAudio) { currentAudio.pause(); currentAudio.src = ''; setCurrentAudio(null); }
    const tags = convertTextToTags(sentence.text);

    if (sentence.audioUrl && sentence.phoneticText) {
      try {
        setSentences(prev => prev.map(s => s.id === id ? { ...s, tags, isPlaying: false } : { ...s, isPlaying: false }));
        const audio = new Audio(sentence.audioUrl);
        setCurrentAudio(audio);
        audio.onloadeddata = (): void => setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: true } : s));
        audio.onended = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s)); setCurrentAudio(null); };
        audio.onerror = (): void => {
          setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false, audioUrl: undefined, phoneticText: undefined } : s));
          setCurrentAudio(null);
          setTimeout(() => { synthesizeAndPlay(id); }, 100);
        };
        await audio.play();
        return;
      } catch {
        setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s));
      }
    }

    setSentences(prev => prev.map(s => s.id === id ? { ...s, tags, isLoading: true, isPlaying: false } : { ...s, isPlaying: false }));

    try {
      let phoneticText: string;
      let newStressedTags: string[] | undefined;

      if (sentence.phoneticText) {
        phoneticText = sentence.phoneticText;
      } else {
        const analyzeResponse = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: sentence.text }) });
        if (!analyzeResponse.ok) throw new Error('Analysis failed');
        const { stressedText } = await analyzeResponse.json();
        phoneticText = stressedText || sentence.text;
        if (stressedText) newStressedTags = stressedText.trim().split(/\s+/).filter((w: string) => w.length > 0);
      }

      const audioUrl = await synthesizeWithPolling(phoneticText, getVoiceModel(phoneticText));
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onloadeddata = (): void => setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: true, phoneticText: phoneticText || undefined, audioUrl, stressedTags: newStressedTags && newStressedTags.length === s.tags.length ? newStressedTags : s.stressedTags } : s));
      audio.onended = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s)); setCurrentAudio(null); };
      audio.onerror = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s)); setCurrentAudio(null); };
      await audio.play();
    } catch (error) {
      console.error('Failed to synthesize:', error);
      setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s));
    }
  }, [currentAudio]);

  const handlePlayAll = useCallback(async () => {
    if (isPlayingAll || isLoadingPlayAll) {
      playAllAbortController?.abort();
      setPlayAllAbortController(null);
      setIsPlayingAll(false);
      setIsLoadingPlayAll(false);
      if (currentAudio) { currentAudio.pause(); currentAudio.src = ''; setCurrentAudio(null); }
      setSentences(prev => prev.map(s => ({ ...s, isPlaying: false, isLoading: false })));
      return;
    }

    const sentencesWithText = sentences.filter(s => s.text.trim());
    if (sentencesWithText.length === 0) return;

    const abortController = new AbortController();
    setPlayAllAbortController(abortController);
    setIsLoadingPlayAll(true);

    let isFirstSentence = true;
    for (const sentence of sentencesWithText) {
      if (abortController.signal.aborted) break;
      const success = await playSingleSentence(sentence.id, abortController.signal);
      if (isFirstSentence && success) { setIsLoadingPlayAll(false); setIsPlayingAll(true); isFirstSentence = false; }
      if (!success || abortController.signal.aborted) break;
    }

    setIsPlayingAll(false);
    setIsLoadingPlayAll(false);
    setPlayAllAbortController(null);
  }, [isPlayingAll, isLoadingPlayAll, playAllAbortController, currentAudio, sentences, playSingleSentence]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence) return;

    if (e.key === ' ' && sentence.currentInput.trim() && sentence.tags.length > 0) {
      e.preventDefault();
      const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
      const allTags = [...sentence.tags, ...inputWords];
      const newText = allTags.join(' ');
      const cacheInvalidated = newText !== sentence.text;
      setSentences(prev => prev.map(s => s.id === id ? { ...s, tags: allTags, currentInput: '', text: newText, ...(cacheInvalidated && { phoneticText: undefined, audioUrl: undefined }) } : s));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sentence.currentInput.trim()) {
        const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
        const allTags = [...sentence.tags, ...inputWords];
        const fullText = allTags.join(' ');
        setSentences(prev => prev.map(s => s.id === id ? { ...s, tags: allTags, currentInput: '', text: fullText, phoneticText: undefined, audioUrl: undefined } : s));
        synthesizeWithText(id, fullText);
      } else if (sentence.tags.length > 0) {
        synthesizeAndPlay(id);
      }
    } else if (e.key === 'Backspace' && !sentence.currentInput && sentence.tags.length > 0) {
      e.preventDefault();
      setSentences(prev => prev.map(s => {
        if (s.id === id) {
          const newTags = s.tags.slice(0, -1);
          const removedTag = s.tags[s.tags.length - 1] ?? '';
          return { ...s, tags: newTags, currentInput: removedTag, text: newTags.join(' '), phoneticText: undefined, audioUrl: undefined };
        }
        return s;
      }));
    }
  }, [sentences, synthesizeAndPlay]);

  const synthesizeWithText = useCallback(async (id: string, text: string) => {
    const sentence = sentences.find(s => s.id === id);
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ''; setCurrentAudio(null); }

    if (sentence?.audioUrl && sentence?.phoneticText && sentence.text === text) {
      try {
        const audio = new Audio(sentence.audioUrl);
        setCurrentAudio(audio);
        audio.onloadeddata = (): void => setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: true } : s));
        audio.onended = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s)); setCurrentAudio(null); };
        audio.onerror = (): void => {
          setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false, audioUrl: undefined, phoneticText: undefined } : s));
          setCurrentAudio(null);
          setTimeout(() => { synthesizeWithText(id, text); }, 100);
        };
        await audio.play();
        return;
      } catch {
        setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s));
      }
    }

    setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: true, isPlaying: false } : { ...s, isPlaying: false }));

    try {
      let phoneticText: string;
      let newStressedTags: string[] | undefined;

      if (sentence?.phoneticText) {
        phoneticText = sentence.phoneticText;
      } else {
        const analyzeResponse = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        if (!analyzeResponse.ok) throw new Error('Analysis failed');
        const { stressedText } = await analyzeResponse.json();
        phoneticText = stressedText || text;
        if (stressedText) newStressedTags = stressedText.trim().split(/\s+/).filter((w: string) => w.length > 0);
      }

      const audioUrl = await synthesizeWithPolling(phoneticText, getVoiceModel(phoneticText));
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onloadeddata = (): void => setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: true, phoneticText: phoneticText || undefined, audioUrl, stressedTags: newStressedTags && newStressedTags.length === s.tags.length ? newStressedTags : s.stressedTags } : s));
      audio.onended = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s)); setCurrentAudio(null); };
      audio.onerror = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s)); setCurrentAudio(null); };
      await audio.play();
    } catch (error) {
      console.error('Failed to synthesize:', error);
      setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s));
    }
  }, [sentences, currentAudio]);

  const handlePlay = useCallback((id: string): void => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence) return;
    if (sentence.currentInput.trim()) {
      const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
      const allTags = [...sentence.tags, ...inputWords];
      const fullText = allTags.join(' ');
      setSentences(prev => prev.map(s => s.id === id ? { ...s, tags: allTags, currentInput: '', text: fullText, phoneticText: undefined, audioUrl: undefined } : s));
      synthesizeWithText(id, fullText);
    } else if (sentence.tags.length > 0) {
      synthesizeAndPlay(id);
    }
  }, [sentences, synthesizeAndPlay, synthesizeWithText]);

  const handleDownload = useCallback(async (id: string) => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence) return;
    let audioUrl = sentence.audioUrl;

    if (!audioUrl) {
      try {
        audioUrl = await synthesizeWithPolling(sentence.text, getVoiceModel(sentence.text));
        setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl } : s));
      } catch (error) {
        console.error('Failed to generate audio:', error);
        return;
      }
    }

    if (!audioUrl) return;

    // Fetch the audio file and download it
    try {
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${sentence.text || 'audio'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download audio:', error);
    }
  }, [sentences]);

  const handleDeleteTag = useCallback((sentenceId: string, tagIndex: number) => {
    setSentences(prev => prev.map(s => {
      if (s.id !== sentenceId) return s;
      const newTags = s.tags.filter((_, i) => i !== tagIndex);
      const newStressedTags = s.stressedTags?.filter((_, i) => i !== tagIndex);
      return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
    }));
    setOpenTagMenu(null);
  }, []);

  const handleEditTag = useCallback((sentenceId: string, tagIndex: number) => {
    const sentence = sentences.find(s => s.id === sentenceId);
    if (!sentence) return;
    const word = sentence.tags[tagIndex] ?? '';
    setEditingTag({ sentenceId, tagIndex, value: word });
    setOpenTagMenu(null);
  }, [sentences]);

  const handleEditTagChange = useCallback((value: string) => {
    if (!editingTag) return;
    setEditingTag({ ...editingTag, value });
  }, [editingTag]);

  const handleEditTagCommit = useCallback(() => {
    if (!editingTag) return;
    const { sentenceId, tagIndex, value } = editingTag;
    const trimmedValue = value.trim();

    // Compute the new sentences array and update the ref IMMEDIATELY
    // so that synthesizeAndPlay can access the updated value before React re-renders
    const newSentences = sentencesRef.current.map(s => {
      if (s.id !== sentenceId) return s;
      if (trimmedValue === '') {
        const newTags = s.tags.filter((_, i) => i !== tagIndex);
        const newStressedTags = s.stressedTags?.filter((_, i) => i !== tagIndex);
        return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
      } else {
        const newWords = trimmedValue.split(/\s+/).filter(w => w.length > 0);
        const newTags = [...s.tags.slice(0, tagIndex), ...newWords, ...s.tags.slice(tagIndex + 1)];
        const newStressedTags = s.stressedTags ? [...s.stressedTags.slice(0, tagIndex), ...newWords.map(() => undefined as unknown as string), ...s.stressedTags.slice(tagIndex + 1)].filter(t => t !== undefined) : undefined;
        return { ...s, tags: newTags, text: newTags.join(' '), stressedTags: newStressedTags, phoneticText: undefined, audioUrl: undefined };
      }
    });
    
    // Update ref BEFORE setSentences so synthesizeAndPlay sees the new value immediately
    sentencesRef.current = newSentences;
    
    setSentences(newSentences);
    setEditingTag(null);
  }, [editingTag]);

  const handleEditTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingTag) {
        const sentenceId = editingTag.sentenceId;
        handleEditTagCommit();
        synthesizeAndPlay(sentenceId);
      }
    } else if (e.key === ' ') {
      e.preventDefault();
      handleEditTagCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingTag(null);
    }
  }, [editingTag, handleEditTagCommit, synthesizeAndPlay]);

  const handleUseVariant = useCallback((variantText: string, selectedSentenceId: string | null, selectedTagIndex: number | null) => {
    if (selectedSentenceId !== null && selectedTagIndex !== null) {
      setSentences(prev => prev.map(s => {
        if (s.id === selectedSentenceId) {
          const newStressedTags = s.stressedTags ? [...s.stressedTags] : [...s.tags];
          newStressedTags[selectedTagIndex] = variantText;
          return { ...s, stressedTags: newStressedTags, phoneticText: newStressedTags.join(' '), audioUrl: undefined };
        }
        return s;
      }));
    }
  }, []);

  const handleSentencePhoneticApply = useCallback((sentenceId: string, newPhoneticText: string) => {
    setSentences(prev => prev.map(s => {
      if (s.id !== sentenceId) return s;
      const newPlainText = stripPhoneticMarkers(newPhoneticText) || '';
      const newTags = newPlainText.trim().split(/\s+/).filter(w => w.length > 0);
      const newStressedTags = newPhoneticText.trim().split(/\s+/).filter(w => w.length > 0);
      return { ...s, text: newPlainText, tags: newTags, phoneticText: newPhoneticText, stressedTags: newStressedTags, audioUrl: undefined };
    }));
  }, []);

  return {
    sentences,
    setSentences,
    isPlayingAll,
    isLoadingPlayAll,
    editingTag,
    openTagMenu,
    setOpenTagMenu,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    handleRemoveSentence,
    handleInputBlur,
    handleKeyDown,
    handlePlay,
    handlePlayAll,
    handleDownload,
    handleDeleteTag,
    handleEditTag,
    handleEditTagChange,
    handleEditTagCommit,
    handleEditTagKeyDown,
    handleUseVariant,
    handleSentencePhoneticApply,
    synthesizeAndPlay,
  };
}
