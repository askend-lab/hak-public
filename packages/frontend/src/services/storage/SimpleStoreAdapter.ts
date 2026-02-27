// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task } from "@/types/task";
import { AuthStorage } from "@/features/auth/services/storage";
import { CONTENT_TYPE_JSON } from "@/config/constants";
import { logger, STORE_KEYS } from "@hak/shared";

/** Serialize a Task to a plain JSON-safe record for storage. */
function taskToRecord(task: Task): Record<string, unknown> {
  return JSON.parse(JSON.stringify(task)) as Record<string, unknown>;
}

function isValidTaskData(data: Record<string, unknown>): boolean {
  return typeof data.id === "string" && typeof data.userId === "string" && typeof data.name === "string";
}

function parseDate(value: unknown): Date {
  return value instanceof Date ? value : new Date((value as string) || Date.now());
}

/** Deserialize a storage record back to a Task with runtime validation. */
function recordToTask(data: Record<string, unknown>): Task | null {
  if (!isValidTaskData(data)) { logger.error("Invalid task data: missing required fields"); return null; }
  return {
    id: data.id as string, userId: data.userId as string, name: data.name as string,
    description: typeof data.description === "string" ? data.description : null,
    speechSequences: Array.isArray(data.speechSequences) ? data.speechSequences as string[] : [],
    entries: Array.isArray(data.entries) ? data.entries as Task["entries"] : [],
    createdAt: parseDate(data.createdAt), updatedAt: parseDate(data.updatedAt),
    shareToken: typeof data.shareToken === "string" ? data.shareToken : "",
  };
}

interface SimpleStoreResponse {
  success: boolean;
  item?: { data: Record<string, unknown> };
  items?: Array<{ data: Record<string, unknown> }>;
  error?: string;
}

const SIMPLE_STORE_BASE_URL = "/api";
const SIMPLE_STORE_TTL_SECONDS = 0; // 0 = no expiration
const UNLISTED_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days for shared tasks

export class SimpleStoreAdapter {
  private readonly baseUrl = SIMPLE_STORE_BASE_URL;
  private readonly ttl = SIMPLE_STORE_TTL_SECONDS;

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": CONTENT_TYPE_JSON,
    };
    // Cognito authorizer requires ID token, not access token
    const token = AuthStorage.getIdToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async save(opts: { key: string; id: string; type: string; data: Record<string, unknown>; ttl?: number }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/save`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ key: opts.key, id: opts.id, type: opts.type, ttl: opts.ttl ?? this.ttl, data: opts.data }),
    });
    if (!response.ok) { const error = await response.text(); logger.error("SimpleStore save failed:", error); throw new Error(`Failed to save: ${error}`); }
  }

  private getEndpoint(type: string): { endpoint: string; headers: Record<string, string> } {
    const isPublic = type !== "private";
    return {
      endpoint: isPublic ? "/get-public" : "/get",
      headers: isPublic ? { "Content-Type": CONTENT_TYPE_JSON } : this.getAuthHeaders(),
    };
  }

  private async handleGetError(response: Response): Promise<null> {
    if (response.status === 404) {return null;}
    const error = await response.text(); logger.error("SimpleStore get failed:", error); throw new Error(`Failed to get: ${error}`);
  }

  private async get(key: string, id: string, type: string): Promise<Record<string, unknown> | null> {
    const { endpoint, headers } = this.getEndpoint(type);
    const response = await fetch(`${this.baseUrl}${endpoint}?${new URLSearchParams({ key, id, type })}`, { headers });
    if (!response.ok) {return this.handleGetError(response);}
    const result: SimpleStoreResponse = await response.json();
    return result.item?.data ?? null;
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    try {
      const data = await this.get(STORE_KEYS.TASKS, shareToken, "unlisted");
      return data ? recordToTask(data) : null;
    } catch (error) {
      logger.error("Failed to get task by share token:", error);
      return null;
    }
  }

  private async delete(
    key: string,
    id: string,
    type: "private" | "shared" | "unlisted",
  ): Promise<void> {
    const params = new URLSearchParams({ key, id, type });
    const response = await fetch(`${this.baseUrl}/delete?${params}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("SimpleStore delete failed:", error);
      throw new Error(`Failed to delete: ${error}`);
    }
  }

  private async query(
    prefix: string,
    type: "private" | "shared" | "unlisted",
  ): Promise<Array<Record<string, unknown>>> {
    const params = new URLSearchParams({ prefix, type });
    const response = await fetch(`${this.baseUrl}/query?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {return [];}
      const error = await response.text();
      logger.error("SimpleStore query failed:", error);
      throw new Error(`Failed to query: ${error}`);
    }

    const result: SimpleStoreResponse = await response.json();
    return (result.items ?? []).map((item) => item.data);
  }

  async saveTask(task: Task): Promise<void> {
    await this.save({ key: STORE_KEYS.TASK, id: task.id, type: "private", data: taskToRecord(task) });
  }

  async getTask(taskId: string): Promise<Task | null> {
    const data = await this.get(STORE_KEYS.TASK, taskId, "private");
    return data ? recordToTask(data) : null;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.delete(STORE_KEYS.TASK, taskId, "private");
  }

  async queryUserTasks(): Promise<Task[]> {
    const items = await this.query(STORE_KEYS.TASK, "private");
    return items
      .map((item) => recordToTask(item))
      .filter((t): t is Task => t !== null);
  }

  async deleteUnlistedTask(shareToken: string): Promise<void> {
    try {
      await this.delete(STORE_KEYS.TASKS, shareToken, "unlisted");
    } catch (error) {
      logger.error("Failed to delete unlisted task:", error);
      throw error;
    }
  }

  async saveTaskAsUnlisted(task: Task): Promise<void> {
    if (!task.shareToken) { throw new Error("Task must have shareToken to save as unlisted"); }
    await this.save({ key: STORE_KEYS.TASKS, id: task.shareToken, type: "unlisted", ttl: UNLISTED_TTL_SECONDS, data: taskToRecord(task) });
  }
}
