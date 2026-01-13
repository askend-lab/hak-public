/* eslint-disable max-lines-per-function, max-lines, complexity */
'use client';

import { useState, useEffect, useRef } from 'react';
import { TaskSummary } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/services/auth';

interface TaskRowProps {
  task: TaskSummary;
  isExpanded: boolean;
  onToggleExpand: (taskId: string, e: React.MouseEvent) => void;
  onViewTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onShareTask: (taskId: string) => void;
  openMenuId: string | null;
  onMenuOpen: (taskId: string) => void;
  onMenuClose: () => void;
}

function TaskRow({
  task,
  isExpanded,
  onToggleExpand,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onShareTask,
  openMenuId,
  onMenuOpen,
  onMenuClose
}: TaskRowProps) {
  const descriptionRef = useRef<HTMLSpanElement>(null);
  const [needsExpansion, setNeedsExpansion] = useState(false);

  useEffect(() => {
    // Check if the description is truncated
    const element = descriptionRef.current;
    if (element && task.description) {
      // Compare scrollHeight with clientHeight to detect overflow
      setNeedsExpansion(element.scrollHeight > element.clientHeight);
    }
  }, [task.description]);

  return (
    <div className={`task-row-simple ${isExpanded ? 'expanded' : ''}`}>
      <div className="task-row-content" onClick={() => onViewTask(task.id)}>
        <div className="task-row-info">
          <span className={`task-row-name ${isExpanded ? 'expanded' : ''}`}>{task.name}</span>
          <div className="task-row-description-wrapper">
            <span
              ref={descriptionRef}
              className={`task-row-description ${isExpanded ? 'expanded' : ''}`}
            >
              {task.description}
            </span>
            {task.description && needsExpansion && (
              <button
                className="task-show-more"
                onClick={(e) => onToggleExpand(task.id, e)}
              >
                {isExpanded ? 'Näita vähem' : 'Näita rohkem'}
              </button>
            )}
          </div>
        </div>
        <div className="task-row-meta">
          <span className="task-row-count">
            [{task.entryCount}] {task.entryCount === 1 ? 'lauset' : 'lauset'}
          </span>
          <span className="task-row-date">
            Loodud {new Date(task.createdAt).toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="task-row-actions">
        <div className="task-manager__menu-container">
          <button
            className="task-manager__menu-button"
            aria-label="More options"
            onClick={() => onMenuOpen(task.id)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {openMenuId === task.id && (
            <>
              <div className="task-manager__menu-backdrop" onClick={onMenuClose} />
              <div className="task-manager__dropdown-menu">
                <button
                  className="task-manager__menu-item"
                  onClick={() => {
                    onEditTask(task.id);
                    onMenuClose();
                  }}
                >
                  <div className="task-manager__menu-item-content">
                    Muuda
                  </div>
                </button>
                <button
                  className="task-manager__menu-item"
                  onClick={() => {
                    onShareTask(task.id);
                    onMenuClose();
                  }}
                >
                  <div className="task-manager__menu-item-content">
                    Jaga
                  </div>
                </button>
                <button
                  className="task-manager__menu-item task-manager__menu-item--danger"
                  onClick={() => {
                    onDeleteTask(task.id);
                    onMenuClose();
                  }}
                >
                  <div className="task-manager__menu-item-content">
                    Kustuta
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface TaskManagerProps {
  onCreateTask: () => void;
  onEditTask: (taskId: string) => void;
  onViewTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onShareTask: (taskId: string) => void;
  refreshTrigger?: number; // Add optional refresh trigger
}

export default function TaskManager({
  onCreateTask,
  onEditTask,
  onViewTask,
  onDeleteTask,
  onShareTask,
  refreshTrigger = 0
}: TaskManagerProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Load tasks when user changes or refresh is triggered
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const dataService = DataService.getInstance();
        const userTasks = await dataService.getUserTasks(user.id);
        setTasks(userTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Viga ülesannete laadimisel');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user, refreshTrigger]);

  const handleShare = (taskId: string) => {
    console.log('TaskManager handleShare called with taskId:', taskId);
    onShareTask(taskId);
  };

  if (isLoading) {
    return (
      <div className="task-manager">
        <div className="task-manager-header">
          <h2 className="task-manager-title">Minu ülesanded</h2>
        </div>
        <div className="task-manager-loading">
          <div className="loading-spinner"></div>
          <p>Laen ülesandeid...</p>
        </div>
      </div>
    );
  }

  const handleMenuOpen = (taskId: string) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  const toggleExpanded = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onViewTask
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <>
      <div className="task-manager-simple">
        {error && (
          <div className="task-manager-error">
            <p>Viga ülesannete laadimisel: {error}</p>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="task-manager-empty">
            <div className="task-manager-empty-image">
              <img src="/icons/avatar_task_empty.png" alt="Ülesanded puuduvad" />
            </div>
            <h4 className="task-manager-empty-title">Ülesanded puuduvad</h4>
            <button
              onClick={onCreateTask}
              className="task-manager-empty-cta"
            >
              Lisa ülesanne
            </button>
          </div>
        ) : (
          <>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isExpanded={expandedTasks.has(task.id)}
                onToggleExpand={toggleExpanded}
                onViewTask={onViewTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onShareTask={handleShare}
                openMenuId={openMenuId}
                onMenuOpen={handleMenuOpen}
                onMenuClose={handleMenuClose}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}