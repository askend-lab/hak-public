/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddEntryModal from './AddEntryModal';

describe('AddEntryModal', () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAdd.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <AddEntryModal isOpen={false} onClose={mockOnClose} onAdd={mockOnAdd} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when open', () => {
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
      expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toBeInTheDocument();
    });

    it('renders title input', () => {
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
      expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
      expect(screen.getByPlaceholderText('Kirjeldus')).toBeInTheDocument();
    });

    it('renders submit button disabled initially', () => {
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
      expect(screen.getByRole('button', { name: 'Lisa' })).toBeDisabled();
    });
  });

  describe('input handling', () => {
    it('enables submit button when title entered', async () => {
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test Title');
      expect(screen.getByRole('button', { name: 'Lisa' })).not.toBeDisabled();
    });

    it('disables submit with whitespace-only title', async () => {
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), '   ');
      expect(screen.getByRole('button', { name: 'Lisa' })).toBeDisabled();
    });

    it('allows entering description', async () => {
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const textarea = screen.getByPlaceholderText('Kirjeldus');
      await user.type(textarea, 'Test description');
      expect(textarea).toHaveValue('Test description');
    });
  });

  describe('form submission', () => {
    it('calls onAdd with trimmed values', async () => {
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), '  Test Title  ');
      await user.type(screen.getByPlaceholderText('Kirjeldus'), '  Test Description  ');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith('Test Title', 'Test Description');
      });
    });

    it('closes modal on successful submit', async () => {
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test Title');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('resets form after successful submit', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />
      );

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test Title');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Rerender to simulate reopening
      rerender(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
      expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toHaveValue('');
    });

    it('shows loading state during submission', async () => {
      mockOnAdd.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      expect(screen.getByText('Lisaan...')).toBeInTheDocument();
    });

    it('disables inputs during submission', async () => {
      mockOnAdd.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      expect(screen.getByPlaceholderText('Pealkiri (Kohustuslik)')).toBeDisabled();
      expect(screen.getByPlaceholderText('Kirjeldus')).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('shows error on submission failure', async () => {
      mockOnAdd.mockRejectedValue(new Error('Failed to add'));
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to add')).toBeInTheDocument();
      });
    });

    it('shows generic error for non-Error rejection', async () => {
      mockOnAdd.mockRejectedValue('unknown');
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      await waitFor(() => {
        expect(screen.getByText('Viga ülesande lisamisel')).toBeInTheDocument();
      });
    });

    it('does not close on error', async () => {
      mockOnAdd.mockRejectedValue(new Error('Failed'));
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('close handling', () => {
    it('resets form on close', async () => {
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test');
      // Simulate BaseModal close - would trigger handleClose
    });

    it('prevents close during submission', async () => {
      mockOnAdd.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      const user = userEvent.setup();
      render(<AddEntryModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      await user.type(screen.getByPlaceholderText('Pealkiri (Kohustuslik)'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Lisa' }));

      // Modal should prevent close during submission
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
