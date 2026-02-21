// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AppModals from "./AppModals";

vi.mock("@/features/tasks/components/TaskEditModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={onClose}>Close Edit</button>
      </div>
    ) : null,
}));
vi.mock("@/features/tasks/components/AddEntryModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="add-modal">
        <button onClick={onClose}>Close Add</button>
      </div>
    ) : null,
}));
vi.mock("@/features/sharing/components/ShareTaskModal", () => ({
  default: ({ isOpen, onClose, onRevoke }: { isOpen: boolean; onClose: () => void; onRevoke?: () => Promise<void> }) =>
    isOpen ? (
      <div data-testid="share-modal">
        <button onClick={onClose}>Close Share</button>
        {onRevoke && <button onClick={() => { void onRevoke(); }}>Revoke</button>}
      </div>
    ) : null,
}));
vi.mock("@/features/auth/components/LoginModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="login-modal">
        <button onClick={onClose}>Close Login</button>
      </div>
    ) : null,
}));
vi.mock("./ConfirmationModal", () => ({
  default: ({
    isOpen,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));
vi.mock("@/features/onboarding/components", () => ({
  OnboardingWizard: () => <div data-testid="wizard">Wizard</div>,
}));

const baseProps = {
  showLoginModal: false,
  setShowLoginModal: vi.fn(),
  isWizardActive: false,
  taskHandlers: {
    modals: {
      showAddTaskModal: false,
      setShowAddTaskModal: vi.fn(),
      taskToEdit: null as { id: string; name: string } | null,
      showTaskEditModal: false,
      setShowTaskEditModal: vi.fn(),
      setTaskToEdit: vi.fn(),
      taskToShare: null as { id: string; name: string; shareToken?: string } | null,
      showShareTaskModal: false,
      setShowShareTaskModal: vi.fn(),
      setTaskToShare: vi.fn(),
      showDeleteConfirmation: false,
      taskToDelete: null as { id: string; name: string } | null,
    },
    crud: {
      handleAddTask: vi.fn(),
      handleTaskUpdated: vi.fn(),
      handleConfirmDelete: vi.fn(),
      handleCancelDelete: vi.fn(),
    },
    sharing: {} as { handleRevokeShare?: (shareToken: string) => Promise<void> },
  },
};

describe("AppModals", () => {
  it("renders nothing visible by default", () => {
    const { container } = render(<AppModals {...baseProps} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders login modal when showLoginModal is true", () => {
    render(<AppModals {...baseProps} showLoginModal={true} />);
    expect(screen.getByTestId("login-modal")).toBeInTheDocument();
  });

  it("closes login modal", () => {
    const setShowLoginModal = vi.fn();
    render(
      <AppModals
        {...baseProps}
        showLoginModal={true}
        setShowLoginModal={setShowLoginModal}
      />,
    );
    fireEvent.click(screen.getByText("Close Login"));
    expect(setShowLoginModal).toHaveBeenCalledWith(false);
  });

  it("renders add modal when showAddTaskModal is true", () => {
    const props = {
      ...baseProps,
      taskHandlers: { ...baseProps.taskHandlers, modals: { ...baseProps.taskHandlers.modals, showAddTaskModal: true } },
    };
    render(<AppModals {...props} />);
    expect(screen.getByTestId("add-modal")).toBeInTheDocument();
  });

  it("closes add modal", () => {
    const setShowAddTaskModal = vi.fn();
    const props = {
      ...baseProps,
      taskHandlers: {
        ...baseProps.taskHandlers,
        modals: {
          ...baseProps.taskHandlers.modals,
          showAddTaskModal: true,
          setShowAddTaskModal,
        },
      },
    };
    render(<AppModals {...props} />);
    fireEvent.click(screen.getByText("Close Add"));
    expect(setShowAddTaskModal).toHaveBeenCalledWith(false);
  });

  it("renders edit modal when taskToEdit and showTaskEditModal", () => {
    const props = {
      ...baseProps,
      taskHandlers: {
        ...baseProps.taskHandlers,
        modals: {
          ...baseProps.taskHandlers.modals,
          taskToEdit: { id: "1", name: "T" },
          showTaskEditModal: true,
        },
      },
    };
    render(<AppModals {...props} />);
    expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
  });

  it("closes edit modal and clears taskToEdit", () => {
    const setShowTaskEditModal = vi.fn();
    const setTaskToEdit = vi.fn();
    const props = {
      ...baseProps,
      taskHandlers: {
        ...baseProps.taskHandlers,
        modals: {
          ...baseProps.taskHandlers.modals,
          taskToEdit: { id: "1", name: "T" },
          showTaskEditModal: true,
          setShowTaskEditModal,
          setTaskToEdit,
        },
      },
    };
    render(<AppModals {...props} />);
    fireEvent.click(screen.getByText("Close Edit"));
    expect(setShowTaskEditModal).toHaveBeenCalledWith(false);
    expect(setTaskToEdit).toHaveBeenCalledWith(null);
  });

  it("closes share modal and clears taskToShare", () => {
    const setShowShareTaskModal = vi.fn();
    const setTaskToShare = vi.fn();
    const props = {
      ...baseProps,
      taskHandlers: {
        ...baseProps.taskHandlers,
        modals: {
          ...baseProps.taskHandlers.modals,
          taskToShare: { id: "1", name: "T", shareToken: "tok" },
          showShareTaskModal: true,
          setShowShareTaskModal,
          setTaskToShare,
        },
      },
    };
    render(<AppModals {...props} />);
    fireEvent.click(screen.getByText("Close Share"));
    expect(setShowShareTaskModal).toHaveBeenCalledWith(false);
    expect(setTaskToShare).toHaveBeenCalledWith(null);
  });

  it("renders confirmation modal when showDeleteConfirmation", () => {
    const props = {
      ...baseProps,
      taskHandlers: {
        ...baseProps.taskHandlers,
        modals: {
          ...baseProps.taskHandlers.modals,
          showDeleteConfirmation: true,
          taskToDelete: { id: "1", name: "T" },
        },
      },
    };
    render(<AppModals {...props} />);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  it("calls handleConfirmDelete on confirm", () => {
    const handleConfirmDelete = vi.fn();
    const props = {
      ...baseProps,
      taskHandlers: {
        ...baseProps.taskHandlers,
        modals: {
          ...baseProps.taskHandlers.modals,
          showDeleteConfirmation: true,
          taskToDelete: { id: "1", name: "T" },
        },
        crud: {
          ...baseProps.taskHandlers.crud,
          handleConfirmDelete,
        },
      },
    };
    render(<AppModals {...props} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(handleConfirmDelete).toHaveBeenCalled();
  });

  it("calls handleRevokeShare via onRevoke when shareToken present", () => {
    const handleRevokeShare = vi.fn().mockResolvedValue(undefined);
    const props = {
      ...baseProps,
      taskHandlers: {
        ...baseProps.taskHandlers,
        modals: {
          ...baseProps.taskHandlers.modals,
          taskToShare: { id: "1", name: "T", shareToken: "tok" },
          showShareTaskModal: true,
        },
        sharing: { handleRevokeShare },
      },
    };
    render(<AppModals {...props} />);
    fireEvent.click(screen.getByText("Revoke"));
    expect(handleRevokeShare).toHaveBeenCalledWith("tok");
  });

  it("renders wizard when isWizardActive", () => {
    render(<AppModals {...baseProps} isWizardActive={true} />);
    expect(screen.getByTestId("wizard")).toBeInTheDocument();
  });
});
