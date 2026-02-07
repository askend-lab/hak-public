import { vi } from "vitest";
import { Task, TaskEntry } from "@/types/task";

// In-memory storage to simulate SimpleStore
let userTasks: Record<string, Task[]> = {};
let baselineAdditions: Record<string, Record<string, TaskEntry[]>> = {};
let sharedTasks: Task[] = [];
let unlistedTasks: Record<string, Task> = {}; // keyed by shareToken

export function resetSimpleStoreMock(): void {
  userTasks = {};
  baselineAdditions = {};
  sharedTasks = [];
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
        // Save task as unlisted (keyed by shareToken in sk)
        unlistedTasks[sk] = data;
      } else if (pk === "tasks" && !sk.startsWith("baseline-")) {
        userTasks[sk] = data.tasks || [];
      } else if (pk === "tasks" && sk.startsWith("baseline-")) {
        const userId = sk.replace("baseline-", "");
        baselineAdditions[userId] = data.additions || {};
      } else if (pk === "shared" && sk === "tasks") {
        sharedTasks = data.tasks || [];
      }

      return {
        ok: true,
        json: async (): Promise<{ success: boolean }> => ({ success: true }),
      };
    }

    if (path === "/api/get" || path === "/api/get-public") {
      const pk = urlObj.searchParams.get("pk");
      const sk = urlObj.searchParams.get("sk");
      const type = urlObj.searchParams.get("type");

      // Handle unlisted type - lookup by shareToken
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

      if (pk === "tasks" && sk && !sk.startsWith("baseline-")) {
        const tasks = userTasks[sk] || [];
        if (tasks.length === 0) {
          return { ok: false, status: 404 };
        }
        return {
          ok: true,
          json: async (): Promise<{
            success: boolean;
            item: { data: { tasks: Task[] } };
          }> => ({ success: true, item: { data: { tasks } } }),
        };
      } else if (pk === "tasks" && sk?.startsWith("baseline-")) {
        const userId = sk.replace("baseline-", "");
        const additions = baselineAdditions[userId] || {};
        if (Object.keys(additions).length === 0) {
          return { ok: false, status: 404 };
        }
        return {
          ok: true,
          json: async (): Promise<{
            success: boolean;
            item: { data: { additions: Record<string, TaskEntry[]> } };
          }> => ({ success: true, item: { data: { additions } } }),
        };
      } else if (pk === "shared" && sk === "tasks") {
        if (sharedTasks.length === 0) {
          return { ok: false, status: 404 };
        }
        return {
          ok: true,
          json: async (): Promise<{
            success: boolean;
            item: { data: { tasks: Task[] } };
          }> => ({ success: true, item: { data: { tasks: sharedTasks } } }),
        };
      }

      return { ok: false, status: 404 };
    }

    return { ok: false, status: 404 };
  }) as unknown as typeof fetch;
}

export function getStoredUserTasks(userId: string): Task[] {
  return userTasks[userId] || [];
}

export function getStoredBaselineAdditions(
  userId: string,
): Record<string, TaskEntry[]> {
  return baselineAdditions[userId] || {};
}

export function getStoredSharedTasks(): Task[] {
  return sharedTasks;
}
