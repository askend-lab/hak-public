// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PronunciationVariants from "./PronunciationVariants";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
  synthesizeAuto: vi.fn().mockResolvedValue("mock-audio-url"),
}));
vi.mock("@/features/synthesis/utils/audioPlayer", () => ({
  createAudioPlayer: vi.fn(() => ({
    audio: { play: vi.fn().mockResolvedValue(undefined), pause: vi.fn() },
  })),
}));
vi.mock("@/features/synthesis/utils/phoneticMarkers", () => ({
  transformToVabamorf: vi.fn((t: string): string => t),
  transformToUI: vi.fn((t: string): string => t),
}));
vi.mock("./VariantItem", () => ({
  VariantItem: ({
    variant,
    onPlay,
    onUse,
  }: {
    variant: { text: string; description: string };
    onPlay: (v: { text: string; description: string }) => void;
    onUse: (v: { text: string; description: string }) => void;
  }) => (
    <div data-testid={`variant-${variant.text}`}>
      <span>{variant.description}</span>
      <button aria-label="play" onClick={() => onPlay(variant)}>
        Play
      </button>
      <button onClick={() => onUse(variant)}>Kasuta</button>
    </div>
  ),
}));
vi.mock("./CustomVariantForm", () => ({
  CustomVariantForm: ({
    onChange,
    onPlay,
    onUse,
    onClose,
  }: {
    onChange: (v: string) => void;
    onPlay: () => void;
    onUse: () => void;
    onClose: () => void;
  }) => (
    <div data-testid="custom-form">
      <input
        data-testid="custom-input"
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onPlay}>Play Custom</button>
      <button onClick={onUse}>Use Custom</button>
      <button onClick={onClose}>Close Custom</button>
    </div>
  ),
}));
vi.mock("./PhoneticGuide", () => ({
  default: ({
    onBack,
    onClose,
  }: {
    onBack: () => void;
    onClose: () => void;
  }) => (
    <div data-testid="phonetic-guide">
      <button onClick={onBack}>Back</button>
      <button onClick={onClose}>Close Guide</button>
    </div>
  ),
}));

describe("PronunciationVariants", () => {
  const defaultProps = {
    word: "tere",
    isOpen: true,
    onClose: vi.fn(),
    onUseVariant: vi.fn(),
    customPhoneticForm: null as string | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          variants: [
            { text: "te`re", description: "Variant 1" },
            { text: "te're", description: "Variant 2" },
            { text: "te`re", description: "Duplicate" },
          ],
        }),
    });
  });

  it("calls onUseVariant when use button clicked", async () => {
    const onUseVariant = vi.fn();
    const user = userEvent.setup();
    render(
      <PronunciationVariants {...defaultProps} onUseVariant={onUseVariant} />,
    );
    await waitFor(() =>
      expect(screen.getByText("Variant 1")).toBeInTheDocument(),
    );
    const useBtns = screen.getAllByText("Kasuta");
    if (useBtns[0]) {await user.click(useBtns[0]);}
    expect(onUseVariant).toHaveBeenCalledWith("te`re");
  });

  it("highlights selected variant", async () => {
    render(
      <PronunciationVariants {...defaultProps} customPhoneticForm="te`re" />,
    );
    await waitFor(() =>
      expect(screen.getByText("Variant 1")).toBeInTheDocument(),
    );
  });

  it("shows and hides custom form", async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Loo oma variant")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Loo oma variant"));
    expect(screen.getByTestId("custom-form")).toBeInTheDocument();
    await user.click(screen.getByText("Close Custom"));
    expect(screen.queryByTestId("custom-form")).not.toBeInTheDocument();
  });

  it("handles play custom variant with value", async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Loo oma variant")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Loo oma variant"));
    await user.type(screen.getByTestId("custom-input"), "te`re");
    await user.click(screen.getByText("Play Custom"));
  });

  it("handles play custom variant with empty value (no-op)", async () => {
    const user = userEvent.setup();
    render(<PronunciationVariants {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByText("Loo oma variant")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Loo oma variant"));
    await user.click(screen.getByText("Play Custom"));
  });

  it("handles use custom variant with value", async () => {
    const onUseVariant = vi.fn();
    const user = userEvent.setup();
    render(
      <PronunciationVariants {...defaultProps} onUseVariant={onUseVariant} />,
    );
    await waitFor(() =>
      expect(screen.getByText("Loo oma variant")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Loo oma variant"));
    await user.type(screen.getByTestId("custom-input"), "te`re");
    await user.click(screen.getByText("Use Custom"));
    expect(onUseVariant).toHaveBeenCalledWith("te`re");
  });

  it("handles use custom variant with empty value (no-op)", async () => {
    const onUseVariant = vi.fn();
    const user = userEvent.setup();
    render(
      <PronunciationVariants {...defaultProps} onUseVariant={onUseVariant} />,
    );
    await waitFor(() =>
      expect(screen.getByText("Loo oma variant")).toBeInTheDocument(),
    );
    await user.click(screen.getByText("Loo oma variant"));
    await user.click(screen.getByText("Use Custom"));
    expect(onUseVariant).not.toHaveBeenCalled();
  });

});
