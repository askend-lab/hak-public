// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task } from "@/types/task";
import { logger } from "@hak/shared";
import { SimpleStoreAdapter } from "@/services/storage/SimpleStoreAdapter";
import { MockDataLoader } from "@/services/storage/MockDataLoader";
import { generateShareToken } from "@/services/storage/shareTokenUtils";

export class ShareService {
  constructor(
    private storage: SimpleStoreAdapter,
    private mockLoader: MockDataLoader,
  ) {}

  generateShareToken(): string {
    return generateShareToken();
  }

  async getSharedTask(taskId: string): Promise<Task | null> {
    logger.debug("Getting shared task:", taskId);

    // Check baseline tasks only - no shared storage fallback
    const baselineTasks = await this.mockLoader.loadBaselineTasks();
    const baselineTask = baselineTasks.find((task) => task.id === taskId);
    if (baselineTask) {
      logger.debug("Found baseline task:", baselineTask);
      return baselineTask;
    }

    // Note: This method is deprecated. Use getTaskByShareToken instead.
    // Tasks are now stored as unlisted and accessed by shareToken, not by ID.
    logger.debug("No baseline task found for ID:", taskId);
    return null;
  }

  async shareUserTask(task: Task): Promise<void> {
    logger.debug("Sharing task:", task);

    try {
      // Save task as unlisted - directly accessible by shareToken
      await this.storage.saveTaskAsUnlisted(task);
      logger.debug("Task shared successfully as unlisted:", task.shareToken);
    } catch (error) {
      console.error("Failed to share task:", error);
      throw new Error("Failed to share task");
    }
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    logger.debug("Looking for share token:", shareToken);

    // First check baseline tasks
    const baselineTask = await this.mockLoader.findTaskByShareToken(shareToken);
    if (baselineTask) {
      logger.debug("Found baseline task with share token:", baselineTask);
      return baselineTask;
    }

    // Direct lookup by shareToken in unlisted storage - O(1)
    const unlistedTask = await this.storage.getTaskByShareToken(shareToken);
    if (unlistedTask) {
      logger.debug("Found unlisted task with share token:", unlistedTask);
      return unlistedTask;
    }

    logger.debug("No task found with share token:", shareToken);
    return null;
  }
}
