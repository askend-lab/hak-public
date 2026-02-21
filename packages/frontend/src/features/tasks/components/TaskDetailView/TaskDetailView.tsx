// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { copyTextToClipboard } from "@/utils/clipboardUtils";
import { convertTextToTags } from "@/types/synthesis";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { useNotification } from "@/contexts/NotificationContext";
import { useCopiedEntries } from "@/contexts/CopiedEntriesContext";
import { logger } from "@hak/shared";
import SentenceSynthesisItem from "@/features/synthesis/components/SentenceSynthesisItem";
import ShareTaskModal from "@/features/sharing/components/ShareTaskModal";
import PronunciationVariants from "@/features/synthesis/components/PronunciationVariants";
import SentencePhoneticPanel from "@/features/synthesis/components/SentencePhoneticPanel";

import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskDetailLoading, TaskDetailError } from "./TaskDetailStates";
import { TaskDetailEmpty } from "./TaskDetailEmpty";
import {
  useDragAndDrop,
  useAudioPlayback,
  usePronunciationVariants,
  usePhoneticPanel,
} from "./hooks";
import { downloadTaskAsZip } from "@/utils/downloadTaskAsZip";

interface TaskDetailViewProps {
  taskId: string;
  onBack: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToSynthesis: () => void;
  initialTask?: Task; // Pre-loaded task for shared view (no auth required)
}

export default function TaskDetailView({
  taskId,
  onBack,
  onEditTask,
  onDeleteTask,
  onNavigateToSynthesis,
  initialTask,
}: TaskDetailViewProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const { setCopiedEntries } = useCopiedEntries();
  const [task, setTask] = useState<Task | null>(initialTask || null);
  const [entries, setEntries] = useState<TaskEntry[]>(
    initialTask?.entries || [],
  );
  const [isLoading, setIsLoading] = useState(!initialTask);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleMenuClose = () => setOpenMenuId(null);

  // Custom hooks
  const dragDrop = useDragAndDrop(setEntries);
  const audio = useAudioPlayback(entries);
  const variants = usePronunciationVariants(
    entries,
    setEntries,
    task,
    user?.id,
  );
  const phonetic = usePhoneticPanel(
    entries,
    setEntries,
    task,
    user?.id,
    handleMenuClose,
  );

  const handleDownloadZip = useCallback(async () => {
    if (!task || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadTaskAsZip({ ...task, entries });
      showNotification({ type: "success", message: "ZIP-fail allalaaditud!", color: "success" });
    } catch (err) {
      logger.error("ZIP download failed:", err);
      showNotification({ type: "error", message: "Viga ZIP-faili loomisel" });
    } finally {
      setIsDownloading(false);
    }
  }, [task, entries, isDownloading, showNotification]);

  const handleCopyToSynthesis = useCallback(() => {
    if (!entries || entries.length === 0) return;

    setCopiedEntries(entries);
    showNotification({ type: "success", message: "Laused kopeeritud!" });
    onNavigateToSynthesis();
  }, [entries, setCopiedEntries, showNotification, onNavigateToSynthesis]);

  // Load task data (skip if initialTask provided)
  useEffect(() => {
    if (initialTask || !user) {
      if (!initialTask && !user) setError("Kasutaja pole sisse logitud");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    dataService
      .getTask(taskId)
      .then((taskData) => {
        if (taskData) {
          setTask(taskData);
          setEntries(taskData.entries || []);
        } else {
          setError("Ülesannet ei leitud");
        }
      })
      .catch((err) =>
        setError(
          getErrorMessage(err, "Viga ülesande laadimisel"),
        ),
      )
      .finally(() => setIsLoading(false));
  }, [taskId, user, initialTask, dataService]);

  const handleCopyText = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry || !entry.text.trim()) return;

    await copyTextToClipboard(entry.text, showNotification);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;

    const entryToDelete = entries.find((e) => e.id === id);
    const updatedEntries = entries.filter((e) => e.id !== id);

    // Update local state immediately for responsive UI
    setEntries(updatedEntries);

    // Persist to backend
    try {
      await dataService.updateTask(taskId, {
        entries: updatedEntries,
      });
      if (entryToDelete) {
        showNotification({
          type: "success",
          message: "Lause kustutatud",
          color: "success",
        });
      }
    } catch (_err) {
      // Revert on error
      setEntries(entries);
      showNotification({ type: "error", message: "Viga lause kustutamisel" });
    }
  };

  if (isLoading) return <TaskDetailLoading />;
  if (error) return <TaskDetailError onBack={onBack} error={error} />;
  if (!task) return null;

  return (
    <div className="task-detail-view">
      <TaskDetailHeader
        task={task}
        entriesCount={entries.length}
        isLoadingPlayAll={audio.isLoadingPlayAll}
        isPlayingAll={audio.isPlayingAll}
        isHeaderMenuOpen={isHeaderMenuOpen}
        setIsHeaderMenuOpen={setIsHeaderMenuOpen}
        onShare={() => setIsShareModalOpen(true)}
        onPlayAll={() => { void audio.handlePlayAll(); }}
        onDownloadZip={() => { void handleDownloadZip(); }}
        isDownloading={isDownloading}
        onCopyToSynthesis={() => { void handleCopyToSynthesis(); }}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />

      {entries.length === 0 ? (
        <TaskDetailEmpty
          task={task}
          onNavigateToSynthesis={onNavigateToSynthesis}
        />
      ) : (
        <div className="task-detail__entries">
          <div className="task-detail__entries-list">
            {entries.map((entry) => (
              <SentenceSynthesisItem
                key={entry.id}
                id={entry.id}
                text={entry.text}
                tags={convertTextToTags(entry.text)}
                mode="tags"
                draggable={true}
                isDragging={dragDrop.draggedId === entry.id}
                isDragOver={dragDrop.dragOverId === entry.id}
                isPlaying={audio.currentPlayingId === entry.id}
                isLoading={audio.currentLoadingId === entry.id}
                onPlay={audio.handlePlayEntry}
                onDragStart={dragDrop.handleDragStart}
                onDragEnd={dragDrop.handleDragEnd}
                onDragOver={dragDrop.handleDragOver}
                onDragLeave={dragDrop.handleDragLeave}
                onDrop={dragDrop.handleDrop}
                onTagClick={variants.handleTagClick}
                selectedTagIndex={
                  variants.selectedEntryId === entry.id
                    ? variants.selectedTagIndex
                    : null
                }
                isPronunciationPanelOpen={
                  variants.isVariantsPanelOpen || phonetic.showPhoneticPanel
                }
                allTagsSelected={phonetic.phoneticPanelEntryId === entry.id}
                openMenuId={openMenuId}
                onMenuOpen={setOpenMenuId}
                onMenuClose={handleMenuClose}
                rowMenuItems={[
                  {
                    label: "Uuri häälduskuju",
                    onClick: (...args: Parameters<typeof phonetic.handleExplorePhonetic>) => { void phonetic.handleExplorePhonetic(...args); },
                  },
                  { label: "Kopeeri tekst", onClick: (...args: Parameters<typeof handleCopyText>) => { void handleCopyText(...args); } },
                  {
                    label: "Kustuta",
                    onClick: (...args: Parameters<typeof handleDeleteEntry>) => { void handleDeleteEntry(...args); },
                    danger: true,
                  },
                ]}
              />
            ))}
          </div>
        </div>
      )}

      <ShareTaskModal
        isOpen={isShareModalOpen}
        shareToken={task?.shareToken || ""}
        taskName={task?.name || ""}
        onClose={() => setIsShareModalOpen(false)}
      />

      <PronunciationVariants
        isOpen={variants.isVariantsPanelOpen}
        word={variants.variantsWord || ""}
        onClose={variants.handleCloseVariants}
        onUseVariant={(...args: Parameters<typeof variants.handleUseVariant>) => { void variants.handleUseVariant(...args); }}
        customPhoneticForm={variants.variantsCustomPhonetic}
      />

      {phonetic.phoneticPanelEntryId && (
        <SentencePhoneticPanel
          sentenceText={
            entries.find((e) => e.id === phonetic.phoneticPanelEntryId)?.text ||
            ""
          }
          phoneticText={
            entries.find((e) => e.id === phonetic.phoneticPanelEntryId)
              ?.stressedText || null
          }
          isOpen={phonetic.showPhoneticPanel}
          onClose={phonetic.handleClosePhoneticPanel}
          onApply={(...args: Parameters<typeof phonetic.handlePhoneticApply>) => { void phonetic.handlePhoneticApply(...args); }}
        />
      )}
    </div>
  );
}
