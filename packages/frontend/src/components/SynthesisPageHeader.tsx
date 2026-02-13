// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import AddToTaskDropdown, { type AddToTaskMode } from "./AddToTaskDropdown";
import { PlayAllButton } from "./ui/PlayAllButton";

interface SynthesisPageHeaderProps {
  sentenceCount: number;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  onAddAllClick: () => void;
  onPlayAllClick: () => void;
  showDropdown: boolean;
  onDropdownClose: () => void;
  onSelectTask: (
    taskId: string,
    taskName: string,
    mode: AddToTaskMode,
  ) => void;
  onCreateNew: () => void;
}

export default function SynthesisPageHeader({
  sentenceCount,
  isPlayingAll,
  isLoadingPlayAll,
  onAddAllClick,
  onPlayAllClick,
  showDropdown,
  onDropdownClose,
  onSelectTask,
  onCreateNew,
}: SynthesisPageHeaderProps) {
  return (
    <div className="page-header page-header--full">
      <div className="page-header__content">
        <h1 className="page-header__title">Muuda tekst kõneks</h1>
        <p className="page-header__description">
          Sisesta lause või sõna, et kuulata selle hääldust ja uurida variante
        </p>
      </div>
      <div className="page-header__actions">
        {sentenceCount > 0 && (
          <div className="add-to-task-container">
            <button
              className="button button--secondary"
              onClick={onAddAllClick}
              data-onboarding-target="save-to-task-button"
            >
              Lisa ülesandesse ({sentenceCount})
            </button>
            <AddToTaskDropdown
              isOpen={showDropdown}
              onClose={onDropdownClose}
              onSelectTask={onSelectTask}
              onCreateNew={onCreateNew}
              sentenceCount={sentenceCount}
            />
          </div>
        )}
        {sentenceCount > 1 && (
          <PlayAllButton
            isPlaying={isPlayingAll}
            isLoading={isLoadingPlayAll}
            onClick={onPlayAllClick}
          />
        )}
      </div>
    </div>
  );
}
