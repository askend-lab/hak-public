// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Task, TaskEntry } from "@/types/task";
import { AuthStorage } from "../auth/storage";
import { CONTENT_TYPE_JSON } from "@/utils/analyzeApi";
import { logger } from "@hak/shared";

interface SimpleStoreResponse {
  success: boolean;
  item?: { data: Record<string, unknown> };
  items?: Array<{ data: Record<string, unknown> }>;
  error?: string;
}

const SIMPLE_STORE_BASE_URL = "/api";
const SIMPLE_STORE_TTL_SECONDS = 0; // 0 = no expiration

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
    pk: string,
    sk: string,
    type: "private" | "shared" | "unlisted",
    data: Record<string, unknown>,
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/save`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ pk, sk, type, ttl: this.ttl, data }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("SimpleStore save failed:", error);
      throw new Error(`Failed to save: ${error}`);
    }
  }

  private async get(
    pk: string,
    sk: string,
    type: "private" | "shared" | "unlisted",
  ): Promise<Record<string, unknown> | null> {
    const params = new URLSearchParams({ pk, sk, type });
    // Use /get-public for unlisted/shared/public (no auth required, rejects private type)
    const endpoint = type === "private" ? "/get" : "/get-public";
    const response = await fetch(`${this.baseUrl}${endpoint}?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.text();
      logger.error("SimpleStore get failed:", error);
      throw new Error(`Failed to get: ${error}`);
    }

    const result: SimpleStoreResponse = await response.json();
    return result.item?.data ?? null;
  }

  async loadUserTasks(userId: string): Promise<Task[]> {
    const data = await this.get("tasks", userId, "private");
    return data ? (data.tasks as Task[]) : [];
  }

  async saveUserTasks(userId: string, tasks: Task[]): Promise<void> {
    await this.save("tasks", userId, "private", { tasks });
  }

  async loadBaselineTaskAdditions(
    userId: string,
  ): Promise<Record<string, TaskEntry[]>> {
    const data = await this.get("tasks", `baseline-${userId}`, "private");
    return data ? (data.additions as Record<string, TaskEntry[]>) : {};
  }

  async saveBaselineTaskAdditions(
    userId: string,
    additions: Record<string, TaskEntry[]>,
  ): Promise<void> {
    await this.save("tasks", `baseline-${userId}`, "private", { additions });
  }

  async loadSharedTasks(): Promise<Task[]> {
    const data = await this.get("shared", "tasks", "shared");
    return data ? (data.tasks as Task[]) : [];
  }

  async saveSharedTasks(tasks: Task[]): Promise<void> {
    try {
      await this.save("shared", "tasks", "shared", { tasks });
    } catch (error) {
      logger.error("Failed to save shared tasks:", error);
      throw error;
    }
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    try {
      const data = await this.get("tasks", shareToken, "unlisted");
      return data ? (data as unknown as Task) : null;
    } catch (error) {
      logger.error("Failed to get task by share token:", error);
      return null;
    }
  }

  async saveTaskAsUnlisted(task: Task): Promise<void> {
    if (!task.shareToken) {
      throw new Error("Task must have shareToken to save as unlisted");
    }
    await this.save(
      "tasks",
      task.shareToken,
      "unlisted",
      task as unknown as Record<string, unknown>,
    );
  }
}
