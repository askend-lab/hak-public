import { vi } from 'vitest';
import { initialAsyncState, createAsyncActions, AsyncState } from './asyncSlice';

describe('asyncSlice', () => {
  describe('initialAsyncState', () => {
    it('should have isLoading set to false', () => {
      expect(initialAsyncState.isLoading).toBe(false);
    });

    it('should have error set to null', () => {
      expect(initialAsyncState.error).toBeNull();
    });
  });

  describe('createAsyncActions', () => {
    let state: AsyncState;
    let set: vi.Mock;
    let actions: ReturnType<typeof createAsyncActions>;

    beforeEach(() => {
      state = { ...initialAsyncState };
      set = vi.fn((partial) => Object.assign(state, partial));
      actions = createAsyncActions(set);
    });

    it('setLoading should update isLoading', () => {
      actions.setLoading(true);
      expect(set).toHaveBeenCalledWith({ isLoading: true });
    });

    it('setError should update error', () => {
      actions.setError('Test error');
      expect(set).toHaveBeenCalledWith({ error: 'Test error' });
    });

    it('clearError should set error to null', () => {
      actions.clearError();
      expect(set).toHaveBeenCalledWith({ error: null });
    });
  });
});
