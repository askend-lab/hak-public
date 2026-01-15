 
'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import PlaylistItem from './PlaylistItem';
import { TaskIcon, MusicNoteIcon, StopIcon, PlayIcon, PlusCircleIcon } from './ui/Icons';

interface PlaylistEntry {
  id: string;
  text: string;
  stressedText: string;
  audioUrl: string | null;
  audioBlob: Blob | null;
}

interface PlaylistProps {
  entries: PlaylistEntry[];
  onPlayEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (id: string) => void;
  onReorderEntries?: (entries: PlaylistEntry[]) => void;
  onPlayAll: () => void;
  onAddEntry?: () => void;
  onAddToTask?: () => void;
  currentPlayingId?: string | null;
  isPlayingAll?: boolean;
}

export default function Playlist({
  entries,
  onPlayEntry,
  onDeleteEntry,
  onEditEntry,
  onReorderEntries,
  onPlayAll,
  onAddEntry,
  onAddToTask,
  currentPlayingId,
  isPlayingAll = false
}: PlaylistProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderEntries) {
      const oldIndex = entries.findIndex((entry) => entry.id === active.id);
      const newIndex = entries.findIndex((entry) => entry.id === over?.id);

      const reorderedEntries = arrayMove(entries, oldIndex, newIndex);
      onReorderEntries(reorderedEntries);
    }
  };
  return (
    <div className="playlist-container">
      <div className="playlist-header">
        <div className="playlist-header-top">
          <h3 className="playlist-title">Kõnevoor</h3>
          {entries.length > 0 && onAddToTask && (
            <button 
              onClick={onAddToTask}
              className="playlist-task-button"
              title="Lisa ülesandesse"
            >
              <TaskIcon size="md" />
              <span>Lisa ülesandesse ({entries.length})</span>
            </button>
          )}
        </div>
      </div>
      
      {entries.length === 0 ? (
        <div className="playlist-empty-state">
          <div className="playlist-empty-icon">
            <MusicNoteIcon size="2xl" />
          </div>
          <h4 className="playlist-empty-title">Kõnevoor on tühi</h4>
          <p className="playlist-empty-description">
            Lisa lausungid kõnevooru, et neid järjest kuulata või salvestada ülesandesse
          </p>
        </div>
      ) : (
        <div className="playlist-content">
          <div className="playlist-actions">
            <button
              onClick={onPlayAll}
              className={`button button--play-primary button--compact ${isPlayingAll ? 'playing-all' : ''}`}
            >
              {isPlayingAll ? (
                <>
                  <StopIcon size="md" />
                  <span>Peata</span>
                </>
              ) : (
                <>
                  <PlayIcon size="md" />
                  <span>Kuula kõik</span>
                </>
              )}
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={entries.map(entry => entry.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="playlist-items">
                {entries.map((entry) => (
                  <PlaylistItem
                    key={entry.id}
                    id={entry.id}
                    text={entry.text}
                    stressedText={entry.stressedText}
                    isPlaying={currentPlayingId === entry.id}
                    isLoading={!entry.audioUrl && !entry.audioBlob}
                    onPlay={onPlayEntry}
                    onDelete={onDeleteEntry}
                    onEdit={onEditEntry}
                    showOptions={true}
                    isDraggable={!!onReorderEntries}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
      
      {entries.length > 0 && onAddEntry && (
        <div className="playlist-footer">
          <button 
            onClick={onAddEntry}
            className="playlist-add-button"
          >
            <PlusCircleIcon size="md" />
            <span>Lisa kõnevoor</span>
          </button>
        </div>
      )}
    </div>
  );
}