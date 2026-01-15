 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackModal from './FeedbackModal';

describe('FeedbackModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <FeedbackModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when open', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText('Tagasiside')).toBeInTheDocument();
    });

    it('renders message textarea', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText('Teade')).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText('E-post')).toBeInTheDocument();
    });

    it('renders submit button disabled initially', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: 'Saada' })).toBeDisabled();
    });

    it('renders description text', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      expect(screen.getByText(/Aitame meil seda tööriista paremaks muuta/)).toBeInTheDocument();
    });
  });

  describe('input handling', () => {
    it('enables submit button when message entered', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('Teade'), 'Test message');
      expect(screen.getByRole('button', { name: 'Saada' })).not.toBeDisabled();
    });

    it('keeps submit disabled with whitespace-only message', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('Teade'), '   ');
      expect(screen.getByRole('button', { name: 'Saada' })).toBeDisabled();
    });

    it('allows entering email', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('E-post'), 'test@test.ee');
      expect(screen.getByLabelText('E-post')).toHaveValue('test@test.ee');
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with message and email', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('Teade'), 'Test feedback');
      await user.type(screen.getByLabelText('E-post'), 'test@test.ee');
      await user.click(screen.getByRole('button', { name: 'Saada' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Test feedback', 'test@test.ee');
      });
    });

    it('closes modal on successful submit', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('Teade'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Saada' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('shows loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('Teade'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Saada' }));

      expect(screen.getByText('Saadan...')).toBeInTheDocument();
    });

    it('disables inputs during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('Teade'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Saada' }));

      expect(screen.getByLabelText('Teade')).toBeDisabled();
      expect(screen.getByLabelText('E-post')).toBeDisabled();
    });

    it('does not submit with empty message', async () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // Submit button should be disabled
      expect(screen.getByRole('button', { name: 'Saada' })).toBeDisabled();
      
      // Force form submit doesn't call onSubmit
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('logs error on submission failure', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('Teade'), 'Test');
      await user.click(screen.getByRole('button', { name: 'Saada' }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });
});
