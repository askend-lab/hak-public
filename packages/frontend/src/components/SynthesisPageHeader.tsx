import AddToTaskDropdown from './AddToTaskDropdown';

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
            {isLoadingPlayAll ? <div className="loader-spinner"></div> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d={isPlayingAll ? "M7 6h3v12H7zm7 0h3v12h-3z" : "M8.31 6.5c.01-.002.07-.005.25.07.18.07.41.18.75.36l8.65 4.37c.38.19.63.32.81.43.16.1.2.15.2.15a.5.5 0 010 .25s-.04.05-.2.15c-.18.11-.43.24-.81.43L9.31 17.08c-.34.17-.57.29-.75.36-.18.07-.24.07-.25.07a.32.32 0 01-.25-.14c-.01-.01-.03-.04-.04-.2-.02-.18-.02-.42-.02-.79V7.63c0-.37 0-.61.02-.79.01-.16.03-.19.04-.2a.32.32 0 01.25-.14z"} fill="currentColor"/></svg>}
            {isLoadingPlayAll ? 'Laadimine' : isPlayingAll ? 'Peata' : 'Mängi kõik'}
          </button>
        )}
      </div>
    </div>
  );
}
