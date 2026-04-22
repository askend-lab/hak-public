// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createContext, useContext, useRef, useCallback, useMemo, useEffect, ReactNode } from "react";
import NotificationContainer, {
  NotificationRef,
  ShowNotificationOptions,
} from "@/components/NotificationContainer";
import { API_ERROR_EVENT, getApiErrorDetail } from "@/utils/apiErrorEvents";

export type { ShowNotificationOptions };

interface NotificationContextType {
  showNotification: (options: ShowNotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationRef = useRef<NotificationRef>(null);

  const showNotification = useCallback((options: ShowNotificationOptions) => {
    notificationRef.current?.show(options);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = getApiErrorDetail(event);
      if (detail) {
        notificationRef.current?.show({ type: "warning", message: detail.message, description: detail.description });
      }
    };
    window.addEventListener(API_ERROR_EVENT, handler);
    return () => { window.removeEventListener(API_ERROR_EVENT, handler); };
  }, []);

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
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
