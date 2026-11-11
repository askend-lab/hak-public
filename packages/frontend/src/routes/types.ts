// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { useSynthesis } from "@/hooks";
import type { useTaskHandlers } from "@/features/tasks/hooks/useTaskHandlers";
import type { ShowNotificationOptions } from "@/contexts/NotificationContext";

export interface AppLayoutContext {
  synthesis: ReturnType<typeof useSynthesis>;
  taskHandlers: ReturnType<typeof useTaskHandlers>;
  showNotification: (options: ShowNotificationOptions) => void;
  isAuthenticated: boolean;
  setShowLoginModal: (v: boolean) => void;
}
