// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@hak/shared";
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
      <button onClick={ctx.prevStep}>prev</button>
      <button onClick={ctx.skipWizard}>skip</button>
      <button onClick={ctx.completeWizard}>complete</button>
      <button onClick={ctx.resetOnboarding}>reset</button>
    </div>
  );
};

describe("OnboardingContext actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("prevStep", () => {
    it("goes to previous step", async () => {
      render(<OnboardingProvider><TestConsumer /></OnboardingProvider>);
      await vi.waitFor(() => { expect(screen.getByTestId("loading")).toHaveTextContent("ready"); });
      await act(async () => { screen.getByText("selectLearner").click(); });
      await act(async () => { screen.getByText("next").click(); });
      expect(screen.getByTestId("step")).toHaveTextContent("1");
      await act(async () => { screen.getByText("prev").click(); });
      expect(screen.getByTestId("step")).toHaveTextContent("0");
    });

    it("does not go below 0", async () => {
      render(<OnboardingProvider><TestConsumer /></OnboardingProvider>);
      await vi.waitFor(() => { expect(screen.getByTestId("loading")).toHaveTextContent("ready"); });
      await act(async () => { screen.getByText("prev").click(); });
      expect(screen.getByTestId("step")).toHaveTextContent("0");
    });
  });

  describe("skipWizard", () => {
    it("marks wizard as completed and skipped", async () => {
      render(<OnboardingProvider><TestConsumer /></OnboardingProvider>);
      await vi.waitFor(() => { expect(screen.getByTestId("loading")).toHaveTextContent("ready"); });
      await act(async () => { screen.getByText("skip").click(); });
      expect(screen.getByTestId("completed")).toHaveTextContent("yes");
      expect(screen.getByTestId("skipped")).toHaveTextContent("yes");
    });

    it("saves to localStorage", async () => {
      render(<OnboardingProvider><TestConsumer /></OnboardingProvider>);
      await vi.waitFor(() => { expect(screen.getByTestId("loading")).toHaveTextContent("ready"); });
      await act(async () => { screen.getByText("skip").click(); });
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      if (stored) { expect(JSON.parse(stored).completed).toBe(true); }
    });
  });

  describe("completeWizard", () => {
    it("marks wizard as completed", async () => {
      render(<OnboardingProvider><TestConsumer /></OnboardingProvider>);
      await vi.waitFor(() => { expect(screen.getByTestId("loading")).toHaveTextContent("ready"); });
      await act(async () => { screen.getByText("selectLearner").click(); });
      await act(async () => { screen.getByText("complete").click(); });
      expect(screen.getByTestId("completed")).toHaveTextContent("yes");
    });
  });

  describe("resetOnboarding", () => {
    it("resets state and clears localStorage", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true, selectedRole: "learner" }));
      render(<OnboardingProvider><TestConsumer /></OnboardingProvider>);
      await vi.waitFor(() => { expect(screen.getByTestId("completed")).toHaveTextContent("yes"); });
      await act(async () => { screen.getByText("reset").click(); });
      expect(screen.getByTestId("completed")).toHaveTextContent("no");
      expect(screen.getByTestId("role")).toHaveTextContent("none");
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe("useOnboarding hook", () => {
    it("throws when used outside provider", () => {
      const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
      expect(() => { render(<TestConsumer />); }).toThrow("useOnboarding must be used within an OnboardingProvider");
      consoleSpy.mockRestore();
    });
  });
});
