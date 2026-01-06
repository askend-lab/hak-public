import { useState, useRef, useCallback } from 'react'

import { logger } from '../core'
import { synthesizeText } from '../services/audio'

export interface Sentence {
  id: string;
  text: string;
}

let sentenceIdCounter = 0;
function generateId(): string {
  return `sentence-${Date.now()}-${++sentenceIdCounter}`;
}

function createSentence(text: string): Sentence {
  return { id: generateId(), text };
}

interface UseSentencesReturn {
  sentences: Sentence[];
  loadingIndex: number | null;
  isPlayingAll: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  addSentence: () => void;
  updateSentence: (index: number, value: string) => void;
  removeSentence: (index: number) => void;
  reorderSentences: (fromIndex: number, toIndex: number) => void;
  playSentence: (index: number) => Promise<void>;
  playAll: () => void;
  stopAll: () => void;
}

export function useSentences(initialTexts: string[] = ['']): UseSentencesReturn {
  const [sentences, setSentences] = useState<Sentence[]>(() => 
    initialTexts.map(text => createSentence(text))
  )
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const addSentence = useCallback(() => {
    setSentences(prev => [...prev, createSentence('')])
  }, [])

  const updateSentence = useCallback((index: number, value: string) => {
    setSentences(prev => {
      const newSentences = [...prev]
      const sentence = newSentences[index]
      if (sentence) {
        newSentences[index] = { ...sentence, text: value }
      }
      return newSentences
    })
  }, [])

  const removeSentence = useCallback((index: number) => {
    setSentences(prev => {
      if (prev.length === 1) {
        return [createSentence('')]
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const reorderSentences = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setSentences(prev => {
      const result = [...prev]
      const [removed] = result.splice(fromIndex, 1)
      if (removed !== undefined) {
        result.splice(toIndex, 0, removed)
      }
      return result
    })
  }, [])

  const playSentence = useCallback(async (index: number) => {
    const text = sentences[index]?.text.trim()
    if (!text) return

    setLoadingIndex(index)
    try {
      const { audioUrl } = await synthesizeText(text);
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        void audioRef.current.play()
      }
    } catch (error) {
      logger.error('Synthesis failed:', error)
    } finally {
      setLoadingIndex(null)
    }
  }, [sentences])

  const playAll = useCallback(async () => {
    setIsPlayingAll(true);
    const sentencesWithText = sentences.filter(s => s.text.trim().length > 0);
    for (const sentence of sentencesWithText) {
      const text = sentence.text.trim();
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
        logger.error('Synthesis failed:', error);
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
    reorderSentences,
    playSentence,
    playAll,
    stopAll,
  }
}
