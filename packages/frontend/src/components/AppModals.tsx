// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import TaskEditModal from "@/features/tasks/components/TaskEditModal";
import AddEntryModal from "@/features/tasks/components/AddEntryModal";
import ShareTaskModal from "@/features/sharing/components/ShareTaskModal";
import LoginModal from "@/features/auth/components/LoginModal";
import ConfirmationModal from "./ConfirmationModal";
import { OnboardingWizard } from "@/features/onboarding/components";
import { MODAL_STRINGS } from "@/config/ui-strings";
import type { Task } from "@/types/task";

type ModalTask = Pick<Task, "id" | "name"> & {
  description?: string | null;
  shareToken?: string;
};

interface AppModalsProps {
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  isWizardActive: boolean;
  taskHandlers: {
    modals: {
      showAddTaskModal: boolean;
      setShowAddTaskModal: (v: boolean) => void;
      taskToEdit: ModalTask | null;
      showTaskEditModal: boolean;
      setShowTaskEditModal: (v: boolean) => void;
      setTaskToEdit: (t: ModalTask | null) => void;
      taskToShare: ModalTask | null;
      showShareTaskModal: boolean;
      setShowShareTaskModal: (v: boolean) => void;
      setTaskToShare: (t: ModalTask | null) => void;
      showDeleteConfirmation: boolean;
      taskToDelete: ModalTask | null;
    };
    crud: {
      handleAddTask: (t: string, d: string) => Promise<void>;
      handleTaskUpdated: (updatedTask: {
        id: string;
        name: string;
        description?: string | null;
      }) => Promise<void>;
      handleConfirmDelete: () => void;
      handleCancelDelete: () => void;
    };
    sharing: {
      handleRevokeShare?: (shareToken: string) => Promise<void>;
    };
  };
}

export default function AppModals({
  showLoginModal,
  setShowLoginModal,
  isWizardActive,
  taskHandlers,
}: AppModalsProps) {
  const { modals, crud, sharing } = taskHandlers;
  return (
    <>
      <AddEntryModal
        isOpen={modals.showAddTaskModal}
        onClose={() => modals.setShowAddTaskModal(false)}
        onAdd={crud.handleAddTask}
      />
      {modals.taskToEdit && (
        <TaskEditModal
          isOpen={modals.showTaskEditModal}
          task={modals.taskToEdit}
          onClose={() => {
            modals.setShowTaskEditModal(false);
            modals.setTaskToEdit(null);
          }}
          onSave={async (updatedTask) => {
            await crud.handleTaskUpdated(updatedTask);
          }}
          setTaskToEdit={modals.setTaskToEdit}
        />
      )}
      {modals.taskToShare && (
        <ShareTaskModal
          isOpen={modals.showShareTaskModal}
          shareToken={modals.taskToShare.shareToken || ""}
          taskName={modals.taskToShare.name}
          onClose={() => {
            modals.setShowShareTaskModal(false);
            modals.setTaskToShare(null);
          }}
          onRevoke={
            sharing.handleRevokeShare && modals.taskToShare.shareToken
              ? async () => {
                  await sharing.handleRevokeShare!(modals.taskToShare!.shareToken!);
                }
              : undefined
          }
        />
      )}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={MODAL_STRINGS.LOGIN_MESSAGE}
      />
      <ConfirmationModal
        isOpen={modals.showDeleteConfirmation}
        title={MODAL_STRINGS.DELETE_TASK_TITLE}
        message={MODAL_STRINGS.DELETE_TASK_CONFIRM(modals.taskToDelete?.name ?? "")}
        confirmText={MODAL_STRINGS.DELETE_TASK_BUTTON}
        cancelText={MODAL_STRINGS.DELETE_TASK_CANCEL}
        onConfirm={crud.handleConfirmDelete}
        onCancel={crud.handleCancelDelete}
        variant="danger"
      />
      {isWizardActive && <OnboardingWizard />}
    </>
  );
}
