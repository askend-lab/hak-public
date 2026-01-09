'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

// eslint-disable-next-line max-lines-per-function
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Kinnita',
  cancelText = 'Tühista',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="confirm-dialog-backdrop" onClick={onCancel} />
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        
        <div className="confirm-dialog-actions">
          <button
            onClick={onCancel}
            className="confirm-dialog-cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`confirm-dialog-confirm confirm-${variant}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}