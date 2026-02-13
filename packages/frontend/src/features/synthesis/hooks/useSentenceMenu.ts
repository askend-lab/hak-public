// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { useAuth } from "@/features/auth/services";
import { DataService } from "@/services/dataService";
import { logger } from "@hak/shared";

export function useSentenceMenu(): {
  openMenuId: string | null;
  menuAnchorEl: { [key: string]: HTMLElement | null };
  menuTasks: Array<{ id: string; name: string }>;
  isLoadingMenuTasks: boolean;
  menuSearchQuery: string;
  setMenuSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleMenuOpen: (event: React.MouseEvent, id: string) => Promise<void>;
  handleMenuClose: () => void;
} {
  const { user, isAuthenticated } = useAuth();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [menuTasks, setMenuTasks] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingMenuTasks, setIsLoadingMenuTasks] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  const handleMenuOpen = useCallback(
    async (event: React.MouseEvent, id: string) => {
      // Capture currentTarget synchronously before any async work
      // (React synthetic events are pooled and currentTarget becomes null after the event handler returns)
      const target = event.currentTarget as HTMLElement;
      setMenuAnchorEl((prev) => ({ ...prev, [id]: target }));
      setOpenMenuId(id);

      if (isAuthenticated && user) {
        setIsLoadingMenuTasks(true);
        try {
          const dataService = DataService.getInstance();
          const tasks = await dataService.getUserTasks(user.id);
          setMenuTasks(tasks.map((t) => ({ id: t.id, name: t.name })));
        } catch (error) {
          logger.error("Failed to load tasks for menu:", error);
          setMenuTasks([]);
        } finally {
          setIsLoadingMenuTasks(false);
        }
      }
    },
    [isAuthenticated, user],
  );

  const handleMenuClose = useCallback(() => {
    setOpenMenuId(null);
    setMenuSearchQuery("");
  }, []);

  return {
    openMenuId,
    menuAnchorEl,
    menuTasks,
    isLoadingMenuTasks,
    menuSearchQuery,
    setMenuSearchQuery,
    handleMenuOpen,
    handleMenuClose,
  };
}
