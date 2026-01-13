/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskManager from './TaskManager';

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', name: 'Test User' },
    isAuthenticated: true,
  })),
}));

const mockTasks = [
  { id: 'task-1', name: 'Task 1', description: 'Description 1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), shareToken: 'token1' },
  { id: 'task-2', name: 'Task 2', description: 'Description 2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), shareToken: 'token2' },
];

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getUserTasks: vi.fn().mockResolvedValue(mockTasks),
    })),
  },
}));

describe('TaskManager', () => {
  const defaultProps = {
    onCreateTask: vi.fn(),
    onEditTask: vi.fn(),
    onViewTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onShareTask: vi.fn(),
    refreshTrigger: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getByText('Laen ülesandeid...')).toBeInTheDocument();
  });

  it('should render tasks after loading', async () => {
    render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should call onViewTask when task is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Task 1'));
    expect(defaultProps.onViewTask).toHaveBeenCalledWith('task-1');
  });

  it('should refresh tasks when refreshTrigger changes', async () => {
    const { rerender } = render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    rerender(<TaskManager {...defaultProps} refreshTrigger={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
  });

  it('should open menu when more options clicked', async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const moreButtons = screen.getAllByLabelText('More options');
    await user.click(moreButtons[0]!);
    
    await waitFor(() => {
      expect(screen.getByText('Muuda')).toBeInTheDocument();
      expect(screen.getByText('Jaga')).toBeInTheDocument();
      expect(screen.getByText('Kustuta')).toBeInTheDocument();
    });
  });

  it('should call onEditTask when edit clicked', async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const moreButtons = screen.getAllByLabelText('More options');
    await user.click(moreButtons[0]!);
    
    await waitFor(() => {
      expect(screen.getByText('Muuda')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Muuda'));
    expect(defaultProps.onEditTask).toHaveBeenCalledWith('task-1');
  });

  it('should call onShareTask when share clicked', async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const moreButtons = screen.getAllByLabelText('More options');
    await user.click(moreButtons[0]!);
    
    await waitFor(() => {
      expect(screen.getByText('Jaga')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jaga'));
    expect(defaultProps.onShareTask).toHaveBeenCalledWith('task-1');
  });

  it('should call onDeleteTask when delete clicked', async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const moreButtons = screen.getAllByLabelText('More options');
    await user.click(moreButtons[0]!);
    
    await waitFor(() => {
      expect(screen.getByText('Kustuta')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Kustuta'));
    expect(defaultProps.onDeleteTask).toHaveBeenCalledWith('task-1');
  });

  it('should close menu when backdrop clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<TaskManager {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const moreButtons = screen.getAllByLabelText('More options');
    await user.click(moreButtons[0]!);
    
    await waitFor(() => {
      expect(screen.getByText('Muuda')).toBeInTheDocument();
    });

    const backdrop = container.querySelector('.task-manager__menu-backdrop');
    if (backdrop) await user.click(backdrop);
    
    await waitFor(() => {
      expect(screen.queryByText('Muuda')).not.toBeInTheDocument();
    });
  });

});
