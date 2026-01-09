'use client';

import { useState, useEffect } from 'react';
import { CreateTaskRequest, TaskSummary } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import BaseModal from './BaseModal';

type Mode = 'create' | 'existing';
interface PlaylistEntry { id: string; text: string; stressedText: string; audioUrl?: string | null; audioBlob?: Blob | null; }

interface TaskCreationModalProps { isOpen: boolean; onClose: () => void; onCreateTask: (task: CreateTaskRequest) => Promise<void>; onAddToExistingTask: (taskId: string, entries: Array<{text: string; stressedText: string}>, taskName: string) => Promise<void>; playlistEntries?: PlaylistEntry[]; }

const ModeSelector = ({ mode, onChange, disabled }: { mode: Mode; onChange: (m: Mode) => void; disabled: boolean }) => (
  <div className="task-modal__field"><div className="task-modal__mode-selection">
    <label className="task-modal__mode-option"><input type="radio" name="taskMode" value="create" checked={mode === 'create'} onChange={(e) => onChange(e.target.value as Mode)} className="task-modal__mode-radio" disabled={disabled} /><span className="task-modal__mode-text">Loo uus ülesanne</span></label>
    <label className="task-modal__mode-option"><input type="radio" name="taskMode" value="existing" checked={mode === 'existing'} onChange={(e) => onChange(e.target.value as Mode)} className="task-modal__mode-radio" disabled={disabled} /><span className="task-modal__mode-text">Lisa olemasolevas ülesandesse</span></label>
  </div></div>
);

const CreateForm = ({ name, description, setName, setDescription, disabled }: { name: string; description: string; setName: (v: string) => void; setDescription: (v: string) => void; disabled: boolean }) => (
  <><div className="task-modal__field"><label htmlFor="task-name" className="task-modal__label">Ülesande nimi *</label><input id="task-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="task-modal__input" placeholder="Sisesta ülesande nimi" disabled={disabled} autoFocus /></div>
  <div className="task-modal__field"><label htmlFor="task-description" className="task-modal__label">Kirjeldus</label><textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} className="task-modal__textarea" placeholder="Kirjelda ülesande eesmärki või sisu (valikuline)" rows={3} disabled={disabled} /></div></>
);

const TaskSelector = ({ tasks, selectedId, onChange, isLoading, disabled }: { tasks: TaskSummary[]; selectedId: string; onChange: (id: string) => void; isLoading: boolean; disabled: boolean }) => (
  <div className="task-modal__field"><label className="task-modal__label">Vali ülesanne</label>
    {isLoading ? <div className="task-modal__selection-loading"><div className="task-modal__selection-spinner"></div><p className="task-modal__selection-loading-text">Laen ülesandeid...</p></div>
    : tasks.length === 0 ? <div className="task-modal__selection-empty"><p>Sul pole veel loodud ülesandeid. Vali "Loo uus ülesanne" või loo esmalt ülesanne ülesannete vaates.</p></div>
    : <div className="task-modal__selection-list">{tasks.map(t => <label key={t.id} className="task-modal__selection-item"><input type="radio" name="selectedTask" value={t.id} checked={selectedId === t.id} onChange={(e) => onChange(e.target.value)} className="task-modal__selection-radio" disabled={disabled} /><div className="task-modal__selection-content"><div className="task-modal__selection-name">{t.name}</div>{t.description && <div className="task-modal__selection-description">{t.description}</div>}</div></label>)}</div>}
  </div>
);

const PlaylistPreview = ({ entries }: { entries: PlaylistEntry[] }) => entries.length === 0 ? null : (
  <div className="task-modal__field"><div className="task-modal__playlist-preview"><p className="task-modal__playlist-preview-title">Lisatavad lausungid ({entries.length} {entries.length === 1 ? 'lausung' : 'lausungit'}):</p><div className="task-modal__playlist-preview-items">{entries.slice(0, 3).map((e, i) => <div key={e.id} className="task-modal__playlist-preview-item">{i + 1}. {e.text}</div>)}{entries.length > 3 && <div className="task-modal__playlist-preview-more">+{entries.length - 3} veel</div>}</div></div></div>
);

export default function TaskCreationModal({ isOpen, onClose, onCreateTask, onAddToExistingTask, playlistEntries = [] }: TaskCreationModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('create'); const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(''); const [existingTasks, setExistingTasks] = useState<TaskSummary[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); const [isLoadingTasks, setIsLoadingTasks] = useState(false); const [error, setError] = useState<string | null>(null);
  const hasPlaylist = playlistEntries.length > 0; const isCreateMode = mode === 'create' || !hasPlaylist;

  useEffect(() => { if (!isOpen || !user || mode !== 'existing') return; setIsLoadingTasks(true); DataService.getInstance().getUserTasks(user.id).then(setExistingTasks).catch(e => console.error('Failed to load tasks:', e)).finally(() => setIsLoadingTasks(false)); }, [isOpen, user, mode]);

  const resetForm = () => { setMode('create'); setName(''); setDescription(''); setSelectedTaskId(''); setError(null); };
  const handleClose = () => { if (!isSubmitting) { resetForm(); onClose(); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateMode && !name.trim()) { setError('Ülesande nimi on kohustuslik'); return; }
    if (!isCreateMode && !selectedTaskId) { setError('Palun vali ülesanne'); return; }
    setIsSubmitting(true); setError(null);
    try {
      const entries = hasPlaylist ? playlistEntries.map(e => ({ text: e.text, stressedText: e.stressedText })) : [];
      if (isCreateMode) { await onCreateTask({ name: name.trim(), description: description.trim() || undefined, speechSequences: entries.map(e => e.text), speechEntries: entries.length > 0 ? entries : undefined }); }
      else { await onAddToExistingTask(selectedTaskId, entries, existingTasks.find(t => t.id === selectedTaskId)?.name || ''); }
      resetForm(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'Viga ülesande loomisel'); }
    finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;
  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Loo uus ülesanne" size="medium" className="task-modal">
      <form onSubmit={handleSubmit} className="task-modal__form">
        {hasPlaylist && <ModeSelector mode={mode} onChange={setMode} disabled={isSubmitting} />}
        {isCreateMode ? <CreateForm name={name} description={description} setName={setName} setDescription={setDescription} disabled={isSubmitting} /> : <TaskSelector tasks={existingTasks} selectedId={selectedTaskId} onChange={setSelectedTaskId} isLoading={isLoadingTasks} disabled={isSubmitting} />}
        <PlaylistPreview entries={playlistEntries} />
        {error && <div className="task-modal__error"><p>{error}</p></div>}
        <div className="task-modal__actions"><button type="button" onClick={handleClose} className="button button--secondary" disabled={isSubmitting}>Tühista</button><button type="submit" className="button button--primary" disabled={isSubmitting || (isCreateMode ? !name.trim() : !selectedTaskId)}>{isSubmitting ? (isCreateMode ? 'Loon...' : 'Salvestan...') : (isCreateMode ? 'Loo ülesanne' : 'Salvesta')}</button></div>
      </form>
    </BaseModal>
  );
}
