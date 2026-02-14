// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { logger } from "@hak/shared";

interface UseTaskSharingDeps {
  setShowShareTaskModal: (show: boolean) => void;
  setTaskToShare: (task: { id: string; name: string; shareToken?: string } | null) => void;
  requireAuth: () => boolean;
}

export function useTaskSharing(deps: UseTaskSharingDeps) {
  const { user } = useAuth();
  const dataService = useDataService();
  const { setShowShareTaskModal, setTaskToShare, requireAuth } = deps;

  const handleShareTask = useCallback(
    async (task: { id: string; name: string; shareToken?: string }) => {
      if (requireAuth()) return;
      if (!user) return;
      try {
        await dataService.shareUserTask(user.id, task.id);
        const fullTask = await dataService.getTask(task.id, user.id);
        if (fullTask) {
          setTaskToShare(
            task.shareToken
              ? { id: task.id, shareToken: task.shareToken, name: task.name }
              : { id: task.id, name: task.name },
          );
          setShowShareTaskModal(true);
        }
      } catch (error) {
        logger.error("Failed to share task:", error);
      }
    },
    [requireAuth, user, dataService],
  );

  const handleRevokeShare = useCallback(
    async (shareToken: string) => {
      if (!user) return;
      try {
        await dataService.revokeShare(shareToken);
      } catch (error) {
        logger.error("Failed to revoke share:", error);
        throw error;
      }
    },
    [user, dataService],
  );

  return { handleShareTask, handleRevokeShare };
}
