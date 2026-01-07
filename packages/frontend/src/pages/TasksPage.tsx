import { useState, useEffect, useCallback } from 'react';

import { Header, Footer, NotificationContainer } from '../components';
import { TaskDetailView } from '../components/tasks/TaskDetailView';
import { TaskSelectModal, CreateTaskModal } from '../components/tasks';
import { useAuth } from '../services/auth';
import { listTasks, deleteTask, updateTask } from '../services/tasks';
import { useUIStore } from '../features';
import type { Task } from '../services/tasks';

interface TaskRowProps {
  task: Task;
  onViewTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  openMenuId: string | null;
  onMenuOpen: (taskId: string) => void;
  onMenuClose: () => void;
}

function TaskRow({ task, onViewTask, onEditTask, onDeleteTask, openMenuId, onMenuOpen, onMenuClose }: TaskRowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="task-row" data-testid={`task-row-${task.id}`}>
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
            data-testid={`task-menu-btn-${task.id}`}
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
                <button className="menu-item" data-testid={`task-edit-btn-${task.id}`} onClick={() => { onMenuClose(); onEditTask(task); }}>
                  <div className="menu-item-content">Muuda</div>
                </button>
                <button className="menu-item" onClick={() => { onMenuClose(); }}>
                  <div className="menu-item-content">Jaga</div>
                </button>
                <button className="menu-item menu-item-danger" data-testid={`task-delete-btn-${task.id}`} onClick={() => { onMenuClose(); onDeleteTask(task.id); }}>
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
  const { activeModal } = useUIStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prevActiveModal, setPrevActiveModal] = useState<string | null>(null);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  // Reload tasks when taskSelect modal closes (after creating a task)
  useEffect(() => {
    if (prevActiveModal === 'taskSelect' && activeModal === null) {
      void loadTasks();
    }
    setPrevActiveModal(activeModal);
  }, [activeModal, prevActiveModal, loadTasks]);

  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    void loadTasks();
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

  const handleDeleteTask = (taskId: string) => {
    setDeleteConfirmTaskId(taskId);
  };

  const handleConfirmDelete = async () => {
    if (!user?.id || !deleteConfirmTaskId) return;
    setIsDeleting(true);
    try {
      const response = await deleteTask(user.id, deleteConfirmTaskId);
      if (response.success) {
        await loadTasks();
        setDeleteConfirmTaskId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmTaskId(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditName(task.name);
    setEditDescription(task.description ?? '');
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!user?.id || !editingTask) return;
    if (!editName.trim()) {
      setEditError('Ülesande nimi on kohustuslik');
      return;
    }
    setIsEditing(true);
    try {
      const response = await updateTask(user.id, editingTask.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      if (response.success) {
        await loadTasks();
        setEditingTask(null);
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditError(null);
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
            <button className="btn-primary" data-testid="task-create-btn" onClick={handleCreateTask} disabled={isLoading}>
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
            <div className="task-list" data-testid="task-list">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onViewTask={handleViewTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
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

      {deleteConfirmTaskId && (
        <>
          <div className="task-modal-backdrop" onClick={handleCancelDelete} />
          <div className="task-modal" role="dialog" aria-modal="true" data-testid="delete-confirm-modal">
            <div className="task-modal-header">
              <h2 className="task-modal-title">Kustuta ülesanne</h2>
              <button onClick={handleCancelDelete} className="task-modal-close" disabled={isDeleting} aria-label="Sulge">
                ×
              </button>
            </div>
            <div className="task-modal-form">
              <p>Kas olete kindel, et soovite selle ülesande kustutada?</p>
              <p><strong>{tasks.find(t => t.id === deleteConfirmTaskId)?.name}</strong></p>
              <div className="task-modal-actions">
                <button type="button" onClick={handleCancelDelete} className="task-modal-cancel" disabled={isDeleting}>
                  Tühista
                </button>
                <button
                  type="button"
                  onClick={() => { void handleConfirmDelete(); }}
                  className="task-modal-submit task-modal-submit-danger"
                  data-testid="delete-confirm-btn"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Kustutan...' : 'Kustuta'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {editingTask && (
        <>
          <div className="task-modal-backdrop" onClick={handleCancelEdit} />
          <div className="task-modal" role="dialog" aria-modal="true" data-testid="edit-task-modal">
            <div className="task-modal-header">
              <h2 className="task-modal-title">Muuda ülesannet</h2>
              <button onClick={handleCancelEdit} className="task-modal-close" disabled={isEditing} aria-label="Sulge">
                ×
              </button>
            </div>
            <form className="task-modal-form" onSubmit={(e) => { e.preventDefault(); void handleSaveEdit(); }}>
              {editError && (
                <div className="task-form-error">
                  <p>{editError}</p>
                </div>
              )}
              <div className="task-form-field">
                <label className="task-form-label" htmlFor="edit-task-name">Ülesande nimi *</label>
                <input
                  id="edit-task-name"
                  type="text"
                  className="task-form-input"
                  data-testid="edit-task-name-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isEditing}
                  placeholder="Sisesta ülesande nimi"
                />
              </div>
              <div className="task-form-field">
                <label className="task-form-label" htmlFor="edit-task-description">Kirjeldus</label>
                <textarea
                  id="edit-task-description"
                  className="task-form-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={isEditing}
                  placeholder="Kirjelda ülesande eesmärki või sisu (valikuline)"
                />
              </div>
              <div className="task-modal-actions">
                <button type="button" onClick={handleCancelEdit} className="task-modal-cancel" disabled={isEditing}>
                  Tühista
                </button>
                <button
                  type="submit"
                  className="task-modal-submit"
                  data-testid="edit-task-save-btn"
                  disabled={isEditing}
                >
                  {isEditing ? 'Salvestan...' : 'Salvesta'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
