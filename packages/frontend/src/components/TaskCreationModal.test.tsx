import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskCreationModal from './TaskCreationModal';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '38001085718', name: 'Test User', email: 'test@test.ee' },
  })),
}));

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getUserTasks: vi.fn().mockResolvedValue([]),
    })),
  },
}));

describe('TaskCreationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreateTask = vi.fn();
  const mockOnAddToExistingTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnCreateTask.mockResolvedValue(undefined);
    mockOnAddToExistingTask.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <TaskCreationModal
          isOpen={false}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
          onAddToExistingTask={mockOnAddToExistingTask}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when open', () => {
      render(
        <TaskCreationModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
          onAddToExistingTask={mockOnAddToExistingTask}
        />
      );
      expect(screen.getByText('Loo uus ülesanne')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(
        <TaskCreationModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
          onAddToExistingTask={mockOnAddToExistingTask}
        />
      );
      expect(screen.getByRole('button', { name: /Loo ülesanne/i })).toBeInTheDocument();
    });

    it('renders name input field', () => {
      render(
        <TaskCreationModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
          onAddToExistingTask={mockOnAddToExistingTask}
        />
      );
      expect(screen.getByLabelText(/nimi/i)).toBeInTheDocument();
    });

    it('renders description field', () => {
      render(
        <TaskCreationModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
          onAddToExistingTask={mockOnAddToExistingTask}
        />
      );
      expect(screen.getByLabelText(/kirjeldus/i)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onCreateTask when form submitted with name', async () => {
      const { userEvent } = await import('@testing-library/user-event');
      const user = userEvent.setup();

      render(
        <TaskCreationModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
          onAddToExistingTask={mockOnAddToExistingTask}
        />
      );

      const nameInput = screen.getByLabelText(/nimi/i);
      await user.type(nameInput, 'New Task Name');
      
      const submitButton = screen.getByRole('button', { name: /Loo ülesanne/i });
      await user.click(submitButton);

      expect(mockOnCreateTask).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Task Name',
      }));
    });

    it('does not call onCreateTask when name is empty', async () => {
      const { userEvent } = await import('@testing-library/user-event');
      const user = userEvent.setup();

      render(
        <TaskCreationModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateTask={mockOnCreateTask}
          onAddToExistingTask={mockOnAddToExistingTask}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Loo ülesanne/i });
      await user.click(submitButton);

      expect(mockOnCreateTask).not.toHaveBeenCalled();
    });
  });

});
