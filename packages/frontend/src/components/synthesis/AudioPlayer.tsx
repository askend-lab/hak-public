import { useRef, useEffect, useCallback } from 'react';

import { useSynthesisStore } from '../../features';

interface AudioPlayerProps {
  className?: string;
}

export function AudioPlayer({ className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { result, isPlaying, setIsPlaying, setAudioElement } = useSynthesisStore();

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
    return () => { setAudioElement(null); };
  }, [setAudioElement]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => { setIsPlaying(false); };
    const handlePlay = () => { setIsPlaying(true); };
    const handlePause = () => { setIsPlaying(false); };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [setIsPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  }, [isPlaying]);

  if (!result?.audioUrl || result.audioUrl === '') {
    return null;
  }

  return (
    <div className={`audio-player ${className}`}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- audio player for synthesis */}
      <audio ref={audioRef} src={result.audioUrl} preload="auto" />
      <button onClick={togglePlay} className="audio-player__button">
        {isPlaying ? '⏸ Paus' : '▶ Mängi'}
      </button>
      <span className="audio-player__status">
        {result.cached ? '(vahemälust)' : '(uus)'}
      </span>
    </div>
  );
}
