// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState } from "react";
import { SearchIcon, AddIcon, ChevronRightIcon, BackIcon } from "./ui/Icons";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";

interface Task {
  id: string;
  name: string;
  description?: string;
  shareToken?: string;
}

interface SentenceMenuProps {
  isAuthenticated: boolean;
  sentenceId: string;
  sentenceText: string;
  menuSearchQuery: string;
  onSearchChange: (value: string) => void;
  isLoadingTasks: boolean;
  tasks: Task[];
  onAddToTask: (sentenceId: string, taskId: string, taskName: string) => void;
  onCreateNewTask: (sentenceId: string) => void;
  onExplorePhonetic: (sentenceId: string) => void;
  onDownload: (sentenceId: string) => void;
  onCopyText: (sentenceId: string) => void;
  onRemove: (sentenceId: string) => void;
  onLogin: () => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null | undefined;
}

const TasksSubPanel = ({
  sentenceId,
  hasText,
  menuSearchQuery,
  onSearchChange,
  isLoadingTasks,
  filteredTasks,
  onAddToTask,
  onCreateNewTask,
  onClose,
  onBack,
}: {
  sentenceId: string;
  hasText: boolean;
  menuSearchQuery: string;
  onSearchChange: (v: string) => void;
  isLoadingTasks: boolean;
  filteredTasks: Task[];
  onAddToTask: (sid: string, tid: string, tn: string) => void;
  onCreateNewTask: (sid: string) => void;
  onClose: () => void;
  onBack: () => void;
}) => (
  <>
    <div className="synthesis__menu-panel-header">
      <button
        onClick={onBack}
        className="synthesis__menu-back-button"
        aria-label="Tagasi"
        type="button"
      >
        <BackIcon size="lg" />
      </button>
      <h4 className="synthesis__menu-panel-title">Lisa ülesandesse</h4>
    </div>
    <div className="synthesis__menu-search">
      <label htmlFor="menu-search" className="visually-hidden">
        Otsi ülesandeid
      </label>
      <input
        id="menu-search"
        type="text"
        className="synthesis__menu-search-input"
        placeholder="Otsi"
        value={menuSearchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />
      <SearchIcon size="2xl" className="synthesis__menu-search-icon" />
    </div>
    <div
      className="synthesis__menu-task-list"
      role="group"
      aria-label="Ülesanded"
    >
      {isLoadingTasks ? (
        <div
          className="synthesis__menu-item synthesis__menu-item--loading"
          aria-busy="true"
        >
          <div className="synthesis__menu-item-content">Laen...</div>
        </div>
      ) : (
        filteredTasks.map((task) => (
          <button
            key={task.id}
            className="synthesis__menu-item"
            role="menuitem"
            onClick={() => {
              onAddToTask(sentenceId, task.id, task.name);
              onClose();
            }}
            disabled={!hasText}
          >
            <div className="synthesis__menu-item-content">{task.name}</div>
          </button>
        ))
      )}
    </div>
    <div className="synthesis__menu-create-section">
      <button
        className="synthesis__menu-item synthesis__menu-item--create"
        role="menuitem"
        onClick={() => {
          onCreateNewTask(sentenceId);
          onClose();
        }}
        disabled={!hasText}
      >
        <span className="synthesis__menu-item-create-icon" aria-hidden="true">
          <AddIcon size="sm" />
        </span>
        <div className="synthesis__menu-item-content">Loo uus ülesanne</div>
      </button>
    </div>
  </>
);

export default function SentenceMenu({
  isAuthenticated,
  sentenceId,
  sentenceText,
  menuSearchQuery,
  onSearchChange,
  isLoadingTasks,
  tasks,
  onAddToTask,
  onCreateNewTask,
  onExplorePhonetic,
  onDownload,
  onCopyText,
  onRemove,
  onLogin,
  onClose,
  anchorEl,
}: SentenceMenuProps) {
  const [activePanel, setActivePanel] = useState<"main" | "tasks">("main");
  const hasText = sentenceText.trim().length > 0;
  const filteredTasks = tasks.filter((t) =>
    t.name.toLowerCase().includes(menuSearchQuery.toLowerCase()),
  );
  const { menuRef, menuStyle } = useDropdownPosition({
    isOpen: true, // SentenceMenu is only rendered when open
    anchorEl: anchorEl ?? null,
    contentDeps: [isLoadingTasks, tasks.length, activePanel],
  });

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      if (activePanel === "tasks") {
        setActivePanel("main");
      } else {
        onClose();
      }
    }
  };

  const handleClose = () => {
    setActivePanel("main"); // Reset to main panel when closing
    onClose();
  };

  const handleOpenTasks = () => {
    setActivePanel("tasks");
  };

  const handleBackToMain = () => {
    setActivePanel("main");
  };

  const useFixedPositioning = !!anchorEl && !!menuStyle;
  const menuClassName = `synthesis__dropdown-menu synthesis__dropdown-menu--with-search${useFixedPositioning ? " synthesis__dropdown-menu--fixed" : ""}`;

  return (
    <>
      <div
        className="synthesis__menu-backdrop"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={menuRef}
        className={menuClassName}
        role="menu"
        tabIndex={-1}
        aria-label="Lausungi valikud"
        onKeyDown={handleKeyDown}
        style={menuStyle}
      >
        {activePanel === "main" ? (
          <>
            {isAuthenticated ? (
              <button
                className="synthesis__menu-item synthesis__menu-item--submenu"
                role="menuitem"
                aria-haspopup="true"
                onClick={handleOpenTasks}
                disabled={!hasText}
              >
                <div className="synthesis__menu-item-content">
                  Lisa ülesandesse
                </div>
                <ChevronRightIcon
                  size="lg"
                  className="synthesis__menu-item-chevron"
                />
              </button>
            ) : (
              <button
                className="synthesis__menu-item"
                role="menuitem"
                onClick={() => {
                  handleClose();
                  onLogin();
                }}
                disabled={!hasText}
              >
                <div className="synthesis__menu-item-content">
                  Lisa ülesandesse
                </div>
              </button>
            )}
            <button
              className="synthesis__menu-item"
              role="menuitem"
              onClick={() => {
                onExplorePhonetic(sentenceId);
                handleClose();
              }}
              disabled={!hasText}
            >
              <div className="synthesis__menu-item-content">
                Uuri häälduskuju
              </div>
            </button>
            <button
              className="synthesis__menu-item"
              role="menuitem"
              onClick={() => {
                onDownload(sentenceId);
                handleClose();
              }}
              disabled={!hasText}
            >
              <div className="synthesis__menu-item-content">
                Lae alla .wav fail
              </div>
            </button>
            <button
              className="synthesis__menu-item"
              role="menuitem"
              onClick={() => {
                onCopyText(sentenceId);
                handleClose();
              }}
              disabled={!hasText}
            >
              <div className="synthesis__menu-item-content">Kopeeri tekst</div>
            </button>
            <div className="synthesis__menu-divider" role="separator" />
            <button
              className="synthesis__menu-item synthesis__menu-item--danger"
              role="menuitem"
              onClick={() => {
                onRemove(sentenceId);
                handleClose();
              }}
            >
              <div className="synthesis__menu-item-content">Eemalda</div>
            </button>
          </>
        ) : (
          <TasksSubPanel
            sentenceId={sentenceId}
            hasText={hasText}
            menuSearchQuery={menuSearchQuery}
            onSearchChange={onSearchChange}
            isLoadingTasks={isLoadingTasks}
            filteredTasks={filteredTasks}
            onAddToTask={onAddToTask}
            onCreateNewTask={onCreateNewTask}
            onClose={handleClose}
            onBack={handleBackToMain}
          />
        )}
      </div>
    </>
  );
}
