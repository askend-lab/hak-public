import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataService } from '@/services/dataService';
import { Task } from '@/types/task';
import TaskDetailView from '@/components/TaskDetailView';

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
    <div className="shared-task-page">
      <TaskDetailView
        taskId={task.id}
        onBack={() => window.history.back()}
        onEditTask={() => {}}
        onDeleteTask={() => {}}
        onAddEntryFromInput={() => {}}
      />
    </div>
  );
}
