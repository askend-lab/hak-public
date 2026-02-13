// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task, TaskEntry } from "@/types/task";
import mockTasksData from "@/data/mock-tasks.json";
import { generateShareToken } from "./shareTokenUtils";
import { logger } from "@hak/shared";

export class MockDataLoader {
  private normalizeTaskEntry(
    entry: TaskEntry,
    taskId: string,
    taskCreatedAt: Date,
  ): TaskEntry {
    return {
      ...entry,
      taskId: entry.taskId || taskId,
      audioBlob: entry.audioBlob || null,
      createdAt: entry.createdAt ? new Date(entry.createdAt) : taskCreatedAt,
    };
  }

  private normalizeTask(taskData: Record<string, unknown>): Task {
    const taskId = taskData.id as string;
    const createdAt = new Date(taskData.createdAt as string);
    const entries = (taskData.entries as TaskEntry[] | undefined) || [];

    return {
      ...taskData,
      shareToken:
        (taskData.shareToken as string) || generateShareToken(),
      speechSequences:
        (taskData.speechSequences as string[]) ||
        entries.map((e: TaskEntry) => e.text) ||
        [],
      entries: entries.map((entry: TaskEntry) =>
        this.normalizeTaskEntry(entry, taskId, createdAt),
      ),
      createdAt,
      updatedAt: new Date(taskData.updatedAt as string),
    } as Task;
  }

  async loadBaselineTasks(): Promise<Task[]> {
    try {
      return (mockTasksData.tasks as unknown[]).map((task: unknown) =>
        this.normalizeTask(task as Record<string, unknown>),
      );
    } catch (error) {
      logger.error("Failed to load baseline tasks:", error);
      return [];
    }
  }

  async findTaskByShareToken(shareToken: string): Promise<Task | null> {
    try {
      const taskData = (mockTasksData.tasks as unknown[]).find(
        (task: unknown) =>
          (task as Record<string, unknown>).shareToken === shareToken,
      );

      return taskData
        ? this.normalizeTask(taskData as Record<string, unknown>)
        : null;
    } catch (error) {
      logger.error("Failed to find task by share token:", error);
      return null;
    }
  }
}
