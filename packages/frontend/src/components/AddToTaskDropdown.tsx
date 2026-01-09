'use client';

import { useState, useEffect, useRef } from 'react';
import { TaskSummary } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';

interface AddToTaskDropdownProps { isOpen: boolean; onClose: () => void; onSelectTask: (taskId: string, taskName: string) => void; onCreateNew: () => void; anchorRef?: React.RefObject<HTMLElement>; }

const TaskList = ({ isLoading, filteredTasks, searchQuery, onSelect }: { isLoading: boolean; filteredTasks: TaskSummary[]; searchQuery: string; onSelect: (id: string, name: string) => void }) => {
  if (isLoading) return <div className="add-to-task-loading"><div className="loader-spinner"></div></div>;
  if (filteredTasks.length === 0 && searchQuery) return <div className="add-to-task-empty">Ülesandeid ei leitud</div>;
  return <>{filteredTasks.map((task) => <button key={task.id} className="add-to-task-item" onClick={() => onSelect(task.id, task.name)}><span className="add-to-task-item-name">{task.name}</span></button>)}</>;
};

export default function AddToTaskDropdown({ isOpen, onClose, onSelectTask, onCreateNew, anchorRef: _anchorRef }: AddToTaskDropdownProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(''); const [tasks, setTasks] = useState<TaskSummary[]>([]); const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!isOpen || !user) return; setIsLoading(true); DataService.getInstance().getUserTasks(user.id).then(setTasks).catch(e => console.error('Failed to load tasks:', e)).finally(() => setIsLoading(false)); }, [isOpen, user]);
  useEffect(() => { if (isOpen && searchInputRef.current) setTimeout(() => searchInputRef.current?.focus(), 100); }, [isOpen]);
  useEffect(() => { if (!isOpen) setSearchQuery(''); }, [isOpen]);
  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleSelect = (id: string, name: string) => { onSelectTask(id, name); onClose(); };
  const handleCreate = () => { onCreateNew(); onClose(); };
  if (!isOpen) return null;
  return (
    <>
      <div className="add-to-task-backdrop" onClick={onClose} />
      <div className="add-to-task-dropdown" ref={dropdownRef}>
        <div className="add-to-task-search"><input ref={searchInputRef} type="text" className="add-to-task-search-input" placeholder="Otsi" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><img className="add-to-task-search-icon" src="/icons/ic_search.svg" alt="Otsi" /></div>
        <div className="add-to-task-list"><TaskList isLoading={isLoading} filteredTasks={filteredTasks} searchQuery={searchQuery} onSelect={handleSelect} /></div>
        <div className="add-to-task-create"><button className="add-to-task-create-button" onClick={handleCreate}><span className="add-to-task-create-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span><span className="add-to-task-create-text">Loo uus ülesanne</span></button></div>
      </div>
    </>
  );
}

