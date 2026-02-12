// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadTaskAsZip } from "./downloadTaskAsZip";
import { Task } from "@/types/task";

const mockFile = vi.fn();
const mockAudioFolder = { file: vi.fn() };
const mockFolder = { file: mockFile, folder: vi.fn(() => mockAudioFolder) };

vi.mock("jszip", () => {
  return {
    default: class MockJSZip {
      folder() { return mockFolder; }
      generateAsync() { return Promise.resolve(new Blob(["zip-content"])); }
    },
  };
});

vi.mock("@/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("https://example.com/synthesized.wav"),
  synthesizeAuto: vi.fn().mockResolvedValue("https://example.com/synthesized.wav"),
}));

vi.mock("@/types/synthesis", () => ({
  getVoiceModel: vi.fn().mockReturnValue("efm_s"),
}));

describe("downloadTaskAsZip", () => {
  let mockTask: Task;

  beforeEach(() => {
    vi.clearAllMocks();

    global.URL.createObjectURL = vi.fn(() => "blob:mock-zip-url");
    global.URL.revokeObjectURL = vi.fn();

    mockTask = {
      id: "task-1",
      userId: "user-1",
      name: "Test Task",
      description: "A test task",
      speechSequences: [],
      entries: [
        {
          id: "entry-1",
          taskId: "task-1",
          text: "Tere tulemast",
          stressedText: "Tere tulemast",
          audioUrl: "https://example.com/audio1.wav",
          audioBlob: null,
          order: 0,
          createdAt: new Date(),
        },
        {
          id: "entry-2",
          taskId: "task-1",
          text: "Head aega",
          stressedText: "Head aega",
          audioUrl: null,
          audioBlob: new Blob(["audio-data"], { type: "audio/wav" }),
          order: 1,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      shareToken: "share-123",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["fetched-audio"])),
    });
  });

  it("creates a downloadable ZIP file", async () => {
    const clickSpy = vi.fn();
    const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
    const removeSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);

    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    await downloadTaskAsZip(mockTask);

    expect(clickSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-zip-url");

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("calls onProgress callback for each entry", async () => {
    const onProgress = vi.fn();

    vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);

    await downloadTaskAsZip(mockTask, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledWith({ current: 1, total: 2 });
    expect(onProgress).toHaveBeenCalledWith({ current: 2, total: 2 });
  });

  it("uses audioBlob when available instead of fetching", async () => {
    vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);

    await downloadTaskAsZip(mockTask);

    // Only first entry should fetch (it has audioUrl but no audioBlob)
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/audio1.wav");
  });

  it("handles empty entries gracefully", async () => {
    vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);

    const emptyTask = { ...mockTask, entries: [] };
    await downloadTaskAsZip(emptyTask);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("synthesizes audio when entry has no audioUrl or audioBlob", async () => {
    vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);

    const taskWithNoAudio = {
      ...mockTask,
      entries: [
        {
          id: "entry-3",
          taskId: "task-1",
          text: "Tere",
          stressedText: "Tere",
          audioUrl: null,
          audioBlob: null,
          order: 0,
          createdAt: new Date(),
        },
      ],
    };

    await downloadTaskAsZip(taskWithNoAudio);

    const { synthesizeAuto } = await import("@/utils/synthesize");
    expect(synthesizeAuto).toHaveBeenCalledWith("Tere");
    // fetch called once to download the synthesized audio URL
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/synthesized.wav");
  });
});
