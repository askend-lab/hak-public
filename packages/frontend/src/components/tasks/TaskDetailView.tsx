import { useState, useRef } from 'react';

import { SentenceListItem } from '../ui';
import { API_CONFIG } from '../../services/config';
import { synthesizeText, playAudio } from '../../services/audio';
import type { Task, TaskEntry } from '../../services/tasks';

interface TaskDetailViewProps {
  task: Task;
  onBack: () => void;
}

export function TaskDetailView({ task, onBack }: TaskDetailViewProps) {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentLoadingId, setCurrentLoadingId] = useState<string | null>(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playAllAbortRef = useRef<boolean>(false);

  const getAudioUrl = (entry: TaskEntry): string | null => {
    const hash = entry.synthesis.audioHash;
    if (hash && hash !== 'h1' && hash !== 'h2' && hash !== 'h3') {
      return `${API_CONFIG.audioBucketUrl}/cache/${hash}.mp3`;
    }
    return null;
  };

  const synthesizeAndPlay = async (entry: TaskEntry): Promise<void> => {
    setCurrentLoadingId(entry.id);
    try {
      const textToSynthesize = entry.synthesis.phoneticText || entry.synthesis.originalText;
      const result = await synthesizeText(textToSynthesize);
      setCurrentLoadingId(null);
      setCurrentPlayingId(entry.id);
      
      const audio = new Audio(result.audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setCurrentPlayingId(null);
      };
      
      audio.onerror = () => {
        setCurrentPlayingId(null);
      };
      
      await playAudio(result.audioUrl);
      setCurrentPlayingId(null);
    } catch {
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
    }
  };

  const handlePlayEntry = async (entryId: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (currentPlayingId === entryId) {
      setCurrentPlayingId(null);
      return;
    }

    const entry = task.entries.find(e => e.id === entryId);
    if (!entry) return;

    const cachedUrl = getAudioUrl(entry);
    
    if (cachedUrl) {
      setCurrentPlayingId(entryId);
      const audio = new Audio(cachedUrl);
      audioRef.current = audio;
      
      audio.onended = () => setCurrentPlayingId(null);
      audio.onerror = () => {
        // Fallback to synthesis if cached audio fails
        void synthesizeAndPlay(entry);
      };
      
      try {
        await audio.play();
      } catch {
        void synthesizeAndPlay(entry);
      }
    } else {
      await synthesizeAndPlay(entry);
    }
  };

  const handlePlayAll = async () => {
    if (isPlayingAll) {
      playAllAbortRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAll(false);
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
      return;
    }

    if (task.entries.length === 0) return;

    playAllAbortRef.current = false;
    setIsPlayingAll(true);

    for (const entry of task.entries) {
      if (playAllAbortRef.current) break;
      
      await new Promise<void>((resolve) => {
        const playEntry = async () => {
          const cachedUrl = getAudioUrl(entry);
          
          if (cachedUrl) {
            setCurrentPlayingId(entry.id);
            const audio = new Audio(cachedUrl);
            audioRef.current = audio;
            audio.onended = () => { setCurrentPlayingId(null); resolve(); };
            audio.onerror = () => { setCurrentPlayingId(null); resolve(); };
            try { await audio.play(); } catch { resolve(); }
          } else {
            setCurrentLoadingId(entry.id);
            try {
              const textToSynthesize = entry.synthesis.phoneticText || entry.synthesis.originalText;
              const result = await synthesizeText(textToSynthesize);
              setCurrentLoadingId(null);
              setCurrentPlayingId(entry.id);
              await playAudio(result.audioUrl);
              setCurrentPlayingId(null);
              resolve();
            } catch { setCurrentLoadingId(null); resolve(); }
          }
        };
        void playEntry();
      });
    }

    setIsPlayingAll(false);
    setCurrentPlayingId(null);
  };


  return (
    <div className="task-detail-view">
      <div className="task-detail-hero">
        <div className="task-detail-hero-header">
          <button onClick={onBack} className="task-back-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            <span>Tagasi</span>
          </button>
        </div>
        
        <div className="task-detail-info">
          <div>
            <h1 className="task-detail-title">{task.name}</h1>
            {task.description && (
              <p className="task-detail-description">{task.description}</p>
            )}
          </div>
          
          {task.entries.length > 0 && (
            <div className="task-detail-hero-actions">
              <button className="btn-secondary">
                <span>Jaga</span>
              </button>
              <button onClick={handlePlayAll} className="btn-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isPlayingAll ? (
                    <>
                      <rect x="7" y="6" width="3" height="12" fill="currentColor" rx="1" />
                      <rect x="14" y="6" width="3" height="12" fill="currentColor" rx="1" />
                    </>
                  ) : (
                    <path d="M8.31445 6.5C8.32533 6.49867 8.38306 6.49567 8.56055 6.56641C8.73719 6.63681 8.96582 6.75129 9.30957 6.9248L17.958 11.291C17.9608 11.2924 17.964 11.2936 17.9668 11.2949C18.343 11.4848 18.5952 11.6131 18.7715 11.7227C18.9298 11.8211 18.9662 11.8696 18.9707 11.876C19.0093 11.9553 19.0094 12.0447 18.9707 12.124C18.9655 12.1314 18.9276 12.1805 18.7705 12.2783C18.593 12.3887 18.3379 12.5182 17.958 12.71L9.30957 17.0752C8.96567 17.2488 8.73701 17.3634 8.56055 17.4336C8.38339 17.5041 8.32566 17.5014 8.31445 17.5C8.20475 17.4865 8.11413 17.431 8.05957 17.3584C8.0567 17.3539 8.0328 17.3114 8.01758 17.1543C8.00046 16.9776 8 16.7364 8 16.3662V7.63477C8 7.26444 8.00045 7.02263 8.01758 6.8457C8.03473 6.66887 8.06291 6.63716 8.05957 6.6416C8.11415 6.56897 8.20478 6.51347 8.31445 6.5Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
                {isPlayingAll ? 'Peata' : 'Mängi kõik'}
              </button>
              <div className="menu-container">
                <button
                  className="menu-button"
                  aria-label="Rohkem valikuid"
                  onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {isHeaderMenuOpen && (
                  <>
                    <div className="menu-backdrop" onClick={() => setIsHeaderMenuOpen(false)} />
                    <div className="dropdown-menu">
                      <button className="menu-item" onClick={() => setIsHeaderMenuOpen(false)}>
                        <div className="menu-item-content">Muuda</div>
                      </button>
                      <button className="menu-item menu-item-danger" onClick={() => setIsHeaderMenuOpen(false)}>
                        <div className="menu-item-content">Kustuta</div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="task-detail-entries">
        {task.entries.length === 0 ? (
          <div className="task-entries-empty">
            <div className="task-entries-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <h4 className="task-entries-empty-title">Ülesandel pole veel lausungeid</h4>
            <p className="task-entries-empty-description">
              Alusta lausungite lisamist, et luua harjutusi häälduseõppimiseks
            </p>
            <button className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Lisa lausung</span>
            </button>
          </div>
        ) : (
          <div className="task-entries-list">
            {task.entries.map((entry, index) => (
              <SentenceListItem
                key={entry.id}
                index={index}
                onPlay={() => { void handlePlayEntry(entry.id); }}
                isActive={true}
                isLoading={currentLoadingId === entry.id}
                isPlaying={currentPlayingId === entry.id}
                isLast={index === task.entries.length - 1}
                actions={<MoreButton />}
              >
                <div className="sentence-list-item__content">
                  <span className="sentence-list-item__text">{entry.synthesis.originalText}</span>
                </div>
              </SentenceListItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MoreButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleBlur = (e: React.FocusEvent): void => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="more-menu" onBlur={handleBlur}>
      <button onClick={() => setIsOpen(!isOpen)} className="more-menu__trigger">⋯</button>
      {isOpen && (
        <div role="menu" className="more-menu__dropdown">
          <button role="menuitem" className="more-menu__item">Lae alla</button>
          <button role="menuitem" className="more-menu__item more-menu__item--danger" onClick={() => setIsOpen(false)}>Eemalda</button>
        </div>
      )}
    </div>
  );
}
