// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import TaskEditModal from "./TaskEditModal";
import AddEntryModal from "./AddEntryModal";
import ShareTaskModal from "./ShareTaskModal";
import LoginModal from "@/features/auth/components/LoginModal";
import ConfirmationModal from "./ConfirmationModal";
import { OnboardingWizard } from "./onboarding";
import { MODAL_STRINGS } from "@/constants/ui-strings";

interface Task {
  id: string;
  name: string;
  description?: string | null;
  shareToken?: string;
}

interface AppModalsProps {
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  isWizardActive: boolean;
  taskHandlers: {
    showAddTaskModal: boolean;
    setShowAddTaskModal: (v: boolean) => void;
    handleAddTask: (t: string, d: string) => Promise<void>;
    taskToEdit: Task | null;
    showTaskEditModal: boolean;
    setShowTaskEditModal: (v: boolean) => void;
    setTaskToEdit: (t: Task | null) => void;
    handleTaskUpdated: (updatedTask: {
      id: string;
      name: string;
      description?: string | null;
    }) => Promise<void>;
    taskToShare: Task | null;
    showShareTaskModal: boolean;
    setShowShareTaskModal: (v: boolean) => void;
    setTaskToShare: (t: Task | null) => void;
    showDeleteConfirmation: boolean;
    taskToDelete: Task | null;
    handleConfirmDelete: () => void;
    handleCancelDelete: () => void;
  };
}

export default function AppModals({
  showLoginModal,
  setShowLoginModal,
  isWizardActive,
  taskHandlers,
}: AppModalsProps) {
  return (
    <>
      <AddEntryModal
        isOpen={taskHandlers.showAddTaskModal}
        onClose={() => taskHandlers.setShowAddTaskModal(false)}
        onAdd={taskHandlers.handleAddTask}
      />
      {taskHandlers.taskToEdit && (
        <TaskEditModal
          isOpen={taskHandlers.showTaskEditModal}
          task={taskHandlers.taskToEdit}
          onClose={() => {
            taskHandlers.setShowTaskEditModal(false);
            taskHandlers.setTaskToEdit(null);
          }}
          onSave={async (updatedTask) => {
            await taskHandlers.handleTaskUpdated(updatedTask);
          }}
          setTaskToEdit={taskHandlers.setTaskToEdit}
        />
      )}
      {taskHandlers.taskToShare && (
        <ShareTaskModal
          isOpen={taskHandlers.showShareTaskModal}
          shareToken={taskHandlers.taskToShare.shareToken || ""}
          taskName={taskHandlers.taskToShare.name}
          onClose={() => {
            taskHandlers.setShowShareTaskModal(false);
            taskHandlers.setTaskToShare(null);
          }}
        />
      )}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={MODAL_STRINGS.LOGIN_MESSAGE}
      />
      <ConfirmationModal
        isOpen={taskHandlers.showDeleteConfirmation}
        title={MODAL_STRINGS.DELETE_TASK_TITLE}
        message={MODAL_STRINGS.DELETE_TASK_CONFIRM(taskHandlers.taskToDelete?.name ?? "")}
        confirmText={MODAL_STRINGS.DELETE_TASK_BUTTON}
        cancelText={MODAL_STRINGS.DELETE_TASK_CANCEL}
        onConfirm={taskHandlers.handleConfirmDelete}
        onCancel={taskHandlers.handleCancelDelete}
        variant="danger"
      />
      {isWizardActive && <OnboardingWizard />}
    </>
  );
}
