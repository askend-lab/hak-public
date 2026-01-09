'use client';

import { useState, useEffect } from 'react';
import { CreateTaskRequest, TaskSummary } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import BaseModal from './BaseModal';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: CreateTaskRequest) => Promise<void>;
  onAddToExistingTask: (taskId: string, entries: Array<{text: string; stressedText: string}>, taskName: string) => Promise<void>;
  playlistEntries?: Array<{
    id: string;
    text: string;
    stressedText: string;
    audioUrl?: string | null;
    audioBlob?: Blob | null;
  }>;
}

export default function TaskCreationModal({
  isOpen,
  onClose,
  onCreateTask,
  onAddToExistingTask,
  playlistEntries = []
}: TaskCreationModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'create' | 'existing'>('create');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [existingTasks, setExistingTasks] = useState<TaskSummary[]>([]);
  const includePlaylist = playlistEntries.length > 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing tasks when modal opens
  useEffect(() => {
    const loadExistingTasks = async () => {
      if (!isOpen || !user || mode !== 'existing') return;

      try {
        setIsLoadingTasks(true);
        const dataService = DataService.getInstance();
        const tasks = await dataService.getUserTasks(user.id);
        setExistingTasks(tasks);
      } catch (err) {
        console.error('Failed to load existing tasks:', err);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    loadExistingTasks();
  }, [isOpen, user, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create' || playlistEntries.length === 0) {
      if (!name.trim()) {
        setError('Ülesande nimi on kohustuslik');
        return;
      }
    } else {
      if (!selectedTaskId) {
        setError('Palun vali ülesanne');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const speechSequences = includePlaylist 
        ? playlistEntries.map(entry => entry.text)
        : [];

      const speechEntries = includePlaylist 
        ? playlistEntries.map(entry => ({
            text: entry.text,
            stressedText: entry.stressedText
          }))
        : [];

      if (mode === 'create' || playlistEntries.length === 0) {
        await onCreateTask({
          name: name.trim(),
          description: description.trim() || undefined,
          speechSequences,
          speechEntries: speechEntries.length > 0 ? speechEntries : undefined
        });
      } else {
        const selectedTask = existingTasks.find(t => t.id === selectedTaskId);
        const taskName = selectedTask?.name || '';
        await onAddToExistingTask(selectedTaskId, speechEntries, taskName);
      }

      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Viga ülesande loomisel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMode('create');
    setName('');
    setDescription('');
    setSelectedTaskId('');
    setError(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Loo uus ülesanne"
      size="medium"
      className="task-modal"
    >
      <form onSubmit={handleSubmit} className="task-modal__form">
        {/* Mode Selection - only show when there are playlist entries */}
        {playlistEntries.length > 0 && (
          <div className="task-modal__field">
            <div className="task-modal__mode-selection">
              <label className="task-modal__mode-option">
                <input
                  type="radio"
                  name="taskMode"
                  value="create"
                  checked={mode === 'create'}
                  onChange={(e) => setMode(e.target.value as 'create' | 'existing')}
                  className="task-modal__mode-radio"
                  disabled={isSubmitting}
                />
                <span className="task-modal__mode-text">Loo uus ülesanne</span>
              </label>
              
              <label className="task-modal__mode-option">
                <input
                  type="radio"
                  name="taskMode"
                  value="existing"
                  checked={mode === 'existing'}
                  onChange={(e) => setMode(e.target.value as 'create' | 'existing')}
                  className="task-modal__mode-radio"
                  disabled={isSubmitting}
                />
                <span className="task-modal__mode-text">Lisa olemasolevas ülesandesse</span>
              </label>
            </div>
          </div>
        )}

        {(mode === 'create' || playlistEntries.length === 0) ? (
          <>
            <div className="task-modal__field">
              <label htmlFor="task-name" className="task-modal__label">
                Ülesande nimi *
              </label>
              <input
                id="task-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="task-modal__input"
                placeholder="Sisesta ülesande nimi"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="task-modal__field">
              <label htmlFor="task-description" className="task-modal__label">
                Kirjeldus
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="task-modal__textarea"
                placeholder="Kirjelda ülesande eesmärki või sisu (valikuline)"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </>
        ) : (
          <div className="task-modal__field">
            <label className="task-modal__label">
              Vali ülesanne
            </label>
            {isLoadingTasks ? (
              <div className="task-modal__selection-loading">
                <div className="task-modal__selection-spinner"></div>
                <p className="task-modal__selection-loading-text">Laen ülesandeid...</p>
              </div>
            ) : existingTasks.length === 0 ? (
              <div className="task-modal__selection-empty">
                <p>Sul pole veel loodud ülesandeid. Vali "Loo uus ülesanne" või loo esmalt ülesanne ülesannete vaates.</p>
              </div>
            ) : (
              <div className="task-modal__selection-list">
                {existingTasks.map((task) => (
                  <label key={task.id} className="task-modal__selection-item">
                    <input
                      type="radio"
                      name="selectedTask"
                      value={task.id}
                      checked={selectedTaskId === task.id}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="task-modal__selection-radio"
                      disabled={isSubmitting}
                    />
                    <div className="task-modal__selection-content">
                      <div className="task-modal__selection-name">{task.name}</div>
                      {task.description && (
                        <div className="task-modal__selection-description">{task.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {playlistEntries.length > 0 && (
          <div className="task-modal__field">
            <div className="task-modal__playlist-preview">
              <p className="task-modal__playlist-preview-title">
                Lisatavad lausungid ({playlistEntries.length} {playlistEntries.length === 1 ? 'lausung' : 'lausungit'}):
              </p>
              <div className="task-modal__playlist-preview-items">
                {playlistEntries.slice(0, 3).map((entry, index) => (
                  <div key={entry.id} className="task-modal__playlist-preview-item">
                    {index + 1}. {entry.text}
                  </div>
                ))}
                {playlistEntries.length > 3 && (
                  <div className="task-modal__playlist-preview-more">
                    +{playlistEntries.length - 3} veel
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="task-modal__error">
            <p>{error}</p>
          </div>
        )}

        <div className="task-modal__actions">
          <button
            type="button"
            onClick={handleClose}
            className="button button--secondary"
            disabled={isSubmitting}
          >
            Tühista
          </button>
          <button
            type="submit"
            className="button button--primary"
            disabled={isSubmitting || ((mode === 'create' || playlistEntries.length === 0) ? !name.trim() : !selectedTaskId)}
          >
            {isSubmitting ? (
              (mode === 'create' || playlistEntries.length === 0) ? 'Loon...' : 'Salvestan...'
            ) : (
              (mode === 'create' || playlistEntries.length === 0) ? 'Loo ülesanne' : 'Salvesta'
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
