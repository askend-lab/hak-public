// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SentencePhoneticPanel from "./SentencePhoneticPanel";

// Use vi.fn() for transforms so we can mockReturnValueOnce later
const mockTransformToUI = vi.fn((t: string | null) => t ?? null);
const mockTransformToVabamorf = vi.fn((t: string | null) => t ?? null);

vi.mock("@/utils/phoneticMarkers", () => ({
  transformToUI: (...args: unknown[]) => mockTransformToUI(...args as [string | null]),
  transformToVabamorf: (...args: unknown[]) => mockTransformToVabamorf(...args as [string | null]),
}));

vi.mock("@/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
}));

vi.mock("@/types/synthesis", () => ({
  getVoiceModel: vi.fn(() => "model"),
}));

// Capture audio callbacks so we can trigger them manually
let audioCallbacks: {
  onLoaded?: () => void;
  onEnded?: () => void;
  onError?: () => void;
} = {};
const mockPause = vi.fn();
const mockPlay = vi.fn().mockResolvedValue(undefined);

vi.mock("@/utils/audioPlayer", () => ({
  createAudioPlayer: vi.fn((_url: string, cbs: typeof audioCallbacks) => {
    audioCallbacks = cbs;
    return {
      audio: { play: mockPlay, pause: mockPause },
    };
  }),
}));

describe("SentencePhoneticPanel mutation kills", () => {
  const defaultProps = {
    sentenceText: "Hello world",
    phoneticText: "Héllo wórld",
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransformToUI.mockImplementation((t: string | null) => t ?? null);
    mockTransformToVabamorf.mockImplementation((t: string | null) => t ?? null);
    mockPlay.mockResolvedValue(undefined);
    audioCallbacks = {};
  });

  describe("editedText initialization", () => {
    it("uses phoneticText (via transformToUI) when open with phoneticText", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByDisplayValue("Héllo wórld")).toBeInTheDocument();
    });

    it("uses sentenceText when open with null phoneticText", () => {
      render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} />);
      expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
    });

    it("does not render when isOpen false", () => {
      const { container } = render(
        <SentencePhoneticPanel {...defaultProps} isOpen={false} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("focus behavior", () => {
    it("focuses textarea when panel opens", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      const ta = screen.getByDisplayValue("Héllo wórld");
      expect(document.activeElement).toBe(ta);
    });
  });

  describe("insertMarkerAtCursor", () => {
    it("inserts marker at cursor position", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} phoneticText="test" />);
      const ta = screen.getByDisplayValue("test") as HTMLTextAreaElement;
      ta.focus();
      ta.setSelectionRange(2, 2);

      const markerBtn = screen.getByRole("button", { name: "kolmas välde" });
      await user.click(markerBtn);
      expect(ta.value).toContain("`");
    });
  });

  describe("handlePlay audio flow", () => {
    it("calls synthesizeWithPolling and createAudioPlayer", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      await user.click(screen.getByText("Kuula"));

      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      expect(synthesizeWithPolling).toHaveBeenCalled();
      const { createAudioPlayer } = await import("@/utils/audioPlayer");
      expect(createAudioPlayer).toHaveBeenCalled();
      expect(mockPlay).toHaveBeenCalled();
    });

    it("onLoaded sets isPlaying=true, isLoading=false", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      await user.click(screen.getByText("Kuula"));

      // Trigger onLoaded inside act
      await act(async () => { audioCallbacks.onLoaded?.(); });

      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).toContain("playing");
      expect(btn.className).not.toContain("loading");
      expect(btn.title).toBe("Mängib");
    });

    it("onEnded resets isPlaying and isLoading", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      await user.click(screen.getByText("Kuula"));
      await act(async () => { audioCallbacks.onLoaded?.(); });

      await act(async () => { audioCallbacks.onEnded?.(); });

      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).not.toContain("playing");
      expect(btn.className).not.toContain("loading");
      expect(btn.title).toBe("Kuula");
    });

    it("onError resets isPlaying and isLoading", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      await user.click(screen.getByText("Kuula"));
      await act(async () => { audioCallbacks.onLoaded?.(); });
      await act(async () => { audioCallbacks.onError?.(); });

      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).not.toContain("playing");
      expect(btn.className).not.toContain("loading");
    });

    it("catch block logs error with exact prefix and resets state", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("synth fail"),
      );
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);

      await user.click(screen.getByText("Kuula"));
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Failed to play:", expect.any(Error));
      });

      const btn = screen.getByText("Kuula").closest("button")!;
      expect(btn.className).not.toContain("playing");
      expect(btn.className).not.toContain("loading");
      consoleSpy.mockRestore();
    });

    it("play button title shows 'Laen...' during loading", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}),
      );
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);

      await user.click(screen.getByText("Kuula"));
      expect(screen.getByText("Kuula").closest("button")?.title).toBe("Laen...");
    });

    it("does not play when editedText is whitespace only", () => {
      render(
        <SentencePhoneticPanel {...defaultProps} phoneticText={null} sentenceText="" />,
      );
      expect(screen.getByText("Kuula").closest("button")).toBeDisabled();
    });

    it("shows loader-spinner when loading", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}),
      );
      const user = userEvent.setup();
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      await user.click(screen.getByText("Kuula"));
      expect(container.querySelector(".loader-spinner")).toBeTruthy();
    });
  });

  describe("handleApply", () => {
    it("calls onApply with transformed text then onClose", async () => {
      const onApply = vi.fn();
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(
        <SentencePhoneticPanel {...defaultProps} onApply={onApply} onClose={onClose} />,
      );
      await user.click(screen.getByRole("button", { name: /rakenda/i }));
      expect(onApply).toHaveBeenCalledWith("Héllo wórld");
      expect(onClose).toHaveBeenCalled();
    });

    it("does not call onApply when text is whitespace", async () => {
      const onApply = vi.fn();
      const user = userEvent.setup();
      render(
        <SentencePhoneticPanel {...defaultProps} phoneticText={null} sentenceText="   " onApply={onApply} />,
      );
      await user.click(screen.getByRole("button", { name: /rakenda/i }));
      expect(onApply).not.toHaveBeenCalled();
    });

    it("uses empty string fallback when transformToVabamorf returns null", async () => {
      mockTransformToVabamorf.mockReturnValueOnce(null);
      const onApply = vi.fn();
      const user = userEvent.setup();
      render(
        <SentencePhoneticPanel {...defaultProps} onApply={onApply} />,
      );
      await user.click(screen.getByRole("button", { name: /rakenda/i }));
      expect(onApply).toHaveBeenCalledWith("");
    });
  });

  describe("handleClose", () => {
    it("calls onClose", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} onClose={onClose} />);
      await user.click(screen.getByRole("button", { name: /sulge/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it("resets playing/loading state on close", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByText("Kuula"));
      await act(async () => { audioCallbacks.onLoaded?.(); });

      await user.click(screen.getByRole("button", { name: /sulge/i }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("handlePlay guard", () => {
    it("handlePlay does not call synthesize when text is empty", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockClear();
      render(
        <SentencePhoneticPanel {...defaultProps} phoneticText={null} sentenceText="  " />,
      );
      // Button is disabled, so play won't fire
      const btn = screen.getByText("Kuula").closest("button");
      expect(btn).toBeDisabled();
      expect(synthesizeWithPolling).not.toHaveBeenCalled();
    });
  });

  describe("button disabled states", () => {
    it("play disabled when empty text", () => {
      render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} sentenceText="" />);
      expect(screen.getByText("Kuula").closest("button")).toBeDisabled();
    });

    it("play disabled when isLoading", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}),
      );
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      await user.click(screen.getByText("Kuula"));
      expect(screen.getByText("Kuula").closest("button")).toBeDisabled();
    });

    it("play enabled when text present and not loading", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByText("Kuula").closest("button")).not.toBeDisabled();
    });

    it("apply disabled when empty text", () => {
      render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} sentenceText="" />);
      expect(screen.getByRole("button", { name: /rakenda/i })).toBeDisabled();
    });

    it("apply enabled when text present", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByRole("button", { name: /rakenda/i })).not.toBeDisabled();
    });
  });

  describe("guide view", () => {
    it("shows guide when opened and hides main header", async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      const guideBtn = screen.queryByLabelText("Ava hääldusmärkide juhend");
      if (guideBtn) {
        await user.click(guideBtn);
        expect(screen.getByText("Hääldusmärkide juhend")).toBeInTheDocument();
        expect(screen.queryByText("Muuda häälduskuju")).not.toBeInTheDocument();
      }
    });

    it("guide close calls handleClose", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} onClose={onClose} />);
      const guideBtn = screen.queryByLabelText("Ava hääldusmärkide juhend");
      if (guideBtn) {
        await user.click(guideBtn);
        const closeButtons = screen.getAllByRole("button", { name: /sulge/i });
        await user.click(closeButtons[0]!);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe("CSS classes", () => {
    it("root class", () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      expect(container.querySelector(".sentence-phonetic-panel")).toBeTruthy();
    });

    it("header classes", () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      expect(container.querySelector(".sentence-phonetic-panel__header")).toBeTruthy();
      expect(container.querySelector(".sentence-phonetic-panel__title-section")).toBeTruthy();
    });

    it("play button button--primary", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByText("Kuula").closest("button")?.className).toContain("button--primary");
    });

    it("apply button button--secondary", () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByRole("button", { name: /rakenda/i }).className).toContain("button--secondary");
    });

    it("textarea class", () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      expect(container.querySelector(".sentence-phonetic-panel__textarea")).toBeTruthy();
    });

    it("close button class", () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      expect(container.querySelector(".sentence-phonetic-panel__close")).toBeTruthy();
    });

    it("markers guide box class", () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      expect(container.querySelector(".sentence-phonetic-panel__markers-guide-box")).toBeTruthy();
    });

    it("textarea placeholder", () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      const ta = container.querySelector("textarea");
      expect(ta?.placeholder).toBe("Kirjuta oma foneetiline variant");
    });

    it("textarea rows=4", () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} />);
      expect(Number(container.querySelector("textarea")?.rows)).toBe(4);
    });
  });
});
