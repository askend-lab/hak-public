import { ReactNode, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
}: ModalProps) {
  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      role="presentation"
    >
      { }
      <div 
        className={`modal ${className}`} 
        onClick={handleContentClick}
        onKeyDown={(e) => { e.stopPropagation(); }}
        role="dialog"
        tabIndex={-1}
      >
        <div className="modal__header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal__close">
            ×
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer !== undefined && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
