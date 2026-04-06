// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AppLayout from "./App";
import { DataServiceTestWrapper } from "./test/dataServiceMock";
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

vi.mock("./pages/LandingPage", () => ({
  default: ({ onLogin }: { onLogin: () => void }) => <div data-testid="landing-page"><button onClick={onLogin}>Login from landing</button></div>,
}));
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
  };
});
vi.mock("./features/tasks/hooks/useTaskHandlers", () => ({
  useTaskHandlers: vi.fn(() => mockTaskHandlers()),
}));
vi.mock("./features/synthesis/components/SynthesisModals", () => ({
  default: () => null,
}));

vi.mock("./components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));
vi.mock("./features/synthesis/components/PronunciationVariants", () => ({ default: () => null }));
vi.mock("./features/tasks/components/TaskManager", () => ({
  default: () => <div data-testid="task-manager">TaskManager</div>,
}));
vi.mock("./features/tasks/components/TaskDetailView", () => ({
  default: () => <div data-testid="task-detail-view">TaskDetailView</div>,
}));
vi.mock("./features/tasks/components/TaskEditModal", () => ({ default: () => null }));
vi.mock("./features/tasks/components/AddEntryModal", () => ({ default: () => null }));
vi.mock("./features/sharing/components/ShareTaskModal", () => ({ default: () => null }));
vi.mock("@/features/auth/components/LoginModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="login-modal">LoginModal</div> : null,
}));
vi.mock("./components/UserProfile", () => ({
  default: ({ user }: { user: { name: string } }) => (
    <div data-testid="user-profile">{user.name}</div>
  ),
}));
vi.mock("./components/ConfirmationModal", () => ({ default: () => null }));
vi.mock("./features/tasks/components/AddToTaskDropdown", () => ({ default: () => null }));
vi.mock("./features/synthesis/components/SentencePhoneticPanel", () => ({ default: () => null }));
vi.mock("./features/synthesis/components/SentenceSynthesisItem", () => ({
  default: ({ id }: { id: string }) => (
    <div data-testid={`sentence-item-${id}`}>SentenceItem</div>
  ),
}));
vi.mock("./features/onboarding/components", () => ({
  RoleSelectionContent: () => (
    <div data-testid="role-selection">RoleSelection</div>
  ),
  OnboardingWizard: () => (
    <div data-testid="onboarding-wizard">OnboardingWizard</div>
  ),
}));

function AppWrapper({ children }: { children: React.ReactNode }) {
  return <DataServiceTestWrapper>{children}</DataServiceTestWrapper>;
}

function renderWithRoutes(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<SynthesisRoute />} />
          <Route path="synthesis" element={<SynthesisRoute />} />
          <Route path="tasks" element={<TasksRoute />} />
          <Route path="tasks/:taskId" element={<TasksRoute />} />
          <Route path="role-selection" element={<div data-testid="role-selection">RoleSelection</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
    { wrapper: AppWrapper },
  );
}

describe("App (Home)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("help button", () => {
    it("renders help button when authenticated", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({ ...mockAuthContext(), isAuthenticated: true, user: { id: "1", name: "Test", email: "t@t.com" } } as ReturnType<typeof useAuth>);
      const { useOnboarding } = await import("./features/onboarding/contexts/OnboardingContext");
      vi.mocked(useOnboarding).mockReturnValue({
        state: {
          completed: true,
          selectedRole: "teacher",
          currentStep: 0,
          skipped: false,
        },
        isWizardActive: false,
        resetOnboarding: vi.fn(),
        isLoading: false,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
        skipWizard: vi.fn(),
        selectRole: vi.fn(),
        completeWizard: vi.fn(),
        currentSteps: [],
      });

      renderWithRoutes();
      expect(screen.getByTitle("Näita juhendeid")).toBeInTheDocument();
    });
  });

  describe("onboarding wizard", () => {
    it("shows wizard when active", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({ ...mockAuthContext(), isAuthenticated: true, user: { id: "1", name: "Test", email: "t@t.com" } } as ReturnType<typeof useAuth>);
      const { useOnboarding } = await import("./features/onboarding/contexts/OnboardingContext");
      vi.mocked(useOnboarding).mockReturnValue({
        state: {
          completed: true,
          selectedRole: "teacher",
          currentStep: 0,
          skipped: false,
        },
        isWizardActive: true,
        resetOnboarding: vi.fn(),
        isLoading: false,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
        skipWizard: vi.fn(),
        selectRole: vi.fn(),
        completeWizard: vi.fn(),
        currentSteps: [],
      });

      renderWithRoutes();
      expect(screen.getByTestId("onboarding-wizard")).toBeInTheDocument();
    });
  });

  describe("login button", () => {
    it("calls setShowLoginModal when clicked", async () => {
      const setShowLoginModal = vi.fn();
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal,
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithRoutes();

      await user.click(screen.getByText("Logi sisse"));
      expect(setShowLoginModal).toHaveBeenCalledWith(true);
    });
  });

});
