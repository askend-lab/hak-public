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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span>Lisa ülesandesse ({entries.length})</span>
            </button>
          )}
        </div>
      </div>
      
      {entries.length === 0 ? (
        <div className="playlist-empty-state">
          <div className="playlist-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="12" height="16"/>
                  </svg>
                  <span>Peata</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Lisa kõnevoor</span>
          </button>
        </div>
      )}
    </div>
  );
}