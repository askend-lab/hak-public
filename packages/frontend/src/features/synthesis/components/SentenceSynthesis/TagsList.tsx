// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import React from "react";

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

export function TagsList({
  id,
  tags,
  selectedTagIndex,
  isPronunciationPanelOpen,
  allTagsSelected,
  onTagClick,
}: TagsListProps): React.ReactElement {
  return (
    <div className="sentence-synthesis-item__content">
      <div className="sentence-synthesis-item__tags-group">
        {tags.map((tag, index) => {
          const isSelected =
            (isPronunciationPanelOpen && selectedTagIndex === index) ||
            (isPronunciationPanelOpen && allTagsSelected);
          return (
            // eslint-disable-next-line react/no-array-index-key -- tag identity is its position in the sentence
            <div key={index}
              className={`sentence-synthesis-item__tag ${onTagClick ? "sentence-synthesis-item__tag--clickable" : ""} ${isSelected ? "sentence-synthesis-item__tag--selected" : ""}`}
              onClick={
                onTagClick ? () => onTagClick(id, index, tag) : undefined
              }
              role={onTagClick ? "button" : undefined}
              tabIndex={onTagClick ? 0 : undefined}
              onKeyDown={
                onTagClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onTagClick(id, index, tag);
                      }
                    }
                  : undefined
              }
            >
              {tag}
            </div>
          );
        })}
      </div>
    </div>
  );
}
