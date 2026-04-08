// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import LandingDemo from "./LandingDemo";

vi.mock("@/components/ui/Icons", () => ({ PlayIcon: () => <span data-testid="play-icon" /> }));

describe("LandingDemo", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("renders the demo card container", () => {
    render(<LandingDemo />);
    expect(document.querySelector(".landing-demo__card")).toBeInTheDocument();
  });

  it("starts with typing phase showing cursor", () => {
    render(<LandingDemo />);
    expect(document.querySelector(".landing-demo__cursor")).toBeInTheDocument();
  });

  it("renders play button icon", () => {
    render(<LandingDemo />);
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
  });

  it("starts visible", () => {
    render(<LandingDemo />);
    expect(document.querySelector(".landing-demo--visible")).toBeInTheDocument();
  });

  it("shows typed text progressively", () => {
    render(<LandingDemo />);
    act(() => { vi.advanceTimersByTime(200); });
    const typed = document.querySelector(".landing-demo__typed-text");
    expect(typed).toBeInTheDocument();
    expect(typed?.textContent?.length).toBeGreaterThan(0);
  });

  it("types text character by character", () => {
    render(<LandingDemo />);
    const typed = document.querySelector(".landing-demo__typed-text");
    expect(typed?.textContent).toBe("");
    // Advance enough for several characters
    act(() => { vi.advanceTimersByTime(65 * 5); });
    expect(typed?.textContent?.length).toBeGreaterThanOrEqual(4);
  });

  it("has play button without pulse in typing phase", () => {
    render(<LandingDemo />);
    const playBtn = document.querySelector(".landing-demo__play-btn");
    expect(playBtn).toBeInTheDocument();
    expect(playBtn?.classList.contains("landing-demo__play-btn--pulse")).toBe(false);
  });

  it("does not show tags initially", () => {
    render(<LandingDemo />);
    expect(document.querySelector(".landing-demo__tags")).not.toBeInTheDocument();
  });

  it("does not show variants initially", () => {
    render(<LandingDemo />);
    expect(document.querySelector(".landing-demo__variants")).not.toBeInTheDocument();
  });

  it("advances through all phases when timers fire", () => {
    render(<LandingDemo />);
    // Complete typing: 19 chars * 65ms = 1235ms
    for (let i = 0; i < 20; i++) { act(() => { vi.advanceTimersByTime(65); }); }
    // Transition to TAGS_APPEAR after 500ms
    act(() => { vi.advanceTimersByTime(600); });
    expect(document.querySelector(".landing-demo__tags")).toBeInTheDocument();
    expect(document.querySelector(".landing-demo__cursor")).not.toBeInTheDocument();
    // TAGS_APPEAR duration 1800ms -> PLAY_PULSE
    act(() => { vi.advanceTimersByTime(1900); });
    expect(document.querySelector(".landing-demo__play-btn--pulse")).toBeInTheDocument();
    expect(document.querySelector(".landing-demo__wave")).toBeInTheDocument();
    // PLAY_PULSE 1500ms -> TAG_SELECT
    act(() => { vi.advanceTimersByTime(1600); });
    expect(document.querySelector(".landing-demo__tag--selected")).toBeInTheDocument();
    // TAG_SELECT 1200ms -> VARIANTS_SHOW
    act(() => { vi.advanceTimersByTime(1300); });
    expect(document.querySelector(".landing-demo__variants")).toBeInTheDocument();
    expect(screen.getByText("Hääldusvariandid:")).toBeInTheDocument();
    expect(document.querySelector(".landing-demo__wave")).not.toBeInTheDocument();
    // VARIANTS_SHOW 2500ms -> PAUSE
    act(() => { vi.advanceTimersByTime(2600); });
    // PAUSE 1200ms -> FADE_OUT
    act(() => { vi.advanceTimersByTime(1300); });
    // FADE_OUT 800ms -> resetCycle (setVisible false)
    act(() => { vi.advanceTimersByTime(900); });
    expect(document.querySelector(".landing-demo--hidden")).toBeInTheDocument();
    // 600ms later -> back to TYPING
    act(() => { vi.advanceTimersByTime(700); });
    expect(document.querySelector(".landing-demo--visible")).toBeInTheDocument();
  });
});
