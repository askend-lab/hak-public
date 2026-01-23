import { useState, useCallback, useEffect } from 'react';

interface TaskFormValues {
  name: string;
  description: string;
}

interface UseTaskFormOptions {
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  resetOnSuccess?: boolean;
}

interface UseTaskFormReturn {
  name: string;
  description: string;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isSubmitting: boolean;
  isValid: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Reusable form logic for task creation/editing
 * Consolidates duplicate form patterns across TaskCreationModal and TaskEditModal
 */
export function useTaskForm({
  initialValues,
  onSubmit,
  resetOnSuccess = true
}: UseTaskFormOptions): UseTaskFormReturn {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim().length > 0;

  const reset = useCallback(() => {
    setName(initialValues?.name ?? '');
    setDescription(initialValues?.description ?? '');
    setError(null);
    setIsSubmitting(false);
  }, [initialValues?.name, initialValues?.description]);

  // Reset when initial values change (e.g., when editing different task)
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name ?? '');
      setDescription(initialValues.description ?? '');
      setError(null);
    }
  }, [initialValues?.name, initialValues?.description]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Ülesande nimi on kohustuslik');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim()
      });
      if (resetOnSuccess) {
        reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Viga ülesande salvestamisel');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, onSubmit, reset, resetOnSuccess]);

  return {
    name,
    description,
    setName,
    setDescription,
    error,
    setError,
    isSubmitting,
    isValid,
    handleSubmit,
    reset
  };
}
