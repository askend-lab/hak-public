import { useEffect, useCallback } from 'react';

import { useUIStore, type NotificationItem } from '../../features';

interface NotificationItemProps {
  notification: NotificationItem;
}

function NotificationToast({ notification }: NotificationItemProps) {
  const { removeNotification } = useUIStore();

  useEffect(() => {
    if (notification.duration !== undefined && notification.duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
      return () => { clearTimeout(timer); };
    }
    return undefined;
  }, [notification.id, notification.duration, removeNotification]);

  const handleClose = useCallback(() => {
    removeNotification(notification.id);
  }, [notification.id, removeNotification]);

  const typeClass = `notification--${notification.type}`;

  return (
    <div className={`notification ${typeClass}`}>
      <span className="notification__message">{notification.message}</span>
      <button onClick={handleClose} className="notification__close">×</button>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications } = useUIStore();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(n => (
        <NotificationToast key={n.id} notification={n} />
      ))}
    </div>
  );
}
