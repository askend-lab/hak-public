import { useState } from 'react';

import { useAuth } from '../../services/auth';
import { createTask } from '../../services/tasks';
import { TaskForm } from './TaskForm';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { name: string; description: string }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const userId = user?.id ?? 'test-user';
      const response = await createTask(userId, {
        name: data.name,
        description: data.description || undefined,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error ?? 'Viga ülesande loomisel');
      }
    } catch {
      setError('Võrgu viga');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="task-modal-backdrop" onClick={onClose} />
      <div className="task-modal" role="dialog" aria-modal="true">
        <div className="task-modal-header">
          <h2 className="task-modal-title">Lisa ülesanne</h2>
          <button onClick={onClose} className="task-modal-close" disabled={isSubmitting} aria-label="Sulge">
            ×
          </button>
        </div>
        <TaskForm
          onSubmit={(data) => { void handleSubmit(data); }}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </>
  );
}
