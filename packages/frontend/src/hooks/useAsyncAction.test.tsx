import { renderHook, act, waitFor } from '@testing-library/react';

import { useUIStore } from '../features';

import { useAsyncAction } from './useAsyncAction';

jest.mock('../features', () => ({
  useUIStore: jest.fn(),
}));

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

describe('useAsyncAction', () => {
  const mockAddNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUIStore.mockReturnValue({
      addNotification: mockAddNotification,
    } as jest.Mocked<Partial<ReturnType<typeof useUIStore>>>);
  });

  it('should initialize with correct state', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useAsyncAction(action));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should execute action successfully', async () => {
    const action = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      const value = await result.current.execute();
      expect(value).toBe('result');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle action failure', async () => {
    const action = jest.fn().mockRejectedValue(new Error('Test error'));
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('Test error');
    expect(mockAddNotification).toHaveBeenCalledWith('error', 'Test error');
  });

  it('should show success notification', async () => {
    const action = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => 
      useAsyncAction(action, { showNotification: true, successMessage: 'Success!' })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(mockAddNotification).toHaveBeenCalledWith('success', 'Success!');
  });

  it('should use custom error message', async () => {
    const action = jest.fn().mockRejectedValue(new Error('Original'));
    const { result } = renderHook(() => 
      useAsyncAction(action, { errorMessage: 'Custom error' })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(mockAddNotification).toHaveBeenCalledWith('error', 'Custom error');
  });

  it('should not show notification when disabled', async () => {
    const action = jest.fn().mockRejectedValue(new Error('Error'));
    const { result } = renderHook(() => 
      useAsyncAction(action, { showNotification: false })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('should reset state', async () => {
    const action = jest.fn().mockRejectedValue(new Error('Error'));
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('Error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle non-Error rejection', async () => {
    const action = jest.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useAsyncAction(action));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe('Operation failed');
  });
});
