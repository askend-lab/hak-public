import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataService } from '@/services/dataService';
import { Task, TaskEntry } from '@/types/task';
import { useNotification } from '@/contexts/NotificationContext';
import { synthesizeWithPolling } from '@/utils/synthesize';
import { getVoiceModel } from '@/types/synthesis';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';
import SentenceSynthesisItem from '@/components/SentenceSynthesisItem';
import { PlayAllButton } from '@/components/ui/PlayAllButton';

export function SharedTaskPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio playback state
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentLoadingId, setCurrentLoadingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] = useState<AbortController | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Load task by share token
  useEffect(() => {
    async function loadTask() {
      if (!token) {
        setError('Token puudub');
        setIsLoading(false);
        return;
      }

      try {
        const dataService = DataService.getInstance();
        const foundTask = await dataService.getTaskByShareToken(token);
        
        if (foundTask) {
          setTask(foundTask);
        } else {
          setError('Ülesannet ei leitud');
        }
      } catch (err) {
        console.error('Failed to load shared task:', err);
        setError('Viga ülesande laadimisel');
      } finally {
        setIsLoading(false);
      }
    }

    loadTask();
  }, [token]);

  // Synthesize and play audio
  const synthesizeAndPlay = useCallback(async (stressedText: string, originalText: string, id: string) => {
    setCurrentLoadingId(id);
    setCurrentPlayingId(null);

    try {
      const audioUrl = await synthesizeWithPolling(stressedText, getVoiceModel(originalText));
      const audio = new Audio(audioUrl);
      
      audio.onloadeddata = () => {
        setCurrentLoadingId(null);
        setCurrentPlayingId(id);
      };
      
      audio.onended = () => {
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch {
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
    }
  }, []);

  // Play single entry
  const handlePlayEntry = useCallback((id: string) => {
    if (!task?.entries) return;
    const entry = task.entries.find(e => e.id === id);
    if (!entry) return;

    if ((entry.audioBlob && entry.audioBlob.size > 0) || (entry.audioUrl && entry.audioUrl.trim() !== '')) {
      setCurrentPlayingId(id);
      const playUrl = entry.audioBlob ? URL.createObjectURL(entry.audioBlob) : entry.audioUrl;
      if (playUrl) {
        const audio = new Audio(playUrl);
        audio.onended = () => {
          setCurrentPlayingId(null);
          if (entry.audioBlob && playUrl !== entry.audioUrl) URL.revokeObjectURL(playUrl);
        };
        audio.onerror = () => {
          if (entry.audioBlob && playUrl !== entry.audioUrl) URL.revokeObjectURL(playUrl);
          synthesizeAndPlay(entry.stressedText, entry.text, id);
        };
        audio.play().catch(() => {
          if (entry.audioBlob && playUrl !== entry.audioUrl) URL.revokeObjectURL(playUrl);
          synthesizeAndPlay(entry.stressedText, entry.text, id);
        });
      }
    } else {
      synthesizeAndPlay(entry.stressedText, entry.text, id);
    }
  }, [task?.entries, synthesizeAndPlay]);

  // Play single entry for sequential playback
  const playSingleEntry = useCallback(async (entry: TaskEntry, abortSignal: AbortSignal): Promise<boolean> => {
    if (abortSignal.aborted) return false;

    let audioUrl: string | null = null;
    let shouldRevokeUrl = false;

    try {
      if (entry.audioBlob && entry.audioBlob.size > 0) {
        audioUrl = URL.createObjectURL(entry.audioBlob);
        shouldRevokeUrl = true;
      } else if (entry.audioUrl && entry.audioUrl.trim() !== '') {
        audioUrl = entry.audioUrl;
      } else {
        setCurrentLoadingId(entry.id);
        try {
          audioUrl = await synthesizeWithPolling(entry.stressedText, getVoiceModel(entry.text));
          if (abortSignal.aborted) {
            setCurrentLoadingId(null);
            return false;
          }
        } catch {
          setCurrentLoadingId(null);
          return false;
        }
      }

      if (!audioUrl || abortSignal.aborted) return false;

      return new Promise((resolve) => {
        const audio = new Audio(audioUrl!);
        setCurrentAudio(audio);

        const cleanup = () => {
          setCurrentPlayingId(null);
          setCurrentLoadingId(null);
          setCurrentAudio(null);
          if (shouldRevokeUrl && audioUrl) URL.revokeObjectURL(audioUrl);
        };

        audio.onloadeddata = () => {
          setCurrentLoadingId(null);
          setCurrentPlayingId(entry.id);
        };

        audio.onended = () => { cleanup(); resolve(true); };
        audio.onerror = () => { cleanup(); resolve(false); };

        abortSignal.addEventListener('abort', () => {
          audio.pause();
          audio.src = '';
          cleanup();
          resolve(false);
        });

        audio.play().catch(() => { cleanup(); resolve(false); });
      });
    } catch {
      setCurrentLoadingId(null);
      setCurrentPlayingId(null);
      if (shouldRevokeUrl && audioUrl) URL.revokeObjectURL(audioUrl);
      return false;
    }
  }, []);

  // Play all entries sequentially
  const handlePlayAll = useCallback(async () => {
    if (!task?.entries) return;

    if (isPlayingAll || isLoadingPlayAll) {
      playAllAbortController?.abort();
      setPlayAllAbortController(null);
      setIsPlayingAll(false);
      setIsLoadingPlayAll(false);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        setCurrentAudio(null);
      }
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
      return;
    }

    if (task.entries.length === 0) return;

    const abortController = new AbortController();
    setPlayAllAbortController(abortController);
    setIsLoadingPlayAll(true);

    let isFirstEntry = true;
    for (const entry of task.entries) {
      if (abortController.signal.aborted) break;

      const success = await playSingleEntry(entry, abortController.signal);
      
      if (isFirstEntry && success) {
        setIsLoadingPlayAll(false);
        setIsPlayingAll(true);
        isFirstEntry = false;
      }
      
      if (!success || abortController.signal.aborted) break;
    }

    setIsPlayingAll(false);
    setIsLoadingPlayAll(false);
    setPlayAllAbortController(null);
    setCurrentPlayingId(null);
    setCurrentLoadingId(null);
  }, [task?.entries, isPlayingAll, isLoadingPlayAll, playAllAbortController, currentAudio, playSingleEntry]);

  // Copy entries to playlist and navigate to synthesis
  const handleCopyToPlaylist = () => {
    if (!task?.entries) return;
    
    sessionStorage.setItem('copiedEntries', JSON.stringify(task.entries));
    showNotification('success', 'Laused kopeeritud!');
    navigate('/synthesis');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="shared-task-loading">
        <div className="loading-spinner" />
        <p>Laadimine...</p>
      </div>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <div className="shared-task-error">
        <h2>{error || 'Ülesannet ei leitud'}</h2>
        <p>Kontrolli, kas jagamislink on õige.</p>
      </div>
    );
  }

  const entries = task.entries || [];

  return (
    <div className="page-layout">
      <AppHeader 
        isAuthenticated={false}
        user={null}
        onTasksClick={() => {}}
        onHelpClick={() => {}}
        onLoginClick={() => { navigate('/'); }}
      />
      
      <main className="page-layout__main">
        <div className="page-header page-header--full">
          <div className="page-header__content">
            <h1 className="page-header__title">{task.name || 'Ülesande nimi'}</h1>
            <p className="page-header__description">
              {task.description || 'Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante'}
            </p>
          </div>
          <div className="page-header__actions">
            <PlayAllButton
              isPlaying={isPlayingAll}
              isLoading={isLoadingPlayAll}
              disabled={entries.length === 0}
              onClick={handlePlayAll}
            />
          </div>
        </div>
        
        <div className="page-content">
          <div className="shared-task-info-banner shared-task-info-banner--inline">
            <div className="shared-task-info-banner-content">
              <div className="shared-task-info-banner-text">
                <div className="shared-task-info-banner-title">Jagatud ülesanne</div>
                <div className="shared-task-info-banner-description">
                  Kopeeri laused, et neid muuta ja uusi versioone luua.
                </div>
              </div>
              <button 
                className="button button--secondary"
                onClick={handleCopyToPlaylist}
                disabled={entries.length === 0}
              >
                Kopeeri
              </button>
            </div>
          </div>

          <div className="shared-task-entries">
            {entries.length === 0 ? (
              <div className="shared-entries-empty">
                <p className="shared-entries-empty-description">
                  See ülesanne ei sisalda ühtegi lauset.
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <SentenceSynthesisItem
                  key={entry.id}
                  id={entry.id}
                  text={entry.text}
                  mode="readonly"
                  isPlaying={currentPlayingId === entry.id}
                  isLoading={currentLoadingId === entry.id}
                  onPlay={handlePlayEntry}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="page-layout__footer page-footer--full">
        <Footer />
      </footer>
    </div>
  );
}
