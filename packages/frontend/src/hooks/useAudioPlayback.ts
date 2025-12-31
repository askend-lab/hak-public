import { useState, useRef, useCallback } from 'react'

import { synthesizeText, playAudio } from '../services/audio'

interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  isLoading: boolean;
  currentId: string | null;
  loadingId: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (text: string, id?: string) => Promise<void>;
  playFromUrl: (url: string, id?: string) => Promise<void>;
  stop: () => void;
  playSequence: (items: Array<{ id: string; text: string; cachedUrl?: string | null }>) => Promise<void>;
  stopSequence: () => void;
  isPlayingSequence: boolean;
}

export function useAudioPlayback(): UseAudioPlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef<boolean>(false)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentId(null)
    setLoadingId(null)
  }, [])

  const playFromUrl = useCallback(async (url: string, id?: string): Promise<void> => {
    stop()
    
    setCurrentId(id ?? null)
    setIsPlaying(true)
    
    const audio = new Audio(url)
    audioRef.current = audio
    
    return new Promise((resolve, reject) => {
      audio.onended = (): void => {
        setIsPlaying(false)
        setCurrentId(null)
        resolve()
      }
      
      audio.onerror = (): void => {
        setIsPlaying(false)
        setCurrentId(null)
        reject(new Error('Audio playback failed'))
      }
      
      const playPromise = audio.play()
      if (playPromise) {
        playPromise.catch(reject)
      }
    })
  }, [stop])

  const play = useCallback(async (text: string, id?: string): Promise<void> => {
    if (!text.trim()) return
    
    stop()
    setLoadingId(id ?? null)
    setIsLoading(true)
    
    try {
      const result = await synthesizeText(text)
      setIsLoading(false)
      setLoadingId(null)
      await playFromUrl(result.audioUrl, id)
    } catch {
      setIsLoading(false)
      setLoadingId(null)
      setIsPlaying(false)
      setCurrentId(null)
    }
  }, [stop, playFromUrl])

  const stopSequence = useCallback(() => {
    abortRef.current = true
    stop()
    setIsPlayingSequence(false)
  }, [stop])

  const playSequence = useCallback(async (
    items: Array<{ id: string; text: string; cachedUrl?: string | null }>
  ): Promise<void> => {
    if (items.length === 0) return
    
    abortRef.current = false
    setIsPlayingSequence(true)
    
    for (const item of items) {
      if (abortRef.current) break
      
      try {
        if (item.cachedUrl) {
          setCurrentId(item.id)
          await playFromUrl(item.cachedUrl, item.id)
        } else {
          setLoadingId(item.id)
          setIsLoading(true)
          const result = await synthesizeText(item.text)
          setIsLoading(false)
          setLoadingId(null)
          
          if (abortRef.current) break
          
          setCurrentId(item.id)
          await playAudio(result.audioUrl)
          setCurrentId(null)
        }
      } catch {
        setIsLoading(false)
        setLoadingId(null)
        setCurrentId(null)
      }
    }
    
    setIsPlayingSequence(false)
    setCurrentId(null)
  }, [playFromUrl])

  return {
    isPlaying,
    isLoading,
    currentId,
    loadingId,
    audioRef,
    play,
    playFromUrl,
    stop,
    playSequence,
    stopSequence,
    isPlayingSequence,
  }
}
