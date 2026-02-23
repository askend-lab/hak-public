// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task } from "@/types/task";
import { AuthStorage } from "@/features/auth/services/storage";
import { CONTENT_TYPE_JSON } from "@/config/constants";
import { logger } from "@hak/shared";

/** Serialize a Task to a plain JSON-safe record for storage. */
function taskToRecord(task: Task): Record<string, unknown> {
  return JSON.parse(JSON.stringify(task)) as Record<string, unknown>;
}

/** Deserialize a storage record back to a Task with runtime validation. */
function recordToTask(data: Record<string, unknown>): Task | null {
  if (
    typeof data.id !== "string" ||
    typeof data.userId !== "string" ||
    typeof data.name !== "string"
  ) {
    logger.error("Invalid task data: missing required fields");
    return null;
  }
  return {
    id: data.id,
    userId: data.userId,
    name: data.name,
    description: typeof data.description === "string" ? data.description : null,
    speechSequences: Array.isArray(data.speechSequences) ? data.speechSequences as string[] : [],
    entries: Array.isArray(data.entries) ? data.entries as Task["entries"] : [],
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt as string || Date.now()),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt as string || Date.now()),
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

  private async save(
    key: string,
    id: string,
    type: "private" | "shared" | "unlisted",
    data: Record<string, unknown>,
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/save`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ key, id, type, ttl: this.ttl, data }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("SimpleStore save failed:", error);
      throw new Error(`Failed to save: ${error}`);
    }
  }

  private async get(
    key: string,
    id: string,
    type: "private" | "shared" | "unlisted",
  ): Promise<Record<string, unknown> | null> {
    const params = new URLSearchParams({ key, id, type });
    // Use /get-public for unlisted/shared/public (no auth required, rejects private type)
    const isPublic = type !== "private";
    const endpoint = isPublic ? "/get-public" : "/get";
    const headers = isPublic
      ? { "Content-Type": CONTENT_TYPE_JSON }
      : this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}?${params}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {return null;}
      const error = await response.text();
      logger.error("SimpleStore get failed:", error);
      throw new Error(`Failed to get: ${error}`);
    }

    const result: SimpleStoreResponse = await response.json();
    return result.item?.data ?? null;
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    try {
      const data = await this.get("tasks", shareToken, "unlisted");
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
    await this.save(
      "task",
      task.id,
      "private",
      taskToRecord(task),
    );
  }

  async getTask(taskId: string): Promise<Task | null> {
    const data = await this.get("task", taskId, "private");
    return data ? recordToTask(data) : null;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.delete("task", taskId, "private");
  }

  async queryUserTasks(): Promise<Task[]> {
    const items = await this.query("task", "private");
    return items
      .map((item) => recordToTask(item))
      .filter((t): t is Task => t !== null);
  }

  async deleteUnlistedTask(shareToken: string): Promise<void> {
    try {
      await this.delete("tasks", shareToken, "unlisted");
    } catch (error) {
      logger.error("Failed to delete unlisted task:", error);
      throw error;
    }
  }

  async saveTaskAsUnlisted(task: Task): Promise<void> {
    if (!task.shareToken) {
      throw new Error("Task must have shareToken to save as unlisted");
    }
    const response = await fetch(`${this.baseUrl}/save`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        key: "tasks",
        id: task.shareToken,
        type: "unlisted",
        ttl: UNLISTED_TTL_SECONDS,
        data: taskToRecord(task),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("SimpleStore save unlisted failed:", error);
      throw new Error(`Failed to save unlisted: ${error}`);
    }
  }
}
