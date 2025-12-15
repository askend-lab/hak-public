import { useState, useCallback } from 'react';
import { useSynthesisStore, useTasksStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';
import { addEntryToTask } from '../../services/tasks';
import { createSynthesisEntry, createTaskEntry } from '../../core';
import { Modal } from '../ui';

interface TaskSelectModalProps {
  onClose?: () => void;
}

export function TaskSelectModal({ onClose }: TaskSelectModalProps) {
  const { activeModal, closeModal, addNotification } = useUIStore();
  const { tasks } = useTasksStore();
  const { text, result } = useSynthesisStore();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    closeModal();
    onClose?.();
  }, [closeModal, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!selectedId || !user || !result) return;

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
      
      const response = await addEntryToTask(user.id, selectedId, entry);
      
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
  }, [selectedId, user, result, text, tasks, addEntryToTask, addNotification, handleClose]);

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
      {tasks.length === 0 ? (
        <p>Ülesandeid pole. Loo uus ülesanne.</p>
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
