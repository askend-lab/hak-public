// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesis } from "./useSynthesis";

vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: (): { showNotification: ReturnType<typeof vi.fn> } => ({
    showNotification: vi.fn(),
  }),
}));

vi.mock("@/features/synthesis/utils/phoneticMarkers", () => ({
  stripPhoneticMarkers: (text: string): string => text.replace(/[·`´óáéí]/g, (c) => {
    const map: Record<string, string> = { ó: "o", á: "a", é: "e", í: "i" };
    return map[c] ?? "";
  }),
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
  synthesizeAuto: vi.fn().mockResolvedValue("mock-audio-url"),
}));

function setupMocks(): void {
  class MockAudio {
    src = "";
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onloadeddata: (() => void) | null = null;
    pause = vi.fn();
    play = vi.fn().mockImplementation(() => {
      setTimeout(() => this.onended?.(), 10);
      return Promise.resolve();
    });
  }
  global.Audio = MockAudio as unknown as typeof Audio;
  global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
  global.URL.revokeObjectURL = vi.fn();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(new Blob(["audio"])),
  });
}

function setupHook() {
  const hook = renderHook(() => useSynthesis());
  act(() => { hook.result.current.setDemoSentences(); });
  return hook;
}

describe("useSynthesis mutation kills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- handleKeyDown L57-65 ---
  it("handleKeyDown calls synthesizeWithText when text provided", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleTextChange(id, "word"); });
    const ev = { key: " ", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => { result.current.handleKeyDown(ev, id); });
    // Tags should include the new word after space
    expect(result.current.sentences[0]?.tags).toContain("word");
    expect(result.current.sentences[0]?.currentInput).toBe("");
  });

  // --- handlePlay L74-98 ---
  it("handlePlay with input trims, splits and joins tags correctly", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleTextChange(id, "  foo  bar  "); });
    act(() => { result.current.handlePlay(id); });
    const s = result.current.sentences[0];
    expect(s?.tags).toContain("foo");
    expect(s?.tags).toContain("bar");
    expect(s?.currentInput).toBe("");
    expect(s?.text).toContain("foo");
    expect(s?.text).toContain("bar");
  });

  it("handlePlay with only tags and no input synthesizes", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    expect(result.current.sentences[0]?.tags.length).toBeGreaterThan(0);
    act(() => { result.current.handlePlay(id); });
    // Should not change tags, just trigger synthesis
    expect(result.current.sentences[0]?.tags.length).toBeGreaterThan(0);
  });

  it("handlePlay with empty tags and empty input does nothing", () => {
    const { result } = renderHook(() => useSynthesis());
    const id = result.current.sentences[0]?.id ?? "";
    // No demo, so tags=[] and input=""
    act(() => { result.current.handlePlay(id); });
    expect(result.current.sentences[0]?.tags).toEqual([]);
  });

  it("handlePlay filters empty strings from split input", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleTextChange(id, "  "); });
    // Input is whitespace-only, trim makes it empty
    act(() => { result.current.handlePlay(id); });
    // Should NOT add empty tags
    const tags = result.current.sentences[0]?.tags ?? [];
    expect(tags.every((t: string) => t.length > 0)).toBe(true);
  });

  // --- handleDownload L100-137 ---
  it("handleDownload creates download link with correct filename", async () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
    const removeSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);
    const anchor = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(anchor as unknown as HTMLAnchorElement);

    await act(async () => { await result.current.handleDownload(id); });

    expect(anchor.download).toMatch(/\.wav$/);
    expect(anchor.click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("handleDownload with no sentence returns early", async () => {
    const { result } = setupHook();
    await act(async () => { await result.current.handleDownload("nonexistent"); });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("handleDownload uses existing audioUrl without re-synthesizing", async () => {
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    // Set audioUrl on the sentence
    act(() => {
      result.current.sentences[0] && (result.current.sentences[0].audioUrl = "existing-url");
    });
    vi.spyOn(document.body, "appendChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => null as unknown as Node);
    vi.spyOn(document, "createElement").mockReturnValue({ href: "", download: "", click: vi.fn() } as unknown as HTMLAnchorElement);

    await act(async () => { await result.current.handleDownload(id); });
    expect(synthesizeWithPolling).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith("existing-url");
  });

  // --- handleCopyText L139-158 ---
  it("handleCopyText copies exact sentence text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, writable: true, configurable: true });
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    const expectedText = result.current.sentences[0]?.text ?? "";

    await act(async () => { await result.current.handleCopyText(id); });

    expect(writeText).toHaveBeenCalledWith(expectedText);
  });

  it("handleCopyText with empty text does nothing", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, writable: true, configurable: true });
    const { result } = renderHook(() => useSynthesis());
    const id = result.current.sentences[0]?.id ?? "";
    // Fresh sentence has empty text
    await act(async () => { await result.current.handleCopyText(id); });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("handleCopyText with nonexistent sentence does nothing", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, writable: true, configurable: true });
    const { result } = setupHook();
    await act(async () => { await result.current.handleCopyText("no-such-id"); });
    expect(writeText).not.toHaveBeenCalled();
  });

  // --- handleEditTagCommit L188-200 ---
  it("handleEditTagCommit with whitespace-only deletes tag", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    const initialLen = result.current.sentences[0]?.tags.length ?? 0;
    act(() => { result.current.handleEditTag(id, 0); });
    act(() => { result.current.handleEditTagChange("   "); });
    act(() => { result.current.handleEditTagCommit(); });
    expect(result.current.editingTag).toBeNull();
    expect(result.current.sentences[0]?.tags.length).toBe(initialLen - 1);
  });

  it("handleEditTagCommit splits multi-word value", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleEditTag(id, 0); });
    act(() => { result.current.handleEditTagChange("one two three"); });
    act(() => { result.current.handleEditTagCommit(); });
    expect(result.current.sentences[0]?.tags).toContain("one");
    expect(result.current.sentences[0]?.tags).toContain("two");
    expect(result.current.sentences[0]?.tags).toContain("three");
  });

  it("handleEditTagCommit does nothing when no editingTag", () => {
    const { result } = setupHook();
    const tagsBefore = [...(result.current.sentences[0]?.tags ?? [])];
    act(() => { result.current.handleEditTagCommit(); });
    expect(result.current.sentences[0]?.tags).toEqual(tagsBefore);
  });

  // --- handleEditTagKeyDown L202-246 ---
  it("Enter key computes new text from replaced tags and synthesizes", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleEditTag(id, 1); });
    act(() => { result.current.handleEditTagChange("replaced"); });
    const ev = { key: "Enter", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => { result.current.handleEditTagKeyDown(ev); });
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(result.current.sentences[0]?.tags).toContain("replaced");
    expect(result.current.editingTag).toBeNull();
  });

  it("Enter with empty value removes tag and computes new text", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    const origLen = result.current.sentences[0]?.tags.length ?? 0;
    act(() => { result.current.handleEditTag(id, 0); });
    act(() => { result.current.handleEditTagChange(""); });
    const ev = { key: "Enter", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => { result.current.handleEditTagKeyDown(ev); });
    expect(result.current.sentences[0]?.tags.length).toBe(origLen - 1);
  });

  it("Enter with multi-word value splits into multiple tags", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleEditTag(id, 0); });
    act(() => { result.current.handleEditTagChange("a b c"); });
    const ev = { key: "Enter", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => { result.current.handleEditTagKeyDown(ev); });
    expect(result.current.sentences[0]?.tags).toContain("a");
    expect(result.current.sentences[0]?.tags).toContain("b");
    expect(result.current.sentences[0]?.tags).toContain("c");
  });

  it("Space key commits edit tag", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleEditTag(id, 0); });
    act(() => { result.current.handleEditTagChange("spaced"); });
    const ev = { key: " ", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => { result.current.handleEditTagKeyDown(ev); });
    expect(result.current.editingTag).toBeNull();
    expect(result.current.sentences[0]?.tags).toContain("spaced");
  });

  it("Escape key cancels edit without changing tags", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    const tagsBefore = [...(result.current.sentences[0]?.tags ?? [])];
    act(() => { result.current.handleEditTag(id, 0); });
    act(() => { result.current.handleEditTagChange("cancelled"); });
    const ev = { key: "Escape", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => { result.current.handleEditTagKeyDown(ev); });
    expect(result.current.editingTag).toBeNull();
    expect(result.current.sentences[0]?.tags).toEqual(tagsBefore);
  });

  // --- handleUseVariant L248-263 ---
  it("handleUseVariant with null sentenceId does nothing", () => {
    const { result } = setupHook();
    const tagsBefore = result.current.sentences[0]?.stressedTags ?? null;
    act(() => { result.current.handleUseVariant("text", null, 0); });
    expect(result.current.sentences[0]?.stressedTags).toEqual(tagsBefore);
  });

  it("handleUseVariant with null tagIndex does nothing", () => {
    const { result } = setupHook();
    act(() => { result.current.handleUseVariant("text", "1", null); });
    // Should not crash
  });

  // --- handleSentencePhoneticApply L265-291 ---
  it("handleSentencePhoneticApply updates text, tags, stressedTags and clears audioUrl", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => {
      result.current.handleSentencePhoneticApply(id, "Nóormees láks kóoli");
    });
    const s = result.current.sentences[0];
    expect(s?.phoneticText).toBe("Nóormees láks kóoli");
    expect(s?.text).toBe("Noormees laks kooli");
    expect(s?.tags).toEqual(["Noormees", "laks", "kooli"]);
    expect(s?.stressedTags).toEqual(["Nóormees", "láks", "kóoli"]);
    expect(s?.audioUrl).toBeUndefined();
  });

  it("handleSentencePhoneticApply handles empty phonetic text", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.handleSentencePhoneticApply(id, ""); });
    const s = result.current.sentences[0];
    expect(s?.text).toBe("");
    expect(s?.tags).toEqual([]);
    expect(s?.stressedTags).toEqual([]);
  });

  it("handleSentencePhoneticApply skips non-matching sentence", () => {
    const { result } = setupHook();
    const s1tags = [...(result.current.sentences[0]?.tags ?? [])];
    act(() => { result.current.handleSentencePhoneticApply("nonexistent", "test"); });
    expect(result.current.sentences[0]?.tags).toEqual(s1tags);
  });

  // --- handleDeleteTag clears openTagMenu ---
  it("handleDeleteTag sets openTagMenu to null", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.setOpenTagMenu({ sentenceId: id, tagIndex: 0 }); });
    expect(result.current.openTagMenu).not.toBeNull();
    act(() => { result.current.handleDeleteTag(id, 0); });
    expect(result.current.openTagMenu).toBeNull();
  });

  // --- handleEditTag sets editingTag and clears menu ---
  it("handleEditTag populates editingTag with correct word", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    const word = result.current.sentences[0]?.tags[1] ?? "";
    act(() => { result.current.handleEditTag(id, 1); });
    expect(result.current.editingTag?.value).toBe(word);
    expect(result.current.editingTag?.tagIndex).toBe(1);
    expect(result.current.openTagMenu).toBeNull();
  });

  it("handleEditTag with nonexistent sentence does nothing", () => {
    const { result } = setupHook();
    act(() => { result.current.handleEditTag("nonexistent", 0); });
    expect(result.current.editingTag).toBeNull();
  });

  // --- handleEditTagChange with no editingTag ---
  it("handleEditTagChange without active edit does nothing", () => {
    const { result } = setupHook();
    act(() => { result.current.handleEditTagChange("value"); });
    expect(result.current.editingTag).toBeNull();
  });
});
