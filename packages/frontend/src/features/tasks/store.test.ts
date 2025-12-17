import { useTasksStore, getSelectedTask } from './store';

describe('useTasksStore', () => {
  const mockTask = {
    id: 'task-1',
    userId: 'user-1',
    text: 'Test task',
    createdAt: '2024-01-01',
    status: 'pending' as const,
  };

  beforeEach(() => {
    useTasksStore.setState({
      tasks: [],
      selectedTaskId: null,
      isLoading: false,
      error: null,
    });
  });

  describe('task actions', () => {
    it('should set tasks', () => {
      useTasksStore.getState().setTasks([mockTask]);
      expect(useTasksStore.getState().tasks).toHaveLength(1);
    });

    it('should add task', () => {
      useTasksStore.getState().addTask(mockTask);
      expect(useTasksStore.getState().tasks).toContainEqual(mockTask);
    });

    it('should update task', () => {
      useTasksStore.setState({ tasks: [mockTask] });
      useTasksStore.getState().updateTask('task-1', { text: 'Updated' });
      expect(useTasksStore.getState().tasks[0].text).toBe('Updated');
    });

    it('should not update non-existent task', () => {
      useTasksStore.setState({ tasks: [mockTask] });
      useTasksStore.getState().updateTask('non-existent', { text: 'Updated' });
      expect(useTasksStore.getState().tasks[0].text).toBe('Test task');
    });

    it('should remove task', () => {
      useTasksStore.setState({ tasks: [mockTask] });
      useTasksStore.getState().removeTask('task-1');
      expect(useTasksStore.getState().tasks).toHaveLength(0);
    });
  });

  describe('selection actions', () => {
    it('should select task', () => {
      useTasksStore.getState().selectTask('task-1');
      expect(useTasksStore.getState().selectedTaskId).toBe('task-1');
    });

    it('should deselect task', () => {
      useTasksStore.setState({ selectedTaskId: 'task-1' });
      useTasksStore.getState().selectTask(null);
      expect(useTasksStore.getState().selectedTaskId).toBeNull();
    });
  });

  describe('loading and error states', () => {
    it('should set loading', () => {
      useTasksStore.getState().setLoading(true);
      expect(useTasksStore.getState().isLoading).toBe(true);
    });

    it('should set error', () => {
      useTasksStore.getState().setError('Something went wrong');
      expect(useTasksStore.getState().error).toBe('Something went wrong');
    });

    it('should reset to initial state', () => {
      useTasksStore.setState({
        tasks: [mockTask],
        selectedTaskId: 'task-1',
        isLoading: true,
        error: 'Error',
      });
      useTasksStore.getState().reset();
      expect(useTasksStore.getState().tasks).toHaveLength(0);
      expect(useTasksStore.getState().selectedTaskId).toBeNull();
      expect(useTasksStore.getState().isLoading).toBe(false);
      expect(useTasksStore.getState().error).toBeNull();
    });
  });
});

describe('getSelectedTask', () => {
  const mockTask = {
    id: 'task-1',
    userId: 'user-1',
    text: 'Test task',
    createdAt: '2024-01-01',
    status: 'pending' as const,
  };

  it('should return null when no task selected', () => {
    const state = { tasks: [mockTask], selectedTaskId: null, isLoading: false, error: null };
    expect(getSelectedTask(state)).toBeNull();
  });

  it('should return selected task', () => {
    const state = { tasks: [mockTask], selectedTaskId: 'task-1', isLoading: false, error: null };
    expect(getSelectedTask(state)).toEqual(mockTask);
  });

  it('should return null when selected task not found', () => {
    const state = { tasks: [mockTask], selectedTaskId: 'non-existent', isLoading: false, error: null };
    expect(getSelectedTask(state)).toBeNull();
  });
});
