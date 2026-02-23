// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import Notification, {
  NotificationType,
  NotificationColor,
  NotificationAction,
} from "./Notification";

interface NotificationData {
  id: string;
  type: NotificationType;
  color?: NotificationColor | undefined;
  message: string;
  description?: string | undefined;
  action?: NotificationAction | undefined;
  duration?: number | undefined;
}

export interface ShowNotificationOptions {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  color?: NotificationColor;
  action?: NotificationAction;
}

export interface NotificationRef {
  show: (options: ShowNotificationOptions) => void;
}

const NotificationContainer = forwardRef<NotificationRef>((_, ref) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const show = useCallback(
    (options: ShowNotificationOptions) => {
      const id = `notification-${crypto.randomUUID()}`;
      const notification: NotificationData = {
        id,
        type: options.type,
        color: options.color,
        message: options.message,
        description: options.description,
        action: options.action,
        duration: options.duration,
      };

      const MAX_NOTIFICATIONS = 5;
      setNotifications((prev) => [...prev, notification].slice(-MAX_NOTIFICATIONS));
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      show,
    }),
    [show],
  );

  return (
    <div className="notification-container" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          color={notification.color ?? undefined}
          message={notification.message}
          description={notification.description ?? undefined}
          action={notification.action ?? undefined}
          duration={notification.duration ?? undefined}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
});

NotificationContainer.displayName = "NotificationContainer";

export default NotificationContainer;
