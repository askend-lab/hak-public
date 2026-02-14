// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useLocation } from "react-router-dom";

export type ViewType =
  | "synthesis"
  | "tasks"
  | "specs"
  | "dashboard"
  | "role-selection"
  | "accessibility"
  | "privacy";

interface CurrentViewResult {
  currentView: ViewType;
  selectedTaskId: string | null;
  pathname: string;
}

/**
 * Determine the current view and task ID from the URL path
 * Simplifies view determination logic in App.tsx
 */
export function useCurrentView(): CurrentViewResult {
  const location = useLocation();
  const pathname = location.pathname;

  const VIEW_ROUTES: [string, ViewType][] = [
    ["/tasks", "tasks"],
    ["/specs", "specs"],
    ["/dashboard", "dashboard"],
    ["/role-selection", "role-selection"],
    ["/accessibility", "accessibility"],
    ["/privacy", "privacy"],
  ];

  const currentView: ViewType =
    VIEW_ROUTES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "synthesis";

  const taskIdMatch = pathname.match(/^\/tasks\/([^/]+)$/);
  const selectedTaskId: string | null = taskIdMatch?.[1] || null;

  return { currentView, selectedTaskId, pathname };
}
