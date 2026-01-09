'use client';

import { useState, useRef, useEffect } from 'react';

interface SentenceSynthesisItemProps {
  // Identity
  id: string;
  
  // Content
  text: string;
  tags?: string[];
  stressedTags?: string[];
  
  // Display mode
  mode: 'input' | 'tags' | 'readonly';
  
  // Drag and drop
  draggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  
  // Playback
  isPlaying?: boolean;
  isLoading?: boolean;
  onPlay: (id: string) => void;
  
  // Tag interactions (for tags mode)
  onTagClick?: (id: string, tagIndex: number, word: string) => void;
  selectedTagIndex?: number | null;
  isPronunciationPanelOpen?: boolean;
  
  // Tag menu (for input mode - synthesis page)
  onTagMenuOpen?: (sentenceId: string, tagIndex: number) => void;
  openTagMenu?: { sentenceId: string; tagIndex: number } | null;
  onTagMenuClose?: () => void;
  tagMenuItems?: Array<{
    label: string;
    onClick: (sentenceId: string, tagIndex: number, word: string) => void;
    danger?: boolean;
  }>;
  
  // Tag editing (for input mode)
  editingTag?: { sentenceId: string; tagIndex: number; value: string } | null;
  onEditTagChange?: (value: string) => void;
  onEditTagKeyDown?: (e: React.KeyboardEvent) => void;
  onEditTagCommit?: () => void;
  
  // Input mode (synthesis)
  currentInput?: string;
  onInputChange?: (id: string, value: string) => void;
  onInputKeyDown?: (e: React.KeyboardEvent) => void;
  onInputBlur?: (id: string) => void;
  onClear?: (id: string) => void;
  placeholder?: string;
  
  // Row menu (like TaskRow pattern - cleaner)
  openMenuId?: string | null;
  onMenuOpen?: (id: string) => void;
  onMenuClose?: () => void;
  rowMenuItems?: Array<{
    label: string;
    onClick: (id: string) => void;
    danger?: boolean;
    icon?: React.ReactNode;
  }>;
  
  // Legacy: Complex menu content (for synthesis page custom menu)
  // TODO: Extract synthesis menu to separate component and remove this
  menuContent?: React.ReactNode;
  onMenuOpenLegacy?: (e: React.MouseEvent, id: string) => void;
  
  // Visual states
  className?: string;
  sentenceIndex?: number; // For onboarding targets
}

export default function SentenceSynthesisItem({
  id,
  text,
  tags = [],
  stressedTags: _stressedTags = [],
  mode,
  draggable = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isPlaying = false,
  isLoading = false,
  onPlay,
  onTagClick,
  selectedTagIndex,
  isPronunciationPanelOpen,
  onTagMenuOpen,
  openTagMenu,
  onTagMenuClose,
  tagMenuItems = [],
  editingTag,
  onEditTagChange,
  onEditTagKeyDown,
  onEditTagCommit,
  currentInput = '',
  onInputChange,
  onInputKeyDown,
  onInputBlur,
  onClear,
  placeholder,
  openMenuId,
  onMenuOpen,
  onMenuClose,
  rowMenuItems = [],
  menuContent,
  onMenuOpenLegacy,
  className = '',
  sentenceIndex = 0
}: SentenceSynthesisItemProps) {
  
  // Ref for the container element (used for drag image)
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ref for the menu button (used for dropdown positioning)
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  // State for dropdown position (when using fixed positioning)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  
  // Calculate dropdown position when menu opens
  useEffect(() => {
    if (openMenuId === id && menuButtonRef.current) {
      const updatePosition = () => {
        if (menuButtonRef.current) {
          const rect = menuButtonRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4, // 4px gap below button
            right: window.innerWidth - rect.right, // Distance from right edge
          });
        }
      };
      
      updatePosition();
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setDropdownPosition(null);
    }
    return undefined;
  }, [openMenuId, id]);
  
  // Internal drag start handler that sets the entire component as drag image
  const handleDragStartInternal = (e: React.DragEvent) => {
    if (containerRef.current) {
      // Set the drag image to be the entire component
      e.dataTransfer.setDragImage(containerRef.current, 20, containerRef.current.offsetHeight / 2);
      
      // Add a slight delay to allow the drag image to render, then apply opacity
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = '0.5';
        }
      }, 0);
    }
    
    // Call the parent's onDragStart handler
    if (onDragStart) {
      onDragStart(e, id);
    }
  };
  
  // Internal drag end handler to reset opacity
  const handleDragEndInternal = (e: React.DragEvent) => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '1';
    }
    
    // Call the parent's onDragEnd handler
    if (onDragEnd) {
      onDragEnd(e);
    }
  };
  
  // Determine container class names
  const containerClasses = [
    'sentence-synthesis-item',
    isDragging && 'sentence-synthesis-item--dragging',
    isDragOver && 'sentence-synthesis-item--drag-over',
    className
  ].filter(Boolean).join(' ');

  // Render content based on mode
  const renderContent = () => {
    switch (mode) {
      case 'input':
        return (
          <div className="sentence-synthesis-item__content">
            <div 
              className="sentence-synthesis-item__tags-group"
              lang="et"
              data-onboarding-target={`sentence-${sentenceIndex}-input`}
            >
              {tags.map((tag, index) => {
                const isSelected = (isPronunciationPanelOpen && selectedTagIndex === index);
                const isMenuOpen = openTagMenu?.sentenceId === id && openTagMenu?.tagIndex === index;
                const isEditing = editingTag?.sentenceId === id && editingTag?.tagIndex === index;
                
                // Show inline input when editing
                if (isEditing && onEditTagChange && onEditTagKeyDown && onEditTagCommit) {
                  return (
                    <input
                      key={index}
                      type="text"
                      className="sentence-synthesis-item__tag-edit-input"
                      value={editingTag.value}
                      onChange={(e) => onEditTagChange(e.target.value)}
                      onKeyDown={onEditTagKeyDown}
                      onBlur={onEditTagCommit}
                      size={Math.max(editingTag.value.length + 2, 4)}
                      spellCheck={false}
                      autoFocus
                    />
                  );
                }
                
                return (
                  <div
                    key={index}
                    className={`sentence-synthesis-item__tag sentence-synthesis-item__tag--clickable ${isSelected ? 'sentence-synthesis-item__tag--selected' : ''}`}
                    onClick={() => onTagMenuOpen && onTagMenuOpen(id, index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTagMenuOpen && onTagMenuOpen(id, index);
                      }
                    }}
                    data-onboarding-target={`sentence-${sentenceIndex}-tag-${index}`}
                  >
                    <span className="sentence-synthesis-item__tag-text">{tag}</span>
                    <span className="sentence-synthesis-item__tag-chevron" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>

                    {isMenuOpen && tagMenuItems.length > 0 && (
                      <>
                        <div className="sentence-synthesis-item__tag-menu-backdrop" onClick={() => onTagMenuClose && onTagMenuClose()} />
                        <div className="sentence-synthesis-item__tag-dropdown" onClick={(e) => e.stopPropagation()}>
                          {tagMenuItems.map((item, itemIndex) => (
                            <button
                              key={itemIndex}
                              className={`sentence-synthesis-item__tag-menu-item ${item.danger ? 'sentence-synthesis-item__tag-menu-item--danger' : ''}`}
                              onClick={() => item.onClick(id, index, tag)}
                            >
                              <div className="sentence-synthesis-item__tag-menu-item-content">{item.label}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {onInputChange && (
                <input
                  type="text"
                  className="sentence-synthesis-item__input"
                  placeholder={tags.length === 0 ? (placeholder || "Kirjuta sõna või lause ja vajuta Enter") : ""}
                  value={currentInput}
                  onChange={(e) => onInputChange(id, e.target.value)}
                  onKeyDown={onInputKeyDown}
                  onBlur={() => onInputBlur && onInputBlur(id)}
                  spellCheck={false}
                />
              )}
              {(tags.length > 0 || currentInput) && onClear && (
                <button
                  onClick={() => onClear(id)}
                  className="sentence-synthesis-item__clear-button"
                  aria-label="Clear all"
                >
                  <img src="/icons/Close_SM.svg" alt="Clear" />
                </button>
              )}
            </div>
          </div>
        );
        
      case 'tags':
        return (
          <div className="sentence-synthesis-item__content">
            <div className="sentence-synthesis-item__tags-group">
              {tags.map((tag, index) => {
                const isSelected = isPronunciationPanelOpen && selectedTagIndex === index;
                return (
                  <div
                    key={index}
                    className={`sentence-synthesis-item__tag ${onTagClick ? 'sentence-synthesis-item__tag--clickable' : ''} ${isSelected ? 'sentence-synthesis-item__tag--selected' : ''}`}
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
          </div>
        );
        
      case 'readonly':
        return (
          <div className="sentence-synthesis-item__content">
            <div className="sentence-synthesis-item__text-readonly">
              {text}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      onDragOver={onDragOver ? (e) => onDragOver(e, id) : undefined}
      onDragLeave={onDragLeave}
      onDrop={onDrop ? (e) => onDrop(e, id) : undefined}
    >
      {/* Drag handle */}
      {draggable && mode !== 'readonly' && (
        <div
          className="sentence-synthesis-item__drag-handle"
          draggable
          onDragStart={handleDragStartInternal}
          onDragEnd={handleDragEndInternal}
          aria-label="Drag to reorder"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 15C14 15.5523 14.4477 16 15 16C15.5523 16 16 15.5523 16 15C16 14.4477 15.5523 14 15 14C14.4477 14 14 14.4477 14 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 15C8 15.5523 8.44772 16 9 16C9.55228 16 10 15.5523 10 15C10 14.4477 9.55228 14 9 14C8.44772 14 8 14.4477 8 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 9C14 9.55228 14.4477 10 15 10C15.5523 10 16 9.55228 16 9C16 8.44772 15.5523 8 15 8C14.4477 8 14 8.44772 14 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 9C8 9.55228 8.44772 10 9 10C9.55228 10 10 9.55228 10 9C10 8.44772 9.55228 8 9 8C8.44772 8 8 8.44772 8 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Content area */}
      {renderContent()}

      {/* Play button */}
      <button
        className={`sentence-synthesis-item__play button button--primary button--icon-only button--circular ${isLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`}
        onClick={() => onPlay(id)}
        disabled={isLoading || (mode === 'input' && tags.length === 0 && !currentInput.trim())}
        aria-label={isLoading ? 'Loading' : isPlaying ? 'Playing' : 'Play'}
        data-onboarding-target={`sentence-${sentenceIndex}-play`}
      >
        {isLoading ? (
          <div className="loader-spinner"></div>
        ) : isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="6" width="3" height="12" fill="currentColor" rx="1" />
            <rect x="14" y="6" width="3" height="12" fill="currentColor" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.31445 6.5C8.32533 6.49867 8.38306 6.49567 8.56055 6.56641C8.73719 6.63681 8.96582 6.75129 9.30957 6.9248L17.958 11.291C17.9608 11.2924 17.964 11.2936 17.9668 11.2949C18.343 11.4848 18.5952 11.6131 18.7715 11.7227C18.9298 11.8211 18.9662 11.8696 18.9707 11.876C19.0093 11.9553 19.0094 12.0447 18.9707 12.124C18.9655 12.1314 18.9276 12.1805 18.7705 12.2783C18.593 12.3887 18.3379 12.5182 17.958 12.71L9.30957 17.0752C8.96567 17.2488 8.73701 17.3634 8.56055 17.4336C8.38339 17.5041 8.32566 17.5014 8.31445 17.5C8.20475 17.4865 8.11413 17.431 8.05957 17.3584C8.0567 17.3539 8.0328 17.3114 8.01758 17.1543C8.00046 16.9776 8 16.7364 8 16.3662V7.63477C8 7.26444 8.00045 7.02263 8.01758 6.8457C8.03473 6.66887 8.06291 6.63716 8.05957 6.6416C8.11415 6.56897 8.20478 6.51347 8.31445 6.5Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Row Menu - Clean Pattern (like TaskRow) */}
      {onMenuOpen && rowMenuItems.length > 0 && (
        <div className="sentence-synthesis-item__menu-container">
          <button
            ref={menuButtonRef}
            className="sentence-synthesis-item__menu-button"
            aria-label="More options"
            onClick={() => onMenuOpen(id)}
            data-onboarding-target={`sentence-${sentenceIndex}-menu`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {openMenuId === id && dropdownPosition && (
            <>
              <div className="sentence-synthesis-item__menu-backdrop" onClick={onMenuClose} />
              <div 
                className="sentence-synthesis-item__dropdown-menu sentence-synthesis-item__dropdown-menu--fixed"
                // Inline styles required for dynamic positioning in scrollable containers
                // Following paper-dropdown pattern with fixed positioning to prevent clipping
                style={{
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                }}
              >
                {rowMenuItems.map((item, index) => (
                  <button
                    key={index}
                    className={`sentence-synthesis-item__menu-item ${item.danger ? 'sentence-synthesis-item__menu-item--danger' : ''}`}
                    onClick={() => {
                      item.onClick(id);
                      onMenuClose && onMenuClose();
                    }}
                  >
                    {item.icon && <span className="sentence-synthesis-item__menu-item-icon">{item.icon}</span>}
                    <div className="sentence-synthesis-item__menu-item-content">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Legacy Menu (for synthesis page complex menu - to be refactored) */}
      {onMenuOpenLegacy && (
        <div className="sentence-synthesis-item__menu-container">
          <button
            className="sentence-synthesis-item__menu-button"
            aria-label="More options"
            onClick={(e) => onMenuOpenLegacy(e, id)}
            data-onboarding-target={`sentence-${sentenceIndex}-menu`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {menuContent}
        </div>
      )}
    </div>
  );
}
