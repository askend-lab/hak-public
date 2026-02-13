// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import PronunciationVariants from "./PronunciationVariants";
import TaskEditModal from "./TaskEditModal";
import AddEntryModal from "./AddEntryModal";
import ShareTaskModal from "./ShareTaskModal";
import LoginModal from "./LoginModal";
import ConfirmationModal from "./ConfirmationModal";
import SentencePhoneticPanel from "./SentencePhoneticPanel";
import { OnboardingWizard } from "./onboarding";
import { SentenceState } from "@/types/synthesis";
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
  showNotification: (
    type: "success" | "error",
    title: string,
    desc?: string,
  ) => void;
  isWizardActive: boolean;
  variants: {
    variantsWord: string | null;
    isVariantsPanelOpen: boolean;
    handleCloseVariants: () => void;
    variantsCustomPhonetic: string | null;
    setVariantsCustomPhonetic: (v: string | null) => void;
    sentencePhoneticId: string | null;
    showSentencePhoneticPanel: boolean;
    handleCloseSentencePhonetic: () => void;
  };
  synthesis: {
    sentences: SentenceState[];
    handleSentencePhoneticApply: (id: string, text: string) => void;
  };
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
  onUseVariant: (text: string) => void;
}

export default function AppModals({
  showLoginModal,
  setShowLoginModal,
  showNotification,
  isWizardActive,
  variants,
  synthesis,
  taskHandlers,
  onUseVariant,
}: AppModalsProps) {
  return (
    <>
      <PronunciationVariants
        word={variants.variantsWord}
        isOpen={variants.isVariantsPanelOpen}
        onClose={variants.handleCloseVariants}
        onUseVariant={onUseVariant}
        customPhoneticForm={variants.variantsCustomPhonetic}
      />
      {variants.sentencePhoneticId && (
        <SentencePhoneticPanel
          sentenceText={
            synthesis.sentences.find(
              (s) => s.id === variants.sentencePhoneticId,
            )?.text || ""
          }
          phoneticText={
            synthesis.sentences.find(
              (s) => s.id === variants.sentencePhoneticId,
            )?.phoneticText || null
          }
          isOpen={variants.showSentencePhoneticPanel}
          onClose={variants.handleCloseSentencePhonetic}
          onApply={(newPhoneticText) => {
            synthesis.handleSentencePhoneticApply(
              variants.sentencePhoneticId!,
              newPhoneticText,
            );
            showNotification("success", MODAL_STRINGS.PHONETIC_APPLIED);
          }}
        />
      )}
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
