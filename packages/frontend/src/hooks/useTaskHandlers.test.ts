 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskHandlers } from './useTaskHandlers';
import { SentenceState } from '@/types/synthesis';

const mockShowNotification = vi.fn();
const mockSetShowLoginModal = vi.fn();

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', name: 'Test User' },
    isAuthenticated: true,
    setShowLoginModal: mockSetShowLoginModal,
  })),
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: vi.fn(() => ({
    showNotification: mockShowNotification,
  })),
}));

const mockCreateTask = vi.fn().mockResolvedValue({ id: 'new-task-1', name: 'New Task' });
const mockGetTask = vi.fn().mockResolvedValue({ id: 'task-1', name: 'Task 1', description: 'Desc', shareToken: 'token' });
const mockUpdateTask = vi.fn().mockResolvedValue({});
const mockDeleteTask = vi.fn().mockResolvedValue({});
const mockShareUserTask = vi.fn().mockResolvedValue({});
const mockAddTextEntriesToTask = vi.fn().mockResolvedValue({});
const mockGetUserTasks = vi.fn().mockResolvedValue([{ id: 'task-1', name: 'Task 1' }]);

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      createTask: mockCreateTask,
      getTask: mockGetTask,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
      shareUserTask: mockShareUserTask,
      addTextEntriesToTask: mockAddTextEntriesToTask,
      getUserTasks: mockGetUserTasks,
    })),
  },
}));

describe('useTaskHandlers', () => {
  const mockSentences: SentenceState[] = [
    { id: '1', text: 'Hello world', tags: ['Hello', 'world'], isPlaying: false, isLoading: false, currentInput: '', phoneticText: 'Héllo wórld' },
    { id: '2', text: 'Test', tags: ['Test'], isPlaying: false, isLoading: false, currentInput: '' },
  ];
  const mockSetCurrentView = vi.fn();
  const mockSetSelectedTaskId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with closed modals', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    expect(result.current.showTaskCreationModal).toBe(false);
    expect(result.current.showAddTaskModal).toBe(false);
    expect(result.current.showAddToTaskDropdown).toBe(false);
  });

  it('should toggle add to task dropdown', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.handleAddAllSentencesToTask();
    });

    expect(result.current.showAddToTaskDropdown).toBe(true);

    act(() => {
      result.current.handleAddAllSentencesToTask();
    });

    expect(result.current.showAddToTaskDropdown).toBe(false);
  });

  it('should add sentences to existing task', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleSelectTaskFromDropdown('task-1', 'Task 1');
    });

    expect(mockAddTextEntriesToTask).toHaveBeenCalledWith('user-1', 'task-1', expect.any(Array));
    expect(mockShowNotification).toHaveBeenCalledWith('success', expect.any(String), expect.any(String), undefined, undefined, expect.any(Object));
  });

  it('should open add task modal from dropdown', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.handleCreateNewFromDropdown();
    });

    expect(result.current.showAddTaskModal).toBe(true);
  });

  it('should add single sentence to existing task', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleAddSentenceToExistingTask('1', 'task-1', 'Task 1');
    });

    expect(mockAddTextEntriesToTask).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalled();
  });

  it('should open add task modal from menu', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.handleCreateNewTaskFromMenu('1');
    });

    expect(result.current.showAddTaskModal).toBe(true);
  });

  it('should create task', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.handleCreateTask();
    });

    expect(result.current.showAddTaskModal).toBe(true);
  });

  it('should handle task created', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleTaskCreated({ name: 'New Task', speechSequences: [] });
    });

    expect(mockCreateTask).toHaveBeenCalled();
    expect(mockShowNotification).toHaveBeenCalled();
    expect(mockSetSelectedTaskId).toHaveBeenCalledWith('new-task-1');
  });

  it('should add task with playlist entries', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleAddTask('New Task', 'Description');
    });

    expect(mockCreateTask).toHaveBeenCalledWith('user-1', expect.objectContaining({
      name: 'New Task',
      description: 'Description',
    }));
  });

  it('should edit task', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleEditTask({ id: 'task-1', name: 'Task 1', description: 'Desc' });
    });

    expect(mockGetTask).toHaveBeenCalledWith('task-1', 'user-1');
    expect(result.current.showTaskEditModal).toBe(true);
    expect(result.current.taskToEdit).toEqual({ id: 'task-1', name: 'Task 1', description: 'Desc' });
  });

  it('should update task', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    // Set taskToEdit first in a separate act
    act(() => {
      result.current.setTaskToEdit({ id: 'task-1', name: 'Updated Task', description: 'Updated Desc' });
    });

    // Then call handleTaskUpdated
    await act(async () => {
      await result.current.handleTaskUpdated();
    });

    expect(mockUpdateTask).toHaveBeenCalledWith('user-1', 'task-1', { name: 'Updated Task', description: 'Updated Desc' });
    expect(result.current.showTaskEditModal).toBe(false);
  });

  it('should delete task with confirmation', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleDeleteTask('task-1');
    });

    expect(result.current.showDeleteConfirmation).toBe(true);
    expect(result.current.taskToDelete).toEqual({ id: 'task-1', name: 'Task 1' });
  });

  it('should confirm delete', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleDeleteTask('task-1');
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteTask).toHaveBeenCalledWith('user-1', 'task-1');
    expect(result.current.showDeleteConfirmation).toBe(false);
  });

  it('should cancel delete', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleDeleteTask('task-1');
    });

    act(() => {
      result.current.handleCancelDelete();
    });

    expect(result.current.showDeleteConfirmation).toBe(false);
    expect(result.current.taskToDelete).toBeNull();
  });

  it('should share task', async () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleShareTask({ id: 'task-1', name: 'Task 1' });
    });

    expect(mockShareUserTask).toHaveBeenCalledWith('user-1', 'task-1');
    expect(result.current.showShareTaskModal).toBe(true);
    expect(result.current.taskToShare).toMatchObject({ id: 'task-1', name: 'Task 1' });
  });

  it('should close modals', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.setShowTaskCreationModal(true);
    });
    expect(result.current.showTaskCreationModal).toBe(true);

    act(() => {
      result.current.setShowTaskCreationModal(false);
    });
    expect(result.current.showTaskCreationModal).toBe(false);
  });

  it('should handle error when adding entries to task', async () => {
    mockAddTextEntriesToTask.mockRejectedValueOnce(new Error('Failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleSelectTaskFromDropdown('task-1', 'Task 1');
    });

    expect(mockShowNotification).toHaveBeenCalledWith('error', expect.any(String));
    consoleSpy.mockRestore();
  });

  it('should handle empty sentences when adding to task', async () => {
    const emptySentences: SentenceState[] = [
      { id: '1', text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '' },
    ];
    const { result } = renderHook(() => useTaskHandlers(emptySentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleSelectTaskFromDropdown('task-1', 'Task 1');
    });

    expect(mockAddTextEntriesToTask).not.toHaveBeenCalled();
  });

  it('should handle error when creating task', async () => {
    mockCreateTask.mockRejectedValueOnce(new Error('Failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleTaskCreated({ name: 'New Task', speechSequences: [] });
    });

    expect(mockShowNotification).toHaveBeenCalledWith('error', expect.any(String));
    consoleSpy.mockRestore();
  });

  it('should handle error when updating task', async () => {
    mockUpdateTask.mockRejectedValueOnce(new Error('Failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    // Set taskToEdit first in a separate act
    act(() => {
      result.current.setTaskToEdit({ id: 'task-1', name: 'Updated', description: 'Desc' });
    });

    // Then call handleTaskUpdated
    await act(async () => {
      await result.current.handleTaskUpdated();
    });

    expect(mockShowNotification).toHaveBeenCalledWith('error', expect.any(String));
    consoleSpy.mockRestore();
  });

  it('should handle error when deleting task', async () => {
    mockDeleteTask.mockRejectedValueOnce(new Error('Failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    await act(async () => {
      await result.current.handleDeleteTask('task-1');
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockShowNotification).toHaveBeenCalledWith('error', expect.any(String));
    consoleSpy.mockRestore();
  });

  it('should close share modal', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.setShowShareTaskModal(true);
    });
    expect(result.current.showShareTaskModal).toBe(true);

    act(() => {
      result.current.setShowShareTaskModal(false);
    });
    expect(result.current.showShareTaskModal).toBe(false);
  });

  it('should close edit modal', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.setShowTaskEditModal(true);
    });
    expect(result.current.showTaskEditModal).toBe(true);

    act(() => {
      result.current.setShowTaskEditModal(false);
    });
    expect(result.current.showTaskEditModal).toBe(false);
  });

  it('should toggle add task dropdown', () => {
    const { result } = renderHook(() => useTaskHandlers(mockSentences, mockSetCurrentView, mockSetSelectedTaskId));

    act(() => {
      result.current.setShowAddToTaskDropdown(true);
    });
    expect(result.current.showAddToTaskDropdown).toBe(true);
  });
});

describe('useTaskHandlers edge cases', () => {
  const sentences: SentenceState[] = [
    { id: '1', text: 'Hello', tags: ['Hello'], isPlaying: false, isLoading: false, currentInput: '', phoneticText: 'Hello' },
  ];
  const setView = vi.fn();
  const setTaskId = vi.fn();

  beforeEach(() => { vi.clearAllMocks(); });

  it('does not add sentence when not found', async () => {
    const { result } = renderHook(() => useTaskHandlers(sentences, setView, setTaskId));
    await act(async () => { await result.current.handleAddSentenceToExistingTask('nonexistent', 'task-1', 'Task 1'); });
    expect(mockAddTextEntriesToTask).not.toHaveBeenCalled();
  });

  it('does not add sentence with empty text', async () => {
    const empty: SentenceState[] = [{ id: '1', text: '   ', tags: [], isPlaying: false, isLoading: false, currentInput: '' }];
    const { result } = renderHook(() => useTaskHandlers(empty, setView, setTaskId));
    await act(async () => { await result.current.handleAddSentenceToExistingTask('1', 'task-1', 'Task 1'); });
    expect(mockAddTextEntriesToTask).not.toHaveBeenCalled();
  });

  it('handles error when adding single sentence', async () => {
    mockAddTextEntriesToTask.mockRejectedValueOnce(new Error('Failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTaskHandlers(sentences, setView, setTaskId));
    await act(async () => { await result.current.handleAddSentenceToExistingTask('1', 'task-1', 'Task 1'); });
    expect(mockShowNotification).toHaveBeenCalledWith('error', expect.any(String));
  });

});
