import { useState, useEffect } from 'react';

interface TaskFormProps {
  onSubmit: (data: { name: string; description: string }) => void;
  onCancel?: () => void;
  initialName?: string;
  initialDescription?: string;
  submitText?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export function TaskForm({
  onSubmit,
  initialName = '',
  initialDescription = '',
  submitText = 'Lisa',
  isSubmitting = false,
  error = null,
}: TaskFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-modal-form">
      <div className="task-form-field">
        <input
          type="text"
          className="task-form-input"
          placeholder="Pealkiri (Kohustuslik)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          autoFocus
        />
      </div>
      <div className="task-form-field">
        <textarea
          className="task-form-textarea"
          placeholder="Kirjeldus"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={4}
        />
      </div>
      {error && <div className="task-form-error"><p>{error}</p></div>}
      <div className="task-modal-actions">
        <button
          type="submit"
          className="task-modal-submit"
          disabled={isSubmitting || !name.trim()}
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}
