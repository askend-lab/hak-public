import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TasksView from './TasksView';

const mockGetTask = vi.fn();
const mockGetTasks = vi.fn();

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getTask: mockGetTask,
      getTasks: mockGetTasks,
    })),
  },
}));

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', name: 'Test User' },
    isAuthenticated: true,
  })),
}));

vi.mock('./TaskManager', () => ({
  default: ({ onEditTask }: { onEditTask: (taskId: string) => void }) => (
    <div data-testid="task-manager">
      <button onClick={() => onEditTask('task-1')}>Edit Task 1</button>
    </div>
  ),
}));

vi.mock('./TaskDetailView', () => ({
  default: ({ taskId, onEditTask }: { taskId: string; onEditTask: (id: string) => void }) => (
    <div data-testid="task-detail-view">
      <div>Task ID: {taskId}</div>
      <button onClick={() => onEditTask(taskId)}>Muuda</button>
    </div>
  ),
}));

describe('TasksView - Edit Task Bug', () => {
  const mockOnBack = vi.fn();
  const mockOnViewTask = vi.fn();
  const mockOnCreateTask = vi.fn();
  const mockOnEditTask = vi.fn();
  const mockOnDeleteTask = vi.fn();
  const mockOnShareTask = vi.fn();
  const mockOnNavigateToSynthesis = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTask.mockResolvedValue({
      id: 'task-1',
      name: 'Test Task',
      description: 'Test Description',
      entries: [],
    });
  });

  it('should pass full task data when editing from task list', async () => {
    const user = userEvent.setup();
    
    render(
      <TasksView
        selectedTaskId={null}
        taskRefreshTrigger={0}
        onBack={mockOnBack}
        onViewTask={mockOnViewTask}
        onCreateTask={mockOnCreateTask}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
        onShareTask={mockOnShareTask}
        onNavigateToSynthesis={mockOnNavigateToSynthesis}
      />
    );

    const editButton = screen.getByText('Edit Task 1');
    await user.click(editButton);

    await waitFor(() => {
      expect(mockOnEditTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'task-1',
          name: expect.any(String),
          description: expect.any(String),
        })
      );
    });

    const call = mockOnEditTask.mock.calls[0]?.[0];
    expect(call?.name).not.toBe('');
    expect(call?.description).toBeDefined();
  });

  it('should pass full task data when editing from detail view', async () => {
    const user = userEvent.setup();
    
    render(
      <TasksView
        selectedTaskId="task-1"
        taskRefreshTrigger={0}
        onBack={mockOnBack}
        onViewTask={mockOnViewTask}
        onCreateTask={mockOnCreateTask}
        onEditTask={mockOnEditTask}
        onDeleteTask={mockOnDeleteTask}
        onShareTask={mockOnShareTask}
        onNavigateToSynthesis={mockOnNavigateToSynthesis}
      />
    );

    const editButton = screen.getByText('Muuda');
    await user.click(editButton);

    await waitFor(() => {
      expect(mockOnEditTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'task-1',
          name: expect.any(String),
          description: expect.any(String),
        })
      );
    });

    const call = mockOnEditTask.mock.calls[0]?.[0];
    expect(call?.name).not.toBe('');
  });
});
