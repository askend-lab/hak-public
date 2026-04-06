// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./App";
import {
  mockAuthContext,
  mockNotificationContext,
  mockOnboardingContext,
  mockSynthesis,
  mockTaskHandlers,
  mockDragAndDrop,
  mockVariantsPanel,
  mockSentenceMenu,
} from "./test/mocks/appMocks";

import SynthesisRoute from "./routes/SynthesisRoute";
import TasksRoute from "./routes/TasksRoute";
import SpecsRoute from "./routes/SpecsRoute";

vi.mock("./features/auth/services", () => ({ useAuth: vi.fn(() => mockAuthContext()) }));
vi.mock("./contexts/CopiedEntriesContext", () => ({
  useCopiedEntries: () => ({ copiedEntries: null, setCopiedEntries: vi.fn(), consumeCopiedEntries: vi.fn().mockReturnValue(null), hasCopiedEntries: false }),
  CopiedEntriesProvider: ({ children }: { children: unknown }) => children,
}));
vi.mock("./contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => mockNotificationContext()),
}));
vi.mock("./features/onboarding/contexts/OnboardingContext", () => ({
  useOnboarding: vi.fn(() => mockOnboardingContext()),
}));
vi.mock("./hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./hooks")>();
  return {
    ...actual,
    useSynthesis: vi.fn(() => mockSynthesis()),
    useDragAndDrop: vi.fn(() => mockDragAndDrop()),
    useVariantsPanel: vi.fn(() => mockVariantsPanel()),
    useSentenceMenu: vi.fn(() => mockSentenceMenu()),
    useUserTasks: vi.fn(() => ({
      tasks: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })),
    useUserId: vi.fn(() => "38001085718"),
    useTaskForm: vi.fn(() => ({
      form: {},
      errors: {},
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      isValid: true,
    })),
    useModalState: vi.fn(() => ({
      isOpen: false,
      open: vi.fn(),
      close: vi.fn(),
    })),
  };
});
vi.mock("./features/tasks/hooks/useTaskHandlers", () => ({
  useTaskHandlers: vi.fn(() => mockTaskHandlers()),
}));
vi.mock("./utils/warmAudioWorker", () => ({ warmAudioWorker: vi.fn() }));

vi.mock("./components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));
vi.mock("./features/synthesis/components/SynthesisView", () => ({
  default: () => <div data-testid="synthesis-view">SynthesisView</div>,
}));
vi.mock("./features/synthesis/components/SynthesisModals", () => ({
  default: () => null,
}));
vi.mock("./features/tasks/components/TasksView", () => ({
  default: ({ selectedTaskId }: { selectedTaskId: string | null }) => (
    <div data-testid="tasks-view" data-task-id={selectedTaskId}>
      TasksView
    </div>
  ),
}));
vi.mock("./components/SpecsPage", () => ({
  default: () => <div data-testid="specs-page">SpecsPage</div>,
}));
vi.mock("./components/Dashboard", () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>,
}));
vi.mock("./components/AppModals", () => ({ default: () => null }));
vi.mock("./features/onboarding/components", () => ({
  RoleSelectionContent: () => (
    <div data-testid="role-selection">RoleSelection</div>
  ),
  OnboardingWizard: () => null,
}));

function renderWithRoutes(initialPath: string) {
  const Dashboard = vi.fn(() => <div data-testid="dashboard">Dashboard</div>);
  const NotFoundPage = vi.fn(() => <div>404</div>);
  const RoleSelectionContent = vi.fn(() => <div data-testid="role-selection">RoleSelection</div>);

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<SynthesisRoute />} />
          <Route path="synthesis" element={<SynthesisRoute />} />
          <Route path="tasks" element={<TasksRoute />} />
          <Route path="tasks/:taskId" element={<TasksRoute />} />
          <Route path="specs" element={<SpecsRoute />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="role-selection" element={<RoleSelectionContent />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("App Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("pathname parsing", () => {
    it("extracts task ID from /tasks/:id URL", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({
        user: { id: "123", name: "Test User", email: "test@test.com" },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      renderWithRoutes("/tasks/abc-def-123");

      const tasksView = await screen.findByTestId("tasks-view");
      expect(tasksView).toHaveAttribute("data-task-id", "abc-def-123");
    });

    it("sets task ID to null for /tasks without ID", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({
        user: { id: "123", name: "Test User", email: "test@test.com" },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      renderWithRoutes("/tasks");

      const tasksView = await screen.findByTestId("tasks-view");
      expect(tasksView.getAttribute("data-task-id")).toBeFalsy();
    });
  });

  describe("view detection from pathname", () => {
    it("detects synthesis view from /synthesis pathname", async () => {
      renderWithRoutes("/synthesis");
      expect(await screen.findByTestId("synthesis-view")).toBeInTheDocument();
    });

    it("detects tasks view from /tasks pathname", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({
        user: { id: "123", name: "Test User", email: "test@test.com" },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      renderWithRoutes("/tasks/123");

      expect(await screen.findByTestId("tasks-view")).toBeInTheDocument();
    });

    it("detects specs view from /specs pathname", async () => {
      renderWithRoutes("/specs");

      expect(await screen.findByTestId("specs-page")).toBeInTheDocument();
    });

    it("detects dashboard view from /dashboard pathname", async () => {
      renderWithRoutes("/dashboard");

      expect(await screen.findByTestId("dashboard")).toBeInTheDocument();
    });
  });

});
