import { useState, useEffect, useCallback } from 'react';

import { Header, Footer, NotificationContainer } from '../components';
import { Modal, ConfirmDialog } from '../components/ui';
import { TaskDetailView } from '../components/tasks/TaskDetailView';
import { TaskSelectModal, CreateTaskModal } from '../components/tasks';
import { TaskRow } from '../components/tasks/TaskRow';
import { useAuth } from '../services/auth';
import { listTasks } from '../services/tasks';
import { useUIStore } from '../features';
import { useTaskEdit } from '../hooks/useTaskEdit';
import { useTaskDelete } from '../hooks/useTaskDelete';
import type { Task } from '../services/tasks';

export function TasksPage() {
  const { user } = useAuth();
  const { activeModal } = useUIStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prevActiveModal, setPrevActiveModal] = useState<string | null>(null);

  const {
    editingTask,
    editName,
    editDescription,
    isEditing,
    editError,
    setEditName,
    setEditDescription,
    startEdit: handleEditTask,
    saveEdit,
    cancelEdit: handleCancelEdit,
  } = useTaskEdit(() => { void loadTasks(); });

  const {
    deleteConfirmTaskId,
    isDeleting,
    requestDelete: handleDeleteTask,
    confirmDelete,
    cancelDelete: handleCancelDelete,
  } = useTaskDelete(() => { void loadTasks(); });

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

  const handleConfirmDelete = async () => {
    await confirmDelete();
  };

  const handleSaveEdit = async () => {
    await saveEdit();
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

      <ConfirmDialog
        isOpen={!!deleteConfirmTaskId}
        onClose={handleCancelDelete}
        onConfirm={() => { void handleConfirmDelete(); }}
        title="Kustuta ülesanne"
        message={`Kas olete kindel, et soovite kustutada ülesande "${tasks.find(t => t.id === deleteConfirmTaskId)?.name}"?`}
        confirmText={isDeleting ? 'Kustutan...' : 'Kustuta'}
        cancelText="Tühista"
        variant="danger"
      />

      <Modal
        isOpen={!!editingTask}
        onClose={handleCancelEdit}
        title="Muuda ülesannet"
        className="task-modal"
      >
        <form className="task-modal-form" onSubmit={(e) => { e.preventDefault(); void handleSaveEdit(); }} data-testid="edit-task-modal">
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
      </Modal>
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
