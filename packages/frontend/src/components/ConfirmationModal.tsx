// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import BaseModal from "./BaseModal";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "OK",
  cancelText = "Tühista",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmationModalProps) {
  if (!isOpen) return null;
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="small"
      className={`confirmation-modal confirmation-modal--${variant}`}
    >
      <p className="confirmation-modal__message">{message}</p>
      <div className="confirmation-modal__actions">
        <button
          onClick={onCancel}
          className="button button--secondary"
          type="button"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="button button--primary"
          type="button"
        >
          {confirmText}
        </button>
      </div>
    </BaseModal>
  );
}
