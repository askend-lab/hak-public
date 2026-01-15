import { useState, useCallback } from 'react';
import { DataService } from '@/services/dataService';
import { CreateTaskRequest } from '@/types/task';
import { useAuth } from '@/services/auth';
import { useNotification } from '@/contexts/NotificationContext';
import { SentenceState, filterNonEmptySentences } from '@/types/synthesis';


// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function useTaskHandlers(
  sentences: SentenceState[],
  setCurrentView: (view: 'synthesis' | 'tasks') => void,
  setSelectedTaskId: (id: string | null) => void
) {
  const { user, isAuthenticated, setShowLoginModal } = useAuth();
  const { showNotification } = useNotification();

  // Auth guard helper - returns true if NOT authenticated (to trigger early return)
  const requireAuth = useCallback((): boolean => {
    if (!isAuthenticated) { setShowLoginModal(true); return true; }
    return false;
  }, [isAuthenticated, setShowLoginModal]);

  const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddToTaskDropdown, setShowAddToTaskDropdown] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const [showShareTaskModal, setShowShareTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<{ id: string; name: string; description?: string | null } | null>(null);
  const [taskToShare, setTaskToShare] = useState<{ id: string; shareToken?: string; name: string } | null>(null);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAddAllSentencesToTask = useCallback(() => {
    if (requireAuth()) return;
    setShowAddToTaskDropdown(prev => !prev);
  }, [requireAuth]);

  const handleSelectTaskFromDropdown = useCallback(async (taskId: string, taskName: string) => {
    if (!user) return;
    const entries = filterNonEmptySentences(sentences).map(s => ({ text: s.text, stressedText: s.phoneticText || s.text }));
    if (entries.length === 0) return;

    try {
      const dataService = DataService.getInstance();
      await dataService.addTextEntriesToTask(user.id, taskId, entries);
      setTaskRefreshTrigger(prev => prev + 1);
      const count = entries.length;
      showNotification('success', 'Lisatud ülesandesse', `${count} ${count === 1 ? 'lause' : 'lauset'} lisatud ülesandesse ${taskName}!`, undefined, undefined, { label: 'Vaata ülesannet', onClick: () => { setSelectedTaskId(taskId); setCurrentView('tasks'); } });
    } catch (error) {
      console.error('Failed to add entries:', error);
      showNotification('error', 'Lausungite lisamine ebaõnnestus');
    }
  }, [user, sentences, showNotification, setSelectedTaskId, setCurrentView]);

  const handleCreateNewFromDropdown = useCallback(() => { setShowAddTaskModal(true); }, []);

  const handleAddSentenceToExistingTask = useCallback(async (sentenceId: string, taskId: string, taskName: string) => {
    if (!user) return;
    const sentence = sentences.find(s => s.id === sentenceId);
    if (!sentence || !sentence.text.trim()) return;

    try {
      const dataService = DataService.getInstance();
      await dataService.addTextEntriesToTask(user.id, taskId, [{ text: sentence.text, stressedText: sentence.phoneticText || sentence.text }]);
      setTaskRefreshTrigger(prev => prev + 1);
      showNotification('success', 'Lisatud ülesandesse', `Lause lisatud ülesandesse ${taskName}!`, undefined, undefined, { label: 'Vaata ülesannet', onClick: () => { setSelectedTaskId(taskId); setCurrentView('tasks'); } });
    } catch (error) {
      console.error('Failed to add entry:', error);
      showNotification('error', 'Lausungi lisamine ebaõnnestus');
    }
  }, [user, sentences, showNotification, setSelectedTaskId, setCurrentView]);

  const handleCreateNewTaskFromMenu = useCallback((_sentenceId: string) => {
    if (requireAuth()) return;
    setShowAddTaskModal(true);
  }, [requireAuth]);

  const handleCreateTask = useCallback(() => {
    if (requireAuth()) return;
    setShowAddTaskModal(true);
  }, [requireAuth]);

  const handleTaskCreated = useCallback(async (taskData: CreateTaskRequest) => {
    if (!user) return;
    try {
      const dataService = DataService.getInstance();
      const newTask = await dataService.createTask(user.id, taskData);
      setShowTaskCreationModal(false);
      setTaskRefreshTrigger(prev => prev + 1);
      const entryCount = taskData.speechEntries?.length || 0;
      if (entryCount > 0) {
        showNotification('success', 'Ülesanne loodud', `${taskData.name} loodud ja ${entryCount} ${entryCount === 1 ? 'lause' : 'lauset'} lisatud!`, undefined, undefined, { label: 'Vaata ülesannet', onClick: () => { setSelectedTaskId(newTask.id); setCurrentView('tasks'); } });
      } else {
        showNotification('success', 'Ülesanne loodud', `${taskData.name} loodud!`, undefined, undefined, { label: 'Vaata ülesannet', onClick: () => { setSelectedTaskId(newTask.id); setCurrentView('tasks'); } });
      }
      setSelectedTaskId(newTask.id);
    } catch (error) {
      console.error('Failed to create task:', error);
      showNotification('error', 'Ülesande loomine ebaõnnestus');
    }
  }, [user, showNotification, setSelectedTaskId, setCurrentView]);

  const handleAddTask = useCallback(async (title: string, description: string) => {
    if (!user) return;
    try {
      const dataService = DataService.getInstance();
      const playlistEntries = filterNonEmptySentences(sentences).map(s => ({ text: s.text, stressedText: s.phoneticText || s.text }));
      const newTask = await dataService.createTask(user.id, {
        name: title, description: description || null,
        speechSequences: playlistEntries.map(e => e.text),
        speechEntries: playlistEntries.length > 0 ? playlistEntries : null
      });
      setShowAddTaskModal(false);
      setTaskRefreshTrigger(prev => prev + 1);
      if (playlistEntries.length > 0) {
        showNotification('success', 'Ülesanne loodud', `${title} loodud!`, undefined, undefined, { label: 'Vaata ülesannet', onClick: () => { setSelectedTaskId(newTask.id); setCurrentView('tasks'); } });
      }
      setSelectedTaskId(newTask.id);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }, [user, sentences, showNotification, setSelectedTaskId, setCurrentView]);

  const handleEditTask = useCallback(async (task: { id: string; name: string; description?: string | null }) => {
    if (requireAuth()) return;
    if (!user) return;
    try {
      const dataService = DataService.getInstance();
      const fullTask = await dataService.getTask(task.id, user.id);
      if (fullTask) {
        setTaskToEdit({ id: task.id, name: task.name, ...(task.description !== null && { description: task.description }) });
        setShowTaskEditModal(true);
      }
    } catch (error) {
      console.error('Failed to load task:', error);
    }
  }, [requireAuth, user]);

  const handleTaskUpdated = useCallback(async (): Promise<void> => {
    if (!user || !taskToEdit) return;
    try {
      const dataService = DataService.getInstance();
      await dataService.updateTask(user.id, taskToEdit.id, { name: taskToEdit.name, ...(taskToEdit.description !== null && { description: taskToEdit.description }) });
      setShowTaskEditModal(false);
      setTaskToEdit(null);
      setTaskRefreshTrigger(prev => prev + 1);
      showNotification('success', `Ülesanne "${taskToEdit.name}" uuendatud!`, undefined, undefined, 'success');
    } catch (error) {
      console.error('Failed to update task:', error);
      showNotification('error', 'Ülesande uuendamine ebaõnnestus');
    }
  }, [user, taskToEdit, showNotification]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (requireAuth()) return;
    if (!user) return;
    try {
      const dataService = DataService.getInstance();
      const fullTask = await dataService.getTask(taskId, user.id);
      if (fullTask) { setTaskToDelete({ id: taskId, name: fullTask.name }); setShowDeleteConfirmation(true); }
    } catch (error) {
      console.error('Failed to load task:', error);
    }
  }, [requireAuth, user]);

  const handleConfirmDelete = useCallback(async () => {
    if (!user || !taskToDelete) return;
    const taskName = taskToDelete.name;
    try {
      const dataService = DataService.getInstance();
      await dataService.deleteTask(user.id, taskToDelete.id);
      setTaskRefreshTrigger(prev => prev + 1);
      showNotification('success', `Ülesanne "${taskName}" kustutatud!`, undefined, undefined, 'success');
    } catch (error) {
      console.error('Failed to delete task:', error);
      showNotification('error', 'Ülesande kustutamine ebaõnnestus');
    } finally {
      setShowDeleteConfirmation(false);
      setTaskToDelete(null);
    }
  }, [user, taskToDelete, showNotification]);

  const handleCancelDelete = useCallback(() => { setShowDeleteConfirmation(false); setTaskToDelete(null); }, []);

  const handleShareTask = useCallback(async (task: { id: string; name: string; shareToken?: string }) => {
    if (requireAuth()) return;
    if (!user) return;
    try {
      const dataService = DataService.getInstance();
      await dataService.shareUserTask(user.id, task.id);
      const fullTask = await dataService.getTask(task.id, user.id);
      if (fullTask) { setTaskToShare(task.shareToken ? { id: task.id, shareToken: task.shareToken, name: task.name } : { id: task.id, name: task.name }); setShowShareTaskModal(true); }
    } catch (error) {
      console.error('Failed to share task:', error);
    }
  }, [requireAuth, user]);

  return {
    showTaskCreationModal, setShowTaskCreationModal,
    showAddTaskModal, setShowAddTaskModal,
    showAddToTaskDropdown, setShowAddToTaskDropdown,
    showTaskEditModal, setShowTaskEditModal,
    showShareTaskModal, setShowShareTaskModal,
    taskToEdit, setTaskToEdit,
    taskToShare, setTaskToShare,
    taskRefreshTrigger,
    showDeleteConfirmation,
    taskToDelete,
    handleAddAllSentencesToTask,
    handleSelectTaskFromDropdown,
    handleCreateNewFromDropdown,
    handleAddSentenceToExistingTask,
    handleCreateNewTaskFromMenu,
    handleCreateTask,
    handleTaskCreated,
    handleAddTask,
    handleEditTask,
    handleTaskUpdated,
    handleDeleteTask,
    handleConfirmDelete,
    handleCancelDelete,
    handleShareTask,
  };
}
