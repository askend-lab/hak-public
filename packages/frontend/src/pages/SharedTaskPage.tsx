import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataService } from '@/services/dataService';
import { Task } from '@/types/task';
import TaskDetailView from '@/components/TaskDetailView';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

export function SharedTaskPage() {
  const { token } = useParams<{ token: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="shared-task-loading">
        <div className="loading-spinner" />
        <p>Laadimine...</p>
      </div>
    );
  }

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
        onLoginClick={() => window.location.href = '/'}
      />
      
      <div className="page-layout__content">
        <div className="shared-task-view">
          <div className="shared-task-info-banner shared-task-info-banner--inline">
            <div className="shared-task-info-banner-content">
              <div className="shared-task-info-banner-text">
                <div className="shared-task-info-banner-title">Jagatud ülesanne</div>
                <div className="shared-task-info-banner-description">
                  Kopeeri link ja et teised saaksid ülesannet vaadata. Sisselogimine pole vajalik.
                </div>
              </div>
              <button 
                className="button button--secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                }}
              >
                Kopeeri
              </button>
            </div>
          </div>

          <TaskDetailView
            taskId={task.id}
            onBack={() => window.history.back()}
            onEditTask={() => {}}
            onDeleteTask={() => {}}
            onAddEntryFromInput={() => {}}
          />
        </div>
      </div>

      <footer className="page-footer">
        <Footer />
      </footer>
    </div>
  );
}
