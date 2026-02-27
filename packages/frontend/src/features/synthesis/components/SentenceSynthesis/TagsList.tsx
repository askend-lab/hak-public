// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import React from "react";
import { buildTagKeys } from "./tagKeys";

interface TagsListProps {
  id: string;
  tags: string[];
  selectedTagIndex?: number | null | undefined;
  isPronunciationPanelOpen?: boolean | undefined;
  allTagsSelected?: boolean | undefined;
  onTagClick?:
    | ((id: string, tagIndex: number, word: string) => void)
    | undefined;
}

function isTagSelected(p: TagsListProps, index: number): boolean {
  return Boolean(p.isPronunciationPanelOpen && (p.selectedTagIndex === index || p.allTagsSelected));
}

function buildTagItemProps(opts: { id: string; index: number; tag: string; onTagClick?: ((id: string, i: number, w: string) => void) | undefined }) {
  if (!opts.onTagClick) {return { role: undefined, tabIndex: undefined, onClick: undefined, onKeyDown: undefined };}
  const { id, index, tag, onTagClick } = opts;
  return {
    role: "button" as const, tabIndex: 0,
    onClick: () => onTagClick(id, index, tag),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTagClick(id, index, tag); } },
  };
}

function TagItem({ id, tag, index, tagKey, isSelected, onTagClick }: {
  id: string; tag: string; index: number; tagKey: string; isSelected: boolean;
  onTagClick?: ((id: string, tagIndex: number, word: string) => void) | undefined;
}) {
  const clickable = Boolean(onTagClick);
  const cls = `sentence-synthesis-item__tag ${clickable ? "sentence-synthesis-item__tag--clickable" : ""} ${isSelected ? "sentence-synthesis-item__tag--selected" : ""}`;
  const handlers = buildTagItemProps({ id, index, tag, onTagClick });
  return <div key={tagKey} className={cls} {...handlers}>{tag}</div>;
}

export function TagsList(p: TagsListProps): React.ReactElement {
  const tagKeys = buildTagKeys(p.tags);
  return (
    <div className="sentence-synthesis-item__content">
      <div className="sentence-synthesis-item__tags-group">
        {p.tags.map((tag, index) => (
          <TagItem key={tagKeys[index]} id={p.id} tag={tag} index={index} tagKey={tagKeys[index] ?? ""}
            isSelected={isTagSelected(p, index)} onTagClick={p.onTagClick} />
        ))}
      </div>
    </div>
  );
}
