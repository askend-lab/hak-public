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

const MAX_NOTIFICATIONS = 5;

function createNotification(options: ShowNotificationOptions): NotificationData {
  return {
    id: `notification-${crypto.randomUUID()}`,
    type: options.type, color: options.color, message: options.message,
    description: options.description, action: options.action, duration: options.duration,
  };
}

const filterById = (id: string) => (n: NotificationData) => n.id !== id;

function useNotificationState() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter(filterById(id)));
  }, []);
  const show = useCallback((options: ShowNotificationOptions) => {
    setNotifications((prev) => [...prev, createNotification(options)].slice(-MAX_NOTIFICATIONS));
  }, []);
  return { notifications, removeNotification, show };
}

function NotificationList({ notifications, removeNotification }: { notifications: NotificationData[]; removeNotification: (id: string) => void }) {
  return (
    <div className="notification-container" aria-live="polite" aria-atomic="true">
      {notifications.map((n) => (
        <Notification
          key={n.id}
          type={n.type}
          color={n.color ?? undefined}
          message={n.message}
          description={n.description ?? undefined}
          action={n.action ?? undefined}
          duration={n.duration ?? undefined}
          onClose={() => removeNotification(n.id)}
        />
      ))}
    </div>
  );
}

const NotificationContainer = forwardRef<NotificationRef>((_, ref) => {
  const { notifications, removeNotification, show } = useNotificationState();
  useImperativeHandle(ref, () => ({ show }), [show]);
  return <NotificationList notifications={notifications} removeNotification={removeNotification} />;
});

NotificationContainer.displayName = "NotificationContainer";

export default NotificationContainer;
