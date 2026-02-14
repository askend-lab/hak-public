// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task, TaskSummary, TaskEntry, CreateTaskRequest } from "@/types/task";
import { logger } from "@hak/shared";
import { SimpleStoreAdapter } from "./storage/SimpleStoreAdapter";
import { ShareService } from "@/features/sharing/services/ShareService";
import { TaskRepository } from "./repository/TaskRepository";

export interface DataServiceDeps {
  storage?: SimpleStoreAdapter;
}

export class DataService {
  private static instance: DataService | null = null;
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

  static getInstance(): DataService {
    const existing = DataService.instance;
    if (existing) return existing;
    const created = new DataService();
    DataService.instance = created;
    return created;
  }

  static resetInstance(): void {
    DataService.instance = null;
  }

  async getUserTasks(userId: string): Promise<TaskSummary[]> {
    return this.repository.getUserTasks(userId);
  }

  async getUserCreatedTasks(userId: string): Promise<TaskSummary[]> {
    return this.repository.getUserCreatedTasks(userId);
  }

  async getModifiableTasks(userId: string): Promise<TaskSummary[]> {
    return this.repository.getModifiableTasks(userId);
  }

  async getTask(taskId: string, userId: string): Promise<Task | null> {
    return this.repository.getTask(taskId, userId);
  }

  async shareUserTask(userId: string, taskId: string): Promise<void> {
    const task = await this.repository.getTask(taskId, userId);
    if (!task) {
      throw new Error("Task not found");
    }

    logger.debug("Sharing task:", { userId, taskId, task });
    await this.shareService.shareUserTask(task);
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    return this.repository.createTask(userId, taskData);
  }

  async updateTask(
    userId: string,
    taskId: string,
    updates: Partial<Task>,
  ): Promise<Task | null> {
    return this.repository.updateTask(userId, taskId, updates);
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    return this.repository.deleteTask(userId, taskId);
  }

  async addEntryToTask(
    userId: string,
    taskId: string,
    entryData: Omit<TaskEntry, "id" | "taskId" | "createdAt">,
  ): Promise<TaskEntry> {
    const entries = await this.repository.addTextEntriesToTask(
      userId,
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
    userId: string,
    taskId: string,
    textEntries: string[] | Array<{ text: string; stressedText: string }>,
    mode: "append" | "replace" = "append",
  ): Promise<TaskEntry[]> {
    return this.repository.addTextEntriesToTask(userId, taskId, textEntries, mode);
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    return this.shareService.getTaskByShareToken(shareToken);
  }

  async updateTaskEntry(
    userId: string,
    taskId: string,
    entryId: string,
    updates: Partial<Omit<TaskEntry, "id" | "taskId" | "createdAt">>,
  ): Promise<TaskEntry | null> {
    return this.repository.updateTaskEntry(userId, taskId, entryId, updates);
  }
}
