import PronunciationVariants from './PronunciationVariants';
import TaskCreationModal from './TaskCreationModal';
import TaskEditModal from './TaskEditModal';
import AddEntryModal from './AddEntryModal';
import ShareTaskModal from './ShareTaskModal';
import LoginModal from './LoginModal';
import ConfirmationModal from './ConfirmationModal';
import SentencePhoneticPanel from './SentencePhoneticPanel';
import { OnboardingWizard } from './onboarding';
import { DataService } from '@/services/dataService';
import { CreateTaskRequest } from '@/types/task';
import { SentenceState, filterNonEmptySentences } from '@/types/synthesis';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Task {
  id: string;
  name: string;
  description?: string | null;
  shareToken?: string;
}


interface AppModalsProps {
  user: User | null;
  sentences: SentenceState[];
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  showNotification: (type: 'success' | 'error', title: string, desc?: string) => void;
  isWizardActive: boolean;
  variants: { variantsWord: string | null; isVariantsPanelOpen: boolean; handleCloseVariants: () => void; variantsCustomPhonetic: string | null; setVariantsCustomPhonetic: (v: string | null) => void; sentencePhoneticId: string | null; showSentencePhoneticPanel: boolean; handleCloseSentencePhonetic: () => void; };
  synthesis: { sentences: SentenceState[]; handleSentencePhoneticApply: (id: string, text: string) => void; };
  taskHandlers: { showAddTaskModal: boolean; setShowAddTaskModal: (v: boolean) => void; handleAddTask: (t: string, d: string) => Promise<void>; showTaskCreationModal: boolean; setShowTaskCreationModal: (v: boolean) => void; handleTaskCreated: (taskData: CreateTaskRequest) => Promise<void>; taskToEdit: Task | null; showTaskEditModal: boolean; setShowTaskEditModal: (v: boolean) => void; setTaskToEdit: (t: Task | null) => void; handleTaskUpdated: (updatedTask: { id: string; name: string; description?: string | null }) => Promise<void>; taskToShare: Task | null; showShareTaskModal: boolean; setShowShareTaskModal: (v: boolean) => void; setTaskToShare: (t: Task | null) => void; showDeleteConfirmation: boolean; taskToDelete: Task | null; handleConfirmDelete: () => void; handleCancelDelete: () => void; };
  onUseVariant: (text: string) => void;
}

 
export default function AppModals({ user, sentences, showLoginModal, setShowLoginModal, showNotification, isWizardActive, variants, synthesis, taskHandlers, onUseVariant }: AppModalsProps) {
  const playlistEntries = filterNonEmptySentences(sentences).map(s => ({ id: s.id, text: s.text, stressedText: s.phoneticText || s.text, audioUrl: s.audioUrl || null, audioBlob: null }));
  const handleAddToExisting = async (taskId: string, entries: { text: string; stressedText: string }[], taskName: string) => {
    if (!user) return;
    try { await DataService.getInstance().addTextEntriesToTask(user.id, taskId, entries); taskHandlers.setShowTaskCreationModal(false); showNotification('success', 'Lisatud ülesandesse', `${entries.length} lauset lisatud ülesandesse ${taskName}!`); }
    catch { showNotification('error', 'Lausete lisamine ebaõnnestus'); }
  };
  return (
    <>
      <PronunciationVariants word={variants.variantsWord} isOpen={variants.isVariantsPanelOpen} onClose={variants.handleCloseVariants} onUseVariant={onUseVariant} customPhoneticForm={variants.variantsCustomPhonetic} />
      {variants.sentencePhoneticId && <SentencePhoneticPanel sentenceText={synthesis.sentences.find(s => s.id === variants.sentencePhoneticId)?.text || ''} phoneticText={synthesis.sentences.find(s => s.id === variants.sentencePhoneticId)?.phoneticText || null} isOpen={variants.showSentencePhoneticPanel} onClose={variants.handleCloseSentencePhonetic} onApply={(newPhoneticText) => { synthesis.handleSentencePhoneticApply(variants.sentencePhoneticId!, newPhoneticText); showNotification('success', 'Lause uus häälduskuju rakendatud'); }} />}
      <AddEntryModal isOpen={taskHandlers.showAddTaskModal} onClose={() => taskHandlers.setShowAddTaskModal(false)} onAdd={taskHandlers.handleAddTask} />
      <TaskCreationModal isOpen={taskHandlers.showTaskCreationModal} onClose={() => taskHandlers.setShowTaskCreationModal(false)} onCreateTask={taskHandlers.handleTaskCreated} onAddToExistingTask={handleAddToExisting} playlistEntries={playlistEntries} />
      {taskHandlers.taskToEdit && <TaskEditModal isOpen={taskHandlers.showTaskEditModal} task={taskHandlers.taskToEdit} onClose={() => { taskHandlers.setShowTaskEditModal(false); taskHandlers.setTaskToEdit(null); }} onSave={async (updatedTask) => { await taskHandlers.handleTaskUpdated(updatedTask); }} setTaskToEdit={taskHandlers.setTaskToEdit} />}
      {taskHandlers.taskToShare && <ShareTaskModal isOpen={taskHandlers.showShareTaskModal} shareToken={taskHandlers.taskToShare.shareToken || ''} taskName={taskHandlers.taskToShare.name} onClose={() => { taskHandlers.setShowShareTaskModal(false); taskHandlers.setTaskToShare(null); }} />}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} message="Sisene, et luua ja hallata ülesandeid" />
      <ConfirmationModal isOpen={taskHandlers.showDeleteConfirmation} title="Kustuta ülesanne" message={`Kas oled kindel, et soovid ülesande "${taskHandlers.taskToDelete?.name}" kustutada?`} confirmText="Kustuta" cancelText="Tühista" onConfirm={taskHandlers.handleConfirmDelete} onCancel={taskHandlers.handleCancelDelete} variant="danger" />
      {isWizardActive && <OnboardingWizard />}
    </>
  );
}
