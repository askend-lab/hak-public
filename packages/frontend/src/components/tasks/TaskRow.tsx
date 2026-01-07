import { formatDate } from '../../utils/formatDate';
import type { Task } from '../../services/tasks';

interface TaskRowProps {
  task: Task;
  onViewTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  openMenuId: string | null;
  onMenuOpen: (taskId: string) => void;
  onMenuClose: () => void;
}

export function TaskRow({ task, onViewTask, onEditTask, onDeleteTask, openMenuId, onMenuOpen, onMenuClose }: TaskRowProps) {
  return (
    <div className="task-row" data-testid={`task-row-${task.id}`}>
      <div className="task-row-content" onClick={() => onViewTask(task.id)}>
        <div className="task-row-info">
          <span className="task-row-name">{task.name}</span>
          {task.description && (
            <span className="task-row-description">{task.description}</span>
          )}
        </div>
        <div className="task-row-meta">
          <span className="task-row-count">[{task.entries.length}] lauset</span>
          <span className="task-row-date">Loodud {formatDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-row-actions">
        <div className="menu-container">
          <button
            className="menu-button"
            aria-label="More options"
            data-testid={`task-menu-btn-${task.id}`}
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
              <div className="menu-backdrop" onClick={onMenuClose} />
              <div className="dropdown-menu">
                <button className="menu-item" data-testid={`task-edit-btn-${task.id}`} onClick={() => { onMenuClose(); onEditTask(task); }}>
                  <div className="menu-item-content">Muuda</div>
                </button>
                <button className="menu-item" onClick={() => { onMenuClose(); }}>
                  <div className="menu-item-content">Jaga</div>
                </button>
                <button className="menu-item menu-item-danger" data-testid={`task-delete-btn-${task.id}`} onClick={() => { onMenuClose(); onDeleteTask(task.id); }}>
                  <div className="menu-item-content">Kustuta</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
