 
'use client';

import React from 'react';

interface TagsListProps {
  id: string;
  tags: string[];
  selectedTagIndex?: number | null | undefined;
  isPronunciationPanelOpen?: boolean | undefined;
  onTagClick?: ((id: string, tagIndex: number, word: string) => void) | undefined;
}

export function TagsList({
  id,
  tags,
  selectedTagIndex,
  isPronunciationPanelOpen,
  onTagClick
}: TagsListProps): React.ReactElement {
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
}
