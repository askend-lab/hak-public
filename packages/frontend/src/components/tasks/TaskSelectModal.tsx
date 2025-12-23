import { useState, useCallback, useEffect } from 'react';

import { createSynthesisEntry, createTaskEntry } from '../../core';
import { useSynthesisStore, useTasksStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';
import { addEntryToTask, listTasks } from '../../services/tasks';
import { Modal } from '../ui';
import type { Task } from '../../core/schemas';

interface TaskSelectModalProps { onClose?: () => void; }

function TaskList({ tasks, selectedId, onSelect }: { tasks: Task[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <ul className="task-list">
      {tasks.map(task => (
        <li key={task.id} className={`task-list__item ${selectedId === task.id ? 'task-list__item--selected' : ''}`} onClick={() => onSelect(task.id)}>
          <span className="task-list__name">{task.name}</span>
          <span className="task-list__count">{task.entries.length} kirjet</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div>
      <p>Ülesandeid pole.</p>
      <button onClick={onCreateNew} className="btn btn--link">+ Loo uus ülesanne</button>
    </div>
  );
}

export function TaskSelectModal({ onClose }: TaskSelectModalProps) {
  const { activeModal, closeModal, openModal, addNotification } = useUIStore();
  const { tasks, setTasks, setLoading, isLoading } = useTasksStore();
  const { text, result } = useSynthesisStore();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeModal !== 'taskSelect') return;
    setLoading(true);
    const userId = user?.id ?? 'test-user';
    void listTasks(userId)
      .then(response => {
        if (response.success && response.data) {
          setTasks(response.data);
        }
      })
      .finally(() => { setLoading(false); });
  }, [activeModal, user, setTasks, setLoading]);

  const handleClose = useCallback(() => { closeModal(); onClose?.(); }, [closeModal, onClose]);

  // eslint-disable-next-line complexity -- submit handler with error handling
  const handleSubmit = useCallback(async () => {
    if (selectedId === null || !result) return;
    const entry = createEntry();
    if (!entry) return;

    setIsSubmitting(true);
    try {
      const userId = user?.id ?? 'test-user';
      const response = await addEntryToTask(userId, selectedId, entry);
      const taskName = tasks.find(t => t.id === selectedId)?.name ?? 'ülesanne';
      if (response.success) {
        addNotification('success', `Lisatud ülesandesse "${taskName}"`);
        handleClose();
      } else {
        addNotification('error', response.error ?? 'Lisamine ebaõnnestus');
      }
    } catch {
      addNotification('error', 'Võrgu viga');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedId, user, result, tasks, createEntry, addNotification, handleClose]);

  const footer = (
    <>
      <button onClick={handleClose} className="btn btn--secondary">
        Tühista
      </button>
      <button
        onClick={() => { void handleSubmit(); }}
        disabled={selectedId === null || isSubmitting}
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
      ) : (
        tasks.length === 0 ? (
          <div>
            <p>Ülesandeid pole.</p>
            <button 
              onClick={() => { openModal('taskCreate'); }} 
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
              onClick={() => { setSelectedId(task.id); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(task.id); }}
              role="button"
              tabIndex={0}
            >
              <span className="task-list__name">{task.name}</span>
              <span className="task-list__count">{task.entries.length} kirjet</span>
            </li>
          ))}
        </ul>
        )
      )}
    </Modal>
  );
}

export default TaskSelectModal;
