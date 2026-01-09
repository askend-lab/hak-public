'use client';

import { useRef, useEffect, useState } from 'react';
import { PlayIcon, PauseIcon, SpeedIcon, DownloadIcon, PlusCircleIcon, DocumentPlusIcon } from './ui/Icons';

interface AudioPlayerProps { audioUrl: string | null; autoPlay?: boolean; text?: string; isLoading?: boolean; onAddToPlaylist?: () => void; onAddToTask?: () => void; canAddToPlaylist?: boolean; canAddToTask?: boolean; }

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

const useAudioPlayer = (audioUrl: string | null, autoPlay: boolean) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  useEffect(() => { if (audioUrl && audioRef.current && autoPlay) audioRef.current.play().catch(e => console.error('Auto-play failed:', e)); }, [audioUrl, autoPlay]);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = playbackRate; }, [playbackRate]);
  const handlePlay = () => { if (audioRef.current) { isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(e => console.error('Play failed:', e)); } };
  const cycleSpeed = () => { const idx = playbackRates.indexOf(playbackRate); setPlaybackRate(playbackRates[(idx + 1) % playbackRates.length] ?? 1); };
  return { audioRef, isPlaying, setIsPlaying, playbackRate, handlePlay, cycleSpeed };
};

const handleDownload = (audioUrl: string | null, text?: string) => {
  if (!audioUrl) return;
  const link = document.createElement('a'); link.href = audioUrl;
  link.download = text ? `${text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.wav` : 'audio.wav';
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

// eslint-disable-next-line complexity
export default function AudioPlayer({ audioUrl, autoPlay = false, text, isLoading = false, onAddToPlaylist, onAddToTask, canAddToPlaylist = false, canAddToTask = false }: AudioPlayerProps) {
  const { audioRef, isPlaying, setIsPlaying, playbackRate, handlePlay, cycleSpeed } = useAudioPlayer(audioUrl, autoPlay);
  if (!audioUrl && !isLoading && !text) return <div className="audio-placeholder">Audio puudub. Sisesta tekst, et genereerida audio.</div>;
  const disabled = isLoading || !audioUrl;
  return (
    <div className="playlist-audio-player">
      {audioUrl && <audio ref={audioRef} src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} className="audio-player__audio-element" />}
      <div className="playlist-audio-controls">
        <button onClick={handlePlay} className={`playlist-audio-play-button ${isLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`} title={isLoading ? 'Laen...' : isPlaying ? "Peata" : "Mängi"} disabled={disabled}>{isLoading ? <div className="playlist-loading-spinner" /> : isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
        {text && <div className="playlist-audio-content-inline"><span className="playlist-audio-title-inline">{text}</span></div>}
        <div className="playlist-audio-secondary-controls">
          <button onClick={cycleSpeed} className="playlist-audio-speed-button" title="Muuda taasesituse kiirust" disabled={disabled}><SpeedIcon /><span className="speed-text">{playbackRate}x</span></button>
          <button onClick={() => handleDownload(audioUrl, text)} className="playlist-audio-download-button" title="Laadi alla" disabled={disabled}><DownloadIcon /></button>
        </div>
      </div>
      {(onAddToPlaylist || onAddToTask) && (audioUrl || text) && (
        <div className="audio-player-actions">
          {onAddToPlaylist && <button onClick={onAddToPlaylist} disabled={!canAddToPlaylist || isLoading} className="phonetic-add-button-secondary"><PlusCircleIcon /><span>Lisa kõnevooru</span></button>}
          {onAddToTask && <button onClick={onAddToTask} disabled={!canAddToTask || isLoading} className="phonetic-add-button-secondary"><DocumentPlusIcon /><span>Lisa ülesandesse</span></button>}
        </div>
      )}
    </div>
  );
}
