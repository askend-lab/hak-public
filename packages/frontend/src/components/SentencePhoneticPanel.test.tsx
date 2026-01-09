import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SentencePhoneticPanel from './SentencePhoneticPanel';

describe('SentencePhoneticPanel', () => {
  const defaultProps = {
    sentenceText: 'Hello world',
    phoneticText: 'Héllo wórld',
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when not open', () => {
    const { container } = render(
      <SentencePhoneticPanel {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    render(<SentencePhoneticPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /rakenda/i })).toBeInTheDocument();
  });

  it('displays phonetic text', () => {
    render(<SentencePhoneticPanel {...defaultProps} />);
    expect(screen.getByDisplayValue('Héllo wórld')).toBeInTheDocument();
  });

  it('allows editing phonetic text', async () => {
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);
    
    const input = screen.getByDisplayValue('Héllo wórld');
    await user.clear(input);
    await user.type(input, 'New phonetic');
    
    expect(input).toHaveValue('New phonetic');
  });

  it('calls onApply when apply button is clicked', async () => {
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);
    
    const applyButton = screen.getByRole('button', { name: /rakenda/i });
    await user.click(applyButton);
    
    expect(defaultProps.onApply).toHaveBeenCalledWith('Héllo wórld');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SentencePhoneticPanel {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /sulge/i });
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('uses sentenceText when phoneticText is null', () => {
    render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} />);
    expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
  });
});
