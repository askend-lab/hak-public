import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataService } from '@/services/dataService';
import { Task } from '@/types/task';
import Footer from '@/components/Footer';
import { useNotification } from '@/contexts/NotificationContext';

export function SharedTaskPage() {
  const { token } = useParams<{ token: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification('success', 'Link kopeeritud!', undefined, undefined, 'success');
    } catch (e) {
      console.error('Failed to copy link:', e);
      showNotification('error', 'Viga lingi kopeerimisel');
    }
  };

  if (isLoading) {
    return (
      <div className="shared-task-page">
        <div className="loader-spinner" />
        <p>Laadimine...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="shared-task-page shared-task-page--error">
        <h2>{error || 'Ülesannet ei leitud'}</h2>
        <p>Kontrolli, kas jagamislink on õige.</p>
      </div>
    );
  }

  return (
    <div className="shared-task-page-wrapper">
      <header className="shared-task-header">
        <div className="shared-task-header__logo">
          <img src="/icons/logo.svg" alt="EKI Logo" />
        </div>
        <div className="shared-task-header__nav">
          <a href="/">Kõnesüntees</a>
          <a href="/tasks">Ülesanded</a>
        </div>
        <div className="shared-task-header__auth">
          <a href="/" className="shared-task-login-btn">Logi sisse</a>
        </div>
      </header>

      <main className="shared-task-content">
        <div className="shared-task-hero">
          <h1>Eesti keele põhihääldus</h1>
          <p>Põhilised eesti keele hääldusreeglid ja harjutused</p>
          <button className="play-all-btn">▶ Mängi kõik</button>
        </div>

        <div className="shared-task-info">
          <h2>Jagatud ülesanne</h2>
          <p>Kopeeri link ja et teised saaksid ülesannet vaadata. Sisselogimine pole vajalik.</p>
          <button className="copy-link-btn" onClick={handleCopyLink}>Kopeeri</button>
        </div>

        <div className="shared-task-entries">
          {task.name && <h3 className="task-title">{task.name}</h3>}
          {task.entries && task.entries.length > 0 ? (
            <ul className="task-entries-list">
              {task.entries.map((entry, index) => (
                <li key={entry.id || index} className="task-entry-item">
                  <button className="play-entry-btn">▶</button>
                  <span className="entry-text">{entry.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>See ülesanne ei sisalda ühtegi kirjet.</p>
          )}
        </div>
      </main>

      <footer className="page-footer">
        <Footer />
      </footer>
    </div>
  );
}
