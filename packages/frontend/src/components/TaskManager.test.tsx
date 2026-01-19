import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskManager from './TaskManager';
import { TaskSummary } from '@/types/task';

const mockTasks: TaskSummary[] = [
  { id: 'task-1', name: 'Task 1', description: 'Description 1', createdAt: new Date(), updatedAt: new Date(), entryCount: 5 },
  { id: 'task-2', name: 'Task 2', description: 'Description 2', createdAt: new Date(), updatedAt: new Date(), entryCount: 3 },
];

describe('TaskManager', () => {
  const defaultProps = {
    tasks: mockTasks,
    onEditTask: vi.fn(),
    onViewTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onShareTask: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render tasks', () => {
    render(<TaskManager {...defaultProps} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should call onViewTask when task is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

    await user.click(screen.getByText('Task 1'));
    expect(defaultProps.onViewTask).toHaveBeenCalledWith('task-1');
  });

  it('should open menu when more options clicked', async () => {
    const user = userEvent.setup();
    render(<TaskManager {...defaultProps} />);

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

  it('should render empty when no tasks provided', () => {
    render(<TaskManager {...defaultProps} tasks={[]} />);
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });
});
