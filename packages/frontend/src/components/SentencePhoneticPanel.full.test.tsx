 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SentencePhoneticPanel from './SentencePhoneticPanel';

vi.mock('@/utils/phoneticMarkers', () => ({
  transformToUI: (text: string | null) => text?.replace(/</, '`').replace(/\?/, '´') ?? null,
  transformToVabamorf: (text: string | null) => text?.replace(/`/, '<').replace(/´/, '?') ?? null,
}));

vi.mock('@/utils/synthesize', () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue('mock-audio-url'),
}));

describe('SentencePhoneticPanel', () => {
  const defaultProps = {
    sentenceText: 'Hello world',
    phoneticText: 'H`ello w`orld',
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Audio
    class MockAudio {
      src = ''; onloadeddata: (() => void) | null = null; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(() => { setTimeout(() => this.onended?.(), 10); return Promise.resolve(); });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('rendering', () => {
    it('returns null when not open', () => {
      const { container } = render(<SentencePhoneticPanel {...defaultProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders panel when open', () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByText('Muuda häälduskuju')).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByLabelText('Sulge')).toBeInTheDocument();
    });

    it('renders textarea with phonetic text', () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('H`ello w`orld');
    });

    it('uses sentence text when no phonetic text', () => {
      render(<SentencePhoneticPanel {...defaultProps} phoneticText={null} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Hello world');
    });

    it('renders marker buttons', () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByTitle('kolmas välde')).toBeInTheDocument();
      expect(screen.getByTitle('ebareeglipärase rõhu märk')).toBeInTheDocument();
      expect(screen.getByTitle('peenendus')).toBeInTheDocument();
      expect(screen.getByTitle('liitsõnapiir')).toBeInTheDocument();
    });

    it('renders play button', () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByText('Kuula')).toBeInTheDocument();
    });

    it('renders apply button', () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByText('Rakenda')).toBeInTheDocument();
    });
  });

  describe('close functionality', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      
      await user.click(screen.getByLabelText('Sulge'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('text editing', () => {
    it('allows editing text in textarea', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'New text');
      expect(textarea).toHaveValue('New text');
    });

    it('inserts marker when marker button clicked', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} phoneticText="test" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Focus and position cursor at the end
      textarea.focus();
      textarea.setSelectionRange(4, 4);
      
      await user.click(screen.getByTitle('kolmas välde'));
      expect(textarea.value).toContain('`');
    });
  });

  describe('apply functionality', () => {
    it('calls onApply with transformed text when apply clicked', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} phoneticText="test`" />);
      
      await user.click(screen.getByText('Rakenda'));
      
      expect(defaultProps.onApply).toHaveBeenCalledWith('test<');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables apply button when text is empty', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} phoneticText="test" />);
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      
      expect(screen.getByText('Rakenda')).toBeDisabled();
    });
  });

  describe('play functionality', () => {
    it('disables play button when text is empty', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} phoneticText="test" />);
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      
      expect(screen.getByText('Kuula').closest('button')).toBeDisabled();
    });
  });

  describe('guide view', () => {
    it('shows guide link', () => {
      render(<SentencePhoneticPanel {...defaultProps} />);
      expect(screen.getByText('siit')).toBeInTheDocument();
    });

    it('shows guide view when guide link clicked', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      
      await user.click(screen.getByText('siit'));
      expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
    });

    it('shows marker documentation in guide', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      
      await user.click(screen.getByText('siit'));
      expect(screen.getByText('kolmas välde')).toBeInTheDocument();
      expect(screen.getByText('ebareeglipärase rõhu märk')).toBeInTheDocument();
      expect(screen.getByText('peenendus')).toBeInTheDocument();
      expect(screen.getByText('liitsõnapiir')).toBeInTheDocument();
    });

    it('returns to edit view when back button clicked', async () => {
      const user = userEvent.setup();
      render(<SentencePhoneticPanel {...defaultProps} />);
      
      await user.click(screen.getByText('siit'));
      expect(screen.getByText('Foneetiliste märkide juhend')).toBeInTheDocument();
      
      await user.click(screen.getByLabelText('Tagasi'));
      expect(screen.queryByText('Foneetiliste märkide juhend')).not.toBeInTheDocument();
      expect(screen.getByText('Kuula')).toBeInTheDocument();
    });
  });
});
