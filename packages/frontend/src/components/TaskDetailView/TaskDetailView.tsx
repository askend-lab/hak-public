// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { copyTextToClipboard } from "@/utils/clipboardUtils";
import { convertTextToTags } from "@/types/synthesis";
import { DataService } from "@/services/dataService";
import { useAuth } from "@/services/auth";
import { useNotification } from "@/contexts/NotificationContext";
import SentenceSynthesisItem from "../SentenceSynthesisItem";
import ShareTaskModal from "../ShareTaskModal";
import PronunciationVariants from "../PronunciationVariants";
import SentencePhoneticPanel from "../SentencePhoneticPanel";

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
      showNotification("success", "ZIP-fail allalaaditud!", undefined, undefined, "success");
    } catch (err) {
      console.error("ZIP download failed:", err);
      showNotification("error", "Viga ZIP-faili loomisel");
    } finally {
      setIsDownloading(false);
    }
  }, [task, entries, isDownloading, showNotification]);

  const handleCopyToSynthesis = useCallback(() => {
    if (!entries || entries.length === 0) return;

    sessionStorage.setItem("copiedEntries", JSON.stringify(entries));
    showNotification("success", "Laused kopeeritud!");
    onNavigateToSynthesis();
  }, [entries, showNotification, onNavigateToSynthesis]);

  // Load task data (skip if initialTask provided)
  useEffect(() => {
    if (initialTask || !user) {
      if (!initialTask && !user) setError("Kasutaja pole sisse logitud");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    DataService.getInstance()
      .getTask(taskId, user.id)
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
  }, [taskId, user, initialTask]);

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
      await DataService.getInstance().updateTask(user.id, taskId, {
        entries: updatedEntries,
      });
      if (entryToDelete) {
        showNotification(
          "success",
          "Lause kustutatud",
          undefined,
          undefined,
          "success",
        );
      }
    } catch (_err) {
      // Revert on error
      setEntries(entries);
      showNotification("error", "Viga lause kustutamisel");
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
        onPlayAll={audio.handlePlayAll}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloading}
        onCopyToSynthesis={handleCopyToSynthesis}
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
                    onClick: phonetic.handleExplorePhonetic,
                  },
                  { label: "Kopeeri tekst", onClick: handleCopyText },
                  {
                    label: "Kustuta",
                    onClick: handleDeleteEntry,
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
        onUseVariant={variants.handleUseVariant}
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
          onApply={phonetic.handlePhoneticApply}
        />
      )}
    </div>
  );
}
