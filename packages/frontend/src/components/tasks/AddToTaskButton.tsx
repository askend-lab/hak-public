import { useCallback } from 'react';
import { useSynthesisStore, useUIStore } from '../../features';
import { useAuth } from '../../services/auth';

interface AddToTaskButtonProps {
  className?: string;
}

export function AddToTaskButton({ className = '' }: AddToTaskButtonProps) {
  const { result } = useSynthesisStore();
  const { openModal } = useUIStore();
  const { isAuthenticated } = useAuth();

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    openModal('taskSelect');
  }, [isAuthenticated, openModal]);

  if (!result?.audioUrl) {
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
