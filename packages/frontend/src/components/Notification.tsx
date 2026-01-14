'use client';

import { useEffect } from 'react';
import { CloseIcon } from './ui/Icons';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
export interface NotificationAction { label: string; onClick: () => void; }
export interface NotificationProps { type: NotificationType; color?: NotificationColor | undefined; message: string; description?: string | undefined; action?: NotificationAction | undefined; duration?: number | undefined; onClose: () => void; }

const typeToColorMap: Record<NotificationType, NotificationColor> = { success: 'success', error: 'danger', warning: 'warning', info: 'primary' };

export default function Notification({ type, color, message, description, action, duration = 4000, onClose }: NotificationProps) {
  useEffect(() => { if (duration > 0) { const t = setTimeout(onClose, duration); return () => clearTimeout(t); } return undefined; }, [duration, onClose]);
  const colorClass = `modal--${color ?? typeToColorMap[type]}--outlined`;
  const handleAction = () => { if (action) { action.onClick(); onClose(); } };
  return (
    <div className={`modal modal--small ${colorClass} modal--outlined notification-toast`}>
      <div className="modal__top"><h2>{message}</h2><button onClick={onClose} aria-label="Sulge teade"><CloseIcon size="2xl" /></button></div>
      {(description || action) && <p>{description}{description && action && ' '}{action && <button className="notification-action-link" onClick={handleAction}>{action.label}</button>}</p>}
    </div>
  );
}
