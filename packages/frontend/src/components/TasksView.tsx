import TaskManager from './TaskManager';
import TaskDetailView from './TaskDetailView';
import { Task } from '@/types';

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
  if (selectedTaskId) {
    return (
      <div className="page-content">
        <TaskDetailView taskId={selectedTaskId} onBack={onBack} onEditTask={onEditTask} onDeleteTask={onDeleteTask} onAddEntryFromInput={() => {}} onAddEntry={() => {}} />
      </div>
    );
  }

  return (
    <>
      <div className="page-header page-header--with-actions">
        <h1 className="page-header__title">Ülesanded</h1>
        <div className="page-header__actions">
          <button onClick={onCreateTask} className="button button--primary">Lisa</button>
        </div>
      </div>
      <div className="page-content">
        <TaskManager onCreateTask={onCreateTask} onEditTask={onEditTask} onViewTask={onViewTask} onDeleteTask={onDeleteTask} onShareTask={onShareTask} refreshTrigger={taskRefreshTrigger} />
      </div>
    </>
  );
}
