// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import Notification, {
  NotificationType,
  NotificationColor,
  NotificationAction,
} from "./Notification";

export interface NotificationData {
  id: string;
  type: NotificationType;
  color?: NotificationColor | undefined;
  message: string;
  description?: string | undefined;
  action?: NotificationAction | undefined;
  duration?: number | undefined;
}

export interface NotificationRef {
  show: (
    type: NotificationType,
    message: string,
    description?: string,
    duration?: number,
    color?: NotificationColor,
    action?: NotificationAction,
  ) => void;
}

const NotificationContainer = forwardRef<NotificationRef>((_, ref) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const show = useCallback(
    (
      type: NotificationType,
      message: string,
      description?: string,
      duration?: number,
      color?: NotificationColor,
      action?: NotificationAction,
    ) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const notification: NotificationData = {
        id,
        type,
        color,
        message,
        description,
        action,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);
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
