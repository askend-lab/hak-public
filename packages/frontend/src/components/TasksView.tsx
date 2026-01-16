import TaskManager from './TaskManager';
import TaskDetailView from './TaskDetailView';
import { AddIcon } from './ui/Icons';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/services/auth';

interface Task {
  id: string;
  name: string;
  description?: string;
  shareToken?: string;
}

interface TasksViewProps {
  selectedTaskId: string | null;
  taskRefreshTrigger: number;
  onBack: () => void;
  onViewTask: (taskId: string) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onShareTask: (task: Task) => void;
}

export default function TasksView({ selectedTaskId, taskRefreshTrigger, onBack, onViewTask, onCreateTask, onEditTask, onDeleteTask, onShareTask }: TasksViewProps) {
  const { user } = useAuth();

  const handleEditTask = async (taskId: string) => {
    if (!user) return;
    try {
      const dataService = DataService.getInstance();
      const task = await dataService.getTask(taskId, user.id);
      if (task) {
        const taskData: Task = { id: task.id, name: task.name };
        if (task.description) taskData.description = task.description;
        onEditTask(taskData);
      }
    } catch (error) {
      console.error('Failed to fetch task for editing:', error);
    }
  };

  const handleShareTask = async (taskId: string) => {
    if (!user) return;
    try {
      const dataService = DataService.getInstance();
      const task = await dataService.getTask(taskId, user.id);
      if (task) {
        const taskData: Task = { id: task.id, name: task.name };
        if (task.description) taskData.description = task.description;
        if (task.shareToken) taskData.shareToken = task.shareToken;
        onShareTask(taskData);
      }
    } catch (error) {
      console.error('Failed to fetch task for sharing:', error);
    }
  };

  if (selectedTaskId) {
    return (
      <div className="page-content">
        <TaskDetailView taskId={selectedTaskId} onBack={onBack} onEditTask={handleEditTask} onDeleteTask={onDeleteTask} onAddEntryFromInput={() => {}} onAddEntry={() => {}} />
      </div>
    );
  }

  return (
    <>
      <div className="page-header page-header--with-actions">
        <h1 className="page-header__title">Ülesanded</h1>
        <div className="page-header__actions">
          <button onClick={onCreateTask} className="button button--primary">
            <AddIcon size="2xl" />
            Loo uus ülesanne
          </button>
        </div>
      </div>
      <div className="page-content">
        <TaskManager onCreateTask={onCreateTask} onEditTask={handleEditTask} onViewTask={onViewTask} onDeleteTask={onDeleteTask} onShareTask={handleShareTask} refreshTrigger={taskRefreshTrigger} />
      </div>
    </>
  );
}
