import { useState, useCallback, useEffect } from 'react';
import { useSynthesisStore, useTasksStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';
import { addEntryToTask, listTasks } from '../../services/tasks';
import { createSynthesisEntry, createTaskEntry } from '../../core';
import { Modal } from '../ui';

interface TaskSelectModalProps {
  onClose?: () => void;
}

export function TaskSelectModal({ onClose }: TaskSelectModalProps) {
  const { activeModal, closeModal, openModal, addNotification } = useUIStore();
  const { tasks, setTasks, setLoading, isLoading } = useTasksStore();
  const { text, result } = useSynthesisStore();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tasks when modal opens
  useEffect(() => {
    if (activeModal === 'taskSelect') {
      setLoading(true);
      // For local dev, use test-user
      const userId = user?.id || 'test-user';
      listTasks(userId)
        .then(response => {
          if (response.success && response.data) {
            setTasks(response.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [activeModal, user, setTasks, setLoading]);

  const handleClose = useCallback(() => {
    closeModal();
    onClose?.();
  }, [closeModal, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!selectedId || !result) return;
    const userId = user?.id || 'test-user';

    setIsSubmitting(true);
    try {
      const synthesis = createSynthesisEntry({
        originalText: text,
        phoneticText: result.phoneticText,
        audioHash: result.audioHash,
        voiceModel: result.voiceModel,
      });
      const existingTask = tasks.find(t => t.id === selectedId);
      const order = existingTask?.entries.length ?? 0;
      const entry = createTaskEntry(synthesis, order);
      
      const response = await addEntryToTask(userId, selectedId, entry);
      
      if (response.success) {
        const task = tasks.find(t => t.id === selectedId);
        addNotification('success', `Lisatud ülesandesse "${task?.name}"`);
        handleClose();
      } else {
        addNotification('error', response.error || 'Lisamine ebaõnnestus');
      }
    } catch {
      addNotification('error', 'Võrgu viga');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedId, user, result, text, tasks, addNotification, handleClose]);

  const footer = (
    <>
      <button onClick={handleClose} className="btn btn--secondary">
        Tühista
      </button>
      <button
        onClick={handleSubmit}
        disabled={!selectedId || isSubmitting}
        className="btn btn--primary"
      >
        {isSubmitting ? 'Lisan...' : 'Lisa'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={activeModal === 'taskSelect'}
      onClose={handleClose}
      title="Vali ülesanne"
      footer={footer}
    >
      {isLoading ? (
        <p>Laadin ülesandeid...</p>
      ) : tasks.length === 0 ? (
        <div>
          <p>Ülesandeid pole.</p>
          <button 
            onClick={() => openModal('taskCreate')} 
            className="btn btn--link"
          >
            + Loo uus ülesanne
          </button>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li
              key={task.id}
              className={`task-list__item ${selectedId === task.id ? 'task-list__item--selected' : ''}`}
              onClick={() => setSelectedId(task.id)}
            >
              <span className="task-list__name">{task.name}</span>
              <span className="task-list__count">{task.entries.length} kirjet</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
