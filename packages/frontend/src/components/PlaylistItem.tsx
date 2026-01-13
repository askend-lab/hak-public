/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState } from 'react';
import { DragHandleIcon, PauseIcon, PlayIcon, MoreIcon } from './ui/Icons';

export interface PlaylistItemProps {
  id: string;
  text: string;
  stressedText?: string | undefined;
  isPlaying?: boolean | undefined;
  isLoading?: boolean | undefined;
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: ((id: string) => void) | undefined;
  onTagClick?: ((entryId: string, tagIndex: number, word: string) => void) | undefined;
  showOptions?: boolean | undefined;
  showDelete?: boolean | undefined;
  isDraggable?: boolean | undefined;
  selectedTagIndex?: number | null | undefined;
  isPronunciationPanelOpen?: boolean | undefined;
  readOnly?: boolean | undefined; // Read-only mode for shared views
}

export default function PlaylistItem({
  id,
  text,
  stressedText: _stressedText,
  isPlaying = false,
  isLoading = false,
  onPlay,
  onDelete,
  onEdit,
  onTagClick,
  showOptions = false,
  showDelete = true,
  isDraggable = false,
  selectedTagIndex,
  isPronunciationPanelOpen,
  readOnly = false
}: PlaylistItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Convert text to tags (split by spaces)
  const tags = text.trim().split(/\s+/).filter(word => word.length > 0);

  return (
    <div className={`playlist-item ${readOnly ? 'playlist-item-readonly' : ''}`}>
      {/* Drag handle - 6 dots icon */}
      {isDraggable && !readOnly && (
        <button
          className="drag-handle"
          aria-label="Lohista järjekorra muutmiseks"
        >
          <DragHandleIcon size="2xl" />
        </button>
      )}

      {/* Content - either plain text (read-only) or tags (editable) */}
      <div className="sentence-content">
        {readOnly ? (
          <div className="playlist-text-readonly">
            {text}
          </div>
        ) : (
          <div className="tags-group">
            {tags.map((tag, index) => {
              const isSelected = isPronunciationPanelOpen && selectedTagIndex === index;
              return (
                <div
                  key={index}
                  className={`tag ${onTagClick ? 'tag-clickable' : ''} ${isSelected ? 'tag-selected' : ''}`}
                  onClick={onTagClick ? () => onTagClick(id, index, tag) : undefined}
                  role={onTagClick ? 'button' : undefined}
                  tabIndex={onTagClick ? 0 : undefined}
                  onKeyDown={onTagClick ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTagClick(id, index, tag);
                    }
                  } : undefined}
                >
                  {tag}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Play button */}
      <button
        onClick={() => onPlay(id)}
        className={`play-button ${isLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`}
        disabled={isLoading}
        aria-label={isLoading ? 'Laen...' : isPlaying ? 'Peatab' : 'Mängi'}
      >
        {isLoading ? (
          <div className="loader-spinner" />
        ) : isPlaying ? (
          <PauseIcon size="2xl" />
        ) : (
          <PlayIcon size="2xl" />
        )}
      </button>

      {/* Menu button with dropdown */}
      {showOptions && (
        <div className="menu-container">
          <button
            className="menu-button"
            aria-label="Rohkem valikuid"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreIcon size="2xl" />
          </button>

          {menuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="dropdown-menu">
                {onEdit && (
                  <button
                    className="menu-item"
                    onClick={() => {
                      onEdit(id);
                      setMenuOpen(false);
                    }}
                  >
                    <div className="menu-item-content">Muuda</div>
                  </button>
                )}
                {showDelete && (
                  <button
                    className="menu-item menu-item-danger"
                    onClick={() => {
                      onDelete(id);
                      setMenuOpen(false);
                    }}
                  >
                    <div className="menu-item-content">Kustuta</div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}