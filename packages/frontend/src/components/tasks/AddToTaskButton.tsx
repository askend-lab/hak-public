import { useCallback } from 'react';

import { useSynthesisStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';

interface AddToTaskButtonProps {
  className?: string;
}

export function AddToTaskButton({ className = '' }: AddToTaskButtonProps) {
  const { result } = useSynthesisStore();
  const { openModal } = useUIStore();
  useAuth(); // Keep hook for future auth check

  const handleClick = useCallback(() => {
    // TODO: Re-enable auth check after testing
    // if (!isAuthenticated) {
    //   openModal('login');
    //   return;
    // }
    openModal('taskSelect');
  }, [openModal]);

  if (!result?.audioUrl || result.audioUrl === '') {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`add-to-task-button ${className}`}
    >
      + Lisa ülesandesse
    </button>
  );
}
