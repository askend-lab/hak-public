// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "./LandingPage";

vi.mock("@/components/ui/PatternBg", () => ({ default: () => <div data-testid="pattern-bg" /> }));
vi.mock("./LandingDemo", () => ({ default: () => <div data-testid="landing-demo" /> }));
vi.mock("./LandingExerciseCard", () => ({
  default: ({ title }: { title: string }) => <div data-testid="exercise-card">{title}</div>,
}));

describe("LandingPage", () => {
  it("renders hero section with title and CTA", () => {
    render(<LandingPage onLogin={vi.fn()} />);
    expect(screen.getByText(/häälduse õppimise/i)).toBeInTheDocument();
    expect(screen.getByText("Hakka harjutama")).toBeInTheDocument();
  });

  it("renders demo component", () => {
    render(<LandingPage onLogin={vi.fn()} />);
    expect(screen.getByTestId("landing-demo")).toBeInTheDocument();
  });

  it("calls onLogin when CTA clicked", async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    render(<LandingPage onLogin={onLogin} />);
    await user.click(screen.getByText("Hakka harjutama"));
    expect(onLogin).toHaveBeenCalled();
  });

  it("renders exercises section with cards", () => {
    render(<LandingPage onLogin={vi.fn()} />);
    expect(screen.getByText(/Proovi mängida/i)).toBeInTheDocument();
    const cards = screen.getAllByTestId("exercise-card");
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it("renders roles section", () => {
    render(<LandingPage onLogin={vi.fn()} />);
    expect(screen.getByText("Õppijale")).toBeInTheDocument();
    expect(screen.getByText("Õpetajale")).toBeInTheDocument();
  });

  it("renders pattern backgrounds", () => {
    render(<LandingPage onLogin={vi.fn()} />);
    expect(screen.getAllByTestId("pattern-bg").length).toBeGreaterThanOrEqual(2);
  });

  it("renders hero description", () => {
    render(<LandingPage onLogin={vi.fn()} />);
    expect(screen.getByText(/Logi sisse ja sisesta/i)).toBeInTheDocument();
  });
});
