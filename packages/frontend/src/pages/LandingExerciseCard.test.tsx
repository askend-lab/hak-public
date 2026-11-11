// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingExerciseCard from "./LandingExerciseCard";

vi.mock("@/hooks/useAudioPlaybackCore", () => ({
  useAudioPlaybackCore: () => ({
    handlePlayEntry: vi.fn(),
    handlePlayAll: vi.fn(),
    isPlayingAll: false,
    isLoadingPlayAll: false,
    currentPlayingId: null,
    currentLoadingId: null,
  }),
}));

vi.mock("@/features/synthesis/components/SentenceSynthesisItem", () => ({
  default: ({ id, text, onPlay }: { id: string; text: string; onPlay: (id: string) => void }) => (
    <div data-testid={`item-${id}`}><span>{text}</span><button onClick={() => onPlay(id)}>Play</button></div>
  ),
}));

vi.mock("@/components/ui/PlayAllButton", () => ({
  PlayAllButton: ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button onClick={onClick} disabled={disabled}>Mängi kõik</button>
  ),
}));

const entries = [
  { id: "e1", text: "Hello", stressedText: "Hello" },
  { id: "e2", text: "World", stressedText: "World" },
] as const;

describe("LandingExerciseCard", () => {
  it("renders title and subtitle", () => {
    render(<LandingExerciseCard title="Välted" subtitle="II VÄLTES" entries={entries} />);
    expect(screen.getByText("Välted")).toBeInTheDocument();
    expect(screen.getByText("II VÄLTES")).toBeInTheDocument();
  });

  it("renders entries as SentenceSynthesisItem", () => {
    render(<LandingExerciseCard title="T" subtitle="S" entries={entries} />);
    expect(screen.getByTestId("item-e1")).toBeInTheDocument();
    expect(screen.getByTestId("item-e2")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("renders PlayAllButton", () => {
    render(<LandingExerciseCard title="T" subtitle="S" entries={entries} />);
    expect(screen.getByText("Mängi kõik")).not.toBeDisabled();
  });

  it("disables play all when no entries", () => {
    render(<LandingExerciseCard title="T" subtitle="S" entries={[]} />);
    expect(screen.getByText("Mängi kõik")).toBeDisabled();
  });

  it("play all button is clickable", async () => {
    const user = userEvent.setup();
    render(<LandingExerciseCard title="T" subtitle="S" entries={entries} />);
    await user.click(screen.getByText("Mängi kõik"));
  });
});
