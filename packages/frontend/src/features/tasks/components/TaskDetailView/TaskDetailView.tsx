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

function useTaskDetailState(taskId: string, initialTask?: Task) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const { setCopiedEntries } = useCopiedEntries();
  const [task, setTask] = useState<Task | null>(initialTask || null);
  const [entries, setEntries] = useState<TaskEntry[]>(initialTask?.entries || []);
  const [isLoading, setIsLoading] = useState(!initialTask);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (initialTask || !user) {
      if (!initialTask && !user) {setError("Kasutaja pole sisse logitud");}
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    dataService.getTask(taskId)
      .then((taskData) => {
        // eslint-disable-next-line promise/always-return -- fire-and-forget state update in useEffect
        if (taskData) { setTask(taskData); setEntries(taskData.entries || []); }
        else { setError("Ülesannet ei leitud"); }
      })
      .catch((err) => setError(getErrorMessage(err, "Viga ülesande laadimisel")))
      .finally(() => setIsLoading(false));
  }, [taskId, user, initialTask, dataService]);

  return { user, showNotification, dataService, setCopiedEntries, task, entries, setEntries, isLoading, error, isDownloading, setIsDownloading };
}

function useTaskDetailActions(
  state: ReturnType<typeof useTaskDetailState>,
  taskId: string,
  onNavigateToSynthesis: () => void,
) {
  const { user, showNotification, dataService, setCopiedEntries, task, entries, setEntries, isDownloading, setIsDownloading } = state;

  const handleDownloadZip = useCallback(async () => {
    if (!task || isDownloading) {return;}
    setIsDownloading(true);
    try {
      await downloadTaskAsZip({ ...task, entries });
      showNotification({ type: "success", message: "ZIP-fail allalaaditud!", color: "success" });
    } catch (err) { logger.error("ZIP download failed:", err); showNotification({ type: "error", message: "Viga ZIP-faili loomisel" }); }
    finally { setIsDownloading(false); }
  }, [task, entries, isDownloading, showNotification, setIsDownloading]);

  const handleCopyToSynthesis = useCallback(() => {
    if (!entries || entries.length === 0) {return;}
    setCopiedEntries(entries); showNotification({ type: "success", message: "Laused kopeeritud!" }); onNavigateToSynthesis();
  }, [entries, setCopiedEntries, showNotification, onNavigateToSynthesis]);

  const handleCopyText = useCallback(async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry || !entry.text.trim()) {return;}
    await copyTextToClipboard(entry.text, showNotification);
  }, [entries, showNotification]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    if (!user) {return;}
    const entryToDelete = entries.find((e) => e.id === id);
    const updatedEntries = entries.filter((e) => e.id !== id);
    setEntries(updatedEntries);
    try {
      await dataService.updateTask(taskId, { entries: updatedEntries });
      if (entryToDelete) { showNotification({ type: "success", message: "Lause kustutatud", color: "success" }); }
    } catch (_err) { setEntries(entries); showNotification({ type: "error", message: "Viga lause kustutamisel" }); }
  }, [user, entries, setEntries, dataService, taskId, showNotification]);

  return { handleDownloadZip, handleCopyToSynthesis, handleCopyText, handleDeleteEntry };
}

function useTaskDetailUI(opts: { setEntries: React.Dispatch<React.SetStateAction<TaskEntry[]>>; entries: TaskEntry[]; task: Task | null; userId: string | undefined }) {
  const { setEntries, entries, task, userId } = opts;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const handleMenuClose = () => setOpenMenuId(null);
  const dragDrop = useDragAndDrop(setEntries);
  const audio = useAudioPlayback(entries);
  const variants = usePronunciationVariants({ entries, setEntries, task, userId });
  const phonetic = usePhoneticPanel({ entries, setEntries, task, userId, onMenuClose: handleMenuClose });

  const handleTagClick = useCallback((entryId: string, tagIndex: number, word: string) => {
    phonetic.handleClosePhoneticPanel();
    variants.handleTagClick(entryId, tagIndex, word);
  }, [phonetic.handleClosePhoneticPanel, variants.handleTagClick]);

  const handleExplorePhonetic = useCallback(async (entryId: string) => {
    variants.handleCloseVariants();
    await phonetic.handleExplorePhonetic(entryId);
  }, [variants.handleCloseVariants, phonetic.handleExplorePhonetic]);

  return {
    openMenuId, setOpenMenuId, handleMenuClose, dragDrop, audio,
    variants: { ...variants, handleTagClick },
    phonetic: { ...phonetic, handleExplorePhonetic },
  };
}

function buildRowMenuItems(phonetic: ReturnType<typeof usePhoneticPanel>, actions: ReturnType<typeof useTaskDetailActions>) {
  return [
    { label: "Uuri häälduskuju", onClick: (...args: Parameters<typeof phonetic.handleExplorePhonetic>) => { void phonetic.handleExplorePhonetic(...args); } },
    { label: "Kopeeri tekst", onClick: (...args: Parameters<typeof actions.handleCopyText>) => { void actions.handleCopyText(...args); } },
    { label: "Kustuta", onClick: (...args: Parameters<typeof actions.handleDeleteEntry>) => { void actions.handleDeleteEntry(...args); }, danger: true },
  ];
}

function TaskPanels({ task, entries, variants, phonetic, isShareModalOpen, onCloseShare }: {
  task: Task; entries: TaskEntry[]; variants: ReturnType<typeof usePronunciationVariants>; phonetic: ReturnType<typeof usePhoneticPanel>;
  isShareModalOpen: boolean; onCloseShare: () => void;
}) {
  const phoneticEntry = phonetic.phoneticPanelEntryId ? entries.find((e) => e.id === phonetic.phoneticPanelEntryId) : undefined;
  const shareToken = task.shareToken ?? "";
  const taskName = task.name ?? "";
  const variantsWord = variants.variantsWord ?? "";
  return (
    <>
      <ShareTaskModal isOpen={isShareModalOpen} shareToken={shareToken} taskName={taskName} onClose={onCloseShare} />
      <PronunciationVariants isOpen={variants.isVariantsPanelOpen} word={variantsWord}
        onClose={variants.handleCloseVariants} onUseVariant={(...args: Parameters<typeof variants.handleUseVariant>) => { void variants.handleUseVariant(...args); }}
        customPhoneticForm={variants.variantsCustomPhonetic} />
      {phoneticEntry && (
        <SentencePhoneticPanel sentenceText={phoneticEntry.text} phoneticText={phoneticEntry.stressedText ?? null}
          isOpen={phonetic.showPhoneticPanel} onClose={phonetic.handleClosePhoneticPanel}
          onApply={(...args: Parameters<typeof phonetic.handlePhoneticApply>) => { void phonetic.handlePhoneticApply(...args); }} />
      )}
    </>
  );
}

export default function TaskDetailView({ taskId, onBack, onEditTask, onDeleteTask, onNavigateToSynthesis, initialTask }: TaskDetailViewProps) {
  const state = useTaskDetailState(taskId, initialTask);
  const { user, task, entries, setEntries, isLoading, error } = state;
  const actions = useTaskDetailActions(state, taskId, onNavigateToSynthesis);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const ui = useTaskDetailUI({ setEntries, entries, task, userId: user?.id });

  if (isLoading) {return <TaskDetailLoading />;}
  if (error) {return <TaskDetailError onBack={onBack} error={error} />;}
  if (!task) {return null;}

  const rowMenuItems = buildRowMenuItems(ui.phonetic, actions);

  return (
    <div className="task-detail-view">
      <TaskDetailHeader task={task} entriesCount={entries.length} isLoadingPlayAll={ui.audio.isLoadingPlayAll} isPlayingAll={ui.audio.isPlayingAll}
        isHeaderMenuOpen={isHeaderMenuOpen} setIsHeaderMenuOpen={setIsHeaderMenuOpen} onShare={() => setIsShareModalOpen(true)}
        onPlayAll={() => { void ui.audio.handlePlayAll(); }} onDownloadZip={() => { void actions.handleDownloadZip(); }} isDownloading={state.isDownloading}
        onCopyToSynthesis={() => { void actions.handleCopyToSynthesis(); }} onEditTask={onEditTask} onDeleteTask={onDeleteTask} />
      {entries.length === 0 ? <TaskDetailEmpty task={task} onNavigateToSynthesis={onNavigateToSynthesis} /> : (
        <div className="task-detail__entries"><div className="task-detail__entries-list">
          {entries.map((entry) => (
            <SentenceSynthesisItem key={entry.id} id={entry.id} text={entry.text} tags={convertTextToTags(entry.text)} mode="tags" draggable={true}
              isDragging={ui.dragDrop.draggedId === entry.id} isDragOver={ui.dragDrop.dragOverId === entry.id}
              isPlaying={ui.audio.currentPlayingId === entry.id} isLoading={ui.audio.currentLoadingId === entry.id}
              onPlay={ui.audio.handlePlayEntry} onDragStart={ui.dragDrop.handleDragStart} onDragEnd={ui.dragDrop.handleDragEnd}
              onDragOver={ui.dragDrop.handleDragOver} onDragLeave={ui.dragDrop.handleDragLeave} onDrop={ui.dragDrop.handleDrop}
              onTagClick={ui.variants.handleTagClick}
              selectedTagIndex={ui.variants.selectedEntryId === entry.id ? ui.variants.selectedTagIndex : null}
              isPronunciationPanelOpen={ui.variants.isVariantsPanelOpen || ui.phonetic.showPhoneticPanel}
              allTagsSelected={ui.phonetic.phoneticPanelEntryId === entry.id}
              openMenuId={ui.openMenuId} onMenuOpen={ui.setOpenMenuId} onMenuClose={ui.handleMenuClose} rowMenuItems={rowMenuItems} />
          ))}
        </div></div>
      )}
      <TaskPanels task={task} entries={entries} variants={ui.variants} phonetic={ui.phonetic} isShareModalOpen={isShareModalOpen} onCloseShare={() => setIsShareModalOpen(false)} />
    </div>
  );
}
