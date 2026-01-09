import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { CreateTaskModal } from './CreateTaskModal';

vi.mock('../../services/tasks', () => ({
  createTask: vi.fn(() => Promise.resolve({ success: true, data: { id: 'new-task-id' } })),
}));

vi.mock('../../services/auth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'user-123' } })),
}));

describe('CreateTaskModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title "Lisa ülesanne"', () => {
    render(<CreateTaskModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Lisa ülesanne')).toBeInTheDocument();
  });

  it('renders TaskForm with title and description inputs', () => {
    render(<CreateTaskModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Kirjeldus')).toBeInTheDocument();
  });

  it('renders Lisa button', () => {
    render(<CreateTaskModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByRole('button', { name: 'Lisa' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    render(<CreateTaskModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const closeButton = document.querySelector('.modal__close');
    fireEvent.click(closeButton!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls createTask and onSuccess when form submitted', async () => {
    const { createTask } = await import('../../services/tasks');
    render(<CreateTaskModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), { target: { value: 'New Task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa' }));
    
    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith('user-123', expect.objectContaining({
        name: 'New Task',
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('does not render when isOpen is false', () => {
    render(<CreateTaskModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.queryByText('Lisa ülesanne')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop clicked', () => {
    render(<CreateTaskModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const backdrop = document.querySelector('.modal-overlay');
    fireEvent.click(backdrop!);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
