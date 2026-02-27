// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import React from "react";

import { ChevronDownIcon, CloseIcon } from "@/components/ui/Icons";
import { buildTagKeys } from "./tagKeys";

interface TagMenuItem {
  label: string;
  onClick: (sentenceId: string, tagIndex: number, word: string) => void;
  danger?: boolean;
}

interface EditingTag {
  sentenceId: string;
  tagIndex: number;
  value: string;
}

interface OpenTagMenu {
  sentenceId: string;
  tagIndex: number;
}

interface TagsInputProps {
  id: string;
  tags: string[];
  currentInput: string;
  placeholder?: string | undefined;
  sentenceIndex: number;
  selectedTagIndex?: number | null | undefined;
  isPronunciationPanelOpen?: boolean | undefined;
  allTagsSelected?: boolean | undefined;
  openTagMenu?: OpenTagMenu | null | undefined;
  tagMenuItems: TagMenuItem[];
  loadingTagIndex?: number | null | undefined;
  onTagMenuOpen?: ((sentenceId: string, tagIndex: number) => void) | undefined;
  onTagMenuClose?: (() => void) | undefined;
  editingTag?: EditingTag | null | undefined;
  onEditTagChange?: ((value: string) => void) | undefined;
  onEditTagKeyDown?: ((e: React.KeyboardEvent) => void) | undefined;
  onEditTagCommit?: (() => void) | undefined;
  onInputChange?: ((id: string, value: string) => void) | undefined;
  onInputKeyDown?: ((e: React.KeyboardEvent) => void) | undefined;
  onInputBlur?: ((id: string) => void) | undefined;
  onClear?: ((id: string) => void) | undefined;
}

function handleDropdownKeyDown(e: React.KeyboardEvent, onClose?: () => void): void {
  if (e.key === "Escape") {
    e.preventDefault(); e.stopPropagation();
    onClose?.();
    const tagEl = e.currentTarget.closest(".sentence-synthesis-item__tag");
    if (tagEl instanceof HTMLElement) {tagEl.focus();}
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const items = e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]');
    const cur = [...items].indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (cur + 1) % items.length : (cur - 1 + items.length) % items.length;
    items[next]?.focus();
  }
}

function TagDropdown({ id, index, tag, items, onClose }: { id: string; index: number; tag: string; items: TagMenuItem[]; onClose?: (() => void) | undefined }) {
  if (items.length === 0) {return null;}
  return (
    <>
      <div className="sentence-synthesis-item__tag-menu-backdrop" onClick={() => onClose?.()} onKeyDown={(e) => { if (e.key === "Escape") {onClose?.();} }} role="presentation" />
      <div className="sentence-synthesis-item__tag-dropdown" role="menu" tabIndex={-1} aria-label="Sõna valikud"
        ref={(el) => { el?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(); }}
        onKeyDown={(e) => handleDropdownKeyDown(e, onClose)} onClick={(e) => e.stopPropagation()}>
        {items.map((item) => (
          <button key={item.label} className={`sentence-synthesis-item__tag-menu-item ${item.danger ? "sentence-synthesis-item__tag-menu-item--danger" : ""}`}
            role="menuitem" onClick={() => { item.onClick(id, index, tag); onClose?.(); }}>
            <div className="sentence-synthesis-item__tag-menu-item-content">{item.label}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function TagChip({ id, index, tag, isSelected, isMenuOpen, isLoading, onOpen, onClose, sentenceIndex, menuItems }: {
  id: string; index: number; tag: string; isSelected: boolean; isMenuOpen: boolean;
  isLoading: boolean; onOpen?: ((id: string, idx: number) => void) | undefined; onClose?: (() => void) | undefined;
  sentenceIndex: number; menuItems: TagMenuItem[];
}) {
  const tagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen?.(id, index); }
    else if (e.key === "Escape" && isMenuOpen) { e.preventDefault(); e.stopPropagation(); onClose?.(); }
  };
  return (
    <div className={`sentence-synthesis-item__tag sentence-synthesis-item__tag--clickable ${isSelected ? "sentence-synthesis-item__tag--selected" : ""}`}
      onClick={() => onOpen?.(id, index)} role="button" tabIndex={0} aria-haspopup="menu" aria-expanded={isMenuOpen}
      onKeyDown={tagKeyDown} data-onboarding-target={`sentence-${sentenceIndex}-tag-${index}`}>
      <span className="sentence-synthesis-item__tag-text">{tag}</span>
      {isLoading
        ? <span className="sentence-synthesis-item__tag-spinner" aria-label="Laen variante" />
        : <span className="sentence-synthesis-item__tag-chevron" aria-hidden="true"><ChevronDownIcon size="xs" /></span>}
      {isMenuOpen && <TagDropdown id={id} index={index} tag={tag} items={menuItems} onClose={onClose} />}
    </div>
  );
}

function isEditingTag(editingTag: EditingTag | null | undefined, id: string, index: number): editingTag is EditingTag {
  return editingTag?.sentenceId === id && editingTag?.tagIndex === index;
}

function EditTagInput({ editingTag, tagKey, onChange, onKeyDown, onCommit }: {
  editingTag: EditingTag; tagKey: string; onChange: (v: string) => void; onKeyDown: (e: React.KeyboardEvent) => void; onCommit: () => void;
}) {
  return <input key={tagKey} type="text" className="sentence-synthesis-item__tag-edit-input" aria-label="Muuda silti"
    value={editingTag.value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown}
    onBlur={onCommit} size={Math.max(editingTag.value.length + 2, 4)} spellCheck={false} autoFocus />;
}

function TagsInputField({ id, tags, currentInput, placeholder, onInputChange, onInputKeyDown, onInputBlur, onClear }: {
  id: string; tags: string[]; currentInput: string; placeholder?: string | undefined;
  onInputChange?: ((id: string, v: string) => void) | undefined; onInputKeyDown?: ((e: React.KeyboardEvent) => void) | undefined;
  onInputBlur?: ((id: string) => void) | undefined; onClear?: ((id: string) => void) | undefined;
}) {
  return (
    <>
      {onInputChange && (
        <input type="text" className="sentence-synthesis-item__input" aria-label="Sisesta lause"
          placeholder={tags.length === 0 ? (placeholder || "Kirjuta sõna või lause ja vajuta Enter") : ""}
          value={currentInput} onChange={(e) => onInputChange(id, e.target.value)} onKeyDown={onInputKeyDown}
          onBlur={() => onInputBlur?.(id)} maxLength={100} spellCheck={false} />
      )}
      {(tags.length > 0 || currentInput) && onClear && (
        <button onClick={() => onClear(id)} className="sentence-synthesis-item__clear-button" aria-label="Tühjenda kõik"><CloseIcon size="sm" /></button>
      )}
    </>
  );
}

function canEdit(props: TagsInputProps): props is TagsInputProps & { onEditTagChange: (v: string) => void; onEditTagKeyDown: (e: React.KeyboardEvent) => void; onEditTagCommit: () => void } {
  return Boolean(props.onEditTagChange && props.onEditTagKeyDown && props.onEditTagCommit);
}

function isTagSelected(props: TagsInputProps, index: number): boolean {
  return Boolean(props.isPronunciationPanelOpen && (props.selectedTagIndex === index || props.allTagsSelected));
}

function isTagMenuOpen(props: TagsInputProps, index: number): boolean {
  return props.openTagMenu?.sentenceId === props.id && props.openTagMenu?.tagIndex === index;
}

function TagItemRenderer({ tag, index, tagKey, props }: { tag: string; index: number; tagKey: string; props: TagsInputProps }): React.ReactElement {
  if (isEditingTag(props.editingTag, props.id, index) && canEdit(props)) {
    return <EditTagInput editingTag={props.editingTag} tagKey={tagKey} onChange={props.onEditTagChange} onKeyDown={props.onEditTagKeyDown} onCommit={props.onEditTagCommit} />;
  }
  return <TagChip id={props.id} index={index} tag={tag} isSelected={isTagSelected(props, index)} isMenuOpen={isTagMenuOpen(props, index)}
    isLoading={props.loadingTagIndex === index} onOpen={props.onTagMenuOpen} onClose={props.onTagMenuClose} sentenceIndex={props.sentenceIndex} menuItems={props.tagMenuItems} />;
}

export function TagsInput(props: TagsInputProps): React.ReactElement {
  const { id, tags, currentInput, placeholder, sentenceIndex, onInputChange, onInputKeyDown, onInputBlur, onClear } = props;
  const tagKeys = buildTagKeys(tags);
  return (
    <div className="sentence-synthesis-item__content">
      <div className="sentence-synthesis-item__tags-group" lang="et" data-onboarding-target={`sentence-${sentenceIndex}-input`}>
        {tags.map((tag, index) => <TagItemRenderer key={tagKeys[index]} tag={tag} index={index} tagKey={tagKeys[index] ?? ""} props={props} />)}
        <TagsInputField id={id} tags={tags} currentInput={currentInput} placeholder={placeholder}
          onInputChange={onInputChange} onInputKeyDown={onInputKeyDown} onInputBlur={onInputBlur} onClear={onClear} />
      </div>
    </div>
  );
}
