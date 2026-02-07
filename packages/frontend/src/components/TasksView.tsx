import TaskManager from "./TaskManager";
import TaskDetailView from "./TaskDetailView";
import { AddIcon } from "./ui/Icons";
import { DataService } from "@/services/dataService";
import { useAuth } from "@/services/auth";
import { useUserTasks } from "@/hooks";

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
  onNavigateToSynthesis: () => void;
}

export default function TasksView({
  selectedTaskId,
  taskRefreshTrigger,
  onBack,
  onViewTask,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onShareTask,
  onNavigateToSynthesis,
}: TasksViewProps) {
  const { user } = useAuth();
  const { tasks, isLoading, error, isEmpty } = useUserTasks(taskRefreshTrigger);

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
      console.error("Failed to fetch task for editing:", error);
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
      console.error("Failed to fetch task for sharing:", error);
    }
  };

  // Task detail view
  if (selectedTaskId) {
    return (
      <div className="page-content">
        <TaskDetailView
          taskId={selectedTaskId}
          onBack={onBack}
          onEditTask={handleEditTask}
          onDeleteTask={onDeleteTask}
          onNavigateToSynthesis={onNavigateToSynthesis}
        />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="page-content page-content--empty">
        <div className="empty-state">
          <div
            className="loader-spinner"
            style={{ width: 48, height: 48 }}
          ></div>
          <p className="empty-state__description">Laen ülesandeid...</p>
        </div>
      </div>
    );
  }

  // Layout Type 4: Empty State (no header, centered content)
  if (isEmpty) {
    return (
      <div className="page-content page-content--empty">
        <div className="empty-state">
          <img
            className="empty-state__icon"
            src="/icons/avatar_task_empty.png"
            alt=""
            style={{ width: 213, height: 186, opacity: 1 }}
          />
          <h2 className="empty-state__title">Ülesanded puuduvad</h2>
          <p className="empty-state__description">
            Sul pole veel ühtegi ülesannet. Alusta uue ülesande loomisega!
          </p>
          <button
            className="empty-state__action button button--primary"
            onClick={onCreateTask}
          >
            <AddIcon size="2xl" />
            Loo esimene ülesanne
          </button>
        </div>
      </div>
    );
  }

  // Layout Type 3: With Actions (header + task list)
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
        {error && (
          <div className="task-manager__error">
            <p>Viga ülesannete laadimisel: {error}</p>
          </div>
        )}
        <TaskManager
          tasks={tasks}
          onEditTask={handleEditTask}
          onViewTask={onViewTask}
          onDeleteTask={onDeleteTask}
          onShareTask={handleShareTask}
        />
      </div>
    </>
  );
}
