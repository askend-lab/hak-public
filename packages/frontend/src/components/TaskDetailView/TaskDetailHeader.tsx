/* eslint-disable max-lines-per-function, complexity */
'use client';

import { Task } from '@/types/task';

interface TaskDetailHeaderProps {
  task: Task;
  entriesCount: number;
  isLoadingPlayAll: boolean;
  isPlayingAll: boolean;
  isHeaderMenuOpen: boolean;
  setIsHeaderMenuOpen: (open: boolean) => void;
  onShare: () => void;
  onPlayAll: () => void;
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
  onEditTask,
  onDeleteTask,
}: TaskDetailHeaderProps) {
  if (entriesCount === 0) return null;

  return (
    <div className="page-header page-header--full">
      <div className="page-header__content">
        <h1 className="page-header__title">{task.name}</h1>
        {task.description && <p className="page-header__description">{task.description}</p>}
      </div>
      <div className="page-header__actions">
        <button onClick={onShare} className="button button--secondary"><span>Jaga</span></button>
        <button
          onClick={onPlayAll}
          className={`button button--primary ${isLoadingPlayAll ? 'loading' : ''}`}
          disabled={entriesCount === 0}
        >
          {isLoadingPlayAll ? (
            <div className="loader-spinner"></div>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {isPlayingAll ? (
                <>
                  <rect x="7" y="6" width="3" height="12" fill="currentColor" rx="1" />
                  <rect x="14" y="6" width="3" height="12" fill="currentColor" rx="1" />
                </>
              ) : (
                <path d="M8.31445 6.5C8.32533 6.49867 8.38306 6.49567 8.56055 6.56641C8.73719 6.63681 8.96582 6.75129 9.30957 6.9248L17.958 11.291C17.9608 11.2924 17.964 11.2936 17.9668 11.2949C18.343 11.4848 18.5952 11.6131 18.7715 11.7227C18.9298 11.8211 18.9662 11.8696 18.9707 11.876C19.0093 11.9553 19.0094 12.0447 18.9707 12.124C18.9655 12.1314 18.9276 12.1805 18.7705 12.2783C18.593 12.3887 18.3379 12.5182 17.958 12.71L9.30957 17.0752C8.96567 17.2488 8.73701 17.3634 8.56055 17.4336C8.38339 17.5041 8.32566 17.5014 8.31445 17.5C8.20475 17.4865 8.11413 17.431 8.05957 17.3584C8.0567 17.3539 8.0328 17.3114 8.01758 17.1543C8.00046 16.9776 8 16.7364 8 16.3662V7.63477C8 7.26444 8.00045 7.02263 8.01758 6.8457C8.03473 6.66887 8.06291 6.63716 8.05957 6.6416C8.11415 6.56897 8.20478 6.51347 8.31445 6.5Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          )}
          {isLoadingPlayAll ? 'Laadimine' : isPlayingAll ? 'Peata' : 'Mängi kõik'}
        </button>
        <div className="task-detail__menu-container">
          <button className="task-detail__menu-button" aria-label="Rohkem valikuid" onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isHeaderMenuOpen && (
            <>
              <div className="task-detail__menu-backdrop" onClick={() => setIsHeaderMenuOpen(false)} />
              <div className="task-detail__dropdown-menu">
                <button className="task-detail__menu-item" onClick={() => { onEditTask(task.id); setIsHeaderMenuOpen(false); }}>
                  <div className="task-detail__menu-item-content">Muuda</div>
                </button>
                <button className="task-detail__menu-item task-detail__menu-item--danger" onClick={() => { onDeleteTask(task.id); setIsHeaderMenuOpen(false); }}>
                  <div className="task-detail__menu-item-content">Kustuta</div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
