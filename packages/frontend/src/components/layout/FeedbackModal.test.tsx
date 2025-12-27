import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { FeedbackModal } from './FeedbackModal';

describe('FeedbackModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render modal with title', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    expect(screen.getByText('Tagasiside')).toBeInTheDocument();
  });

  it('should render message textarea', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    expect(screen.getByLabelText('Sõnum')).toBeInTheDocument();
  });

  it('should render email input marked as optional', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    expect(screen.getByLabelText(/E-post/)).toBeInTheDocument();
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it('should render submit and cancel buttons', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    expect(screen.getByText('Saada')).toBeInTheDocument();
    expect(screen.getByText('Tühista')).toBeInTheDocument();
  });

  it('should call onClose when cancel button clicked', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Tühista'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button clicked', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show thank you message after submit', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    const textarea = screen.getByLabelText('Sõnum');
    fireEvent.change(textarea, { target: { value: 'Test feedback' } });
    fireEvent.click(screen.getByText('Saada'));
    expect(screen.getByText('Täname!')).toBeInTheDocument();
    expect(screen.getByText('Teie tagasiside on edastatud.')).toBeInTheDocument();
  });

  it('should have dialog role', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should update message value on input', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    const textarea = screen.getByLabelText('Sõnum') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'My feedback' } });
    expect(textarea.value).toBe('My feedback');
  });

  it('should update email value on input', () => {
    render(<FeedbackModal onClose={mockOnClose} />);
    const emailInput = screen.getByLabelText(/E-post/) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });
});
