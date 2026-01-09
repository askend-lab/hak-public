import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const confirmClasses = [
    'confirm-dialog__btn',
    'confirm-dialog__btn--confirm',
    variant !== 'default' && `confirm-dialog__btn--confirm--${variant}`,
  ].filter(Boolean).join(' ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-dialog">
        <p className="confirm-dialog__message">{message}</p>
        
        <div className="confirm-dialog__actions">
          <button onClick={onClose} className="confirm-dialog__btn confirm-dialog__btn--cancel">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={confirmClasses}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
