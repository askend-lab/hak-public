// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

"use client";

import React from "react";

import { ChevronDownIcon, CloseIcon } from "../ui/Icons";

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

  // Tag selection
  selectedTagIndex?: number | null | undefined;
  isPronunciationPanelOpen?: boolean | undefined;
  allTagsSelected?: boolean | undefined;

  // Tag menu
  openTagMenu?: OpenTagMenu | null | undefined;
  tagMenuItems: TagMenuItem[];
  loadingTagIndex?: number | null | undefined;
  onTagMenuOpen?: ((sentenceId: string, tagIndex: number) => void) | undefined;
  onTagMenuClose?: (() => void) | undefined;

  // Tag editing
  editingTag?: EditingTag | null | undefined;
  onEditTagChange?: ((value: string) => void) | undefined;
  onEditTagKeyDown?: ((e: React.KeyboardEvent) => void) | undefined;
  onEditTagCommit?: (() => void) | undefined;

  // Input
  onInputChange?: ((id: string, value: string) => void) | undefined;
  onInputKeyDown?: ((e: React.KeyboardEvent) => void) | undefined;
  onInputBlur?: ((id: string) => void) | undefined;
  onClear?: ((id: string) => void) | undefined;
}

export function TagsInput({
  id,
  tags,
  currentInput,
  placeholder,
  sentenceIndex,
  selectedTagIndex,
  isPronunciationPanelOpen,
  allTagsSelected,
  openTagMenu,
  tagMenuItems,
  loadingTagIndex,
  onTagMenuOpen,
  onTagMenuClose,
  editingTag,
  onEditTagChange,
  onEditTagKeyDown,
  onEditTagCommit,
  onInputChange,
  onInputKeyDown,
  onInputBlur,
  onClear,
}: TagsInputProps): React.ReactElement {
  return (
    <div className="sentence-synthesis-item__content">
      <div
        className="sentence-synthesis-item__tags-group"
        lang="et"
        data-onboarding-target={`sentence-${sentenceIndex}-input`}
      >
        {tags.map((tag, index) => {
          const isSelected =
            (isPronunciationPanelOpen && selectedTagIndex === index) ||
            (isPronunciationPanelOpen && allTagsSelected);
          const isMenuOpen =
            openTagMenu?.sentenceId === id && openTagMenu?.tagIndex === index;
          const isEditing =
            editingTag?.sentenceId === id && editingTag?.tagIndex === index;

          if (
            isEditing &&
            onEditTagChange &&
            onEditTagKeyDown &&
            onEditTagCommit
          ) {
            return (
              <input
                key={index}
                type="text"
                className="sentence-synthesis-item__tag-edit-input"
                aria-label="Muuda silti"
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
              className={`sentence-synthesis-item__tag sentence-synthesis-item__tag--clickable ${isSelected ? "sentence-synthesis-item__tag--selected" : ""}`}
              onClick={() => onTagMenuOpen && onTagMenuOpen(id, index)}
              role="button"
              tabIndex={0}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTagMenuOpen && onTagMenuOpen(id, index);
                } else if (e.key === "Escape" && isMenuOpen) {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagMenuClose && onTagMenuClose();
                }
              }}
              data-onboarding-target={`sentence-${sentenceIndex}-tag-${index}`}
            >
              <span className="sentence-synthesis-item__tag-text">{tag}</span>
              {loadingTagIndex === index ? (
                <span
                  className="sentence-synthesis-item__tag-spinner"
                  aria-label="Laen variante"
                />
              ) : (
                <span
                  className="sentence-synthesis-item__tag-chevron"
                  aria-hidden="true"
                >
                  <ChevronDownIcon size="xs" />
                </span>
              )}
              {isMenuOpen && tagMenuItems.length > 0 && (
                <>
                  <div
                    className="sentence-synthesis-item__tag-menu-backdrop"
                    onClick={() => onTagMenuClose && onTagMenuClose()}
                    onKeyDown={(e) => { if (e.key === "Escape") onTagMenuClose?.(); }}
                    role="presentation"
                  />
                  <div
                    className="sentence-synthesis-item__tag-dropdown"
                    role="menu"
                    tabIndex={-1}
                    aria-label="Sõna valikud"
                    ref={(el) => {
                      if (el) {
                        const firstItem =
                          el.querySelector<HTMLElement>('[role="menuitem"]');
                        firstItem?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        e.stopPropagation();
                        onTagMenuClose && onTagMenuClose();
                        const tagEl = e.currentTarget.closest(
                          ".sentence-synthesis-item__tag",
                        );
                        if (tagEl instanceof HTMLElement) {
                          tagEl.focus();
                        }
                      } else if (
                        e.key === "ArrowDown" ||
                        e.key === "ArrowUp"
                      ) {
                        e.preventDefault();
                        const items =
                          e.currentTarget.querySelectorAll<HTMLElement>(
                            '[role="menuitem"]',
                          );
                        const currentIndex = Array.from(items).indexOf(
                          document.activeElement as HTMLElement,
                        );
                        const nextIndex =
                          e.key === "ArrowDown"
                            ? (currentIndex + 1) % items.length
                            : (currentIndex - 1 + items.length) % items.length;
                        items[nextIndex]?.focus();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tagMenuItems.map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        className={`sentence-synthesis-item__tag-menu-item ${item.danger ? "sentence-synthesis-item__tag-menu-item--danger" : ""}`}
                        role="menuitem"
                        onClick={() => {
                          item.onClick(id, index, tag);
                          onTagMenuClose && onTagMenuClose();
                        }}
                      >
                        <div className="sentence-synthesis-item__tag-menu-item-content">
                          {item.label}
                        </div>
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
            aria-label="Sisesta lause"
            placeholder={
              tags.length === 0
                ? placeholder || "Kirjuta sõna või lause ja vajuta Enter"
                : ""
            }
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
            aria-label="Tühjenda kõik"
          >
            <CloseIcon size="sm" />
          </button>
        )}
      </div>
    </div>
  );
}
