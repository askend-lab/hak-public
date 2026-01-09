import { ReactNode, useCallback } from 'react'
import { cn } from '../../utils/cn'

interface ExtendedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ExtendedModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  size = 'md',
}: ExtendedModalProps) {
  const handleOverlayClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) {
    return null
  }

  const sizeClasses = {
    sm: 'modal--small',
    md: 'modal--medium',
    lg: 'modal--large',
  }

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      role="presentation"
    >
      <div 
        className={cn('modal', sizeClasses[size], className)}
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
  )
}

// Compound components for better composition
export function ModalHeader({ children }: { children: ReactNode }) {
  return <div className="modal__header">{children}</div>
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="modal__body">{children}</div>
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="modal__footer">{children}</div>
}
