// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState } from "react";
import { SearchIcon, AddIcon, ChevronRightIcon, BackIcon } from "@/components/ui/Icons";
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

function TaskSearchHeader({ onBack, query, onChange }: { onBack: () => void; query: string; onChange: (v: string) => void }) {
  return (
    <>
      <div className="synthesis__menu-panel-header">
        <button onClick={onBack} className="synthesis__menu-back-button" aria-label="Tagasi" type="button"><BackIcon size="lg" /></button>
        <h4 className="synthesis__menu-panel-title">Lisa ülesandesse</h4>
      </div>
      <div className="synthesis__menu-search">
        <label htmlFor="menu-search" className="visually-hidden">Otsi ülesandeid</label>
        <input id="menu-search" type="text" className="synthesis__menu-search-input" placeholder="Otsi"
          value={query} onChange={(e) => onChange(e.target.value)} onClick={(e) => e.stopPropagation()} />
        <SearchIcon size="2xl" className="synthesis__menu-search-icon" />
      </div>
    </>
  );
}

function TaskList({ sentenceId, hasText, isLoading, tasks, onAdd, onCreate, onClose }: {
  sentenceId: string; hasText: boolean; isLoading: boolean; tasks: Task[];
  onAdd: (sid: string, tid: string, tn: string) => void; onCreate: (sid: string) => void; onClose: () => void;
}) {
  return (
    <>
      <div className="synthesis__menu-task-list" role="group" aria-label="Ülesanded">
        {isLoading ? (
          <div className="synthesis__menu-item synthesis__menu-item--loading" aria-busy="true"><div className="synthesis__menu-item-content">Laen...</div></div>
        ) : (
          tasks.map((t) => (
            <button key={t.id} className="synthesis__menu-item" role="menuitem" onClick={() => { onAdd(sentenceId, t.id, t.name); onClose(); }} disabled={!hasText}>
              <div className="synthesis__menu-item-content">{t.name}</div>
            </button>
          ))
        )}
      </div>
      <div className="synthesis__menu-create-section">
        <button className="synthesis__menu-item synthesis__menu-item--create" role="menuitem" onClick={() => { onCreate(sentenceId); onClose(); }} disabled={!hasText}>
          <span className="synthesis__menu-item-create-icon" aria-hidden="true"><AddIcon size="sm" /></span>
          <div className="synthesis__menu-item-content">Loo uus ülesanne</div>
        </button>
      </div>
    </>
  );
}

function TasksSubPanel({ sentenceId, hasText, menuSearchQuery, onSearchChange, isLoadingTasks, filteredTasks, onAddToTask, onCreateNewTask, onClose, onBack }: {
  sentenceId: string; hasText: boolean; menuSearchQuery: string; onSearchChange: (v: string) => void;
  isLoadingTasks: boolean; filteredTasks: Task[]; onAddToTask: (sid: string, tid: string, tn: string) => void;
  onCreateNewTask: (sid: string) => void; onClose: () => void; onBack: () => void;
}) {
  return (
    <>
      <TaskSearchHeader onBack={onBack} query={menuSearchQuery} onChange={onSearchChange} />
      <TaskList sentenceId={sentenceId} hasText={hasText} isLoading={isLoadingTasks} tasks={filteredTasks} onAdd={onAddToTask} onCreate={onCreateNewTask} onClose={onClose} />
    </>
  );
}

function MenuBtn({ label, onClick, disabled, cls }: { label: string; onClick: () => void; disabled?: boolean; cls?: string }) {
  return <button className={`synthesis__menu-item ${cls ?? ""}`} role="menuitem" onClick={onClick} disabled={disabled}><div className="synthesis__menu-item-content">{label}</div></button>;
}

function MainPanel({ sentenceId, hasText, isAuthenticated, onOpenTasks, onExplorePhonetic, onDownload, onCopyText, onRemove, onLogin, onClose }: {
  sentenceId: string; hasText: boolean; isAuthenticated: boolean;
  onOpenTasks: () => void; onExplorePhonetic: (id: string) => void; onDownload: (id: string) => void;
  onCopyText: (id: string) => void; onRemove: (id: string) => void; onLogin: () => void; onClose: () => void;
}) {
  const close = (fn: () => void) => () => { fn(); onClose(); };
  return (
    <>
      {isAuthenticated ? (
        <button className="synthesis__menu-item synthesis__menu-item--submenu" role="menuitem" aria-haspopup="true" onClick={onOpenTasks} disabled={!hasText}>
          <div className="synthesis__menu-item-content">Lisa ülesandesse</div>
          <ChevronRightIcon size="lg" className="synthesis__menu-item-chevron" />
        </button>
      ) : (
        <MenuBtn label="Lisa ülesandesse" onClick={close(onLogin)} disabled={!hasText} />
      )}
      <MenuBtn label="Uuri häälduskuju" onClick={close(() => onExplorePhonetic(sentenceId))} disabled={!hasText} />
      <MenuBtn label="Lae alla .wav fail" onClick={close(() => onDownload(sentenceId))} disabled={!hasText} />
      <MenuBtn label="Kopeeri tekst" onClick={close(() => onCopyText(sentenceId))} disabled={!hasText} />
      <div className="synthesis__menu-divider" role="separator" />
      <MenuBtn label="Eemalda" onClick={close(() => onRemove(sentenceId))} cls="synthesis__menu-item--danger" />
    </>
  );
}

export default function SentenceMenu(p: SentenceMenuProps) {
  const [activePanel, setActivePanel] = useState<"main" | "tasks">("main");
  const hasText = p.sentenceText.trim().length > 0;
  const filteredTasks = p.tasks.filter((t) => t.name.toLowerCase().includes(p.menuSearchQuery.toLowerCase()));
  const { menuRef, menuStyle } = useDropdownPosition({ isOpen: true, anchorEl: p.anchorEl ?? null, contentDeps: [p.isLoadingTasks, p.tasks.length, activePanel] });

  const handleClose = () => { setActivePanel("main"); p.onClose(); };
  const handleKeyDown = (e: React.KeyboardEvent): void => { if (e.key === "Escape") { if (activePanel === "tasks") {setActivePanel("main");} else {p.onClose();} } };
  const useFixed = Boolean(p.anchorEl && menuStyle);
  const cls = `synthesis__dropdown-menu synthesis__dropdown-menu--with-search${useFixed ? " synthesis__dropdown-menu--fixed" : ""}`;

  return (
    <>
      <div className="synthesis__menu-backdrop" onClick={handleClose} aria-hidden="true" />
      <div ref={menuRef} className={cls} role="menu" tabIndex={-1} aria-label="Lausungi valikud" onKeyDown={handleKeyDown} style={menuStyle}>
        {activePanel === "main"
          ? <MainPanel sentenceId={p.sentenceId} hasText={hasText} isAuthenticated={p.isAuthenticated} onOpenTasks={() => setActivePanel("tasks")}
              onExplorePhonetic={p.onExplorePhonetic} onDownload={p.onDownload} onCopyText={p.onCopyText} onRemove={p.onRemove} onLogin={p.onLogin} onClose={handleClose} />
          : <TasksSubPanel sentenceId={p.sentenceId} hasText={hasText} menuSearchQuery={p.menuSearchQuery} onSearchChange={p.onSearchChange}
              isLoadingTasks={p.isLoadingTasks} filteredTasks={filteredTasks} onAddToTask={p.onAddToTask} onCreateNewTask={p.onCreateNewTask} onClose={handleClose} onBack={() => setActivePanel("main")} />}
      </div>
    </>
  );
}
