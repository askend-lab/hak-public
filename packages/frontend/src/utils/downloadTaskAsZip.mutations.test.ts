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

function setupDomMocks(): { anchor: { href: string; download: string; click: ReturnType<typeof vi.fn> } } {
  const anchor = { href: "", download: "", click: vi.fn() };
  vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
  vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);
  vi.spyOn(document, "createElement").mockReturnValue(anchor as unknown as HTMLAnchorElement);
  return { anchor };
}

describe("downloadTaskAsZip mutations", () => {
  let mockTask: Task;

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:mock-zip-url");
    global.URL.revokeObjectURL = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["fetched-audio"])),
    });
    mockTask = {
      id: "task-1", userId: "user-1", name: "Test Task",
      description: "A test task", speechSequences: [],
      entries: [
        { id: "e1", taskId: "task-1", text: "Tere tulemast", stressedText: "Tere tulemast",
          audioUrl: "https://example.com/audio1.wav", audioBlob: null, order: 0, createdAt: new Date() },
        { id: "e2", taskId: "task-1", text: "Head aega", stressedText: "Head aega",
          audioUrl: null, audioBlob: new Blob(["audio-data"], { type: "audio/wav" }), order: 1, createdAt: new Date() },
      ],
      createdAt: new Date(), updatedAt: new Date(), shareToken: "share-123",
    };
  });

  it("writes manifest.json with correct metadata", async () => {
    setupDomMocks();
    await downloadTaskAsZip(mockTask);
    const call = mockFile.mock.calls.find((c: unknown[]) => c[0] === "manifest.json");
    expect(call).toBeDefined();
    const manifest = JSON.parse(String(call?.[1]));
    expect(manifest.name).toBe("Test Task");
    expect(manifest.description).toBe("A test task");
    expect(manifest.entryCount).toBe(2);
    expect(manifest.exportedAt).toBeDefined();
    expect(manifest.createdAt).toBeDefined();
  });

  it("writes null description in manifest when task has none", async () => {
    setupDomMocks();
    await downloadTaskAsZip({ ...mockTask, description: null });
    const call = mockFile.mock.calls.find((c: unknown[]) => c[0] === "manifest.json");
    const manifest = JSON.parse(String(call?.[1]));
    expect(manifest.description).toBeNull();
  });

  it("writes texts.txt with zero-padded numbered entries", async () => {
    setupDomMocks();
    await downloadTaskAsZip(mockTask);
    const call = mockFile.mock.calls.find((c: unknown[]) => c[0] === "texts.txt");
    expect(call).toBeDefined();
    expect(String(call?.[1])).toBe("001. Tere tulemast\n002. Head aega");
  });

  it("names audio files with padded index and sanitized text", async () => {
    setupDomMocks();
    await downloadTaskAsZip(mockTask);
    expect(mockAudioFolder.file.mock.calls).toHaveLength(2);
    expect(mockAudioFolder.file.mock.calls[0]?.[0]).toBe("001-Tere_tulemast.wav");
    expect(mockAudioFolder.file.mock.calls[1]?.[0]).toBe("002-Head_aega.wav");
  });

  it("sanitizes special characters in task name", async () => {
    const { anchor } = setupDomMocks();
    await downloadTaskAsZip({ ...mockTask, name: 'Test<>:"/\\|?*Task', entries: [] });
    expect(anchor.download).toMatch(/^TestTask_/);
  });

  it("uses 'task' fallback when name sanitizes to empty", async () => {
    const { anchor } = setupDomMocks();
    await downloadTaskAsZip({ ...mockTask, name: "<>:", entries: [] });
    expect(anchor.download).toMatch(/^task_/);
  });

  it("truncates folder name to 80 chars", async () => {
    const { anchor } = setupDomMocks();
    await downloadTaskAsZip({ ...mockTask, name: "A".repeat(200), entries: [] });
    const parts = anchor.download.split("_");
    expect(String(parts[0]).length).toBeLessThanOrEqual(80);
  });

  it("replaces whitespace with underscores", async () => {
    const { anchor } = setupDomMocks();
    await downloadTaskAsZip({ ...mockTask, name: "Test  Multiple   Spaces", entries: [] });
    expect(anchor.download).toMatch(/^Test_Multiple_Spaces_/);
  });

  it("sets download filename ending with .zip", async () => {
    const { anchor } = setupDomMocks();
    await downloadTaskAsZip({ ...mockTask, entries: [] });
    expect(anchor.download).toMatch(/^Test_Task_.*\.zip$/);
    expect(anchor.href).toBe("blob:mock-zip-url");
  });

  it("creates audio subfolder", async () => {
    setupDomMocks();
    await downloadTaskAsZip({ ...mockTask, entries: [] });
    expect(mockFolder.folder).toHaveBeenCalledWith("audio");
  });

  it("throws when audio folder creation fails", async () => {
    const orig = mockFolder.folder;
    (mockFolder as Record<string, unknown>).folder = vi.fn(() => null);
    await expect(downloadTaskAsZip({ ...mockTask, entries: [] })).rejects.toThrow("Failed to create audio folder");
    mockFolder.folder = orig;
  });

  it("skips audio when fetch fails", async () => {
    setupDomMocks();
    global.fetch = vi.fn().mockRejectedValue(new Error("fail"));
    const task = { ...mockTask, entries: [
      { id: "e1", taskId: "t1", text: "X", stressedText: "X",
        audioUrl: "https://x.com/a.wav", audioBlob: null, order: 0, createdAt: new Date() },
    ] };
    await downloadTaskAsZip(task);
    expect(mockAudioFolder.file).not.toHaveBeenCalled();
  });

  it("skips audio when response not ok", async () => {
    setupDomMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const task = { ...mockTask, entries: [
      { id: "e1", taskId: "t1", text: "X", stressedText: "X",
        audioUrl: "https://x.com/a.wav", audioBlob: null, order: 0, createdAt: new Date() },
    ] };
    await downloadTaskAsZip(task);
    expect(mockAudioFolder.file).not.toHaveBeenCalled();
  });

  it("skips zero-size audioBlob and fetches audioUrl", async () => {
    setupDomMocks();
    const task = { ...mockTask, entries: [
      { id: "e1", taskId: "t1", text: "X", stressedText: "X",
        audioUrl: "https://x.com/a.wav", audioBlob: new Blob([]), order: 0, createdAt: new Date() },
    ] };
    await downloadTaskAsZip(task);
    expect(global.fetch).toHaveBeenCalledWith("https://x.com/a.wav");
  });

  it("prefers stressedText for synthesis", async () => {
    const { synthesizeAuto } = await import("@/utils/synthesize");
    setupDomMocks();
    const task = { ...mockTask, entries: [
      { id: "e1", taskId: "t1", text: "plain", stressedText: "stressed",
        audioUrl: null, audioBlob: null, order: 0, createdAt: new Date() },
    ] };
    await downloadTaskAsZip(task);
    expect(synthesizeAuto).toHaveBeenCalledWith("stressed");
  });

  it("falls back to text when stressedText is empty", async () => {
    const { synthesizeAuto } = await import("@/utils/synthesize");
    setupDomMocks();
    const task = { ...mockTask, entries: [
      { id: "e1", taskId: "t1", text: "fallback", stressedText: "",
        audioUrl: null, audioBlob: null, order: 0, createdAt: new Date() },
    ] };
    await downloadTaskAsZip(task);
    expect(synthesizeAuto).toHaveBeenCalledWith("fallback");
  });

  it("skips audio on synthesis failure", async () => {
    const { synthesizeAuto } = await import("@/utils/synthesize");
    (synthesizeAuto as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("fail"));
    setupDomMocks();
    const task = { ...mockTask, entries: [
      { id: "e1", taskId: "t1", text: "X", stressedText: "",
        audioUrl: null, audioBlob: null, order: 0, createdAt: new Date() },
    ] };
    await downloadTaskAsZip(task);
    expect(mockAudioFolder.file).not.toHaveBeenCalled();
  });

  it("uses 'audio' fallback when entry text sanitizes to empty", async () => {
    setupDomMocks();
    const task = { ...mockTask, entries: [
      { id: "e1", taskId: "t1", text: "<>:", stressedText: "",
        audioUrl: "https://x.com/a.wav", audioBlob: null, order: 0, createdAt: new Date() },
    ] };
    await downloadTaskAsZip(task);
    expect(mockAudioFolder.file).toHaveBeenCalledWith("001-audio.wav", expect.anything());
  });
});
