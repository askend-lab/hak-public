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
