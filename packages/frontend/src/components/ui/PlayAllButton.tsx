import { PlayIcon, PauseIcon } from './Icons';

interface PlayAllButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function PlayAllButton({ isPlaying, isLoading, disabled, onClick }: PlayAllButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`button button--primary ${isLoading ? 'loading' : ''}`}
      disabled={disabled}
    >
      {isLoading ? (
        <div className="loader-spinner"></div>
      ) : isPlaying ? (
        <PauseIcon size="2xl" />
      ) : (
        <PlayIcon size="2xl" />
      )}
      {isLoading ? 'Laadimine' : isPlaying ? 'Peata' : 'Mängi kõik'}
    </button>
  );
}
