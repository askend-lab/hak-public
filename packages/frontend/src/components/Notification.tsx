'use client';

import { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
export interface NotificationAction { label: string; onClick: () => void; }
export interface NotificationProps { type: NotificationType; color?: NotificationColor; message: string; description?: string; action?: NotificationAction; duration?: number; onClose: () => void; }

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Notification({ type, color, message, description, action, duration = 4000, onClose }: NotificationProps) {
  useEffect(() => { if (duration > 0) { const t = setTimeout(onClose, duration); return () => clearTimeout(t); } return undefined; }, [duration, onClose]);
  const colorClass = color ? `modal--${color}--outlined` : (type === 'error' ? 'modal--danger--outlined' : 'modal--primary--outlined');
  const handleAction = () => { if (action) { action.onClick(); onClose(); } };
  return (
    <div className={`modal modal--small ${colorClass} modal--outlined notification-toast`}>
      <div className="modal__top"><h2>{message}</h2><button onClick={onClose} aria-label="Sulge teade"><CloseIcon /></button></div>
      {(description || action) && <p>{description}{description && action && ' '}{action && <button className="notification-action-link" onClick={handleAction}>{action.label}</button>}</p>}
    </div>
  );
}
