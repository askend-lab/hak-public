/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, DragHandleIcon, PlayIcon, PauseIcon, MoreIcon, CloseIcon } from './ui/Icons';

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
  
  // Tag loading state (for variants prefetch)
  loadingTagIndex?: number | null;
  
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
  loadingTagIndex,
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
                  <div key={index} className={`sentence-synthesis-item__tag sentence-synthesis-item__tag--clickable ${isSelected ? 'sentence-synthesis-item__tag--selected' : ''}`} onClick={() => onTagMenuOpen && onTagMenuOpen(id, index)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTagMenuOpen && onTagMenuOpen(id, index); } }} data-onboarding-target={`sentence-${sentenceIndex}-tag-${index}`}>
                    <span className="sentence-synthesis-item__tag-text">{tag}</span>
                    {loadingTagIndex === index ? (
                      <span className="sentence-synthesis-item__tag-spinner" aria-label="Laen variante" />
                    ) : (
                      <span className="sentence-synthesis-item__tag-chevron" aria-hidden="true"><ChevronDownIcon size="xs" /></span>
                    )}
                    {isMenuOpen && tagMenuItems.length > 0 && (<><div className="sentence-synthesis-item__tag-menu-backdrop" onClick={() => onTagMenuClose && onTagMenuClose()} /><div className="sentence-synthesis-item__tag-dropdown" onClick={(e) => e.stopPropagation()}>{tagMenuItems.map((item, itemIndex) => <button key={itemIndex} className={`sentence-synthesis-item__tag-menu-item ${item.danger ? 'sentence-synthesis-item__tag-menu-item--danger' : ''}`} onClick={() => { item.onClick(id, index, tag); onTagMenuClose && onTagMenuClose(); }}><div className="sentence-synthesis-item__tag-menu-item-content">{item.label}</div></button>)}</div></>)}
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
                  <CloseIcon size="sm" />
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
    <div ref={containerRef} className={containerClasses} onDragOver={onDragOver ? (e) => onDragOver(e, id) : undefined} onDragLeave={onDragLeave} onDrop={onDrop ? (e) => onDrop(e, id) : undefined}>
      {draggable && mode !== 'readonly' && <div className="sentence-synthesis-item__drag-handle" draggable onDragStart={handleDragStartInternal} onDragEnd={handleDragEndInternal} aria-label="Drag to reorder"><DragHandleIcon size="2xl" /></div>}
      {renderContent()}
      <button className={`sentence-synthesis-item__play button button--primary button--icon-only button--circular ${isLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`} onClick={() => onPlay(id)} disabled={isLoading || (mode === 'input' && tags.length === 0 && !currentInput.trim())} aria-label={isLoading ? 'Loading' : isPlaying ? 'Playing' : 'Play'} data-onboarding-target={`sentence-${sentenceIndex}-play`}>{isLoading ? <div className="loader-spinner"></div> : isPlaying ? <PauseIcon size="2xl" /> : <PlayIcon size="2xl" />}</button>
      {onMenuOpen && rowMenuItems.length > 0 && (
        <div className="sentence-synthesis-item__menu-container">
          <button ref={menuButtonRef} className="sentence-synthesis-item__menu-button" aria-label="More options" onClick={() => onMenuOpen(id)} data-onboarding-target={`sentence-${sentenceIndex}-menu`}><MoreIcon size="2xl" /></button>
          {openMenuId === id && dropdownPosition && (<><div className="sentence-synthesis-item__menu-backdrop" onClick={onMenuClose} /><div className="sentence-synthesis-item__dropdown-menu sentence-synthesis-item__dropdown-menu--fixed" style={{ top: `${dropdownPosition.top}px`, right: `${dropdownPosition.right}px` }}>{rowMenuItems.map((item, index) => <button key={index} className={`sentence-synthesis-item__menu-item ${item.danger ? 'sentence-synthesis-item__menu-item--danger' : ''}`} onClick={() => { item.onClick(id); onMenuClose && onMenuClose(); }}>{item.icon && <span className="sentence-synthesis-item__menu-item-icon">{item.icon}</span>}<div className="sentence-synthesis-item__menu-item-content">{item.label}</div></button>)}</div></>)}
        </div>
      )}
      {onMenuOpenLegacy && <div className="sentence-synthesis-item__menu-container"><button className="sentence-synthesis-item__menu-button" aria-label="More options" onClick={(e) => onMenuOpenLegacy(e, id)} data-onboarding-target={`sentence-${sentenceIndex}-menu`}><MoreIcon size="2xl" /></button>{menuContent}</div>}
    </div>
  );
}
