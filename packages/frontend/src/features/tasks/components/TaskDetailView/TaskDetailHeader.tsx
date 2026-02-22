// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { Task } from "@/types/task";
import { PlayAllButton } from "@/components/ui/PlayAllButton";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";

interface TaskDetailHeaderProps {
  task: Task;
  entriesCount: number;
  isLoadingPlayAll: boolean;
  isPlayingAll: boolean;
  isHeaderMenuOpen: boolean;
  setIsHeaderMenuOpen: (open: boolean) => void;
  onShare: () => void;
  onPlayAll: () => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
  onCopyToSynthesis: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskDetailHeader({
  task,
  entriesCount,
  isLoadingPlayAll,
  isPlayingAll,
  isHeaderMenuOpen,
  setIsHeaderMenuOpen,
  onShare,
  onPlayAll,
  onDownloadZip,
  isDownloading,
  onCopyToSynthesis,
  onEditTask,
  onDeleteTask,
}: TaskDetailHeaderProps) {
  const { anchorRef, menuRef, menuStyle } = useDropdownPosition({
    isOpen: isHeaderMenuOpen,
  });

  if (entriesCount === 0) {return null;}

  return (
    <div className="page-header page-header--full">
      <div className="page-header__content">
        <h1 className="page-header__title">{task.name}</h1>
        {task.description && (
          <p className="page-header__description">{task.description}</p>
        )}
      </div>
      <div className="page-header__actions">
        <button onClick={onShare} className="button button--secondary">
          <span>Jaga</span>
        </button>
        <PlayAllButton
          isPlaying={isPlayingAll}
          isLoading={isLoadingPlayAll}
          disabled={entriesCount === 0}
          onClick={onPlayAll}
        />
        <div className="task-detail__menu-container">
          <button
            ref={anchorRef}
            className="task-detail__menu-button"
            aria-label="Rohkem valikuid"
            aria-expanded={isHeaderMenuOpen}
            onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {isHeaderMenuOpen && (
            <>
              <div
                className="task-detail__menu-backdrop"
                onClick={() => setIsHeaderMenuOpen(false)}
                onKeyDown={(e) => { if (e.key === "Escape") {setIsHeaderMenuOpen(false);} }}
                role="presentation"
              />
              <div
                ref={menuRef}
                className={`task-detail__dropdown-menu${menuStyle ? " task-detail__dropdown-menu--fixed" : ""}`}
                style={menuStyle}
              >
                <button
                  className="task-detail__menu-item"
                  onClick={() => {
                    onDownloadZip();
                    setIsHeaderMenuOpen(false);
                  }}
                  disabled={isDownloading}
                >
                  <div className="task-detail__menu-item-content">
                    {isDownloading ? "Laadin..." : "Lae alla ülesande sisu"}
                  </div>
                </button>
                <button
                  className="task-detail__menu-item"
                  onClick={() => {
                    onCopyToSynthesis();
                    setIsHeaderMenuOpen(false);
                  }}
                >
                  <div className="task-detail__menu-item-content">Muuda ülesande lauseid</div>
                </button>
                <button
                  className="task-detail__menu-item"
                  onClick={() => {
                    onEditTask(task.id);
                    setIsHeaderMenuOpen(false);
                  }}
                >
                  <div className="task-detail__menu-item-content">Muuda ülesande kirjeldust</div>
                </button>
                <button
                  className="task-detail__menu-item task-detail__menu-item--danger"
                  onClick={() => {
                    onDeleteTask(task.id);
                    setIsHeaderMenuOpen(false);
                  }}
                >
                  <div className="task-detail__menu-item-content">Kustuta ülesanne</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
