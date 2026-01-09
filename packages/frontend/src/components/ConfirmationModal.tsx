'use client';

import BaseModal from './BaseModal';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="small"
      className={`confirmation-modal confirmation-modal--${variant}`}
    >
      <p className="confirmation-modal__message">{message}</p>

      <div className="confirmation-modal__actions">
        <button
          onClick={handleCancel}
          className="button button--secondary"
          type="button"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className="button button--primary"
          type="button"
        >
          {confirmText}
        </button>
      </div>
    </BaseModal>
  );
}
