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
      <button onClick={() => ctx.selectRole("specialist")}>selectSpec</button>
      <button onClick={ctx.nextStep}>next</button>
      <button onClick={ctx.prevStep}>prev</button>
      <button onClick={ctx.skipWizard}>skip</button>
      <button onClick={ctx.completeWizard}>complete</button>
      <button onClick={ctx.resetOnboarding}>reset</button>
    </div>
  );
};

describe("OnboardingContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("initial state", () => {
    it("provides default state", async () => {
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
      expect(screen.getByTestId("step")).toHaveTextContent("0");
    });

    it("loads completed state from localStorage", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completed: true,
          selectedRole: "learner",
          completedAt: new Date().toISOString(),
        }),
      );

      render(
        <OnboardingProvider>
          <TestConsumer />
        </OnboardingProvider>,
      );

      await vi.waitFor(() => {
        expect(screen.getByTestId("completed")).toHaveTextContent("yes");
        expect(screen.getByTestId("role")).toHaveTextContent("learner");
      });
    });

    it("handles malformed localStorage", async () => {
      localStorage.setItem(STORAGE_KEY, "invalid-json");
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <OnboardingProvider>
          <TestConsumer />
        </OnboardingProvider>,
      );

      await vi.waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });
      expect(screen.getByTestId("completed")).toHaveTextContent("no");

      consoleSpy.mockRestore();
    });
  });

  describe("selectRole", () => {
    it("selects learner role", async () => {
      render(
        <OnboardingProvider>
          <TestConsumer />
        </OnboardingProvider>,
      );

      await vi.waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      await act(async () => {
        screen.getByText("selectLearner").click();
      });

      expect(screen.getByTestId("role")).toHaveTextContent("learner");
      expect(screen.getByTestId("wizardActive")).toHaveTextContent("yes");
    });

    it("selects teacher role", async () => {
      render(
        <OnboardingProvider>
          <TestConsumer />
        </OnboardingProvider>,
      );

      await vi.waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      await act(async () => {
        screen.getByText("selectTeacher").click();
      });

      expect(screen.getByTestId("role")).toHaveTextContent("teacher");
    });

    it("selects specialist role", async () => {
      render(
        <OnboardingProvider>
          <TestConsumer />
        </OnboardingProvider>,
      );

      await vi.waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      await act(async () => {
        screen.getByText("selectSpec").click();
      });

      expect(screen.getByTestId("role")).toHaveTextContent("specialist");
    });
  });

  describe("nextStep", () => {
    it("advances to next step", async () => {
      render(
        <OnboardingProvider>
          <TestConsumer />
        </OnboardingProvider>,
      );

      await vi.waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      await act(async () => {
        screen.getByText("selectLearner").click();
      });

      await act(async () => {
        screen.getByText("next").click();
      });

      expect(screen.getByTestId("step")).toHaveTextContent("1");
    });

    it("does nothing without role selected", async () => {
      render(
        <OnboardingProvider>
          <TestConsumer />
        </OnboardingProvider>,
      );

      await vi.waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("ready");
      });

      await act(async () => {
        screen.getByText("next").click();
      });

      expect(screen.getByTestId("step")).toHaveTextContent("0");
    });
  });

});
