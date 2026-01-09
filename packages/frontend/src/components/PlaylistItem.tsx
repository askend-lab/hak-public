/* eslint-disable max-lines-per-function, complexity */
'use client';

import { useState } from 'react';

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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 15C14 15.5523 14.4477 16 15 16C15.5523 16 16 15.5523 16 15C16 14.4477 15.5523 14 15 14C14.4477 14 14 14.4477 14 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 15C8 15.5523 8.44772 16 9 16C9.55228 16 10 15.5523 10 15C10 14.4477 9.55228 14 9 14C8.44772 14 8 14.4477 8 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 9C14 9.55228 14.4477 10 15 10C15.5523 10 16 9.55228 16 9C16 8.44772 15.5523 8 15 8C14.4477 8 14 8.44772 14 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 9C8 9.55228 8.44772 10 9 10C9.55228 10 10 9.55228 10 9C10 8.44772 9.55228 8 9 8C8.44772 8 8 8.44772 8 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="6" width="3" height="12" fill="currentColor" rx="1" />
            <rect x="14" y="6" width="3" height="12" fill="currentColor" rx="1" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.31445 6.5C8.32533 6.49867 8.38306 6.49567 8.56055 6.56641C8.73719 6.63681 8.96582 6.75129 9.30957 6.9248L17.958 11.291C17.9608 11.2924 17.964 11.2936 17.9668 11.2949C18.343 11.4848 18.5952 11.6131 18.7715 11.7227C18.9298 11.8211 18.9662 11.8696 18.9707 11.876C19.0093 11.9553 19.0094 12.0447 18.9707 12.124C18.9655 12.1314 18.9276 12.1805 18.7705 12.2783C18.593 12.3887 18.3379 12.5182 17.958 12.71L9.30957 17.0752C8.96567 17.2488 8.73701 17.3634 8.56055 17.4336C8.38339 17.5041 8.32566 17.5014 8.31445 17.5C8.20475 17.4865 8.11413 17.431 8.05957 17.3584C8.0567 17.3539 8.0328 17.3114 8.01758 17.1543C8.00046 16.9776 8 16.7364 8 16.3662V7.63477C8 7.26444 8.00045 7.02263 8.01758 6.8457C8.03473 6.66887 8.06291 6.63716 8.05957 6.6416C8.11415 6.56897 8.20478 6.51347 8.31445 6.5Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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