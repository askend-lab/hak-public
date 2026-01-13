/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TaskDetailView from './TaskDetailView';

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', name: 'Test User' },
    isAuthenticated: true,
  })),
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: vi.fn(() => ({
    showNotification: vi.fn(),
  })),
}));

const mockTask = {
  id: 'task-1',
  name: 'Test Task',
  description: 'Test Description',
  shareToken: 'share-token-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  speechEntries: [
    { id: 'entry-1', text: 'Entry 1', stressedText: 'Entry 1', order: 0 },
    { id: 'entry-2', text: 'Entry 2', stressedText: 'Entry 2', order: 1 },
  ],
};

const mockGetTask = vi.fn().mockResolvedValue(mockTask);

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getTask: mockGetTask,
      deleteTaskEntry: vi.fn().mockResolvedValue({}),
      reorderTaskEntries: vi.fn().mockResolvedValue({}),
    })),
  },
}));

describe('TaskDetailView', () => {
  const defaultProps = {
    taskId: 'task-1',
    onBack: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onAddEntryFromInput: vi.fn(),
    onAddEntry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTask.mockResolvedValue(mockTask);
  });

  it('should render loading state initially', () => {
    render(<TaskDetailView {...defaultProps} />);
    expect(screen.getByText(/laen/i)).toBeInTheDocument();
  });

  it('should render task name after loading', async () => {
    render(<TaskDetailView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should call getTask with correct params', async () => {
    render(<TaskDetailView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetTask).toHaveBeenCalledWith('task-1', 'user-1');
    });
  });

  it('should show error when task not found', async () => {
    mockGetTask.mockResolvedValue(null);
    render(<TaskDetailView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/ei leitud/i)).toBeInTheDocument();
    });
  });

  it('should render task description when available', async () => {
    render(<TaskDetailView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });
});
