 
'use client';

import { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

interface TaskEditModalProps {
  isOpen: boolean;
  task: { id: string; name: string; description?: string | null } | null;
  onClose: () => void;
  onSave: (updatedTask: { id: string; name: string; description?: string | null }) => Promise<void>;
  setTaskToEdit: (task: { id: string; name: string; description?: string | null } | null) => void;
}

export default function TaskEditModal({
  isOpen,
  task,
  onClose,
  onSave,
  setTaskToEdit
}: TaskEditModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen && task) {
      setName(task.name);
      setDescription(task.description || '');
      setError(null);
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) return;
    
    if (!name.trim()) {
      setError('Ülesande nimi on kohustuslik');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const updatedTask = { ...task, name: name.trim(), description: description.trim() || null };
    
    // Update the task in the hook state
    setTaskToEdit(updatedTask);

    try {
      // Pass updated task data directly to avoid race condition
      await onSave(updatedTask);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Viga ülesande muutmisel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Muuda ülesannet"
      size="medium"
      className="task-edit-modal"
    >
      <form onSubmit={handleSubmit} className="task-edit-modal__form">
        <div className="task-edit-modal__field">
          <input
            id="edit-task-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="task-edit-modal__input"
            placeholder="Ülesande nimi (Kohustuslik)"
            aria-label="Ülesande nimi (Kohustuslik)"
            disabled={isSubmitting}
            autoFocus
            aria-required="true"
          />
        </div>

        <div className="task-edit-modal__field">
          <textarea
            id="edit-task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="task-edit-modal__textarea"
            placeholder="Kirjeldus"
            aria-label="Kirjeldus"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="task-edit-modal__error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="task-edit-modal__actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Salvestan...' : 'Salvesta'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
