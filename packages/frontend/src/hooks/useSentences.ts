import { useState, useRef, useCallback } from 'react'

import { synthesizeText } from '../services/audio'

interface UseSentencesReturn {
  sentences: string[];
  loadingIndex: number | null;
  isPlayingAll: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  addSentence: () => void;
  updateSentence: (index: number, value: string) => void;
  removeSentence: (index: number) => void;
  playSentence: (index: number) => Promise<void>;
  playAll: () => void;
  stopAll: () => void;
}

export function useSentences(initialSentences: string[] = ['']): UseSentencesReturn {
  const [sentences, setSentences] = useState<string[]>(initialSentences)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const addSentence = useCallback(() => {
    setSentences(prev => [...prev, ''])
  }, [])

  const updateSentence = useCallback((index: number, value: string) => {
    setSentences(prev => {
      const newSentences = [...prev]
      newSentences[index] = value
      return newSentences
    })
  }, [])

  const removeSentence = useCallback((index: number) => {
    setSentences(prev => {
      if (prev.length === 1) {
        return ['']
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const playSentence = useCallback(async (index: number) => {
    const text = sentences[index]?.trim()
    if (!text) return

    setLoadingIndex(index)
    try {
      const { audioUrl } = await synthesizeText(text);
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        void audioRef.current.play()
      }
    } catch (error) {
      console.error('Synthesis failed:', error)
    } finally {
      setLoadingIndex(null)
    }
  }, [sentences])

  const playAll = useCallback(async () => {
    setIsPlayingAll(true);
    const sentencesWithText = sentences.filter(s => s.trim().length > 0);
    for (const sentence of sentencesWithText) {
      const text = sentence.trim();
      try {
        const { audioUrl } = await synthesizeText(text);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
          // Wait for audio to finish before playing next
          await new Promise<void>((resolve): void => {
            if (audioRef.current) {
              audioRef.current.onended = (): void => resolve();
            } else {
              resolve();
            }
          });
        }
      } catch (error) {
        console.error('Synthesis failed:', error);
      }
    }
    setIsPlayingAll(false);
  }, [sentences]);

  const stopAll = useCallback(() => {
    setIsPlayingAll(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    sentences,
    loadingIndex,
    isPlayingAll,
    audioRef,
    addSentence,
    updateSentence,
    removeSentence,
    playSentence,
    playAll,
    stopAll,
  }
}
