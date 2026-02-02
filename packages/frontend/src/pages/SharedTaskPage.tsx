import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataService } from '@/services/dataService';
import { Task } from '@/types/task';
import { useNotification } from '@/contexts/NotificationContext';
import { useSharedTaskAudio } from '@/hooks/useSharedTaskAudio';
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

  const {
    currentPlayingId,
    currentLoadingId,
    isPlayingAll,
    isLoadingPlayAll,
    handlePlayEntry,
    handlePlayAll,
  } = useSharedTaskAudio();

  useEffect(() => {
    async function loadTask(): Promise<void> {
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

  const entries = task?.entries || [];

  const onPlayEntry = useCallback((id: string) => {
    handlePlayEntry(id, entries);
  }, [handlePlayEntry, entries]);

  const onPlayAll = useCallback(async () => {
    await handlePlayAll(entries);
  }, [handlePlayAll, entries]);

  const handleCopyToPlaylist = (): void => {
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
              onClick={onPlayAll}
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
                  onPlay={onPlayEntry}
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
