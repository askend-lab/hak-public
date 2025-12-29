import { useState, useCallback } from 'react';

import { useUIStore } from '../features';

interface AsyncActionOptions {
  successMessage?: string;
  errorMessage?: string;
  showNotification?: boolean;
}

interface AsyncActionState {
  isLoading: boolean;
  error: string | null;
}

interface AsyncActionResult<T> extends AsyncActionState {
  execute: (...args: unknown[]) => Promise<T | undefined>;
  reset: () => void;
}

export function useAsyncAction<T>(
  action: (...args: unknown[]) => Promise<T>,
  options: AsyncActionOptions = {}
): AsyncActionResult<T> {
  const [state, setState] = useState<AsyncActionState>({
    isLoading: false,
    error: null,
  });
  const { addNotification } = useUIStore();
  
  const { successMessage, errorMessage, showNotification } = options;

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | undefined> => {
      setState({ isLoading: true, error: null });
      try {
        const result = await action(...args);
        setState({ isLoading: false, error: null });
        if (showNotification === true && successMessage !== undefined && successMessage !== '') {
          addNotification('success', successMessage);
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Operation failed';
        setState({ isLoading: false, error: message });
        if (showNotification !== false) {
          addNotification('error', errorMessage ?? message);
        }
        return undefined;
      }
    },
    [action, successMessage, errorMessage, showNotification, addNotification]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
