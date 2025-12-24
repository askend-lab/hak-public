import { useState, useRef, useCallback } from 'react'

import { synthesizeText } from '../services/audio'

interface UseSentencesReturn {
  sentences: string[];
  loadingIndex: number | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  addSentence: () => void;
  updateSentence: (index: number, value: string) => void;
  playSentence: (index: number) => Promise<void>;
}

export function useSentences(initialSentences: string[] = ['']): UseSentencesReturn {
  const [sentences, setSentences] = useState<string[]>(initialSentences)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
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

  const playSentence = useCallback(async (index: number) => {
    const text = sentences[index]
    if (text === undefined || text.trim() === '') return

    setLoadingIndex(index)
    try {
      const result = await synthesizeText(text);
      if (audioRef.current !== null) {
        audioRef.current.src = result.audioUrl
        void audioRef.current.play()
      }
    } catch (err) {
      // TODO: Add proper logger
      console.error('Synthesis failed:', err)
    } finally {
      setLoadingIndex(null)
    }
  }, [sentences])

  return {
    sentences,
    loadingIndex,
    audioRef,
    addSentence,
    updateSentence,
    playSentence,
  }
}

export default useSentences
