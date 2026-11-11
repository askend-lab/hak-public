// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import React, { createElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePhoneticPanel } from "./usePhoneticPanel";
import type { TaskEntry, Task } from "@/types/task";
import { logger } from "@hak/shared";
import { createMockDataService, DataServiceTestWrapper } from "@/test/dataServiceMock";

const mockUpdateTaskEntry = vi.fn();
const mockDS = createMockDataService({ updateTaskEntry: mockUpdateTaskEntry });
function dsWrapper({ children }: { children: React.ReactNode }) { return createElement(DataServiceTestWrapper, { dataService: mockDS }, children); }

vi.mock("@/features/synthesis/utils/phoneticMarkers", () => ({
  stripPhoneticMarkers: (text: string): string => text.replace(/[`~^]/g, ""),
}));

describe("usePhoneticPanel", () => {
  const mockEntry: TaskEntry = {
    id: "e1",
    taskId: "t1",
    text: "tere maailm",
    stressedText: "tere maailm",
    audioUrl: null,
    audioBlob: null,
    order: 0,
    createdAt: new Date(),
  };
  const mockTask: Task = {
    id: "t1",
    userId: "u1",
    name: "Test",
    entries: [mockEntry],
    speechSequences: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    shareToken: "tok1",
  };
  const onMenuClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("handlePhoneticApply handles save error", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    window.alert = vi.fn();
    mockUpdateTaskEntry.mockRejectedValueOnce(new Error("save fail"));
    const setEntries = vi.fn();
    const { result } = renderHook(() =>
      usePhoneticPanel({ entries: [mockEntry], setEntries, task: mockTask, userId: "u1", onMenuClose }),
      { wrapper: dsWrapper },
    );
    await act(async () => {
      await result.current.handleExplorePhonetic("e1");
    });
    await act(async () => {
      await result.current.handlePhoneticApply("te`re");
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  });

  });

  });

  });

  });

});
