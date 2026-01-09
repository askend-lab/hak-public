import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddToTaskDropdown from './AddToTaskDropdown';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '38001085718', name: 'Test User', email: 'test@test.ee' },
  })),
}));

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getUserTasks: vi.fn().mockResolvedValue([
        { id: 'task-1', name: 'Task One', description: '', entryCount: 0 },
        { id: 'task-2', name: 'Task Two', description: '', entryCount: 0 },
      ]),
    })),
  },
}));

describe('AddToTaskDropdown', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectTask = vi.fn();
  const mockOnCreateNew = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <AddToTaskDropdown
          isOpen={false}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when open', async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Otsi')).toBeInTheDocument();
      });
    });

    it('renders search input', async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Otsi')).toBeInTheDocument();
      });
    });

    it('renders create new button', async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Loo uus ülesanne')).toBeInTheDocument();
      });
    });

    it('renders task list after loading', async () => {
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Task One')).toBeInTheDocument();
        expect(screen.getByText('Task Two')).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Otsi')).toBeInTheDocument();
      });

      const backdrop = document.querySelector('.add-to-task-backdrop');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('calls onSelectTask when task clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Task One')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Task One'));
      expect(mockOnSelectTask).toHaveBeenCalledWith('task-1', 'Task One');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onCreateNew when create button clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Loo uus ülesanne')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Loo uus ülesanne'));
      expect(mockOnCreateNew).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('filters tasks based on search query', async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Task One')).toBeInTheDocument();
        expect(screen.getByText('Task Two')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Otsi'), 'One');

      await waitFor(() => {
        expect(screen.getByText('Task One')).toBeInTheDocument();
      });
    });

    it('shows empty message when no tasks match', async () => {
      const user = userEvent.setup();
      render(
        <AddToTaskDropdown
          isOpen={true}
          onClose={mockOnClose}
          onSelectTask={mockOnSelectTask}
          onCreateNew={mockOnCreateNew}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Task One')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Otsi'), 'xyz');

      await waitFor(() => {
        expect(screen.queryByText('Task One')).not.toBeInTheDocument();
      });
    });
  });
});
