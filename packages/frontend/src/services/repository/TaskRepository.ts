// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task, TaskEntry, TaskSummary, CreateTaskRequest } from "@/types/task";
import { SimpleStoreAdapter } from "../storage/SimpleStoreAdapter";
import { ShareService } from "@/features/sharing/services/ShareService";

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export class TaskRepository {
  constructor(
    private storage: SimpleStoreAdapter,
    private shareService: ShareService,
  ) {}

  private toSummary(task: Task): TaskSummary {
    return {
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      entryCount: task.entries?.length || 0,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }

  async getUserTasks(_userId: string): Promise<TaskSummary[]> {
    const userTasks = await this.storage.queryUserTasks();
    return userTasks.map((task) => this.toSummary(task));
  }

  async getUserCreatedTasks(_userId: string): Promise<TaskSummary[]> {
    return this.getUserTasks(_userId);
  }

  async getModifiableTasks(_userId: string): Promise<TaskSummary[]> {
    return this.getUserCreatedTasks(_userId);
  }

  async getTask(taskId: string, _userId: string): Promise<Task | null> {
    return this.storage.getTask(taskId);
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    const taskId = generateId("task");
    const newTask: Task = {
      id: taskId,
      userId,
      name: taskData.name,
      description: taskData.description ?? null,
      speechSequences: taskData.speechSequences ?? [],
      entries:
        taskData.speechEntries?.map((entry, index) => ({
          id: generateId("entry"),
          taskId,
          text: entry.text,
          stressedText: entry.stressedText,
          audioUrl: null,
          audioBlob: null,
          order: index + 1,
          createdAt: new Date(),
        })) ??
        taskData.speechSequences?.map((text, index) => ({
          id: generateId("entry"),
          taskId,
          text,
          stressedText: text,
          audioUrl: null,
          audioBlob: null,
          order: index + 1,
          createdAt: new Date(),
        })) ??
        [],
      createdAt: new Date(),
      updatedAt: new Date(),
      shareToken: this.shareService.generateShareToken(),
    };

    await this.storage.saveTask(newTask);

    // Also save as unlisted for anonymous access via shareToken
    await this.storage.saveTaskAsUnlisted(newTask);

    return newTask;
  }

  async updateTask(
    _userId: string,
    taskId: string,
    updates: Partial<Task>,
  ): Promise<Task | null> {
    const existingTask = await this.storage.getTask(taskId);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      updatedAt: new Date(),
    };

    await this.storage.saveTask(updatedTask);
    // Sync unlisted storage for anonymous access
    await this.storage.saveTaskAsUnlisted(updatedTask);
    return updatedTask;
  }

  async deleteTask(_userId: string, taskId: string): Promise<boolean> {
    const existingTask = await this.storage.getTask(taskId);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    await this.storage.deleteTask(taskId);
    return true;
  }

  async addTextEntriesToTask(
    userId: string,
    taskId: string,
    textEntries: string[] | Array<{ text: string; stressedText: string }>,
    mode: "append" | "replace" = "append",
  ): Promise<TaskEntry[]> {
    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const isReplace = mode === "replace";
    const currentEntries = task.entries ?? [];
    const startOrder = isReplace
      ? 0
      : currentEntries.length > 0
        ? Math.max(...currentEntries.map((e) => e.order))
        : 0;

    const newEntries: TaskEntry[] = textEntries.map((entry, index) => {
      const isStringEntry = typeof entry === "string";
      return {
        id: generateId("entry"),
        taskId,
        text: isStringEntry ? entry : entry.text,
        stressedText: isStringEntry ? entry : entry.stressedText,
        audioUrl: null,
        audioBlob: null,
        order: startOrder + index + 1,
        createdAt: new Date(),
      };
    });

    const newTexts = textEntries.map((entry) =>
      typeof entry === "string" ? entry : entry.text,
    );

    const updatedEntries = isReplace
      ? newEntries
      : [...currentEntries, ...newEntries];
    const updatedSequences = isReplace
      ? newTexts
      : [...(task.speechSequences ?? []), ...newTexts];
    await this.updateTask(userId, taskId, {
      entries: updatedEntries,
      speechSequences: updatedSequences,
    });

    return newEntries;
  }

  async updateTaskEntry(
    userId: string,
    taskId: string,
    entryId: string,
    updates: Partial<Omit<TaskEntry, "id" | "taskId" | "createdAt">>,
  ): Promise<TaskEntry | null> {
    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const entryIndex = task.entries?.findIndex((entry) => entry.id === entryId);
    if (entryIndex === undefined || entryIndex === -1) {
      throw new Error("Entry not found");
    }

    const existingEntry = task.entries?.[entryIndex];
    if (!existingEntry) throw new Error("Entry not found");
    const updatedEntry: TaskEntry = {
      ...existingEntry,
      ...updates,
    };

    const updatedEntries = [...(task.entries ?? [])];
    updatedEntries[entryIndex] = updatedEntry;

    await this.updateTask(userId, taskId, { entries: updatedEntries });

    return updatedEntry;
  }
}
