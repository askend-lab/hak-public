import { useLayoutEffect, useState } from 'react';
import { SearchIcon, AddIcon } from './ui/Icons';

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
  onRemove: (sentenceId: string) => void;
  onLogin: () => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null | undefined;
}

const AuthenticatedMenu = ({ sentenceId, hasText, menuSearchQuery, onSearchChange, isLoadingTasks, filteredTasks, onAddToTask, onCreateNewTask, onClose }: { sentenceId: string; hasText: boolean; menuSearchQuery: string; onSearchChange: (v: string) => void; isLoadingTasks: boolean; filteredTasks: Task[]; onAddToTask: (sid: string, tid: string, tn: string) => void; onCreateNewTask: (sid: string) => void; onClose: () => void }) => (
  <>
    <div className="synthesis__menu-search">
      <label htmlFor="menu-search" className="visually-hidden">Otsi ülesandeid</label>
      <input id="menu-search" type="text" className="synthesis__menu-search-input" placeholder="Otsi" value={menuSearchQuery} onChange={(e) => onSearchChange(e.target.value)} onClick={(e) => e.stopPropagation()} />
      <SearchIcon size="2xl" className="synthesis__menu-search-icon" />
    </div>
    <div className="synthesis__menu-task-list" role="group" aria-label="Ülesanded">{isLoadingTasks ? <div className="synthesis__menu-item synthesis__menu-item--loading" aria-busy="true"><div className="synthesis__menu-item-content">Laen...</div></div> : filteredTasks.map(task => <button key={task.id} className="synthesis__menu-item" role="menuitem" onClick={() => { onAddToTask(sentenceId, task.id, task.name); onClose(); }} disabled={!hasText}><div className="synthesis__menu-item-content">{task.name}</div></button>)}</div>
    <div className="synthesis__menu-create-section"><button className="synthesis__menu-item synthesis__menu-item--create" role="menuitem" onClick={() => { onCreateNewTask(sentenceId); onClose(); }} disabled={!hasText}><span className="synthesis__menu-item-create-icon" aria-hidden="true"><AddIcon size="sm" /></span><div className="synthesis__menu-item-content">Loo uus ülesanne</div></button></div>
    <div className="synthesis__menu-divider" role="separator" />
  </>
);

export default function SentenceMenu({ isAuthenticated, sentenceId, sentenceText, menuSearchQuery, onSearchChange, isLoadingTasks, tasks, onAddToTask, onCreateNewTask, onExplorePhonetic, onDownload, onRemove, onLogin, onClose, anchorEl }: SentenceMenuProps) {
  const hasText = sentenceText.trim().length > 0;
  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(menuSearchQuery.toLowerCase()));
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculate fixed position from anchor element
  useLayoutEffect(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      // Position menu below the button, aligned to the right edge
      setMenuPosition({
        top: rect.bottom + 4, // 4px gap below button
        left: rect.right - 250, // Align right edge (250px is menu width from paper-md)
      });
    }
  }, [anchorEl]);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Use fixed positioning when anchorEl is provided
  const useFixedPositioning = !!anchorEl && !!menuPosition;
  const menuClassName = `synthesis__dropdown-menu synthesis__dropdown-menu--with-search${useFixedPositioning ? ' synthesis__dropdown-menu--fixed' : ''}`;
  const menuStyle = useFixedPositioning ? { top: menuPosition.top, left: Math.max(8, menuPosition.left) } : undefined;

  return (
    <>
      <div className="synthesis__menu-backdrop" onClick={onClose} aria-hidden="true" />
      <div className={menuClassName} role="menu" aria-label="Lausungi valikud" onKeyDown={handleKeyDown} style={menuStyle}>
        {isAuthenticated ? <AuthenticatedMenu sentenceId={sentenceId} hasText={hasText} menuSearchQuery={menuSearchQuery} onSearchChange={onSearchChange} isLoadingTasks={isLoadingTasks} filteredTasks={filteredTasks} onAddToTask={onAddToTask} onCreateNewTask={onCreateNewTask} onClose={onClose} /> : <button className="synthesis__menu-item" role="menuitem" onClick={() => { onClose(); onLogin(); }} disabled={!hasText}><div className="synthesis__menu-item-content">Lisa ülesandesse</div></button>}
        <button className="synthesis__menu-item" role="menuitem" onClick={() => { onExplorePhonetic(sentenceId); onClose(); }} disabled={!hasText}><div className="synthesis__menu-item-content">Uuri foneetilist kuju</div></button>
        <button className="synthesis__menu-item" role="menuitem" onClick={() => { onDownload(sentenceId); onClose(); }} disabled={!hasText}><div className="synthesis__menu-item-content">Lae alla .wav fail</div></button>
        <button className="synthesis__menu-item synthesis__menu-item--danger" role="menuitem" onClick={() => { onRemove(sentenceId); onClose(); }}><div className="synthesis__menu-item-content">Eemalda</div></button>
      </div>
    </>
  );
}
