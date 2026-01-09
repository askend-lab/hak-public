import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PronunciationVariants from './PronunciationVariants';

vi.mock('@/utils/phoneticMarkers', () => ({
  transformToUI: (text: string | null) => text?.replace(/</, '`').replace(/\?/, '´') ?? null,
  transformToVabamorf: (text: string | null) => text?.replace(/`/, '<').replace(/´/, '?') ?? null,
}));

vi.mock('@/utils/synthesize', () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue('mock-audio-url'),
}));

describe('PronunciationVariants', () => {
  const defaultProps = {
    word: 'test',
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    // Mock Audio
    class MockAudio {
      src = ''; onloadeddata: (() => void) | null = null; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => { setTimeout(() => this.onended?.(), 10); return Promise.resolve(); });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(
        <PronunciationVariants {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders panel when open', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ variants: [] }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('renders close button', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ variants: [] }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading message while fetching', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<PronunciationVariants {...defaultProps} />);
      expect(screen.getByText('Laen variante...')).toBeInTheDocument();
    });
  });

  describe('variants display', () => {
    it('displays fetched variants', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [
            { text: 't<est', description: 'Third syllable' },
            { text: 'te?st', description: 'Stress' },
          ],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('t`est')).toBeInTheDocument();
        expect(screen.getByText('te´st')).toBeInTheDocument();
      });
    });

    it('shows play buttons for variants', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Mängi')).toBeInTheDocument();
      });
    });

    it('shows use button for variants', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Kasuta')).toBeInTheDocument();
      });
    });

    it('filters duplicate variants by text', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [
            { text: 'test', description: 'First' },
            { text: 'test', description: 'Duplicate' },
            { text: 'test2', description: 'Different' },
          ],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        const useButtons = screen.getAllByText('Kasuta');
        expect(useButtons.length).toBe(2); // Only 2 unique variants
      });
    });
  });

  describe('error handling', () => {
    it('displays error message on fetch failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/viga/i)).toBeInTheDocument();
      });
    });
  });

  describe('interactions', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ variants: [] }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await user.click(screen.getByLabelText('Close'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onUseVariant when use button clicked', async () => {
      const user = userEvent.setup();
      const onUseVariant = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} onUseVariant={onUseVariant} />);
      
      await waitFor(() => {
        expect(screen.getByText('Kasuta')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Kasuta'));
      expect(onUseVariant).toHaveBeenCalledWith('test');
    });
  });

  describe('custom variant form', () => {
    it('shows toggle link for custom variant', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
    });

    it('opens custom variant form when clicked', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Loo oma variant'));
      expect(screen.getByPlaceholderText('Kirjuta oma foneetiline variant')).toBeInTheDocument();
    });

    it('shows phonetic marker buttons in custom form', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Loo oma variant'));
      
      expect(screen.getByTitle('Kolmas välde')).toBeInTheDocument();
      expect(screen.getByTitle('Rõhuline silp')).toBeInTheDocument();
      expect(screen.getByTitle('Palatalisatsioon')).toBeInTheDocument();
      expect(screen.getByTitle('Liitsõna piir')).toBeInTheDocument();
    });

    it('allows entering custom variant', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Loo oma variant'));
      
      const input = screen.getByPlaceholderText('Kirjuta oma foneetiline variant');
      await user.type(input, 'custom text');
      expect(input).toHaveValue('custom text');
    });

    it('shows clear button when custom variant has content', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Loo oma variant'));
      
      const input = screen.getByPlaceholderText('Kirjuta oma foneetiline variant');
      await user.type(input, 'custom');
      
      expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
    });

    it('closes custom form when toggle clicked again', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Loo oma variant'));
      expect(screen.getByPlaceholderText('Kirjuta oma foneetiline variant')).toBeInTheDocument();
      
      await user.click(screen.getByText('Eemalda loodud variant'));
      expect(screen.queryByPlaceholderText('Kirjuta oma foneetiline variant')).not.toBeInTheDocument();
    });
  });

  describe('guide view', () => {
    it('opens guide view when guide link clicked', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Loo oma variant'));
      await user.click(screen.getByText('siit'));
      
      expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
    });

    it('closes guide view when back button clicked', async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      render(<PronunciationVariants {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Loo oma variant')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Loo oma variant'));
      await user.click(screen.getByText('siit'));
      expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
      
      await user.click(screen.getByLabelText('Tagasi variantide juurde'));
      expect(screen.queryByText('Foneetiliste märkide juhend')).not.toBeInTheDocument();
    });
  });

  describe('selected variant highlighting', () => {
    it('highlights selected variant when customPhoneticForm matches', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          variants: [{ text: 'test', description: 'Normal' }],
        }),
      });
      
      const { container } = render(
        <PronunciationVariants {...defaultProps} customPhoneticForm="test" />
      );
      
      await waitFor(() => {
        expect(container.querySelector('.pronunciation-variants__item--selected')).toBeInTheDocument();
      });
    });
  });
});
