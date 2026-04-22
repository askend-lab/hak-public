// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task, TaskSummary, TaskEntry, CreateTaskRequest } from "@/types/task";
import { logger } from "@hak/shared";
import { SimpleStoreAdapter } from "./storage/SimpleStoreAdapter";
import { ShareService } from "@/features/sharing/services/ShareService";
import { TaskRepository } from "./repository/TaskRepository";

interface DataServiceDeps {
  storage?: SimpleStoreAdapter;
}

export class DataService {
  private storage: SimpleStoreAdapter;
  private shareService: ShareService;
  private repository: TaskRepository;

  constructor(deps: DataServiceDeps = {}) {
    this.storage = deps.storage ?? new SimpleStoreAdapter();
    this.shareService = new ShareService(this.storage);
    this.repository = new TaskRepository(
      this.storage,
      this.shareService,
    );
  }

  async getUserTasks(): Promise<TaskSummary[]> {
    return this.repository.getUserTasks();
  }

  async getUserCreatedTasks(): Promise<TaskSummary[]> {
    return this.repository.getUserCreatedTasks();
  }

  async getModifiableTasks(): Promise<TaskSummary[]> {
    return this.repository.getModifiableTasks();
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.repository.getTask(taskId);
  }

  async shareUserTask(taskId: string): Promise<void> {
    const task = await this.repository.getTask(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    logger.debug("Sharing task:", { taskId });
    await this.shareService.shareUserTask(task);
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    return this.repository.createTask(userId, taskData);
  }

  async updateTask(
    taskId: string,
    updates: Partial<Task>,
  ): Promise<Task | null> {
    return this.repository.updateTask(taskId, updates);
  }

  async deleteTask(taskId: string): Promise<boolean> {
    return this.repository.deleteTask(taskId);
  }

  async addEntryToTask(
    taskId: string,
    entryData: Omit<TaskEntry, "id" | "taskId" | "createdAt">,
  ): Promise<TaskEntry> {
    const entries = await this.repository.addTextEntriesToTask(
      taskId,
      [{ text: entryData.text, stressedText: entryData.stressedText }],
    );
    const entry = entries[0];
    if (!entry) {
      throw new Error("Failed to create entry");
    }
    return entry;
  }

  async addTextEntriesToTask(
    taskId: string,
    textEntries: string[] | Array<{ text: string; stressedText: string }>,
    mode: "append" | "replace" = "append",
  ): Promise<TaskEntry[]> {
    return this.repository.addTextEntriesToTask(taskId, textEntries, mode);
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    return this.shareService.getTaskByShareToken(shareToken);
  }

  async revokeShare(shareToken: string): Promise<void> {
    await this.storage.deleteUnlistedTask(shareToken);
  }

  async updateTaskEntry(
    taskId: string,
    entryId: string,
    updates: Partial<Omit<TaskEntry, "id" | "taskId" | "createdAt">>,
  ): Promise<TaskEntry | null> {
    return this.repository.updateTaskEntry(taskId, entryId, updates);
  }
}
