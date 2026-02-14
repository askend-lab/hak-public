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
      const { pk, sk, data } = body;
      const type = body.type;

      if (type === "unlisted" && pk === "tasks") {
        unlistedTasks[sk] = data;
      } else if (pk === "task") {
        tasks[sk] = data;
      }

      return {
        ok: true,
        json: async (): Promise<{ success: boolean }> => ({ success: true }),
      };
    }

    if (path === "/api/delete" && options?.method === "DELETE") {
      const pk = urlObj.searchParams.get("pk");
      const sk = urlObj.searchParams.get("sk");
      if (pk === "task" && sk) {
        delete tasks[sk];
      }
      if (pk === "tasks" && sk) {
        delete unlistedTasks[sk];
      }
      return { ok: true, json: async (): Promise<{ success: boolean }> => ({ success: true }) };
    }

    if (path === "/api/query") {
      const pk = urlObj.searchParams.get("prefix");
      const type = urlObj.searchParams.get("type");
      if (pk === "task" && type === "private") {
        const items = Object.values(tasks).map((t) => ({ data: t }));
        return {
          ok: true,
          json: async (): Promise<{ success: boolean; items: Array<{ data: Task }> }> => ({ success: true, items }),
        };
      }
      return { ok: true, json: async (): Promise<{ success: boolean; items: never[] }> => ({ success: true, items: [] }) };
    }

    if (path === "/api/get" || path === "/api/get-public") {
      const pk = urlObj.searchParams.get("pk");
      const sk = urlObj.searchParams.get("sk");
      const type = urlObj.searchParams.get("type");

      if (type === "unlisted" && pk === "tasks" && sk) {
        const task = unlistedTasks[sk];
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

      if (pk === "task" && sk) {
        const task = tasks[sk];
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
