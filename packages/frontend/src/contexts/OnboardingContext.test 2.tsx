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
      <div data-testid="wizardActive">{ctx.isWizardActive ? "yes" : "no"}</div>
      <div data-testid="stepsCount">{ctx.currentSteps.length}</div>
      <button onClick={() => ctx.selectRole("learner")}>selectLearner</button>
      <button onClick={() => ctx.selectRole("teacher")}>selectTeacher</button>
      <button onClick={ctx.nextStep}>next</button>
      <button onClick={ctx.prevStep}>prev</button>
      <button onClick={ctx.skipWizard}>skip</button>
      <button onClick={ctx.completeWizard}>complete</button>
      <button onClick={ctx.resetOnboarding}>reset</button>
    </div>
  );
};

describe("OnboardingContext mutation tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("non-completed stored state does not set completed", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed: false, selectedRole: "learner", completedAt: null }),
    );
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("completed")).toHaveTextContent("no");
    expect(screen.getByTestId("role")).toHaveTextContent("none");
  });

  it("loaded completed state has skipped=false", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed: true, selectedRole: "teacher", completedAt: new Date().toISOString() }),
    );
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("completed")).toHaveTextContent("yes");
    });
    expect(screen.getByTestId("skipped")).toHaveTextContent("no");
  });

  it("advances through all steps and completes wizard", async () => {
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    await act(async () => { screen.getByText("selectLearner").click(); });
    expect(screen.getByTestId("stepsCount")).toHaveTextContent("5");
    for (let i = 0; i < 4; i++) {
      await act(async () => { screen.getByText("next").click(); });
      expect(screen.getByTestId("step")).toHaveTextContent(String(i + 1));
    }
    await act(async () => { screen.getByText("next").click(); });
    expect(screen.getByTestId("completed")).toHaveTextContent("yes");
    expect(screen.getByTestId("step")).toHaveTextContent("0");
  });

  it("wizard is not active when no role selected", async () => {
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("wizardActive")).toHaveTextContent("no");
    expect(screen.getByTestId("stepsCount")).toHaveTextContent("0");
  });

  it("wizard becomes inactive after completion", async () => {
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    await act(async () => { screen.getByText("selectLearner").click(); });
    expect(screen.getByTestId("wizardActive")).toHaveTextContent("yes");
    await act(async () => { screen.getByText("complete").click(); });
    expect(screen.getByTestId("wizardActive")).toHaveTextContent("no");
  });

  it("selectRole resets completed to false", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed: true, selectedRole: "learner" }),
    );
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("completed")).toHaveTextContent("yes");
    });
    await act(async () => { screen.getByText("selectTeacher").click(); });
    expect(screen.getByTestId("completed")).toHaveTextContent("no");
  });

  it("error handler removes malformed storage key", async () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    vi.restoreAllMocks();
  });

  it("saveToStorage stores completedAt when completed", async () => {
    render(
      <OnboardingProvider>
        <TestConsumer />
      </OnboardingProvider>,
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    await act(async () => { screen.getByText("selectLearner").click(); });
    await act(async () => { screen.getByText("complete").click(); });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    expect(stored.completed).toBe(true);
    expect(stored.completedAt).toBeTruthy();
  });
});
