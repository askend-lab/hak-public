import TaskManager from './TaskManager';
import TaskDetailView from './TaskDetailView';
import { AddIcon } from './ui/Icons';
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
  if (selectedTaskId) {
    return (
      <div className="page-content">
        <TaskDetailView taskId={selectedTaskId} onBack={onBack} onEditTask={(taskId) => onEditTask({ id: taskId, name: '' })} onDeleteTask={onDeleteTask} onAddEntryFromInput={() => {}} onAddEntry={() => {}} />
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
        <TaskManager onCreateTask={onCreateTask} onEditTask={(taskId) => onEditTask({ id: taskId, name: '' })} onViewTask={onViewTask} onDeleteTask={onDeleteTask} onShareTask={(taskId) => onShareTask({ id: taskId, name: '' })} refreshTrigger={taskRefreshTrigger} />
      </div>
    </>
  );
}
