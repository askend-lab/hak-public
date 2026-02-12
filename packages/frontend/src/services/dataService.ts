// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task, TaskSummary, TaskEntry, CreateTaskRequest } from "@/types/task";
import { logger } from "@hak/shared";
import { SimpleStoreAdapter } from "./storage/SimpleStoreAdapter";
import { MockDataLoader } from "./storage/MockDataLoader";
import { ShareService } from "./storage/ShareService";
import { TaskRepository } from "./repository/TaskRepository";

export class DataService {
  private static instance: DataService;
  private storage: SimpleStoreAdapter;
  private mockLoader: MockDataLoader;
  private shareService: ShareService;
  private repository: TaskRepository;

  private constructor() {
    this.storage = new SimpleStoreAdapter();
    this.mockLoader = new MockDataLoader();
    this.shareService = new ShareService(this.storage, this.mockLoader);
    this.repository = new TaskRepository(
      this.storage,
      this.mockLoader,
      this.shareService,
    );
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
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

  async getSharedTask(taskId: string): Promise<Task | null> {
    return this.shareService.getSharedTask(taskId);
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
    const task = await this.repository.getTask(taskId, userId);
    if (!task) {
      throw new Error("Task not found");
    }

    const newEntry: TaskEntry = {
      id: `entry_${crypto.randomUUID()}`,
      taskId,
      ...entryData,
      createdAt: new Date(),
    };

    const updatedEntries = [...(task.entries || []), newEntry];
    await this.repository.updateTask(userId, taskId, {
      entries: updatedEntries,
    });

    return newEntry;
  }

  async addTextEntriesToTask(
    userId: string,
    taskId: string,
    textEntries: string[] | Array<{ text: string; stressedText: string }>,
  ): Promise<TaskEntry[]> {
    return this.repository.addTextEntriesToTask(userId, taskId, textEntries);
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
