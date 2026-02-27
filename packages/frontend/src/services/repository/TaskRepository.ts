// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task, TaskEntry, TaskSummary, CreateTaskRequest } from "@/types/task";
import { SimpleStoreAdapter } from "../storage/SimpleStoreAdapter";
import { ShareService } from "@/features/sharing/services/ShareService";

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

const TASK_NOT_FOUND = "Task not found";
const MAX_TASK_NAME_LENGTH = 200;
const MAX_TASK_DESCRIPTION_LENGTH = 2000;
const MAX_ENTRIES_PER_TASK = 500;

type TextEntryInput = string | { text: string; stressedText: string };

function getStartOrder(entries: TaskEntry[], isReplace: boolean): number {
  if (isReplace || entries.length === 0) {return 0;}
  return Math.max(...entries.map((e) => e.order));
}

function buildNewEntries(taskId: string, textEntries: TextEntryInput[], startOrder: number): TaskEntry[] {
  return textEntries.map((entry, index) => ({
    id: generateId("entry"),
    taskId,
    text: typeof entry === "string" ? entry : entry.text,
    stressedText: typeof entry === "string" ? entry : entry.stressedText,
    audioUrl: null,
    audioBlob: null,
    order: startOrder + index + 1,
    createdAt: new Date(),
  }));
}

export class TaskRepository {
  constructor(
    private storage: SimpleStoreAdapter,
    private shareService: ShareService,
  ) {}

  private toSummary(task: Task): TaskSummary {
    const createdAt = new Date(task.createdAt);
    const updatedAt = new Date(task.updatedAt);
    return {
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      entryCount: task.entries?.length || 0,
      createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
    };
  }

  async getUserTasks(): Promise<TaskSummary[]> {
    const userTasks = await this.storage.queryUserTasks();
    return userTasks.map((task) => this.toSummary(task));
  }

  async getUserCreatedTasks(): Promise<TaskSummary[]> {
    return this.getUserTasks();
  }

  async getModifiableTasks(): Promise<TaskSummary[]> {
    return this.getUserCreatedTasks();
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.storage.getTask(taskId);
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    const trimmedName = taskData.name.trim();
    if (!trimmedName) {
      throw new Error("Task name is required");
    }
    if (trimmedName.length > MAX_TASK_NAME_LENGTH) {
      throw new Error(`Task name exceeds ${MAX_TASK_NAME_LENGTH} characters`);
    }
    const description = taskData.description?.trim() ?? null;
    if (description && description.length > MAX_TASK_DESCRIPTION_LENGTH) {
      throw new Error(`Task description exceeds ${MAX_TASK_DESCRIPTION_LENGTH} characters`);
    }
    const taskId = generateId("task");
    const newTask: Task = {
      id: taskId,
      userId,
      name: trimmedName,
      description,
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
    taskId: string,
    updates: Partial<Task>,
  ): Promise<Task | null> {
    const existingTask = await this.storage.getTask(taskId);
    if (!existingTask) {
      throw new Error(TASK_NOT_FOUND);
    }

    return this.applyTaskUpdate(existingTask, updates);
  }

  private async applyTaskUpdate(
    existingTask: Task,
    updates: Partial<Task>,
  ): Promise<Task> {
    const { id: _id, userId: _uid, shareToken: _st, createdAt: _ca, ...safeUpdates } = updates;
    const updatedTask: Task = {
      ...existingTask,
      ...safeUpdates,
      updatedAt: new Date(),
    };

    await this.storage.saveTask(updatedTask);
    // Sync unlisted storage for anonymous access
    await this.storage.saveTaskAsUnlisted(updatedTask);
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const existingTask = await this.storage.getTask(taskId);
    if (!existingTask) {
      throw new Error(TASK_NOT_FOUND);
    }

    await this.storage.deleteTask(taskId);

    // Also delete the unlisted copy if it was shared
    if (existingTask.shareToken) {
      await this.storage.deleteUnlistedTask(existingTask.shareToken);
    }

    return true;
  }

  async addTextEntriesToTask(
    taskId: string,
    textEntries: string[] | Array<{ text: string; stressedText: string }>,
    mode: "append" | "replace" = "append",
  ): Promise<TaskEntry[]> {
    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error(TASK_NOT_FOUND);
    }

    const currentCount = mode === "replace" ? 0 : (task.entries?.length ?? 0);
    if (currentCount + textEntries.length > MAX_ENTRIES_PER_TASK) {
      throw new Error(`Cannot exceed ${MAX_ENTRIES_PER_TASK} entries per task`);
    }

    const isReplace = mode === "replace";
    const currentEntries = task.entries ?? [];
    const startOrder = getStartOrder(currentEntries, isReplace);
    const newEntries = buildNewEntries(taskId, textEntries, startOrder);
    const newTexts = newEntries.map((entry) => entry.text);

    const updatedEntries = isReplace ? newEntries : [...currentEntries, ...newEntries];
    const updatedSequences = isReplace ? newTexts : [...(task.speechSequences ?? []), ...newTexts];
    await this.applyTaskUpdate(task, { entries: updatedEntries, speechSequences: updatedSequences });
    return newEntries;
  }

  async updateTaskEntry(
    taskId: string,
    entryId: string,
    updates: Partial<Omit<TaskEntry, "id" | "taskId" | "createdAt">>,
  ): Promise<TaskEntry | null> {
    const task = await this.storage.getTask(taskId);
    if (!task) {
      throw new Error(TASK_NOT_FOUND);
    }

    const entryIndex = task.entries?.findIndex((entry) => entry.id === entryId);
    if (entryIndex === undefined || entryIndex === -1) {
      throw new Error("Entry not found");
    }

    const existingEntry = task.entries?.[entryIndex];
    if (!existingEntry) {throw new Error("Entry not found");}
    const updatedEntry: TaskEntry = {
      ...existingEntry,
      ...updates,
    };

    const updatedEntries = [...(task.entries ?? [])];
    updatedEntries[entryIndex] = updatedEntry;

    await this.applyTaskUpdate(task, { entries: updatedEntries });

    return updatedEntry;
  }
}
