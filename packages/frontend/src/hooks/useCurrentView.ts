import { useLocation } from "react-router-dom";

export type ViewType =
  | "synthesis"
  | "tasks"
  | "specs"
  | "dashboard"
  | "role-selection";

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

  const currentView: ViewType = pathname.startsWith("/tasks")
    ? "tasks"
    : pathname.startsWith("/specs")
      ? "specs"
      : pathname.startsWith("/dashboard")
        ? "dashboard"
        : pathname.startsWith("/role-selection")
          ? "role-selection"
          : "synthesis";

  const taskIdMatch = pathname.match(/^\/tasks\/([^/]+)$/);
  const selectedTaskId: string | null = taskIdMatch?.[1] || null;

  return { currentView, selectedTaskId, pathname };
}
