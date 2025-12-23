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
  setLoading: (isLoading) => { set({ isLoading } as Partial<T>); },
  setError: (error) => { set({ error } as Partial<T>); },
  clearError: () => { set({ error: null } as Partial<T>); },
});
