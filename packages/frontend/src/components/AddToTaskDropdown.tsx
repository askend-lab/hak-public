'use client';

import { useState, useEffect, useRef } from 'react';
import { TaskSummary } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';

interface AddToTaskDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string, taskName: string) => void;
  onCreateNew: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export default function AddToTaskDropdown({
  isOpen,
  onClose,
  onSelectTask,
  onCreateNew,
  anchorRef: _anchorRef
}: AddToTaskDropdownProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load tasks when dropdown opens
  useEffect(() => {
    const loadTasks = async () => {
      if (!isOpen || !user) return;

      try {
        setIsLoading(true);
        const dataService = DataService.getInstance();
        const userTasks = await dataService.getUserTasks(user.id);
        setTasks(userTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [isOpen, user]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTask = (taskId: string, taskName: string) => {
    onSelectTask(taskId, taskName);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="add-to-task-backdrop" onClick={onClose} />
      <div className="add-to-task-dropdown" ref={dropdownRef}>
        {/* Search Input */}
        <div className="add-to-task-search">
          <input
            ref={searchInputRef}
            type="text"
            className="add-to-task-search-input"
            placeholder="Otsi"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <img 
            className="add-to-task-search-icon" 
            src="/icons/ic_search.svg"
            alt="Otsi"
          />
        </div>

        {/* Task List */}
        <div className="add-to-task-list">
          {isLoading ? (
            <div className="add-to-task-loading">
              <div className="loader-spinner"></div>
            </div>
          ) : filteredTasks.length === 0 && searchQuery ? (
            <div className="add-to-task-empty">
              Ülesandeid ei leitud
            </div>
          ) : (
            filteredTasks.map((task) => (
              <button
                key={task.id}
                className="add-to-task-item"
                onClick={() => handleSelectTask(task.id, task.name)}
              >
                <span className="add-to-task-item-name">{task.name}</span>
              </button>
            ))
          )}
        </div>

        {/* Create New Task */}
        <div className="add-to-task-create">
          <button
            className="add-to-task-create-button"
            onClick={handleCreateNew}
          >
            <span className="add-to-task-create-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </span>
            <span className="add-to-task-create-text">Loo uus ülesanne</span>
          </button>
        </div>
      </div>
    </>
  );
}

