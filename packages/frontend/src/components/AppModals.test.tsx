// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AppModals from "./AppModals";

vi.mock("./TaskEditModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <button onClick={onClose}>Close Edit</button>
      </div>
    ) : null,
}));
vi.mock("./AddEntryModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="add-modal">
        <button onClick={onClose}>Close Add</button>
      </div>
    ) : null,
}));
vi.mock("./ShareTaskModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="share-modal">
        <button onClick={onClose}>Close Share</button>
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
    showAddTaskModal: false,
    setShowAddTaskModal: vi.fn(),
    handleAddTask: vi.fn(),
    taskToEdit: null,
    showTaskEditModal: false,
    setShowTaskEditModal: vi.fn(),
    setTaskToEdit: vi.fn(),
    handleTaskUpdated: vi.fn(),
    taskToShare: null,
    showShareTaskModal: false,
    setShowShareTaskModal: vi.fn(),
    setTaskToShare: vi.fn(),
    showDeleteConfirmation: false,
    taskToDelete: null,
    handleConfirmDelete: vi.fn(),
    handleCancelDelete: vi.fn(),
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
      taskHandlers: { ...baseProps.taskHandlers, showAddTaskModal: true },
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
        showAddTaskModal: true,
        setShowAddTaskModal,
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
        taskToEdit: { id: "1", name: "T" },
        showTaskEditModal: true,
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
        taskToEdit: { id: "1", name: "T" },
        showTaskEditModal: true,
        setShowTaskEditModal,
        setTaskToEdit,
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
        taskToShare: { id: "1", name: "T", shareToken: "tok" },
        showShareTaskModal: true,
        setShowShareTaskModal,
        setTaskToShare,
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
        showDeleteConfirmation: true,
        taskToDelete: { id: "1", name: "T" },
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
        showDeleteConfirmation: true,
        taskToDelete: { id: "1", name: "T" },
        handleConfirmDelete,
      },
    };
    render(<AppModals {...props} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(handleConfirmDelete).toHaveBeenCalled();
  });

  it("renders wizard when isWizardActive", () => {
    render(<AppModals {...baseProps} isWizardActive={true} />);
    expect(screen.getByTestId("wizard")).toBeInTheDocument();
  });
});
