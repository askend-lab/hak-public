'use client';

import { useEffect } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  preventBackdropClose?: boolean;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  size = 'medium',
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  preventBackdropClose = false,
}: BaseModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!preventBackdropClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClass = `base-modal--${size}`;
  const modalClasses = `base-modal ${sizeClass} ${className}`.trim();
  const headerClasses = `base-modal__header ${headerClassName}`.trim();
  const contentClasses = `base-modal__content ${contentClassName}`.trim();

  return (
    <>
      <div className="base-modal__backdrop" onClick={handleBackdropClick} />
      <div className={modalClasses}>
        {(title || showCloseButton) && (
          <div className={headerClasses}>
            {title && <h2 className="base-modal__title">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="base-modal__close"
                aria-label="Sulge"
                type="button"
              >
                <img src="/icons/Menucross.svg" alt="Close" />
              </button>
            )}
          </div>
        )}
        <div className={contentClasses}>{children}</div>
      </div>
    </>
  );
}

