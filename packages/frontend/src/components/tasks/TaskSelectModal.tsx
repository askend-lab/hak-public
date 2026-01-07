import { useState, useCallback, useEffect } from 'react';

import { Modal } from '../ui';
import { createSynthesisEntry, createTaskEntry } from '../../core';
import { useSynthesisStore, useTasksStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';
import { addEntryToTask, listTasks, createTask } from '../../services/tasks';

interface TaskSelectModalProps { onClose?: () => void; }

export function TaskSelectModal({ onClose }: TaskSelectModalProps) {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { tasks, setTasks, setLoading, isLoading } = useTasksStore();
  const { text, sentences } = useSynthesisStore();
  const { user } = useAuth();
  
  const [mode, setMode] = useState<'create' | 'existing'>('create');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = activeModal === 'taskSelect';

  useEffect(() => {
    if (!isOpen || mode !== 'existing') return;
    
    const loadTasks = async (): Promise<void> => {
      setLoading(true);
      try {
        const userId = user?.id ?? 'test-user';
        const response = await listTasks(userId);
        if (response.success && response.data) {
          setTasks(response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    
    void loadTasks();
  }, [isOpen, mode, user, setTasks, setLoading]);

  const resetForm = useCallback(() => {
    setMode('create');
    setName('');
    setDescription('');
    setSelectedTaskId('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      closeModal();
      onClose?.();
    }
  }, [isSubmitting, resetForm, closeModal, onClose]);

  const createEntries = useCallback(() => {
    const textsToAdd = sentences.length > 0 ? sentences : (text ? [text] : []);
    return textsToAdd.map((sentenceText, index) => {
      const synthesis = createSynthesisEntry({
        originalText: sentenceText,
        phoneticText: '',
        audioHash: '',
        voiceModel: 'efm_s',
      });
      return createTaskEntry(synthesis, index);
    });
  }, [sentences, text]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
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
      const userId = user?.id ?? 'test-user';
      const entries = createEntries();

      if (mode === 'create') {
        const createResponse = await createTask(userId, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
        if (createResponse.success && createResponse.data) {
          for (const entry of entries) {
            await addEntryToTask(userId, createResponse.data.id, entry);
          }
          addNotification('success', `Ülesanne "${name}" loodud (${entries.length} lauset)`);
          handleClose();
        } else {
          setError(createResponse.error ?? 'Viga ülesande loomisel');
        }
      } else {
        if (entries.length === 0) return;
        const taskName = tasks.find(t => t.id === selectedTaskId)?.name ?? 'ülesanne';
        for (const entry of entries) {
          await addEntryToTask(userId, selectedTaskId, entry);
        }
        addNotification('success', `Lisatud ${entries.length} lauset ülesandesse "${taskName}"`);
        handleClose();
      }
    } catch {
      setError('Võrgu viga');
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, name, description, selectedTaskId, user, tasks, createEntries, addNotification, handleClose]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Loo uus ülesanne"
      className="task-modal"
    >
      <form onSubmit={(e) => { void handleSubmit(e); }} className="task-modal-form" data-testid="create-task-modal">
          <div className="task-form-field">
            <div className="task-mode-selection">
              <label className="task-mode-option">
                <input
                  type="radio"
                  name="taskMode"
                  value="create"
                  checked={mode === 'create'}
                  onChange={() => { setMode('create'); }}
                  className="task-mode-radio"
                  disabled={isSubmitting}
                />
                <span className="task-mode-text">Loo uus ülesanne</span>
              </label>
              <label className="task-mode-option">
                <input
                  type="radio"
                  name="taskMode"
                  value="existing"
                  checked={mode === 'existing'}
                  onChange={() => { setMode('existing'); }}
                  className="task-mode-radio"
                  disabled={isSubmitting}
                />
                <span className="task-mode-text">Lisa olemasolevas ülesandesse</span>
              </label>
            </div>
          </div>

          {mode === 'create' ? (
            <>
              <div className="task-form-field">
                <label htmlFor="task-name" className="task-form-label">Ülesande nimi *</label>
                <input
                  id="task-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); }}
                  className="task-form-input"
                  data-testid="create-task-name-input"
                  placeholder="Sisesta ülesande nimi"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="task-form-field">
                <label htmlFor="task-description" className="task-form-label">Kirjeldus</label>
                <textarea
                  id="task-description"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); }}
                  className="task-form-textarea"
                  placeholder="Kirjelda ülesande eesmärki või sisu (valikuline)"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </>
          ) : (
            <div className="task-form-field">
              <label className="task-form-label">Vali ülesanne</label>
              {isLoading ? (
                <div className="task-selection-loading">Laen ülesandeid...</div>
              ) : tasks.length === 0 ? (
                <div className="task-selection-empty">Sul pole veel loodud ülesandeid.</div>
              ) : (
                <div className="task-selection-list">
                  {tasks.map((task) => (
                    <label key={task.id} className="task-selection-item">
                      <input
                        type="radio"
                        name="selectedTask"
                        value={task.id}
                        checked={selectedTaskId === task.id}
                        onChange={() => { setSelectedTaskId(task.id); }}
                        className="task-selection-radio"
                        disabled={isSubmitting}
                      />
                      <div className="task-selection-content">
                        <div className="task-selection-name">{task.name}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {(sentences.length > 0 || text) && (
            <div className="task-form-field">
              <div className="task-playlist-preview">
                <p className="task-playlist-preview-title">
                  Lisatavad lausungid ({sentences.length > 0 ? sentences.length : 1} lausung{(sentences.length > 1) ? 'it' : ''}):
                </p>
                <div className="task-playlist-preview-items">
                  {sentences.length > 0 
                    ? sentences.map((s, i) => <div key={i} className="task-playlist-preview-item">{i + 1}. {s}</div>)
                    : <div className="task-playlist-preview-item">1. {text}</div>
                  }
                </div>
              </div>
            </div>
          )}

          {error && <div className="task-form-error"><p>{error}</p></div>}

          <div className="task-modal-actions">
            <button type="button" onClick={handleClose} className="task-modal-cancel" disabled={isSubmitting}>
              Tühista
            </button>
            <button
              type="submit"
              className="task-modal-submit"
              data-testid="create-task-submit-btn"
              disabled={isSubmitting || (mode === 'create' ? !name.trim() : !selectedTaskId)}
            >
              {isSubmitting ? (mode === 'create' ? 'Loon...' : 'Salvestan...') : (mode === 'create' ? 'Loo ülesanne' : 'Salvesta')}
            </button>
          </div>
        </form>
    </Modal>
  );
}
