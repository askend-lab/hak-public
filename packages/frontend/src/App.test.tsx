// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
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
vi.mock("@/features/auth/components/LoginModal", () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="login-modal">LoginModal</div> : null }));
vi.mock("./components/UserProfile", () => ({ default: ({ user }: { user: { name: string } }) => <div data-testid="user-profile">{user.name}</div> }));
vi.mock("./components/ConfirmationModal", () => ({ default: () => null }));
vi.mock("./features/tasks/components/AddToTaskDropdown", () => ({ default: () => null }));
vi.mock("./features/synthesis/components/SentencePhoneticPanel", () => ({ default: () => null }));
vi.mock("./features/synthesis/components/SentenceSynthesisItem", () => ({ default: ({ id }: { id: string }) => <div data-testid={`sentence-item-${id}`}>SentenceItem</div> }));
vi.mock("./features/onboarding/components", () => ({
  RoleSelectionContent: () => <div data-testid="role-selection">RoleSelection</div>,
  OnboardingWizard: () => <div data-testid="onboarding-wizard">OnboardingWizard</div>,
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
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAuth } = await import("./features/auth/services");
    vi.mocked(useAuth).mockReturnValue(mockAuthContext() as ReturnType<typeof useAuth>);
  });

  describe("rendering", () => {
    it("renders header with logo", () => {
      renderWithRoutes();
      expect(screen.getByAltText("EKI Logo")).toBeInTheDocument();
    });

    it("renders navigation links", () => {
      renderWithRoutes();
      expect(screen.getByText("Tekst kõneks")).toBeInTheDocument();
      expect(screen.getByText("Ülesanded")).toBeInTheDocument();
    });

    it("renders synthesis view by default when authenticated", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({ ...mockAuthContext(), isAuthenticated: true, user: { id: "1", name: "Test", email: "t@t.com" } } as ReturnType<typeof useAuth>);
      renderWithRoutes();
      expect(await screen.findByText("Muuda tekst kõneks")).toBeInTheDocument();
    });

    it("shows landing content when not authenticated", () => {
      renderWithRoutes();
      // Unauthenticated users see the landing layout (not synthesis view)
      expect(screen.queryByText("Muuda tekst kõneks")).not.toBeInTheDocument();
    });

    it("renders footer", () => {
      renderWithRoutes();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("renders help button when authenticated", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({ ...mockAuthContext(), isAuthenticated: true, user: { id: "1", name: "Test", email: "t@t.com" } } as ReturnType<typeof useAuth>);
      renderWithRoutes();
      expect(screen.getByTitle("Näita juhendeid")).toBeInTheDocument();
    });

    it("renders login button when not authenticated", () => {
      renderWithRoutes();
      expect(screen.getByText("Logi sisse")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading spinner when onboarding is loading", async () => {
      const { useOnboarding } = await import("./features/onboarding/contexts/OnboardingContext");
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: false, selectedRole: null, currentStep: 0, skipped: false },
        isWizardActive: false, resetOnboarding: vi.fn(), isLoading: true,
        nextStep: vi.fn(), prevStep: vi.fn(), skipWizard: vi.fn(),
        selectRole: vi.fn(), completeWizard: vi.fn(), currentSteps: [],
      });
      const { container } = render(<MemoryRouter><AppLayout /></MemoryRouter>, { wrapper: AppWrapper });
      expect(container.querySelector(".page-loading-state")).toBeInTheDocument();
    });
  });

  describe("role selection", () => {
    it("shows role selection when onboarding not completed and authenticated", async () => {
      const { useAuth } = await import("./features/auth/services");
      vi.mocked(useAuth).mockReturnValue({ ...mockAuthContext(), isAuthenticated: true, user: { id: "1", name: "Test", email: "t@t.com" } } as ReturnType<typeof useAuth>);
      const { useOnboarding } = await import("./features/onboarding/contexts/OnboardingContext");
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: false, selectedRole: null, currentStep: 0, skipped: false },
        isWizardActive: false, resetOnboarding: vi.fn(), isLoading: false,
        nextStep: vi.fn(), prevStep: vi.fn(), skipWizard: vi.fn(),
        selectRole: vi.fn(), completeWizard: vi.fn(), currentSteps: [],
      });
      renderWithRoutes("/role-selection");
      expect(await screen.findByTestId("role-selection")).toBeInTheDocument();
    });
  });

});
