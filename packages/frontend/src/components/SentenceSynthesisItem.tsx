// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import React, { useRef } from "react";
import { DragHandleIcon, MoreIcon } from "./ui/Icons";
import { PlayButton, RowMenu, TagsInput, TagsList } from "./SentenceSynthesis";

interface SentenceSynthesisItemProps {
  // Identity
  id: string;

  // Content
  text: string;
  tags?: string[];
  stressedTags?: string[];

  // Display mode
  mode: "input" | "tags" | "readonly";

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
  allTagsSelected?: boolean;

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
  menuContent?: React.ReactNode;
  onMenuOpenLegacy?: (e: React.MouseEvent, id: string) => void;

  // Visual states
  className?: string;
  sentenceIndex?: number;
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
  allTagsSelected,
  onTagMenuOpen,
  openTagMenu,
  onTagMenuClose,
  tagMenuItems = [],
  loadingTagIndex,
  editingTag,
  onEditTagChange,
  onEditTagKeyDown,
  onEditTagCommit,
  currentInput = "",
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
  className = "",
  sentenceIndex = 0,
}: SentenceSynthesisItemProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStartInternal = (e: React.DragEvent): void => {
    if (containerRef.current) {
      e.dataTransfer.setDragImage(
        containerRef.current,
        20,
        containerRef.current.offsetHeight / 2,
      );
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = "0.5";
        }
      }, 0);
    }
    if (onDragStart) {
      onDragStart(e, id);
    }
  };

  const handleDragEndInternal = (e: React.DragEvent): void => {
    if (containerRef.current) {
      containerRef.current.style.opacity = "1";
    }
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const containerClasses = [
    "sentence-synthesis-item",
    isDragging && "sentence-synthesis-item--dragging",
    isDragOver && "sentence-synthesis-item--drag-over",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderContent = (): React.ReactElement => {
    switch (mode) {
      case "input":
        return (
          <TagsInput
            id={id}
            tags={tags}
            currentInput={currentInput}
            placeholder={placeholder}
            sentenceIndex={sentenceIndex}
            selectedTagIndex={selectedTagIndex}
            isPronunciationPanelOpen={isPronunciationPanelOpen}
            allTagsSelected={allTagsSelected}
            openTagMenu={openTagMenu}
            tagMenuItems={tagMenuItems}
            loadingTagIndex={loadingTagIndex}
            onTagMenuOpen={onTagMenuOpen}
            onTagMenuClose={onTagMenuClose}
            editingTag={editingTag}
            onEditTagChange={onEditTagChange}
            onEditTagKeyDown={onEditTagKeyDown}
            onEditTagCommit={onEditTagCommit}
            onInputChange={onInputChange}
            onInputKeyDown={onInputKeyDown}
            onInputBlur={onInputBlur}
            onClear={onClear}
          />
        );

      case "tags":
        return (
          <TagsList
            id={id}
            tags={tags}
            selectedTagIndex={selectedTagIndex}
            isPronunciationPanelOpen={isPronunciationPanelOpen}
            allTagsSelected={allTagsSelected}
            onTagClick={onTagClick}
          />
        );

      case "readonly":
        return (
          <div className="sentence-synthesis-item__content">
            <div className="sentence-synthesis-item__text-readonly">{text}</div>
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
      {draggable && mode !== "readonly" && (
        <div
          className="sentence-synthesis-item__drag-handle"
          draggable
          onDragStart={handleDragStartInternal}
          onDragEnd={handleDragEndInternal}
          aria-label="Lohista järjestamiseks"
        >
          <DragHandleIcon size="2xl" />
        </div>
      )}

      {renderContent()}

      <PlayButton
        isPlaying={isPlaying}
        isLoading={isLoading}
        disabled={
          isLoading ||
          (mode === "input" && tags.length === 0 && !currentInput.trim())
        }
        onClick={() => onPlay(id)}
        data-onboarding-target={`sentence-${sentenceIndex}-play`}
      />

      {onMenuOpen && rowMenuItems.length > 0 && onMenuClose && (
        <RowMenu
          id={id}
          isOpen={openMenuId === id}
          items={rowMenuItems}
          onOpen={onMenuOpen}
          onClose={onMenuClose}
          data-onboarding-target={`sentence-${sentenceIndex}-menu`}
        />
      )}

      {onMenuOpenLegacy && (
        <div className="sentence-synthesis-item__menu-container">
          <button
            className="sentence-synthesis-item__menu-button"
            aria-label="Rohkem valikuid"
            onClick={(e) => onMenuOpenLegacy(e, id)}
            data-onboarding-target={`sentence-${sentenceIndex}-menu`}
          >
            <MoreIcon size="2xl" />
          </button>
          {menuContent}
        </div>
      )}
    </div>
  );
}
