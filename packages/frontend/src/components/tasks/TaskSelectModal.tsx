import { useState, useCallback, useEffect } from 'react';

import { createSynthesisEntry, createTaskEntry } from '../../core';
import { useSynthesisStore, useTasksStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';
import { addEntryToTask, listTasks } from '../../services/tasks';
import { Modal } from '../ui';

interface TaskSelectModalProps { onClose?: () => void; }

 
export function TaskSelectModal({ onClose }: TaskSelectModalProps) {
  const { activeModal, closeModal, openModal, addNotification } = useUIStore();
  const { tasks, setTasks, setLoading, isLoading } = useTasksStore();
  const { text, result } = useSynthesisStore();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeModal !== 'taskSelect') return;
    
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
  }, [activeModal, user, setTasks, setLoading]);

  const handleClose = useCallback(() => { closeModal(); onClose?.(); }, [closeModal, onClose]);

  // Create a task entry from the current result
  const createEntry = useCallback(() => {
    if (!result) return null;
    const synthesis = createSynthesisEntry({
      originalText: text,
      phoneticText: result.phoneticText,
      audioHash: result.audioHash,
      voiceModel: result.voiceModel,
    });
    return createTaskEntry(synthesis, 0);
  }, [result, text]);

   
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

  const renderContent = () => {
    if (isLoading) {
      return <p>Laadin ülesandeid...</p>;
    }
    
    if (tasks.length === 0) {
      return (
        <div>
          <p>Ülesandeid pole.</p>
          <button 
            onClick={() => { openModal('taskCreate'); }} 
            className="btn btn--link"
          >
            + Loo uus ülesanne
          </button>
        </div>
      );
    }
    
    return (
      <div className="task-list">
        {tasks.map(task => (
          <button
             
            key={task.id}
            className={`task-list__item ${selectedId === task.id ? 'task-list__item--selected' : ''}`}
            onClick={() => { setSelectedId(task.id); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedId(task.id); }}
            type="button"
          >
            <span className="task-list__name">{task.name}</span>
            <span className="task-list__count">{task.entries.length} kirjet</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={activeModal === 'taskSelect'}
      onClose={handleClose}
      title="Vali ülesanne"
      footer={footer}
    >
      {renderContent()}
    </Modal>
  );
}
