import { useState, useEffect, useCallback } from 'react';

import { Header, Footer, NotificationContainer } from '../components';
import { TaskDetailView } from '../components/tasks/TaskDetailView';
import { TaskSelectModal } from '../components/tasks/TaskSelectModal';
import { useAuth } from '../services/auth';
import { listTasks } from '../services/tasks';
import { useUIStore } from '../features';
import type { Task } from '../services/tasks';

interface TaskRowProps {
  task: Task;
  onViewTask: (taskId: string) => void;
  openMenuId: string | null;
  onMenuOpen: (taskId: string) => void;
  onMenuClose: () => void;
}

function TaskRow({ task, onViewTask, openMenuId, onMenuOpen, onMenuClose }: TaskRowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="task-row">
      <div className="task-row-content" onClick={() => onViewTask(task.id)}>
        <div className="task-row-info">
          <span className="task-row-name">{task.name}</span>
          {task.description && (
            <span className="task-row-description">{task.description}</span>
          )}
        </div>
        <div className="task-row-meta">
          <span className="task-row-count">[{task.entries.length}] lauset</span>
          <span className="task-row-date">Loodud {formatDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-row-actions">
        <div className="menu-container">
          <button
            className="menu-button"
            aria-label="More options"
            onClick={() => onMenuOpen(task.id)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {openMenuId === task.id && (
            <>
              <div className="menu-backdrop" onClick={onMenuClose} />
              <div className="dropdown-menu">
                <button className="menu-item" onClick={() => { onMenuClose(); }}>
                  <div className="menu-item-content">Muuda</div>
                </button>
                <button className="menu-item" onClick={() => { onMenuClose(); }}>
                  <div className="menu-item-content">Jaga</div>
                </button>
                <button className="menu-item menu-item-danger" onClick={() => { onMenuClose(); }}>
                  <div className="menu-item-content">Kustuta</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TasksPage() {
  const { user } = useAuth();
  const { openModal } = useUIStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await listTasks(user.id);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleCreateTask = () => {
    openModal('taskSelect');
  };

  const handleViewTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  const handleBackToList = () => {
    setSelectedTask(null);
  };

  const handleMenuOpen = (taskId: string) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  // Show task detail view if a task is selected
  if (selectedTask) {
    return (
      <div className="app-page">
        <Header />
        <main className="app-main">
          <TaskDetailView task={selectedTask} onBack={handleBackToList} />
        </main>
        <Footer />
        <NotificationContainer />
      </div>
    );
  }

  return (
    <div className="app-page">
      <Header />
      <main className="app-main">
        <div className="hero-section">
          <div>
            <h1 className="page-title">Ülesanded</h1>
          </div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleCreateTask} disabled={isLoading}>
              Lisa
            </button>
          </div>
        </div>

        <div className="task-manager">
          {isLoading ? (
            <div className="task-manager-loading">
              <p>Laen ülesandeid...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="task-manager-empty">
              <p className="task-empty-description">Ülesandeid pole veel loodud</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onViewTask={handleViewTask}
                  openMenuId={openMenuId}
                  onMenuOpen={handleMenuOpen}
                  onMenuClose={handleMenuClose}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <NotificationContainer />
      <TaskSelectModal />
    </div>
  );
}
