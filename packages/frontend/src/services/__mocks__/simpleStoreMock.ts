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

function handleSave(options: RequestInit | undefined): { ok: boolean; json: () => Promise<{ success: boolean }> } {
  const body = JSON.parse(options?.body as string);
  const { key, id, data } = body;
  if (body.type === "unlisted" && key === "tasks") { unlistedTasks[id] = data; }
  else if (key === "task") { tasks[id] = data; }
  return { ok: true, json: async () => ({ success: true }) };
}

function handleDelete(urlObj: URL): { ok: boolean; json: () => Promise<{ success: boolean }> } {
  const key = urlObj.searchParams.get("key");
  const id = urlObj.searchParams.get("id");
  if (key === "task" && id) { delete tasks[id]; }
  if (key === "tasks" && id) { delete unlistedTasks[id]; }
  return { ok: true, json: async () => ({ success: true }) };
}

function handleQuery(urlObj: URL): { ok: boolean; json: () => Promise<unknown> } {
  const prefix = urlObj.searchParams.get("prefix");
  const type = urlObj.searchParams.get("type");
  if (prefix === "task" && type === "private") {
    const items = Object.values(tasks).map((t) => ({ data: t }));
    return { ok: true, json: async () => ({ success: true, items }) };
  }
  return { ok: true, json: async () => ({ success: true, items: [] }) };
}

function handleGet(urlObj: URL): { ok: boolean; json?: () => Promise<unknown>; status?: number; text?: () => Promise<string> } {
  const key = urlObj.searchParams.get("key");
  const id = urlObj.searchParams.get("id");
  const type = urlObj.searchParams.get("type");
  if (type === "unlisted" && key === "tasks" && id) {
    const task = unlistedTasks[id];
    return { ok: true, json: async () => ({ success: true, item: task ? { data: task } : null }) };
  }
  if (key === "task" && id) {
    const task = tasks[id];
    return { ok: true, json: async () => ({ success: true, item: task ? { data: task } : null }) };
  }
  return { ok: false, status: 404, text: async () => "Not found" };
}

export function setupSimpleStoreMock(): void {
  resetSimpleStoreMock();
  global.fetch = vi.fn(async (url: string, options?: RequestInit) => {
    const urlObj = new URL(url, "http://localhost");
    const path = urlObj.pathname;
    if (path === "/api/save" && options?.method === "POST") { return handleSave(options); }
    if (path === "/api/delete" && options?.method === "DELETE") { return handleDelete(urlObj); }
    if (path === "/api/query") { return handleQuery(urlObj); }
    if (path === "/api/get" || path === "/api/get-public") { return handleGet(urlObj); }
    return { ok: false, status: 404, text: async (): Promise<string> => "Not found" };
  }) as unknown as typeof fetch;
}

export function getStoredTasks(): Task[] {
  return Object.values(tasks);
}
