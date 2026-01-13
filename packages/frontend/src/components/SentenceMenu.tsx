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
}

const AuthenticatedMenu = ({ sentenceId, hasText, menuSearchQuery, onSearchChange, isLoadingTasks, filteredTasks, onAddToTask, onCreateNewTask, onClose }: { sentenceId: string; hasText: boolean; menuSearchQuery: string; onSearchChange: (v: string) => void; isLoadingTasks: boolean; filteredTasks: Task[]; onAddToTask: (sid: string, tid: string, tn: string) => void; onCreateNewTask: (sid: string) => void; onClose: () => void }) => (
  <>
    <div className="synthesis__menu-search"><input type="text" className="synthesis__menu-search-input" placeholder="Otsi" value={menuSearchQuery} onChange={(e) => onSearchChange(e.target.value)} onClick={(e) => e.stopPropagation()} /><SearchIcon size="2xl" className="synthesis__menu-search-icon" /></div>
    <div className="synthesis__menu-task-list">{isLoadingTasks ? <div className="synthesis__menu-item synthesis__menu-item--loading"><div className="synthesis__menu-item-content">Laen...</div></div> : filteredTasks.map(task => <button key={task.id} className="synthesis__menu-item" onClick={() => { onAddToTask(sentenceId, task.id, task.name); onClose(); }} disabled={!hasText}><div className="synthesis__menu-item-content">{task.name}</div></button>)}</div>
    <div className="synthesis__menu-create-section"><button className="synthesis__menu-item synthesis__menu-item--create" onClick={() => { onCreateNewTask(sentenceId); onClose(); }} disabled={!hasText}><span className="synthesis__menu-item-create-icon"><AddIcon size="sm" /></span><div className="synthesis__menu-item-content">Loo uus ülesanne</div></button></div>
    <div className="synthesis__menu-divider" />
  </>
);

export default function SentenceMenu({ isAuthenticated, sentenceId, sentenceText, menuSearchQuery, onSearchChange, isLoadingTasks, tasks, onAddToTask, onCreateNewTask, onExplorePhonetic, onDownload, onRemove, onLogin, onClose }: SentenceMenuProps) {
  const hasText = sentenceText.trim().length > 0;
  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(menuSearchQuery.toLowerCase()));
  return (
    <>
      <div className="synthesis__menu-backdrop" onClick={onClose} />
      <div className="synthesis__dropdown-menu synthesis__dropdown-menu--with-search">
        {isAuthenticated ? <AuthenticatedMenu sentenceId={sentenceId} hasText={hasText} menuSearchQuery={menuSearchQuery} onSearchChange={onSearchChange} isLoadingTasks={isLoadingTasks} filteredTasks={filteredTasks} onAddToTask={onAddToTask} onCreateNewTask={onCreateNewTask} onClose={onClose} /> : <button className="synthesis__menu-item" onClick={() => { onClose(); onLogin(); }} disabled={!hasText}><div className="synthesis__menu-item-content">Lisa ülesandesse</div></button>}
        <button className="synthesis__menu-item" onClick={() => { onExplorePhonetic(sentenceId); onClose(); }} disabled={!hasText}><div className="synthesis__menu-item-content">Uuri foneetilist kuju</div></button>
        <button className="synthesis__menu-item" onClick={() => { onDownload(sentenceId); onClose(); }} disabled={!hasText}><div className="synthesis__menu-item-content">Lae alla .wav fail</div></button>
        <button className="synthesis__menu-item synthesis__menu-item--danger" onClick={() => { onRemove(sentenceId); onClose(); }}><div className="synthesis__menu-item-content">Eemalda</div></button>
      </div>
    </>
  );
}
