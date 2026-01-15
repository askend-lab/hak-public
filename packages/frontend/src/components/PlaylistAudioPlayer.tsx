 
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleIcon, PlayIcon, PauseIcon, EditIcon, TrashIcon, SpeedIcon, DownloadIcon } from './ui/Icons';

interface PlaylistAudioPlayerProps { id: string; text: string; stressedText?: string; audioUrl?: string | null; audioBlob?: Blob | null; isPlaying?: boolean; isLoading?: boolean; onPlay?: (id: string) => void; onDelete: (id: string) => void; onEdit?: (id: string) => void; showOptions?: boolean; isDraggable?: boolean; }

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const formatTime = (time: number) => { const m = Math.floor(time / 60), s = Math.floor(time % 60); return `${m}:${s.toString().padStart(2, '0')}`; };

const usePlaylistAudio = (audioUrl: string | null | undefined, audioBlob: Blob | null | undefined, onPlay?: (id: string) => void) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const effectiveAudioUrl = React.useMemo(() => audioBlob ? URL.createObjectURL(audioBlob) : audioUrl, [audioBlob, audioUrl]);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = playbackRate; }, [playbackRate]);
  useEffect(() => () => { if (audioBlob && effectiveAudioUrl && effectiveAudioUrl !== audioUrl) URL.revokeObjectURL(effectiveAudioUrl); }, [audioBlob, effectiveAudioUrl, audioUrl]);
  const handlePlay = (id: string) => { if (onPlay) { onPlay(id); } else if (audioRef.current && effectiveAudioUrl) { internalIsPlaying ? audioRef.current.pause() : audioRef.current.play().catch(e => console.error('Play failed:', e)); } };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { const t = parseFloat(e.target.value); if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); } };
  const cycleSpeed = () => { const idx = playbackRates.indexOf(playbackRate); setPlaybackRate(playbackRates[(idx + 1) % playbackRates.length] ?? 1); };
  return { audioRef, internalIsPlaying, setInternalIsPlaying, currentTime, setCurrentTime, duration, setDuration, playbackRate, effectiveAudioUrl, handlePlay, handleSeek, cycleSpeed };
};

const handleDownload = (url: string | null | undefined, text: string) => { if (!url) return; const link = document.createElement('a'); link.href = url; link.download = `${text.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.wav`; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

export default function PlaylistAudioPlayer({ id, text, stressedText, audioUrl, audioBlob, isPlaying = false, isLoading = false, onPlay, onDelete, onEdit, showOptions = false, isDraggable = false }: PlaylistAudioPlayerProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !isDraggable });
  const { audioRef, internalIsPlaying, setInternalIsPlaying, currentTime, setCurrentTime, duration, setDuration, playbackRate, effectiveAudioUrl, handlePlay, handleSeek, cycleSpeed } = usePlaylistAudio(audioUrl, audioBlob, onPlay);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const displayIsPlaying = onPlay ? isPlaying : internalIsPlaying;
  return (
    <div ref={setNodeRef} style={style} className={`playlist-audio-player ${isDragging ? 'dragging' : ''}`}>
      {isDraggable && <div className="playlist-drag-handle" {...attributes} {...listeners} title="Lohista järjekorra muutmiseks"><DragHandleIcon size="xs" /></div>}
      {effectiveAudioUrl && !onPlay && <audio ref={audioRef} src={effectiveAudioUrl} onPlay={() => setInternalIsPlaying(true)} onPause={() => setInternalIsPlaying(false)} onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)} onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)} onEnded={() => setInternalIsPlaying(false)} className="playlist-audio-player__audio-element" />}
      <div className="playlist-audio-content">
        <div className="playlist-audio-header"><h3 className="playlist-audio-title">{text}</h3>{showOptions && <div className="playlist-audio-actions">{onEdit && <button onClick={() => onEdit(id)} className="playlist-edit-button" title="Muuda"><EditIcon size="md" /></button>}<button onClick={() => onDelete(id)} className="playlist-delete-button" title="Kustuta"><TrashIcon size="md" /></button></div>}</div>
        {stressedText && <div className="playlist-audio-phonetic">{stressedText}</div>}
      </div>
      {effectiveAudioUrl && (
        <div className="playlist-audio-controls">
          <button onClick={() => handlePlay(id)} className="playlist-audio-play-button" title={isLoading ? 'Laen...' : displayIsPlaying ? "Peata" : "Mängi"} disabled={isLoading}>{isLoading ? <div className="playlist-loading-spinner" /> : displayIsPlaying ? <PauseIcon size="2xl" /> : <PlayIcon size="2xl" />}</button>
          <div className="playlist-audio-progress"><span className="playlist-audio-time">{formatTime(currentTime)}</span><input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek} className="playlist-audio-progress-bar" disabled={!duration} /><span className="playlist-audio-time">{formatTime(duration)}</span></div>
          <div className="playlist-audio-secondary-controls"><button onClick={cycleSpeed} className="playlist-audio-speed-button" title="Muuda taasesituse kiirust"><SpeedIcon size="md" /><span className="speed-text">{playbackRate}x</span></button><button onClick={() => handleDownload(effectiveAudioUrl, text)} className="playlist-audio-download-button" title="Laadi alla"><DownloadIcon size="md" /></button></div>
        </div>
      )}
    </div>
  );
}