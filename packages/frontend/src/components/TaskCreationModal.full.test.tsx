import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCreationModal from './TaskCreationModal';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'user-1', name: 'Test' } })),
}));

const mockGetUserTasks = vi.fn().mockResolvedValue([
  { id: 'task-1', name: 'Existing Task 1' },
  { id: 'task-2', name: 'Existing Task 2' },
]);

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({ getUserTasks: mockGetUserTasks })),
  },
}));

describe('TaskCreationModal Full', () => {
  const mockOnClose = vi.fn();
  const mockOnCreateTask = vi.fn().mockResolvedValue(undefined);
  const mockOnAddToExistingTask = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads existing tasks on open', async () => {
    render(
      <TaskCreationModal isOpen={true} onClose={mockOnClose} onCreateTask={mockOnCreateTask} onAddToExistingTask={mockOnAddToExistingTask} />
    );
    await waitFor(() => expect(mockGetUserTasks).toHaveBeenCalled());
  });

  it('allows adding description', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationModal isOpen={true} onClose={mockOnClose} onCreateTask={mockOnCreateTask} onAddToExistingTask={mockOnAddToExistingTask} />
    );
    
    const nameInput = screen.getByLabelText(/nimi/i);
    const descInput = screen.getByLabelText(/kirjeldus/i);
    
    await user.type(nameInput, 'Test Task');
    await user.type(descInput, 'Test Description');
    await user.click(screen.getByRole('button', { name: /Loo ülesanne/i }));
    
    expect(mockOnCreateTask).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Task',
      description: 'Test Description',
    }));
  });

  it('closes modal after successful creation', async () => {
    const user = userEvent.setup();
    render(
      <TaskCreationModal isOpen={true} onClose={mockOnClose} onCreateTask={mockOnCreateTask} onAddToExistingTask={mockOnAddToExistingTask} />
    );
    
    await user.type(screen.getByLabelText(/nimi/i), 'New Task');
    await user.click(screen.getByRole('button', { name: /Loo ülesanne/i }));
    
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
  });

  it('handles creation error gracefully', async () => {
    mockOnCreateTask.mockRejectedValueOnce(new Error('Creation failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    
    render(
      <TaskCreationModal isOpen={true} onClose={mockOnClose} onCreateTask={mockOnCreateTask} onAddToExistingTask={mockOnAddToExistingTask} />
    );
    
    await user.type(screen.getByLabelText(/nimi/i), 'Test Task');
    await user.click(screen.getByRole('button', { name: /Loo ülesanne/i }));
    
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it('resets form when modal closes and reopens', async () => {
    const { rerender } = render(
      <TaskCreationModal isOpen={true} onClose={mockOnClose} onCreateTask={mockOnCreateTask} onAddToExistingTask={mockOnAddToExistingTask} />
    );
    
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nimi/i), 'Some text');
    
    rerender(
      <TaskCreationModal isOpen={false} onClose={mockOnClose} onCreateTask={mockOnCreateTask} onAddToExistingTask={mockOnAddToExistingTask} />
    );
    
    rerender(
      <TaskCreationModal isOpen={true} onClose={mockOnClose} onCreateTask={mockOnCreateTask} onAddToExistingTask={mockOnAddToExistingTask} />
    );
    
    expect(screen.getByLabelText(/nimi/i)).toHaveValue('');
  });
});
