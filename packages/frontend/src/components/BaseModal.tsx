'use client';

import { useEffect } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | null;
  showCloseButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  preventBackdropClose?: boolean;
}

const ModalHeader = ({ title, showCloseButton, onClose, headerClasses }: { title?: string | null | undefined; showCloseButton: boolean; onClose: () => void; headerClasses: string }) => (
  <div className={headerClasses}>
    {title && <h2 className="base-modal__title">{title}</h2>}
    {showCloseButton && <button onClick={onClose} className="base-modal__close" aria-label="Sulge" type="button"><img src="/icons/Menucross.svg" alt="Close" /></button>}
  </div>
);

// eslint-disable-next-line complexity
export default function BaseModal({ isOpen, onClose, title, showCloseButton = true, size = 'medium', children, className = '', headerClassName = '', contentClassName = '', preventBackdropClose = false }: BaseModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset'; };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const handleBackdropClick = (e: React.MouseEvent) => { if (!preventBackdropClose && e.target === e.currentTarget) onClose(); };
  const modalClasses = `base-modal base-modal--${size} ${className}`.trim();
  return (
    <>
      <div className="base-modal__backdrop" onClick={handleBackdropClick} />
      <div className={modalClasses}>
        {(title !== null || showCloseButton) && <ModalHeader title={title} showCloseButton={showCloseButton} onClose={onClose} headerClasses={`base-modal__header ${headerClassName}`.trim()} />}
        <div className={`base-modal__content ${contentClassName}`.trim()}>{children}</div>
      </div>
    </>
  );
}
