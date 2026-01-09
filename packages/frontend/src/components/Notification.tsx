'use client';

import { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationProps {
  type: NotificationType;
  color?: NotificationColor | undefined;
  message: string;
  description?: string | undefined;
  action?: NotificationAction | undefined;
  duration?: number | undefined;
  onClose: () => void;
}

export default function Notification({
  type,
  color,
  message,
  description,
  action,
  duration = 4000,
  onClose
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, onClose]);

  // Determine color: use explicit color prop, or default based on type
  const getColorClass = () => {
    if (color) {
      return `modal--${color}--outlined`;
    }
    // Default: danger for errors, primary for everything else
    return type === 'error' ? 'modal--danger--outlined' : 'modal--primary--outlined';
  };

  const handleActionClick = () => {
    if (action) {
      action.onClick();
      onClose();
    }
  };

  return (
    <div className={`modal modal--small ${getColorClass()} modal--outlined notification-toast`}>
      <div className="modal__top">
        <h2>{message}</h2>
        <button 
          onClick={onClose}
          aria-label="Sulge teade"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      {(description || action) && (
        <p>
          {description}
          {description && action && ' '}
          {action && (
            <button 
              className="notification-action-link"
              onClick={handleActionClick}
            >
              {action.label}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
