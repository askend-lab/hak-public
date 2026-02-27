// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab


import { useState, useEffect, useRef } from "react";
import { TaskSummary } from "@/types/task";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { logger } from "@hak/shared";
import { SearchIcon, AddIcon, BackIcon } from "@/components/ui/Icons";

export type AddToTaskMode = "append" | "replace";

interface AddToTaskDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (
    taskId: string,
    taskName: string,
    mode: AddToTaskMode,
  ) => void;
  onCreateNew: () => void;
  sentenceCount: number;
  anchorRef?: React.RefObject<HTMLElement>;
}

const TaskList = ({
  isLoading,
  filteredTasks,
  searchQuery,
  onSelect,
}: {
  isLoading: boolean;
  filteredTasks: TaskSummary[];
  searchQuery: string;
  onSelect: (task: TaskSummary) => void;
}) => {
  if (isLoading)
    {return (
      <div className="add-to-task-loading">
        <div className="loader-spinner"></div>
      </div>
    );}
  if (filteredTasks.length === 0 && searchQuery)
    {return <div className="add-to-task-empty">Ülesandeid ei leitud</div>;}
  return (
    <>
      {filteredTasks.map((task) => (
        <button
          key={task.id}
          className="add-to-task-item"
          onClick={() => onSelect(task)}
        >
          <span className="add-to-task-item-name">{task.name}</span>
        </button>
      ))}
    </>
  );
};

const ConfirmPanel = ({
  task,
  sentenceCount,
  onBack,
  onConfirm,
}: {
  task: TaskSummary;
  sentenceCount: number;
  onBack: () => void;
  onConfirm: (mode: AddToTaskMode) => void;
}) => (
  <>
    <div className="add-to-task-confirm-header">
      <button
        onClick={onBack}
        className="add-to-task-confirm-back"
        aria-label="Tagasi"
        type="button"
      >
        <BackIcon size="lg" />
      </button>
      <h4 className="add-to-task-confirm-title">{task.name}</h4>
    </div>
    <div className="add-to-task-confirm-body">
      <p className="add-to-task-confirm-info">
        Ülesandes on {task.entryCount}{" "}
        {task.entryCount === 1 ? "lause" : "lauset"}.
        <br />
        Lisad {sentenceCount}{" "}
        {sentenceCount === 1 ? "uue lause" : "uut lauset"}.
      </p>
      <div className="add-to-task-confirm-actions">
        <button
          className="button button--primary button--small"
          onClick={() => onConfirm("append")}
        >
          Lisa juurde
        </button>
        <button
          className="button button--secondary button--small"
          onClick={() => onConfirm("replace")}
        >
          Asenda olemasolevad
        </button>
      </div>
    </div>
  </>
);

function useTaskDropdownState(isOpen: boolean) {
  const { user } = useAuth();
  const dataService = useDataService();
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskSummary | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isOpen || !user) {return;}
    setIsLoading(true);
    dataService.getUserTasks().then(setTasks).catch((e) => logger.error("Failed to load tasks:", e)).finally(() => setIsLoading(false));
  }, [isOpen, user, dataService]);
  useEffect(() => {
    if (isOpen && !selectedTask && searchInputRef.current) { requestAnimationFrame(() => searchInputRef.current?.focus()); }
  }, [isOpen, selectedTask]);
  useEffect(() => { if (!isOpen) { setSearchQuery(""); setSelectedTask(null); } }, [isOpen]);
  const filteredTasks = tasks.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return { searchQuery, setSearchQuery, isLoading, selectedTask, setSelectedTask, searchInputRef, filteredTasks };
}

function SearchPanel({ state, onTaskClick, onCreate }: {
  state: ReturnType<typeof useTaskDropdownState>; onTaskClick: (t: TaskSummary) => void; onCreate: () => void;
}) {
  return (
    <>
      <div className="add-to-task-search">
        <input ref={state.searchInputRef} type="text" className="add-to-task-search-input" placeholder="Otsi" aria-label="Otsi ülesannet"
          value={state.searchQuery} onChange={(e) => state.setSearchQuery(e.target.value)} />
        <SearchIcon size="2xl" className="add-to-task-search-icon" />
      </div>
      <div className="add-to-task-list"><TaskList isLoading={state.isLoading} filteredTasks={state.filteredTasks} searchQuery={state.searchQuery} onSelect={onTaskClick} /></div>
      <div className="add-to-task-create">
        <button className="add-to-task-create-button" onClick={onCreate}>
          <span className="add-to-task-create-icon"><AddIcon size="sm" /></span><span className="add-to-task-create-text">Loo uus ülesanne</span>
        </button>
      </div>
    </>
  );
}

export default function AddToTaskDropdown({ isOpen, onClose, onSelectTask, onCreateNew, sentenceCount, anchorRef: _anchorRef }: AddToTaskDropdownProps) {
  const state = useTaskDropdownState(isOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleTaskClick = (task: TaskSummary) => {
    if (task.entryCount > 0) { state.setSelectedTask(task); } else { onSelectTask(task.id, task.name, "append"); onClose(); }
  };
  const handleConfirm = (mode: AddToTaskMode) => { if (!state.selectedTask) {return;} onSelectTask(state.selectedTask.id, state.selectedTask.name, mode); onClose(); };
  if (!isOpen) {return null;}
  return (
    <>
      <div className="add-to-task-backdrop" onClick={onClose} onKeyDown={(e) => { if (e.key === "Escape") {onClose();} }} role="presentation" tabIndex={-1} />
      <div className="add-to-task-dropdown" ref={dropdownRef}>
        {state.selectedTask
          ? <ConfirmPanel task={state.selectedTask} sentenceCount={sentenceCount} onBack={() => state.setSelectedTask(null)} onConfirm={handleConfirm} />
          : <SearchPanel state={state} onTaskClick={handleTaskClick} onCreate={() => { onCreateNew(); onClose(); }} />}
      </div>
    </>
  );
}
