// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "Hääldusabiline";

const ROUTE_TITLES: Record<string, string> = {
  "/": `${APP_NAME} – Tekst kõneks`,
  "/synthesis": `${APP_NAME} – Tekst kõneks`,
  "/tasks": `${APP_NAME} – Ülesanded`,
  "/specs": `${APP_NAME} – Testid`,
  "/dashboard": `${APP_NAME} – Töölaud`,
  "/role-selection": `${APP_NAME} – Vali roll`,
  "/accessibility": `${APP_NAME} – Ligipääsetavuse teatis`,
  "/privacy": `${APP_NAME} – Privaatsuspoliitika`,
  "/auth/callback": `${APP_NAME} – Sisselogimine`,
};

/**
 * Updates document.title based on the current route.
 * Accepts an optional custom title for dynamic pages (e.g. task detail).
 */
export function useDocumentTitle(customTitle?: string): void {
  const { pathname } = useLocation();

  useEffect(() => {
    if (customTitle) {
      document.title = `${APP_NAME} – ${customTitle}`;
      return;
    }

    // Exact match first
    if (ROUTE_TITLES[pathname]) {
      document.title = ROUTE_TITLES[pathname];
      return;
    }

    // Prefix match for nested routes (e.g. /tasks/:id)
    if (pathname.startsWith("/tasks/")) {
      document.title = `${APP_NAME} – Ülesanne`;
      return;
    }

    // Fallback
    document.title = APP_NAME;
  }, [pathname, customTitle]);
}
