import { useState, useCallback } from 'react';
import { SentenceState, getVoiceModel } from '@/types/synthesis';
import { synthesizeWithPolling } from '@/utils/synthesize';
import { analyzeTextOrThrow } from '@/utils/analyzeApi';

export interface UseSynthesisPlaybackReturn {
  currentAudio: HTMLAudioElement | null;
  setCurrentAudio: React.Dispatch<React.SetStateAction<HTMLAudioElement | null>>;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  playSingleSentence: (id: string, abortSignal?: AbortSignal, retryCount?: number) => Promise<boolean>;
  synthesizeAndPlay: (id: string) => Promise<void>;
  synthesizeWithText: (id: string, text: string) => Promise<void>;
  handlePlayAll: () => Promise<void>;
  handlePlay: (id: string) => void;
  handleDownload: (id: string) => Promise<void>;
}

// eslint-disable-next-line max-lines-per-function
export function useSynthesisPlayback(
  sentences: SentenceState[],
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>,
  sentencesRef: React.MutableRefObject<SentenceState[]>
): UseSynthesisPlaybackReturn {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] = useState<AbortController | null>(null);

  // eslint-disable-next-line max-lines-per-function
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
      } catch (error) { console.error('Failed to synthesize audio:', error); return false; }
    }
    if (abortSignal?.aborted) return false;
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: true } : { ...s, isPlaying: false }));
      const cleanup = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s)); setCurrentAudio(null); };
      audio.onended = (): void => { cleanup(); resolve(true); };
      audio.onerror = (): void => {
        cleanup();
        if (retryCount === 0 && sentence.audioUrl) {
          setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s));
          setTimeout(async () => { resolve(await playSingleSentence(id, abortSignal, 1)); }, 100);
        } else { resolve(false); }
      };
      if (abortSignal) { abortSignal.addEventListener('abort', () => { audio.pause(); cleanup(); resolve(false); }); }
      audio.play().catch(() => {
        cleanup();
        if (retryCount === 0 && sentence.audioUrl) {
          setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s));
          setTimeout(async () => { resolve(await playSingleSentence(id, abortSignal, 1)); }, 100);
        } else { resolve(false); }
      });
    });
  }, [sentences, setSentences]);

  // eslint-disable-next-line max-lines-per-function
  const synthesizeAndPlay = useCallback(async (id: string): Promise<void> => {
    const sentence = sentencesRef.current.find(s => s.id === id);
    if (!sentence?.text.trim()) return;
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ''; setCurrentAudio(null); }
    if (sentence.audioUrl && sentence.phoneticText) {
      try {
        setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : { ...s, isPlaying: false }));
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
      } catch { setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s)); }
    }
    setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: true, isPlaying: false } : { ...s, isPlaying: false }));
    try {
      let phoneticText: string;
      let newStressedTags: string[] | undefined;
      if (sentence.phoneticText) { phoneticText = sentence.phoneticText; }
      else { phoneticText = await analyzeTextOrThrow(sentence.text); newStressedTags = phoneticText.trim().split(/\s+/).filter((w: string) => w.length > 0); }
      const audioUrl = await synthesizeWithPolling(phoneticText, getVoiceModel(phoneticText));
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      audio.onloadeddata = (): void => setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: true, phoneticText: phoneticText || undefined, audioUrl, stressedTags: newStressedTags && newStressedTags.length === s.tags.length ? newStressedTags : s.stressedTags } : s));
      audio.onended = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s)); setCurrentAudio(null); };
      audio.onerror = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s)); setCurrentAudio(null); };
      await audio.play();
    } catch (error) { console.error('Failed to synthesize:', error); setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s)); }
  }, [currentAudio, sentencesRef, setSentences]);

  // eslint-disable-next-line max-lines-per-function
  const synthesizeWithText = useCallback(async (id: string, text: string): Promise<void> => {
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
      } catch { setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl: undefined, phoneticText: undefined } : s)); }
    }
    setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: true, isPlaying: false } : { ...s, isPlaying: false }));
    try {
      let phoneticText: string;
      let newStressedTags: string[] | undefined;
      if (sentence?.phoneticText) { phoneticText = sentence.phoneticText; }
      else { phoneticText = await analyzeTextOrThrow(text); newStressedTags = phoneticText.trim().split(/\s+/).filter((w: string) => w.length > 0); }
      const audioUrl = await synthesizeWithPolling(phoneticText, getVoiceModel(phoneticText));
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      audio.onloadeddata = (): void => setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: true, phoneticText: phoneticText || undefined, audioUrl, stressedTags: newStressedTags && newStressedTags.length === s.tags.length ? newStressedTags : s.stressedTags } : s));
      audio.onended = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isPlaying: false } : s)); setCurrentAudio(null); };
      audio.onerror = (): void => { setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s)); setCurrentAudio(null); };
      await audio.play();
    } catch (error) { console.error('Failed to synthesize:', error); setSentences(prev => prev.map(s => s.id === id ? { ...s, isLoading: false, isPlaying: false } : s)); }
  }, [sentences, currentAudio, setSentences]);

  const handlePlayAll = useCallback(async (): Promise<void> => {
    if (isPlayingAll || isLoadingPlayAll) {
      playAllAbortController?.abort(); setPlayAllAbortController(null); setIsPlayingAll(false); setIsLoadingPlayAll(false);
      if (currentAudio) { currentAudio.pause(); currentAudio.src = ''; setCurrentAudio(null); }
      setSentences(prev => prev.map(s => ({ ...s, isPlaying: false, isLoading: false }))); return;
    }
    const sentencesWithText = sentences.filter(s => s.text.trim());
    if (sentencesWithText.length === 0) return;
    const abortController = new AbortController();
    setPlayAllAbortController(abortController); setIsLoadingPlayAll(true);
    let isFirstSentence = true;
    for (const sentence of sentencesWithText) {
      if (abortController.signal.aborted) break;
      const success = await playSingleSentence(sentence.id, abortController.signal);
      if (isFirstSentence && success) { setIsLoadingPlayAll(false); setIsPlayingAll(true); isFirstSentence = false; }
      if (!success || abortController.signal.aborted) break;
    }
    setIsPlayingAll(false); setIsLoadingPlayAll(false); setPlayAllAbortController(null);
  }, [isPlayingAll, isLoadingPlayAll, playAllAbortController, currentAudio, sentences, playSingleSentence, setSentences]);

  const handlePlay = useCallback((id: string): void => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence) return;
    if (sentence.currentInput.trim()) {
      const inputWords = sentence.currentInput.trim().split(/\s+/).filter(word => word.length > 0);
      const allTags = [...sentence.tags, ...inputWords];
      const fullText = allTags.join(' ');
      setSentences(prev => prev.map(s => s.id === id ? { ...s, tags: allTags, currentInput: '', text: fullText, phoneticText: undefined, audioUrl: undefined } : s));
      synthesizeWithText(id, fullText);
    } else if (sentence.tags.length > 0) { synthesizeAndPlay(id); }
  }, [sentences, synthesizeAndPlay, synthesizeWithText, setSentences]);

  const handleDownload = useCallback(async (id: string): Promise<void> => {
    const sentence = sentences.find(s => s.id === id);
    if (!sentence) return;
    let audioUrl = sentence.audioUrl;
    if (!audioUrl) {
      try { audioUrl = await synthesizeWithPolling(sentence.text, getVoiceModel(sentence.text)); setSentences(prev => prev.map(s => s.id === id ? { ...s, audioUrl } : s)); }
      catch (error) { console.error('Failed to generate audio:', error); return; }
    }
    if (!audioUrl) return;
    try {
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = `${sentence.text || 'audio'}.wav`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) { console.error('Failed to download audio:', error); }
  }, [sentences, setSentences]);

  return { currentAudio, setCurrentAudio, isPlayingAll, isLoadingPlayAll, playSingleSentence, synthesizeAndPlay, synthesizeWithText, handlePlayAll, handlePlay, handleDownload };
}
