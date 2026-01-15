import { useState, useCallback } from 'react';
import { SentenceState } from '@/types/synthesis';

export function usePlaylistControl(
  sentences: SentenceState[],
  playSingle: (id: string, abortSignal?: AbortSignal) => Promise<boolean>,
  stopAudio: () => void,
  updateAllSentences: (updates: Partial<SentenceState>) => void
): {
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayAll: () => Promise<void>;
} {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] = useState<AbortController | null>(null);

  const handlePlayAll = useCallback(async () => {
    if (isPlayingAll || isLoadingPlayAll) {
      playAllAbortController?.abort();
      setPlayAllAbortController(null);
      setIsPlayingAll(false);
      setIsLoadingPlayAll(false);
      stopAudio();
      updateAllSentences({ isPlaying: false, isLoading: false });
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
      
      const success = await playSingle(sentence.id, abortController.signal);
      
      if (isFirstSentence && success) {
        setIsLoadingPlayAll(false);
        setIsPlayingAll(true);
        isFirstSentence = false;
      }
      
      if (!success || abortController.signal.aborted) break;
    }

    setIsPlayingAll(false);
    setIsLoadingPlayAll(false);
    setPlayAllAbortController(null);
  }, [isPlayingAll, isLoadingPlayAll, playAllAbortController, sentences, playSingle, stopAudio, updateAllSentences]);

  return {
    isPlayingAll,
    isLoadingPlayAll,
    handlePlayAll
  };
}
