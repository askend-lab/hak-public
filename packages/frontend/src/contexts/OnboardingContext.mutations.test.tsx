// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { OnboardingProvider, useOnboarding } from "./OnboardingContext";
import { STORAGE_KEY } from "@/config/onboardingConfig";

const TestConsumer = () => {
  const ctx = useOnboarding();
  return (
    <div>
      <div data-testid="loading">{ctx.isLoading ? "loading" : "ready"}</div>
      <div data-testid="completed">{ctx.state.completed ? "yes" : "no"}</div>
      <div data-testid="role">{ctx.state.selectedRole || "none"}</div>
      <div data-testid="step">{ctx.state.currentStep}</div>
      <div data-testid="skipped">{ctx.state.skipped ? "yes" : "no"}</div>
      <button onClick={() => ctx.selectRole("learner")}>selectLearner</button>
      <button onClick={ctx.nextStep}>next</button>
    </div>
  );
};

describe("OnboardingContext precise mutation kills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("default skipped state is false", async () => {
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    // L38: skipped: false → true would fail this
    expect(screen.getByTestId("skipped")).toHaveTextContent("no");
  });

  it("no stored value: localStorage.removeItem NOT called, no console.error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const removeSpy = vi.spyOn(Storage.prototype, "removeItem");

    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    // L53: if (stored) → if (true) would cause JSON.parse(null) → error → removeItem
    expect(consoleSpy).not.toHaveBeenCalled();
    // removeItem should not be called when there's no stored value
    const removeCallsForKey = removeSpy.mock.calls.filter(c => c[0] === STORAGE_KEY);
    expect(removeCallsForKey).toHaveLength(0);

    consoleSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("error handler logs exact message prefix", async () => {
    localStorage.setItem(STORAGE_KEY, "{{invalid");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    // L65: StringLiteral "" → would log "" instead of message
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load onboarding state:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("completing wizard via nextStep saves completed=true to storage", async () => {
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    await act(async () => { screen.getByText("selectLearner").click(); });
    // Advance through all 5 learner steps to trigger completion
    for (let i = 0; i < 5; i++) {
      await act(async () => { screen.getByText("next").click(); });
    }
    expect(screen.getByTestId("completed")).toHaveTextContent("yes");
    // L105: saveToStorage(true, ...) → saveToStorage(false, ...) would save completed=false
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(stored.completed).toBe(true);
    expect(stored.completedAt).toBeTruthy();
  });
});
