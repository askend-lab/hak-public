import SynthesisPageHeader from './SynthesisPageHeader';
import SentenceMenu from './SentenceMenu';
import SentenceSynthesisItem from './SentenceSynthesisItem';
import { Sentence } from '@/types';
import { Task } from '@/types';

interface SynthesisViewProps {
  sentences: Sentence[];
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  openTagMenu: { sentenceId: string; tagIndex: number } | null;
  editingTag: { sentenceId: string; tagIndex: number; value: string } | null;
  draggedId: string | null;
  dragOverId: string | null;
  isAuthenticated: boolean;
  menuOpenId: string | null;
  menuAnchorEl: Record<string, HTMLElement | null>;
  menuSearchQuery: string;
  isLoadingMenuTasks: boolean;
  menuTasks: Task[];
  showAddToTaskDropdown: boolean;
  variantsSelectedSentenceId: string | null;
  variantsSelectedTagIndex: number | null;
  sentencePhoneticId: string | null;
  isVariantsPanelOpen: boolean;
  showSentencePhoneticPanel: boolean;
  onAddAllClick: () => void;
  onPlayAllClick: () => void;
  onDropdownClose: () => void;
  onSelectTask: (taskId: string, taskName: string) => void;
  onCreateNew: () => void;
  onPlay: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onTagMenuOpen: (sentenceId: string, tagIndex: number) => void;
  onTagMenuClose: () => void;
  onOpenVariantsFromMenu: () => void;
  onEditTag: () => void;
  onDeleteTag: () => void;
  onEditTagChange: (value: string) => void;
  onEditTagKeyDown: (e: React.KeyboardEvent) => void;
  onEditTagCommit: () => void;
  onInputChange: (id: string, value: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onInputBlur: () => void;
  onClearSentence: (id: string) => void;
  onMenuOpen: (id: string, el: HTMLElement) => void;
  onMenuClose: () => void;
  onMenuSearchChange: (value: string) => void;
  onAddToTask: (sentenceId: string, taskId: string, taskName: string) => void;
  onCreateNewTask: (sentenceId: string) => void;
  onExplorePhonetic: (id: string) => void;
  onDownload: (id: string) => void;
  onRemoveSentence: (id: string) => void;
  onLogin: () => void;
  onAddSentence: () => void;
}

const tagMenuItems = (p: SynthesisViewProps) => [{ label: 'Uuri variandid', onClick: p.onOpenVariantsFromMenu }, { label: 'Muuda', onClick: p.onEditTag }, { label: 'Kustuta', onClick: p.onDeleteTag, danger: true }];

const SentenceItem = ({ sentence, sentenceIndex, p }: { sentence: Sentence; sentenceIndex: number; p: SynthesisViewProps }) => {
  const isMenuOpen = p.menuOpenId === sentence.id && p.menuAnchorEl[sentence.id];
  const isTagSelected = (p.isVariantsPanelOpen || p.showSentencePhoneticPanel) && (p.variantsSelectedSentenceId === sentence.id || p.sentencePhoneticId === sentence.id);
  return (
    <SentenceSynthesisItem key={sentence.id} id={sentence.id} text={sentence.text} tags={sentence.tags} mode="input" draggable={true} isDragging={p.draggedId === sentence.id} isDragOver={p.dragOverId === sentence.id} isPlaying={sentence.isPlaying} isLoading={sentence.isLoading} onPlay={p.onPlay} onDragStart={p.onDragStart} onDragEnd={p.onDragEnd} onDragOver={p.onDragOver} onDragLeave={p.onDragLeave} onDrop={p.onDrop} onTagMenuOpen={p.onTagMenuOpen} openTagMenu={p.openTagMenu} onTagMenuClose={p.onTagMenuClose} tagMenuItems={tagMenuItems(p)} selectedTagIndex={isTagSelected ? p.variantsSelectedTagIndex : null} isPronunciationPanelOpen={p.isVariantsPanelOpen || p.showSentencePhoneticPanel} editingTag={p.editingTag} onEditTagChange={p.onEditTagChange} onEditTagKeyDown={p.onEditTagKeyDown} onEditTagCommit={p.onEditTagCommit} currentInput={sentence.currentInput} onInputChange={p.onInputChange} onInputKeyDown={(e) => p.onInputKeyDown(e, sentence.id)} onInputBlur={p.onInputBlur} onClear={p.onClearSentence} sentenceIndex={sentenceIndex} onMenuOpenLegacy={p.onMenuOpen}
      menuContent={isMenuOpen ? <SentenceMenu isAuthenticated={p.isAuthenticated} sentenceId={sentence.id} sentenceText={sentence.text} menuSearchQuery={p.menuSearchQuery} onSearchChange={p.onMenuSearchChange} isLoadingTasks={p.isLoadingMenuTasks} tasks={p.menuTasks} onAddToTask={p.onAddToTask} onCreateNewTask={p.onCreateNewTask} onExplorePhonetic={p.onExplorePhonetic} onDownload={p.onDownload} onRemove={p.onRemoveSentence} onLogin={p.onLogin} onClose={p.onMenuClose} /> : undefined}
    />
  );
};

export default function SynthesisView(props: SynthesisViewProps) {
  return (
    <>
      <SynthesisPageHeader sentenceCount={props.sentences.filter(s => s.text.trim()).length} isPlayingAll={props.isPlayingAll} isLoadingPlayAll={props.isLoadingPlayAll} onAddAllClick={props.onAddAllClick} onPlayAllClick={props.onPlayAllClick} showDropdown={props.showAddToTaskDropdown} onDropdownClose={props.onDropdownClose} onSelectTask={props.onSelectTask} onCreateNew={props.onCreateNew} />
      <div className="page-content"><div className="sentences-section">{props.sentences.map((s, i) => <SentenceItem key={s.id} sentence={s} sentenceIndex={i} p={props} />)}<div className="add-sentence-button-wrapper"><button className="button button--secondary" onClick={props.onAddSentence} data-onboarding-target="add-sentence-button">Lisa lause</button></div></div></div>
    </>
  );
}
