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

  private validateTaskName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) { throw new Error("Task name is required"); }
    if (trimmed.length > MAX_TASK_NAME_LENGTH) { throw new Error(`Task name exceeds ${MAX_TASK_NAME_LENGTH} characters`); }
    return trimmed;
  }

  private validateDescription(desc?: string | null): string | null {
    const trimmed = desc?.trim() ?? null;
    if (trimmed && trimmed.length > MAX_TASK_DESCRIPTION_LENGTH) { throw new Error(`Task description exceeds ${MAX_TASK_DESCRIPTION_LENGTH} characters`); }
    return trimmed;
  }

  private buildEntries(taskData: CreateTaskRequest, taskId: string): TaskEntry[] {
    if (taskData.speechEntries) {
      return taskData.speechEntries.map((entry, i) => ({ id: generateId("entry"), taskId, text: entry.text, stressedText: entry.stressedText, audioUrl: null, audioBlob: null, order: i + 1, createdAt: new Date() }));
    }
    return taskData.speechSequences?.map((text, i) => ({ id: generateId("entry"), taskId, text, stressedText: text, audioUrl: null, audioBlob: null, order: i + 1, createdAt: new Date() })) ?? [];
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    const name = this.validateTaskName(taskData.name);
    const taskId = generateId("task");
    const newTask: Task = {
      id: taskId, userId, name, description: this.validateDescription(taskData.description),
      speechSequences: taskData.speechSequences ?? [], entries: this.buildEntries(taskData, taskId),
      createdAt: new Date(), updatedAt: new Date(), shareToken: this.shareService.generateShareToken(),
    };
    await this.storage.saveTask(newTask);
    await this.storage.saveTaskAsUnlisted(newTask);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    return this.applyTaskUpdate(await this.getTaskOrThrow(taskId), updates);
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
    const task = await this.getTaskOrThrow(taskId);
    await this.storage.deleteTask(taskId);
    if (task.shareToken) { await this.storage.deleteUnlistedTask(task.shareToken); }
    return true;
  }

  private async getTaskOrThrow(taskId: string): Promise<Task> {
    const task = await this.storage.getTask(taskId);
    if (!task) { throw new Error(TASK_NOT_FOUND); }
    return task;
  }

  private validateEntryCount(task: Task, count: number, isReplace: boolean): void {
    const current = isReplace ? 0 : (task.entries?.length ?? 0);
    if (current + count > MAX_ENTRIES_PER_TASK) { throw new Error(`Cannot exceed ${MAX_ENTRIES_PER_TASK} entries per task`); }
  }

  private mergeEntries(task: Task, newEntries: TaskEntry[], isReplace: boolean): Partial<Task> {
    const current = task.entries ?? [];
    const newTexts = newEntries.map((e) => e.text);
    return {
      entries: isReplace ? newEntries : [...current, ...newEntries],
      speechSequences: isReplace ? newTexts : [...(task.speechSequences ?? []), ...newTexts],
    };
  }

  async addTextEntriesToTask(taskId: string, textEntries: TextEntryInput[], mode: "append" | "replace" = "append"): Promise<TaskEntry[]> {
    const task = await this.getTaskOrThrow(taskId);
    const isReplace = mode === "replace";
    this.validateEntryCount(task, textEntries.length, isReplace);
    const newEntries = buildNewEntries(taskId, textEntries, getStartOrder(task.entries ?? [], isReplace));
    await this.applyTaskUpdate(task, this.mergeEntries(task, newEntries, isReplace));
    return newEntries;
  }

  private findEntry(task: Task, entryId: string): { entry: TaskEntry; index: number } {
    const index = task.entries?.findIndex((e) => e.id === entryId) ?? -1;
    const entry = index >= 0 ? task.entries?.[index] : undefined;
    if (!entry) { throw new Error("Entry not found"); }
    return { entry, index };
  }

  async updateTaskEntry(taskId: string, entryId: string, updates: Partial<Omit<TaskEntry, "id" | "taskId" | "createdAt">>): Promise<TaskEntry | null> {
    const task = await this.getTaskOrThrow(taskId);
    const { entry, index } = this.findEntry(task, entryId);
    const updatedEntry: TaskEntry = { ...entry, ...updates };
    const updatedEntries = [...(task.entries ?? [])];
    updatedEntries[index] = updatedEntry;
    await this.applyTaskUpdate(task, { entries: updatedEntries });
    return updatedEntry;
  }
}
