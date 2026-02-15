// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createContext, useContext, useRef, useCallback, useMemo, ReactNode } from "react";
import NotificationContainer, {
  NotificationRef,
  ShowNotificationOptions,
} from "@/components/NotificationContainer";

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
