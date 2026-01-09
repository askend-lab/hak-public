import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { PhoneticGuideModal } from './PhoneticGuideModal';

describe('PhoneticGuideModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render modal with title', () => {
    render(<PhoneticGuideModal onClose={mockOnClose} />);
    expect(screen.getByText('Foneetilised sümbolid')).toBeInTheDocument();
  });

  it('should render all phonetic symbols', () => {
    render(<PhoneticGuideModal onClose={mockOnClose} />);
    expect(screen.getByText('`')).toBeInTheDocument();
    expect(screen.getByText('´')).toBeInTheDocument();
    expect(screen.getByText("'")).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('should render symbol names in Estonian', () => {
    render(<PhoneticGuideModal onClose={mockOnClose} />);
    expect(screen.getByText('Kolmas pikkusaste')).toBeInTheDocument();
    expect(screen.getByText('Rõhumärk')).toBeInTheDocument();
    expect(screen.getByText('Palatalisatsioon')).toBeInTheDocument();
    expect(screen.getByText('Liitsõna piir')).toBeInTheDocument();
  });

  it('should render example words', () => {
    render(<PhoneticGuideModal onClose={mockOnClose} />);
    expect(screen.getByText(/sa`ada/)).toBeInTheDocument();
    expect(screen.getByText(/kooli\+tüdruk/)).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(<PhoneticGuideModal onClose={mockOnClose} />);
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have dialog role', () => {
    render(<PhoneticGuideModal onClose={mockOnClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<PhoneticGuideModal onClose={mockOnClose} />);
    expect(screen.getByLabelText('Phonetic guide')).toBeInTheDocument();
  });
});
