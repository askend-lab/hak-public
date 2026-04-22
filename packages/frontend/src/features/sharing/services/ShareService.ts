// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task } from "@/types/task";
import { logger } from "@hak/shared";
import { SimpleStoreAdapter } from "@/services/storage/SimpleStoreAdapter";
import { generateShareToken } from "@/services/storage/shareTokenUtils";

export class ShareService {
  constructor(
    private storage: SimpleStoreAdapter,
  ) {}

  generateShareToken(): string {
    return generateShareToken();
  }

  async shareUserTask(task: Task): Promise<void> {
    logger.debug("Sharing task:", task.id);

    try {
      // Save task as unlisted - directly accessible by shareToken
      await this.storage.saveTaskAsUnlisted(task);
      logger.debug("Task shared successfully as unlisted");
    } catch (error) {
      logger.error("Failed to share task:", error);
      throw new Error("Failed to share task");
    }
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    logger.debug("Looking for share token");

    // Direct lookup by shareToken in unlisted storage - O(1)
    const unlistedTask = await this.storage.getTaskByShareToken(shareToken);
    if (unlistedTask) {
      logger.debug("Found unlisted task with share token:", unlistedTask.id);
      return unlistedTask;
    }

    logger.debug("No task found with share token");
    return null;
  }
}
