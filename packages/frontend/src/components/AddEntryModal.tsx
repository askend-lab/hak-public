'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string) => Promise<void>;
}

export default function AddEntryModal({
  isOpen,
  onClose,
  onAdd
}: AddEntryModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Pealkiri on kohustuslik');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd(title.trim(), description.trim());
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Viga ülesande lisamisel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Lisa ülesanne"
      size="medium"
      className="add-entry-modal"
    >
      <form onSubmit={handleSubmit} className="add-entry-modal__form">
        <div className="add-entry-modal__field">
          <input
            id="entry-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="add-entry-modal__input"
            placeholder="Pealkiri (Kohustuslik)"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div className="add-entry-modal__field">
          <textarea
            id="entry-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="add-entry-modal__textarea"
            placeholder="Kirjeldus"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="add-entry-modal__error">
            <p>{error}</p>
          </div>
        )}

        <div className="add-entry-modal__actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? 'Lisaan...' : 'Lisa'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
