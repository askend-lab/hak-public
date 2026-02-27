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
vi.mock("@/contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({ copiedEntries: null, setCopiedEntries: vi.fn(), consumeCopiedEntries: vi.fn().mockReturnValue(null), hasCopiedEntries: false }),
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

  it("handleDeleteTag sets openTagMenu to null", () => {
    const { result } = setupHook();
    const id = result.current.sentences[0]?.id ?? "";
    act(() => { result.current.setOpenTagMenu({ sentenceId: id, tagIndex: 0 }); });
    expect(result.current.openTagMenu).not.toBeNull();
    act(() => { result.current.handleDeleteTag(id, 0); });
    expect(result.current.openTagMenu).toBeNull();
  });

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

  it("handleEditTagChange without active edit does nothing", () => {
    const { result } = setupHook();
    act(() => { result.current.handleEditTagChange("value"); });
    expect(result.current.editingTag).toBeNull();
  });

});
