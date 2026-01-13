import AddToTaskDropdown from './AddToTaskDropdown';
import { PlayIcon, PauseIcon } from './ui/Icons';

interface SynthesisPageHeaderProps {
  sentenceCount: number;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  onAddAllClick: () => void;
  onPlayAllClick: () => void;
  showDropdown: boolean;
  onDropdownClose: () => void;
  onSelectTask: (taskId: string, taskName: string) => void;
  onCreateNew: () => void;
}

export default function SynthesisPageHeader({ sentenceCount, isPlayingAll, isLoadingPlayAll, onAddAllClick, onPlayAllClick, showDropdown, onDropdownClose, onSelectTask, onCreateNew }: SynthesisPageHeaderProps) {
  return (
    <div className="page-header page-header--full">
      <div className="page-header__content">
        <h1 className="page-header__title">Teksti kõnesüntees</h1>
        <p className="page-header__description">Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante</p>
      </div>
      <div className="page-header__actions">
        {sentenceCount > 0 && (
          <div className="add-to-task-container">
            <button className="button button--secondary" onClick={onAddAllClick} data-onboarding-target="save-to-task-button">Lisa ülesandesse ({sentenceCount})</button>
            <AddToTaskDropdown isOpen={showDropdown} onClose={onDropdownClose} onSelectTask={onSelectTask} onCreateNew={onCreateNew} />
          </div>
        )}
        {sentenceCount > 1 && (
          <button className={`button button--primary ${isLoadingPlayAll ? 'loading' : ''}`} onClick={onPlayAllClick}>
            {isLoadingPlayAll ? <div className="loader-spinner"></div> : isPlayingAll ? <PauseIcon size="2xl" /> : <PlayIcon size="2xl" />}
            {isLoadingPlayAll ? 'Laadimine' : isPlayingAll ? 'Peata' : 'Mängi kõik'}
          </button>
        )}
      </div>
    </div>
  );
}
