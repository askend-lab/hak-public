export interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncActions {
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const initialAsyncState: AsyncState = {
  isLoading: false,
  error: null,
};

export const createAsyncActions = <T extends AsyncState>(
  set: (partial: Partial<T>) => void
): AsyncActions => ({
  setLoading: (isLoading): void => { set({ isLoading } as Partial<T>); },
  setError: (error): void => { set({ error } as Partial<T>); },
  clearError: (): void => { set({ error: null } as Partial<T>); },
});
