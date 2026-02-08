// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { createContext, useContext, useRef, ReactNode } from "react";
import NotificationContainer, {
  NotificationRef,
} from "@/components/NotificationContainer";
import {
  NotificationType,
  NotificationColor,
  NotificationAction,
} from "@/components/Notification";

interface NotificationContextType {
  showNotification: (
    type: NotificationType,
    message: string,
    description?: string,
    duration?: number,
    color?: NotificationColor,
    action?: NotificationAction,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationRef = useRef<NotificationRef>(null);

  const showNotification = (
    type: NotificationType,
    message: string,
    description?: string,
    duration?: number,
    color?: NotificationColor,
    action?: NotificationAction,
  ) => {
    notificationRef.current?.show(
      type,
      message,
      description,
      duration,
      color,
      action,
    );
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer ref={notificationRef} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
