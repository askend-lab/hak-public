// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import React, { useCallback, useRef } from "react";
import { DragHandleIcon, MoreIcon } from "@/components/ui/Icons";
import { PlayButton, RowMenu, TagsInput, TagsList } from "./SentenceSynthesis";

function setContainerOpacity(ref: React.RefObject<HTMLDivElement | null>, opacity: string): void {
  const el = ref.current;
  if (el) { el.style.opacity = opacity; }
}

function useDragStartHandler(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onDragStart: ((e: React.DragEvent, id: string) => void) | undefined,
  id: string,
) {
  return useCallback((e: React.DragEvent): void => {
    if (containerRef.current) {
      e.dataTransfer.setDragImage(containerRef.current, 20, containerRef.current.offsetHeight / 2);
      setTimeout(() => { setContainerOpacity(containerRef, "0.5"); }, 0);
    }
    onDragStart?.(e, id);
  }, [containerRef, onDragStart, id]);
}

function useDragEndHandler(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onDragEnd: ((e: React.DragEvent) => void) | undefined,
) {
  return useCallback((e: React.DragEvent): void => {
    setContainerOpacity(containerRef, "1");
    onDragEnd?.(e);
  }, [containerRef, onDragEnd]);
}

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

function resolveArrayDefaults(p: SentenceSynthesisItemProps) {
  return {
    tags: p.tags ?? [], tagMenuItems: p.tagMenuItems ?? [], rowMenuItems: p.rowMenuItems ?? [],
    currentInput: p.currentInput ?? "", className: p.className ?? "", sentenceIndex: p.sentenceIndex ?? 0,
  };
}

function resolveBoolDefaults(p: SentenceSynthesisItemProps) {
  return {
    draggable: p.draggable ?? false, isDragging: p.isDragging ?? false, isDragOver: p.isDragOver ?? false,
    isPlaying: p.isPlaying ?? false, isLoading: p.isLoading ?? false,
  };
}

function resolveDefaults(p: SentenceSynthesisItemProps) {
  return { ...resolveArrayDefaults(p), ...resolveBoolDefaults(p) };
}

function ItemContent(p: SentenceSynthesisItemProps & { tags: string[]; currentInput: string; tagMenuItems: NonNullable<SentenceSynthesisItemProps["tagMenuItems"]>; sentenceIndex: number }): React.ReactElement {
  if (p.mode === "input") {
    return <TagsInput id={p.id} tags={p.tags} currentInput={p.currentInput} placeholder={p.placeholder} sentenceIndex={p.sentenceIndex}
      selectedTagIndex={p.selectedTagIndex} isPronunciationPanelOpen={p.isPronunciationPanelOpen} allTagsSelected={p.allTagsSelected}
      openTagMenu={p.openTagMenu} tagMenuItems={p.tagMenuItems} loadingTagIndex={p.loadingTagIndex} onTagMenuOpen={p.onTagMenuOpen} onTagMenuClose={p.onTagMenuClose}
      editingTag={p.editingTag} onEditTagChange={p.onEditTagChange} onEditTagKeyDown={p.onEditTagKeyDown} onEditTagCommit={p.onEditTagCommit}
      onInputChange={p.onInputChange} onInputKeyDown={p.onInputKeyDown} onInputBlur={p.onInputBlur} onClear={p.onClear} />;
  }
  if (p.mode === "tags") {
    return <TagsList id={p.id} tags={p.tags} selectedTagIndex={p.selectedTagIndex} isPronunciationPanelOpen={p.isPronunciationPanelOpen} allTagsSelected={p.allTagsSelected} onTagClick={p.onTagClick} />;
  }
  return <div className="sentence-synthesis-item__content"><div className="sentence-synthesis-item__text-readonly">{p.text}</div></div>;
}

function ItemMenus({ p, d }: { p: SentenceSynthesisItemProps; d: ReturnType<typeof resolveDefaults> }) {
  return (
    <>
      {p.onMenuOpen && d.rowMenuItems.length > 0 && p.onMenuClose && (
        <RowMenu id={p.id} isOpen={p.openMenuId === p.id} items={d.rowMenuItems} onOpen={p.onMenuOpen} onClose={p.onMenuClose} data-onboarding-target={`sentence-${d.sentenceIndex}-menu`} />
      )}
      {p.onMenuOpenLegacy && (
        <div className="sentence-synthesis-item__menu-container">
          <button className="sentence-synthesis-item__menu-button" aria-label="Rohkem valikuid" onClick={(e) => p.onMenuOpenLegacy?.(e, p.id)} data-onboarding-target={`sentence-${d.sentenceIndex}-menu`}><MoreIcon size="2xl" /></button>
          {p.menuContent}
        </div>
      )}
    </>
  );
}

function isPlayDisabled(p: SentenceSynthesisItemProps, d: ReturnType<typeof resolveDefaults>): boolean {
  return d.isLoading || (p.mode === "input" && d.tags.length === 0 && !d.currentInput.trim());
}

function buildContainerCls(d: ReturnType<typeof resolveDefaults>): string {
  return ["sentence-synthesis-item", d.isDragging && "sentence-synthesis-item--dragging", d.isDragOver && "sentence-synthesis-item--drag-over", d.className].filter(Boolean).join(" ");
}

function SentenceSynthesisItem(p: SentenceSynthesisItemProps): React.ReactElement {
  const d = resolveDefaults(p);
  const containerRef = useRef<HTMLDivElement>(null);
  const onDragStartInt = useDragStartHandler(containerRef, p.onDragStart, p.id);
  const onDragEndInt = useDragEndHandler(containerRef, p.onDragEnd);

  return (
    <div ref={containerRef} className={buildContainerCls(d)} onDragOver={p.onDragOver ? (e) => p.onDragOver?.(e, p.id) : undefined} onDragLeave={p.onDragLeave} onDrop={p.onDrop ? (e) => p.onDrop?.(e, p.id) : undefined}>
      {d.draggable && p.mode !== "readonly" && (
        <div className="sentence-synthesis-item__drag-handle" role="button" tabIndex={0} draggable onDragStart={onDragStartInt} onDragEnd={onDragEndInt} aria-label="Lohista järjestamiseks"><DragHandleIcon size="2xl" /></div>
      )}
      <ItemContent {...p} tags={d.tags} currentInput={d.currentInput} tagMenuItems={d.tagMenuItems} sentenceIndex={d.sentenceIndex} />
      <PlayButton isPlaying={d.isPlaying} isLoading={d.isLoading} disabled={isPlayDisabled(p, d)} onClick={() => p.onPlay(p.id)} data-onboarding-target={`sentence-${d.sentenceIndex}-play`} />
      <ItemMenus p={p} d={d} />
    </div>
  );
}

export default React.memo(SentenceSynthesisItem);
