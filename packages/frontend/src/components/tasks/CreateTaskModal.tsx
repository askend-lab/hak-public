import { useState } from 'react';

import { Modal } from '../ui';
import { useUserId } from '../../hooks/useUserId';
import { createTask } from '../../services/tasks';
import { TaskForm } from './TaskForm';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const userId = useUserId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { name: string; description: string }) => {
    setIsSubmitting(true);
    setError(null);

    try {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lisa ülesanne"
      className="task-modal"
    >
      <TaskForm
        onSubmit={(data) => { void handleSubmit(data); }}
        isSubmitting={isSubmitting}
        error={error}
      />
    </Modal>
  );
}
