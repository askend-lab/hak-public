// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import SentencePhoneticPanel from "./SentencePhoneticPanel";

const flush = () => new Promise(r => setTimeout(r, 0));

const mockTransformToUI = vi.fn((t: string | null) => t ?? null);
const mockTransformToVabamorf = vi.fn((t: string | null) => t ?? null);
vi.mock("@/utils/phoneticMarkers", () => ({
  transformToUI: (...a: unknown[]) => mockTransformToUI(...(a as [string | null])),
  transformToVabamorf: (...a: unknown[]) => mockTransformToVabamorf(...(a as [string | null])),
}));
vi.mock("@/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-url"),
}));
vi.mock("@/types/synthesis", () => ({ getVoiceModel: vi.fn(() => "m") }));

let cbs: { onLoaded?: () => void; onEnded?: () => void; onError?: () => void } = {};
const mockPause = vi.fn();
const mockPlay = vi.fn().mockResolvedValue(undefined);
vi.mock("@/utils/audioPlayer", () => ({
  createAudioPlayer: vi.fn((_u: string, c: typeof cbs) => {
    cbs = c;
    return { audio: { play: mockPlay, pause: mockPause } };
  }),
}));

describe("SentencePhoneticPanel mutation kills", () => {
  const dp = {
    sentenceText: "Hello world",
    phoneticText: "abcde",
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
  };
  beforeEach(async () => {
    vi.clearAllMocks();
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
    (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockResolvedValue("mock-url");
    mockTransformToUI.mockImplementation((t: string | null) => t ?? null);
    mockTransformToVabamorf.mockImplementation((t: string | null) => t ?? null);
    mockPlay.mockResolvedValue(undefined);
    cbs = {};
  });

  // --- editedText init & useEffect deps ---
  it("uses transformToUI(phoneticText) when open", () => {
    render(<SentencePhoneticPanel {...dp} />);
    expect(mockTransformToUI).toHaveBeenCalledWith("abcde");
    expect(screen.getByDisplayValue("abcde")).toBeInTheDocument();
  });
  it("uses sentenceText when phoneticText is null", () => {
    render(<SentencePhoneticPanel {...dp} phoneticText={null} />);
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
  });
  it("falls back to empty string when transformToUI returns null", () => {
    mockTransformToUI.mockReturnValueOnce(null);
    render(<SentencePhoneticPanel {...dp} />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
  it("returns null when not open", () => {
    const { container } = render(<SentencePhoneticPanel {...dp} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });
  it("re-initializes when phoneticText changes", () => {
    const { rerender } = render(<SentencePhoneticPanel {...dp} phoneticText="old" />);
    expect(screen.getByDisplayValue("old")).toBeInTheDocument();
    rerender(<SentencePhoneticPanel {...dp} phoneticText="new" />);
    expect(screen.getByDisplayValue("new")).toBeInTheDocument();
  });
  it("re-initializes when sentenceText changes and phoneticText null", () => {
    const { rerender } = render(
      <SentencePhoneticPanel {...dp} phoneticText={null} sentenceText="a" />,
    );
    expect(screen.getByDisplayValue("a")).toBeInTheDocument();
    rerender(<SentencePhoneticPanel {...dp} phoneticText={null} sentenceText="b" />);
    expect(screen.getByDisplayValue("b")).toBeInTheDocument();
  });
  it("focuses textarea on open", () => {
    render(<SentencePhoneticPanel {...dp} />);
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
  });
  it("shows edit view by default (not guide)", () => {
    render(<SentencePhoneticPanel {...dp} />);
    expect(screen.getByText("Muuda häälduskuju")).toBeInTheDocument();
    expect(screen.queryByText("Hääldusmärkide juhend")).not.toBeInTheDocument();
  });

  // --- insertMarkerAtCursor ---
  describe("insertMarkerAtCursor", () => {
    it("inserts marker at middle preserving surrounding text", () => {
      vi.useFakeTimers();
      render(<SentencePhoneticPanel {...dp} phoneticText="hello" />);
      const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(2, 2);
      fireEvent.click(screen.getByRole("button", { name: "kolmas välde" }));
      expect(ta.value).toBe("he`llo");
      vi.advanceTimersByTime(10);
      expect(ta.selectionStart).toBe(3);
      expect(ta.selectionEnd).toBe(3);
      vi.useRealTimers();
    });
    it("inserts at start (position 0)", () => {
      vi.useFakeTimers();
      render(<SentencePhoneticPanel {...dp} phoneticText="abc" />);
      const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(0, 0);
      fireEvent.click(screen.getByRole("button", { name: "kolmas välde" }));
      expect(ta.value).toBe("`abc");
      vi.advanceTimersByTime(10);
      expect(ta.selectionStart).toBe(1);
      vi.useRealTimers();
    });
    it("inserts at end", () => {
      vi.useFakeTimers();
      render(<SentencePhoneticPanel {...dp} phoneticText="abc" />);
      const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(3, 3);
      fireEvent.click(screen.getByRole("button", { name: "kolmas välde" }));
      expect(ta.value).toBe("abc`");
      vi.advanceTimersByTime(10);
      expect(ta.selectionStart).toBe(4);
      vi.useRealTimers();
    });
    it("replaces selected range", () => {
      vi.useFakeTimers();
      render(<SentencePhoneticPanel {...dp} phoneticText="abcde" />);
      const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(1, 3);
      fireEvent.click(screen.getByRole("button", { name: "kolmas välde" }));
      expect(ta.value).toBe("a`de");
      vi.advanceTimersByTime(10);
      expect(ta.selectionStart).toBe(2);
      vi.useRealTimers();
    });
  });

  // --- handlePlay ---
  describe("handlePlay", () => {
    it("passes transformToVabamorf result to synthesize", async () => {
      mockTransformToVabamorf.mockReturnValueOnce("transformed");
      render(<SentencePhoneticPanel {...dp} />);
      await act(async () => { fireEvent.click(screen.getByText("Kuula")); await flush(); });
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      expect(synthesizeWithPolling).toHaveBeenCalledWith("transformed", "m");
    });
    it("empty string fallback when transformToVabamorf returns null", async () => {
      mockTransformToVabamorf.mockReturnValueOnce(null);
      render(<SentencePhoneticPanel {...dp} />);
      await act(async () => { fireEvent.click(screen.getByText("Kuula")); await flush(); });
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      expect(synthesizeWithPolling).toHaveBeenCalledWith("", "m");
      const { getVoiceModel } = await import("@/types/synthesis");
      expect(getVoiceModel).toHaveBeenCalledWith("");
    });
    it("sets isLoading at start", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}),
      );
      render(<SentencePhoneticPanel {...dp} />);
      fireEvent.click(screen.getByText("Kuula"));
      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).toContain("loading");
      expect(btn.className).not.toContain("playing");
      expect(btn.title).toBe("Laen...");
    });
    it("onLoaded sets playing", async () => {
      render(<SentencePhoneticPanel {...dp} />);
      await act(async () => { fireEvent.click(screen.getByText("Kuula")); await flush(); });
      await act(async () => { cbs.onLoaded?.(); });
      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).toContain("playing");
      expect(btn.className).not.toContain("loading");
      expect(btn.title).toBe("Mängib");
    });
    it("onEnded resets both", async () => {
      render(<SentencePhoneticPanel {...dp} />);
      await act(async () => { fireEvent.click(screen.getByText("Kuula")); await flush(); });
      await act(async () => { cbs.onLoaded?.(); });
      await act(async () => { cbs.onEnded?.(); });
      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).not.toContain("playing");
      expect(btn.className).not.toContain("loading");
    });
    it("onError resets both", async () => {
      render(<SentencePhoneticPanel {...dp} />);
      await act(async () => { fireEvent.click(screen.getByText("Kuula")); await flush(); });
      await waitFor(() => expect(cbs.onLoaded).toBeDefined());
      await act(async () => { cbs.onLoaded?.(); });
      await act(async () => { cbs.onError?.(); });
      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).not.toContain("playing");
      expect(btn.className).not.toContain("loading");
    });
    it("catch logs and resets", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("x"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      render(<SentencePhoneticPanel {...dp} />);
      await act(async () => { fireEvent.click(screen.getByText("Kuula")); await flush(); });
      await waitFor(() => expect(spy).toHaveBeenCalledWith("Failed to play:", expect.any(Error)));
      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).not.toContain("playing");
      expect(btn.className).not.toContain("loading");
      spy.mockRestore();
    });
    it("shows loader-spinner", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));
      const { container } = render(<SentencePhoneticPanel {...dp} />);
      fireEvent.click(screen.getByText("Kuula"));
      expect(container.querySelector(".loader-spinner")).toBeTruthy();
    });
  });

  // --- handleApply ---
  describe("handleApply", () => {
    it("calls onApply with transformed text then onClose", () => {
      const onApply = vi.fn();
      const onClose = vi.fn();
      render(<SentencePhoneticPanel {...dp} onApply={onApply} onClose={onClose} />);
      fireEvent.click(screen.getByRole("button", { name: /rakenda/i }));
      expect(onApply).toHaveBeenCalledWith("abcde");
      expect(onClose).toHaveBeenCalled();
    });
    it("does not call onApply when whitespace", () => {
      const onApply = vi.fn();
      render(<SentencePhoneticPanel {...dp} phoneticText={null} sentenceText="   " onApply={onApply} />);
      fireEvent.click(screen.getByRole("button", { name: /rakenda/i }));
      expect(onApply).not.toHaveBeenCalled();
    });
    it("null fallback from transformToVabamorf", () => {
      mockTransformToVabamorf.mockReturnValueOnce(null);
      const onApply = vi.fn();
      render(<SentencePhoneticPanel {...dp} onApply={onApply} />);
      fireEvent.click(screen.getByRole("button", { name: /rakenda/i }));
      expect(onApply).toHaveBeenCalledWith("");
    });
  });

  // --- handleClose ---
  describe("handleClose", () => {
    it("calls onClose", () => {
      const onClose = vi.fn();
      render(<SentencePhoneticPanel {...dp} onClose={onClose} />);
      fireEvent.click(screen.getByRole("button", { name: /sulge/i }));
      expect(onClose).toHaveBeenCalled();
    });
    it("resets state on close after play", async () => {
      const onClose = vi.fn();
      render(<SentencePhoneticPanel {...dp} onClose={onClose} />);
      await act(async () => { fireEvent.click(screen.getByText("Kuula")); await flush(); });
      await waitFor(() => expect(cbs.onLoaded).toBeDefined());
      await act(async () => { cbs.onLoaded?.(); });
      fireEvent.click(screen.getByRole("button", { name: /sulge/i }));
      expect(onClose).toHaveBeenCalled();
      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).not.toContain("playing");
      expect(btn.className).not.toContain("loading");
    });
  });

  // --- button disabled ---
  describe("disabled states", () => {
    it("play disabled empty", () => {
      render(<SentencePhoneticPanel {...dp} phoneticText={null} sentenceText="" />);
      expect(screen.getByText("Kuula").closest("button")).toBeDisabled();
    });
    it("apply disabled empty", () => {
      render(<SentencePhoneticPanel {...dp} phoneticText={null} sentenceText="" />);
      expect(screen.getByRole("button", { name: /rakenda/i })).toBeDisabled();
    });
    it("play disabled whitespace-only (kills .trim() mutation)", () => {
      render(<SentencePhoneticPanel {...dp} phoneticText={null} sentenceText="   " />);
      expect(screen.getByText("Kuula").closest("button")).toBeDisabled();
    });
    it("apply disabled whitespace-only (kills .trim() mutation)", () => {
      render(<SentencePhoneticPanel {...dp} phoneticText={null} sentenceText="   " />);
      expect(screen.getByRole("button", { name: /rakenda/i })).toBeDisabled();
    });
    it("play enabled with text", () => {
      render(<SentencePhoneticPanel {...dp} />);
      expect(screen.getByText("Kuula").closest("button")).not.toBeDisabled();
    });
    it("apply enabled with text", () => {
      render(<SentencePhoneticPanel {...dp} />);
      expect(screen.getByRole("button", { name: /rakenda/i })).not.toBeDisabled();
    });
  });

  // --- guide view ---
  describe("guide view", () => {
    it("opens guide and shows marker items", () => {
      render(<SentencePhoneticPanel {...dp} />);
      const btn = screen.queryByLabelText("Ava hääldusmärkide juhend");
      if (!btn) return;
      fireEvent.click(btn);
      expect(screen.getByText("Hääldusmärkide juhend")).toBeInTheDocument();
      expect(screen.queryByText("Muuda häälduskuju")).not.toBeInTheDocument();
      expect(screen.getByText(/k`ätte/)).toBeInTheDocument();
      expect(screen.getByText(/kolmas välde/)).toBeInTheDocument();
    });
    it("back button returns to edit view", () => {
      render(<SentencePhoneticPanel {...dp} />);
      const btn = screen.queryByLabelText("Ava hääldusmärkide juhend");
      if (!btn) return;
      fireEvent.click(btn);
      fireEvent.click(screen.getByLabelText("Tagasi"));
      expect(screen.getByText("Muuda häälduskuju")).toBeInTheDocument();
    });
    it("guide close calls handleClose", () => {
      const onClose = vi.fn();
      render(<SentencePhoneticPanel {...dp} onClose={onClose} />);
      const btn = screen.queryByLabelText("Ava hääldusmärkide juhend");
      if (!btn) return;
      fireEvent.click(btn);
      const closes = screen.getAllByRole("button", { name: /sulge/i });
      fireEvent.click(closes[0]!);
      expect(onClose).toHaveBeenCalled();
    });
  });

  // --- CSS classes ---
  describe("classes and attrs", () => {
    it("root", () => {
      const { container } = render(<SentencePhoneticPanel {...dp} />);
      expect(container.querySelector(".sentence-phonetic-panel")).toBeTruthy();
    });
    it("button--primary on play", () => {
      render(<SentencePhoneticPanel {...dp} />);
      expect(screen.getByText("Kuula").closest("button")?.className).toContain("button--primary");
    });
    it("button--secondary on apply", () => {
      render(<SentencePhoneticPanel {...dp} />);
      expect(screen.getByRole("button", { name: /rakenda/i }).className).toContain("button--secondary");
    });
    it("play idle: exact class and title (kills empty-string mutations)", () => {
      render(<SentencePhoneticPanel {...dp} />);
      const btn = screen.getByText("Kuula").closest("button")!;
      const classes = btn.className.trim().split(/\s+/);
      expect(classes).toEqual(["button", "button--primary"]);
      expect(btn.title).toBe("Kuula");
    });
    it("textarea rows=4 and placeholder", () => {
      const { container } = render(<SentencePhoneticPanel {...dp} />);
      const ta = container.querySelector("textarea")!;
      expect(Number(ta.rows)).toBe(4);
      expect(ta.placeholder).toBe("Kirjuta oma foneetiline variant");
    });
    it("close button class", () => {
      const { container } = render(<SentencePhoneticPanel {...dp} />);
      expect(container.querySelector(".sentence-phonetic-panel__close")).toBeTruthy();
    });
  });
});
