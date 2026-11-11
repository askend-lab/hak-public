// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createElement, ReactNode } from "react";
import { vi } from "vitest";
import { DataServiceContext } from "@/contexts/DataServiceContext";
import type { DataService } from "@/services/dataService";

export function createMockDataService(
  overrides: Partial<DataService> = {},
): DataService {
  return {
    getUserTasks: vi.fn().mockResolvedValue([]),
    getUserCreatedTasks: vi.fn().mockResolvedValue([]),
    getTaskByShareToken: vi.fn().mockResolvedValue(null),
    createTask: vi.fn().mockResolvedValue({ id: "mock-id", name: "Mock" }),
    editTask: vi.fn().mockResolvedValue(undefined),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    addEntryToTask: vi.fn().mockResolvedValue(undefined),
    addTextEntriesToTask: vi.fn().mockResolvedValue(undefined),
    updateTaskEntry: vi.fn().mockResolvedValue(undefined),
    deleteTaskEntry: vi.fn().mockResolvedValue(undefined),
    shareUserTask: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as DataService;
}

export function DataServiceTestWrapper({
  children,
  dataService,
}: {
  children?: ReactNode;
  dataService?: DataService;
}) {
  const ds = dataService ?? createMockDataService();
  return createElement(
    DataServiceContext.Provider,
    { value: ds },
    children,
  );
}
