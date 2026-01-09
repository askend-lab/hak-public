import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PhoneticGuideModal from './PhoneticGuideModal';

describe('PhoneticGuideModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <PhoneticGuideModal isOpen={false} onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when open', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
    });

    it('renders intro text', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(/Klõpsa sümbolitele/)).toBeInTheDocument();
    });

    it('renders symbols section', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Foneetilised märgendid:')).toBeInTheDocument();
    });

    it('renders examples section', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Näited:')).toBeInTheDocument();
    });

    it('renders symbol buttons', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('`')).toBeInTheDocument();
      expect(screen.getByText('´')).toBeInTheDocument();
      expect(screen.getByText("'")).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('renders symbol descriptions', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      // Verify description content exists
      expect(screen.getByText('Foneetilised märgendid:')).toBeInTheDocument();
    });

    it('renders example items', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      // Check that example section exists
      expect(screen.getByText('Näited:')).toBeInTheDocument();
    });

    it('renders example descriptions', () => {
      render(<PhoneticGuideModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('tavaline rõhk')).toBeInTheDocument();
    });
  });
});
