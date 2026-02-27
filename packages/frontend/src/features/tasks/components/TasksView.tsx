// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import TaskManager from "./TaskManager";
import TaskDetailView from "./TaskDetailView";
import { AddIcon } from "@/components/ui/Icons";
import { PageLoadingState } from "@/components/ui/PageLoadingState";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { useUserTasks } from "@/hooks";
import { logger } from "@hak/shared";

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

function TaskEmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <div className="page-content page-content--empty">
      <div className="empty-state">
        <img className="empty-state__icon" src="/icons/avatar_task_empty.png" alt="" />
        <h2 className="empty-state__title">Ülesanded puuduvad</h2>
        <p className="empty-state__description">Sul pole veel ühtegi ülesannet. Alusta uue ülesande loomisega!</p>
        <button className="empty-state__action button button--primary" onClick={onCreateTask}><AddIcon size="2xl" />Loo esimene ülesanne</button>
      </div>
    </div>
  );
}

function useTaskActions(onEditTask: (t: Task) => void, onShareTask: (t: Task) => void) {
  const { user } = useAuth();
  const dataService = useDataService();
  const handleEdit = async (taskId: string) => {
    if (!user) {return;}
    try {
      const task = await dataService.getTask(taskId);
      if (task) { onEditTask({ id: task.id, name: task.name, ...(task.description && { description: task.description }) }); }
    } catch (e) { logger.error("Failed to fetch task for editing:", e); }
  };
  const handleShare = async (taskId: string) => {
    if (!user) {return;}
    try {
      const task = await dataService.getTask(taskId);
      if (task) { onShareTask({ id: task.id, name: task.name, ...(task.description && { description: task.description }), ...(task.shareToken && { shareToken: task.shareToken }) }); }
    } catch (e) { logger.error("Failed to fetch task for sharing:", e); }
  };
  return { handleEdit, handleShare };
}

export default function TasksView({ selectedTaskId, taskRefreshTrigger, onBack, onViewTask, onCreateTask, onEditTask, onDeleteTask, onShareTask, onNavigateToSynthesis }: TasksViewProps) {
  const { tasks, isLoading, error, isEmpty } = useUserTasks(taskRefreshTrigger);
  const actions = useTaskActions(onEditTask, onShareTask);
  if (selectedTaskId) {
    return <div className="page-content"><TaskDetailView taskId={selectedTaskId} onBack={onBack}
      onEditTask={(...a: Parameters<typeof actions.handleEdit>) => { void actions.handleEdit(...a); }} onDeleteTask={onDeleteTask} onNavigateToSynthesis={onNavigateToSynthesis} /></div>;
  }
  if (isLoading) { return <div className="page-content page-content--empty"><PageLoadingState message="Laen ülesandeid..." /></div>; }
  if (isEmpty) { return <TaskEmptyState onCreateTask={onCreateTask} />; }
  return (
    <>
      <div className="page-header page-header--with-actions">
        <h1 className="page-header__title">Ülesanded</h1>
        <div className="page-header__actions"><button onClick={onCreateTask} className="button button--primary"><AddIcon size="2xl" />Loo uus ülesanne</button></div>
      </div>
      <div className="page-content">
        {error && <div className="task-manager__error"><p>Viga ülesannete laadimisel: {error}</p></div>}
        <TaskManager tasks={tasks} onEditTask={(...a: Parameters<typeof actions.handleEdit>) => { void actions.handleEdit(...a); }}
          onViewTask={onViewTask} onDeleteTask={onDeleteTask} onShareTask={(...a: Parameters<typeof actions.handleShare>) => { void actions.handleShare(...a); }} />
      </div>
    </>
  );
}
