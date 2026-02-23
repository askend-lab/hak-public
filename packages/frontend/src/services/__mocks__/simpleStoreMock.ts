// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { Task } from "@/types/task";

// In-memory storage to simulate SimpleStore (per-task)
let tasks: Record<string, Task> = {}; // keyed by taskId
let unlistedTasks: Record<string, Task> = {}; // keyed by shareToken

export function resetSimpleStoreMock(): void {
  tasks = {};
  unlistedTasks = {};
}

export function setupSimpleStoreMock(): void {
  resetSimpleStoreMock();

  global.fetch = vi.fn(async (url: string, options?: RequestInit) => {
    const urlObj = new URL(url, "http://localhost");
    const path = urlObj.pathname;

    if (path === "/api/save" && options?.method === "POST") {
      const body = JSON.parse(options.body as string);
      const { key, id, data } = body;
      const type = body.type;

      if (type === "unlisted" && key === "tasks") {
        unlistedTasks[id] = data;
      } else if (key === "task") {
        tasks[id] = data;
      }

      return {
        ok: true,
        json: async (): Promise<{ success: boolean }> => ({ success: true }),
      };
    }

    if (path === "/api/delete" && options?.method === "DELETE") {
      const key = urlObj.searchParams.get("key");
      const id = urlObj.searchParams.get("id");
      if (key === "task" && id) {
        delete tasks[id];
      }
      if (key === "tasks" && id) {
        delete unlistedTasks[id];
      }
      return { ok: true, json: async (): Promise<{ success: boolean }> => ({ success: true }) };
    }

    if (path === "/api/query") {
      const prefix = urlObj.searchParams.get("prefix");
      const type = urlObj.searchParams.get("type");
      if (prefix === "task" && type === "private") {
        const items = Object.values(tasks).map((t) => ({ data: t }));
        return {
          ok: true,
          json: async (): Promise<{ success: boolean; items: Array<{ data: Task }> }> => ({ success: true, items }),
        };
      }
      return { ok: true, json: async (): Promise<{ success: boolean; items: never[] }> => ({ success: true, items: [] }) };
    }

    if (path === "/api/get" || path === "/api/get-public") {
      const key = urlObj.searchParams.get("key");
      const id = urlObj.searchParams.get("id");
      const type = urlObj.searchParams.get("type");

      if (type === "unlisted" && key === "tasks" && id) {
        const task = unlistedTasks[id];
        if (!task) {
          return {
            ok: true,
            json: async (): Promise<{ success: boolean; item: null }> => ({
              success: true,
              item: null,
            }),
          };
        }
        return {
          ok: true,
          json: async (): Promise<{
            success: boolean;
            item: { data: Task };
          }> => ({ success: true, item: { data: task } }),
        };
      }

      if (key === "task" && id) {
        const task = tasks[id];
        if (!task) {
          return {
            ok: true,
            json: async (): Promise<{ success: boolean; item: null }> => ({ success: true, item: null }),
          };
        }
        return {
          ok: true,
          json: async (): Promise<{
            success: boolean;
            item: { data: Task };
          }> => ({ success: true, item: { data: task } }),
        };
      }

      return { ok: false, status: 404, text: async (): Promise<string> => "Not found" };
    }

    return { ok: false, status: 404, text: async (): Promise<string> => "Not found" };
  }) as unknown as typeof fetch;
}

export function getStoredTasks(): Task[] {
  return Object.values(tasks);
}
