"use client";

import { useState } from "react";
import BaseModal from "./BaseModal";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string) => Promise<void>;
}

const AddEntryForm = ({
  title,
  description,
  isSubmitting,
  error,
  onTitleChange,
  onDescChange,
  onSubmit,
}: {
  title: string;
  description: string;
  isSubmitting: boolean;
  error: string | null;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form onSubmit={onSubmit} className="add-entry-modal__form">
    <div className="add-entry-modal__field">
      <input
        id="entry-title"
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="add-entry-modal__input"
        placeholder="Pealkiri (Kohustuslik)"
        aria-label="Pealkiri (Kohustuslik)"
        disabled={isSubmitting}
        autoFocus
        aria-required="true"
      />
    </div>
    <div className="add-entry-modal__field">
      <textarea
        id="entry-description"
        value={description}
        onChange={(e) => onDescChange(e.target.value)}
        className="add-entry-modal__textarea"
        placeholder="Kirjeldus"
        aria-label="Kirjeldus"
        disabled={isSubmitting}
      />
    </div>
    {error && (
      <div className="add-entry-modal__error" role="alert">
        <p>{error}</p>
      </div>
    )}
    <div className="add-entry-modal__actions">
      <button
        type="submit"
        className="button button--primary"
        disabled={isSubmitting || !title.trim()}
      >
        {isSubmitting ? "Lisaan..." : "Lisa"}
      </button>
    </div>
  </form>
);

export default function AddEntryModal({
  isOpen,
  onClose,
  onAdd,
}: AddEntryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setError(null);
  };
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Pealkiri on kohustuslik");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(title.trim(), description.trim());
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Viga ülesande lisamisel");
    } finally {
      setIsSubmitting(false);
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
      <AddEntryForm
        title={title}
        description={description}
        isSubmitting={isSubmitting}
        error={error}
        onTitleChange={setTitle}
        onDescChange={setDescription}
        onSubmit={handleSubmit}
      />
    </BaseModal>
  );
}
