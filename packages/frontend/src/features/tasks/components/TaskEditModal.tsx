// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useState, useEffect } from "react";
import { getErrorMessage } from "@/utils/getErrorMessage";
import BaseModal from "@/components/BaseModal";

interface TaskEditModalProps {
  isOpen: boolean;
  task: { id: string; name: string; description?: string | null } | null;
  onClose: () => void;
  onSave: (updatedTask: {
    id: string;
    name: string;
    description?: string | null;
  }) => Promise<void>;
  setTaskToEdit: (
    task: { id: string; name: string; description?: string | null } | null,
  ) => void;
}

function EditForm({ name, setName, description, setDescription, isSubmitting, error, onSubmit }: {
  name: string; setName: (v: string) => void; description: string; setDescription: (v: string) => void;
  isSubmitting: boolean; error: string | null; onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="task-edit-modal__form">
      <div className="task-edit-modal__field">
        <input id="edit-task-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="task-edit-modal__input" placeholder="Ülesande nimi (Kohustuslik)" aria-label="Ülesande nimi (Kohustuslik)" disabled={isSubmitting} autoFocus aria-required="true" />
      </div>
      <div className="task-edit-modal__field">
        <textarea id="edit-task-description" value={description} onChange={(e) => setDescription(e.target.value)}
          className="task-edit-modal__textarea" placeholder="Kirjeldus" aria-label="Kirjeldus" disabled={isSubmitting} />
      </div>
      {error && <div className="task-edit-modal__error" role="alert"><p>{error}</p></div>}
      <div className="task-edit-modal__actions">
        <button type="submit" className="button button--primary" disabled={isSubmitting || !name.trim()}>{isSubmitting ? "Salvestan..." : "Salvesta"}</button>
      </div>
    </form>
  );
}

export default function TaskEditModal({ isOpen, task, onClose, onSave, setTaskToEdit }: TaskEditModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (isOpen && task) { setName(task.name); setDescription(task.description || ""); setError(null); } }, [isOpen, task]);
  const handleClose = () => { if (!isSubmitting) { setName(""); setDescription(""); setError(null); onClose(); } };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!task) {return;}
    if (!name.trim()) { setError("Ülesande nimi on kohustuslik"); return; }
    setIsSubmitting(true); setError(null);
    const updated = { ...task, name: name.trim(), description: description.trim() || null };
    setTaskToEdit(updated);
    try { await onSave(updated); handleClose(); } catch (err) { setError(getErrorMessage(err, "Viga ülesande muutmisel")); } finally { setIsSubmitting(false); }
  };
  if (!isOpen || !task) {return null;}
  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Muuda ülesannet" size="medium" className="task-edit-modal">
      <EditForm name={name} setName={setName} description={description} setDescription={setDescription} isSubmitting={isSubmitting} error={error} onSubmit={(e) => { void handleSubmit(e); }} />
    </BaseModal>
  );
}
