import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareTaskModal from './ShareTaskModal';

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: vi.fn(() => ({
    showNotification: vi.fn(),
  })),
}));

describe('ShareTaskModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <ShareTaskModal isOpen={false} shareToken="abc123" taskName="Test" onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when open', () => {
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      expect(screen.getByText('Jaga ülesanne')).toBeInTheDocument();
    });

    it('renders share URL with token', () => {
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      const input = screen.getByLabelText('Jagamislink');
      expect(input).toHaveValue();
      expect((input as HTMLInputElement).value).toContain('/shared/task/abc123');
    });

    it('renders copy button', () => {
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      expect(screen.getByRole('button', { name: 'Kopeeri' })).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      expect(screen.getByText(/Kopeeri ja jaga seda linki/)).toBeInTheDocument();
    });

    it('URL input is readonly', () => {
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      expect(screen.getByLabelText('Jagamislink')).toHaveAttribute('readonly');
    });

  });

  describe('copy button', () => {
    it('shows copy button', () => {
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      expect(screen.getByRole('button', { name: 'Kopeeri' })).toBeInTheDocument();
    });

    it('button is not disabled by default', () => {
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      expect(screen.getByRole('button', { name: 'Kopeeri' })).not.toBeDisabled();
    });
  });

  describe('copy functionality', () => {
    it('copies link to clipboard on button click', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } });
      const user = userEvent.setup();
      
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      
      await user.click(screen.getByRole('button', { name: 'Kopeeri' }));
      expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('/shared/task/abc123'));
    });

    it('handles clipboard error gracefully', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      
      render(
        <ShareTaskModal isOpen={true} shareToken="abc123" taskName="Test Task" onClose={mockOnClose} />
      );
      
      await user.click(screen.getByRole('button', { name: 'Kopeeri' }));
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
