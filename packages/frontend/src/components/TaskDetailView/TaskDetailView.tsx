 
'use client';

import { useState, useEffect } from 'react';
import { Task, TaskEntry } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/services/auth';
import { useNotification } from '@/contexts/NotificationContext';
import SentenceSynthesisItem from '../SentenceSynthesisItem';
import ShareTaskModal from '../ShareTaskModal';
import PronunciationVariants from '../PronunciationVariants';
import SentencePhoneticPanel from '../SentencePhoneticPanel';

import { TaskDetailHeader } from './TaskDetailHeader';
import { TaskDetailLoading, TaskDetailError } from './TaskDetailStates';
import { TaskDetailEmpty } from './TaskDetailEmpty';
import { useDragAndDrop, useAudioPlayback, usePronunciationVariants, usePhoneticPanel } from './hooks';

interface TaskDetailViewProps {
  taskId: string;
  onBack: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToSynthesis: () => void;
}

export default function TaskDetailView({
  taskId, onBack, onEditTask, onDeleteTask, onNavigateToSynthesis
}: TaskDetailViewProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [task, setTask] = useState<Task | null>(null);
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuClose = () => setOpenMenuId(null);

  // Custom hooks
  const dragDrop = useDragAndDrop(setEntries);
  const audio = useAudioPlayback(entries);
  const variants = usePronunciationVariants(entries, setEntries, task, user?.id);
  const phonetic = usePhoneticPanel(entries, setEntries, task, user?.id, handleMenuClose);

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      if (!user) {
        setError('Kasutaja pole sisse logitud');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const taskData = await DataService.getInstance().getTask(taskId, user.id);
        if (!taskData) {
          setError('Ülesannet ei leitud');
          return;
        }
        setTask(taskData);
        setEntries(taskData.entries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Viga ülesande laadimisel');
      } finally {
        setIsLoading(false);
      }
    };
    loadTask();
  }, [taskId, user]);

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    
    const entryToDelete = entries.find(e => e.id === id);
    const updatedEntries = entries.filter(e => e.id !== id);
    
    // Update local state immediately for responsive UI
    setEntries(updatedEntries);
    
    // Persist to backend
    try {
      await DataService.getInstance().updateTask(user.id, taskId, { entries: updatedEntries });
      if (entryToDelete) {
        showNotification('success', 'Lause kustutatud', undefined, undefined, 'success');
      }
    } catch (_err) {
      // Revert on error
      setEntries(entries);
      showNotification('error', 'Viga lause kustutamisel');
    }
  };

  if (isLoading) return <TaskDetailLoading onBack={onBack} />;
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
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />

      {entries.length === 0 ? (
        <TaskDetailEmpty task={task} onNavigateToSynthesis={onNavigateToSynthesis} />
      ) : (
        <div className="task-detail__entries">
          <div className="task-detail__entries-list">
            {entries.map((entry) => (
              <SentenceSynthesisItem
                key={entry.id}
                id={entry.id}
                text={entry.text}
                tags={entry.text.trim().split(/\s+/).filter(word => word.length > 0)}
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
                selectedTagIndex={variants.selectedEntryId === entry.id ? variants.selectedTagIndex : null}
                isPronunciationPanelOpen={variants.isVariantsPanelOpen}
                openMenuId={openMenuId}
                onMenuOpen={setOpenMenuId}
                onMenuClose={handleMenuClose}
                rowMenuItems={[
                  { label: 'Uuri häälduskuju', onClick: phonetic.handleExplorePhonetic },
                  { label: 'Kustuta', onClick: handleDeleteEntry, danger: true }
                ]}
              />
            ))}
          </div>
        </div>
      )}

      <ShareTaskModal
        isOpen={isShareModalOpen}
        shareToken={task?.shareToken || ''}
        taskName={task?.name || ''}
        onClose={() => setIsShareModalOpen(false)}
      />

      <PronunciationVariants
        isOpen={variants.isVariantsPanelOpen}
        word={variants.variantsWord || ''}
        onClose={variants.handleCloseVariants}
        onUseVariant={variants.handleUseVariant}
        customPhoneticForm={variants.variantsCustomPhonetic}
      />

      {phonetic.phoneticPanelEntryId && (
        <SentencePhoneticPanel
          sentenceText={entries.find(e => e.id === phonetic.phoneticPanelEntryId)?.text || ''}
          phoneticText={entries.find(e => e.id === phonetic.phoneticPanelEntryId)?.stressedText || null}
          isOpen={phonetic.showPhoneticPanel}
          onClose={phonetic.handleClosePhoneticPanel}
          onApply={phonetic.handlePhoneticApply}
        />
      )}
    </div>
  );
}
