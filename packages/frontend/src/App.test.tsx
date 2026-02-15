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
import SynthesisRoute from "./routes/SynthesisRoute";
import TasksRoute from "./routes/TasksRoute";

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

    it("renders synthesis view by default", async () => {
      renderWithRoutes();
      expect(await screen.findByText("Muuda tekst kõneks")).toBeInTheDocument();
    });

    it("renders footer", () => {
      renderWithRoutes();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("renders help button", () => {
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
        state: {
          completed: false,
          selectedRole: null,
          currentStep: 0,
          skipped: false,
        },
        isWizardActive: false,
        resetOnboarding: vi.fn(),
        isLoading: true,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
        skipWizard: vi.fn(),
        selectRole: vi.fn(),
        completeWizard: vi.fn(),
        currentSteps: [],
      });

      const { container } = render(
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>,
        { wrapper: AppWrapper },
      );
      expect(container.querySelector(".page-loading-state")).toBeInTheDocument();
    });
  });

  describe("role selection", () => {
    it("shows role selection when onboarding not completed", async () => {
      const { useOnboarding } = await import("./features/onboarding/contexts/OnboardingContext");
      vi.mocked(useOnboarding).mockReturnValue({
        state: {
          completed: false,
          selectedRole: null,
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

      renderWithRoutes("/role-selection");
      expect(await screen.findByTestId("role-selection")).toBeInTheDocument();
    });
  });

  describe("authenticated user", () => {
    it("shows user profile when authenticated", async () => {
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

      renderWithRoutes();
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("synthesis link is rendered by default", () => {
      renderWithRoutes();
      const synthesisLink = screen.getByText("Tekst kõneks");
      expect(synthesisLink).toBeInTheDocument();
    });

    it("clicking tasks link when not authenticated shows login modal", async () => {
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

      await user.click(screen.getByText("Ülesanded"));
      expect(setShowLoginModal).toHaveBeenCalledWith(true);
    });
  });

  describe("synthesis view", () => {
    beforeEach(async () => {
      // Ensure onboarding is completed so synthesis view is shown
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
    });

    it("renders sentence items", async () => {
      renderWithRoutes("/synthesis");
      expect(await screen.findByTestId("sentence-item-1")).toBeInTheDocument();
    });

    it("renders add sentence button", async () => {
      renderWithRoutes("/synthesis");
      expect(await screen.findByText("Lisa lause")).toBeInTheDocument();
    });

    it("renders page title", async () => {
      renderWithRoutes("/synthesis");
      expect(await screen.findByText("Muuda tekst kõneks")).toBeInTheDocument();
    });
  });

  describe("help button", () => {
    it("renders help button", async () => {
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

  describe("tasks view", () => {
    it("shows tasks view when authenticated and tasks selected", async () => {
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

      const user = userEvent.setup();
      renderWithRoutes();

      await user.click(screen.getByText("Ülesanded"));
      expect(await screen.findByTestId("task-manager")).toBeInTheDocument();
    });
  });

  describe("add sentence button", () => {
    it("calls handleAddSentence when clicked", async () => {
      const handleAddSentence = vi.fn();
      const { useSynthesis } = await import("./hooks");
      vi.mocked(useSynthesis).mockReturnValue({
        sentences: [
          {
            id: "1",
            text: "",
            tags: [],
            isPlaying: false,
            isLoading: false,
            currentInput: "",
          },
        ],
        setSentences: vi.fn(),
        isPlayingAll: false,
        isLoadingPlayAll: false,
        editingTag: null,
        openTagMenu: null,
        setOpenTagMenu: vi.fn(),
        setDemoSentences: vi.fn(),
        handleTextChange: vi.fn(),
        handleClearSentence: vi.fn(),
        handleAddSentence,
        handleRemoveSentence: vi.fn(),
        handleInputBlur: vi.fn(),
        handleKeyDown: vi.fn(),
        handlePlay: vi.fn(),
        handlePlayAll: vi.fn(),
        handleDownload: vi.fn(),
        handleCopyText: vi.fn(),
        handleDeleteTag: vi.fn(),
        handleEditTag: vi.fn(),
        handleEditTagChange: vi.fn(),
        handleEditTagCommit: vi.fn(),
        handleEditTagKeyDown: vi.fn(),
        handleUseVariant: vi.fn(),
        handleSentencePhoneticApply: vi.fn(),
        synthesizeAndPlay: vi.fn(),
      });

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

      const user = userEvent.setup();
      renderWithRoutes("/synthesis");

      await user.click(await screen.findByText("Lisa lause"));
      expect(handleAddSentence).toHaveBeenCalled();
    });
  });
});
