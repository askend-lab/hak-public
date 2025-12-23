import { useState, useRef, useCallback } from 'react'

import { synthesizeText } from '../services/audio'

export function useSentences(initialSentences: string[] = ['']) {
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
    if (!text?.trim()) return

    setLoadingIndex(index)
    try {
      const result = await synthesizeText(text)
      if (audioRef.current) {
        audioRef.current.src = result.audioUrl
        void audioRef.current.play()
      }
    } catch (err) {
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
