/* eslint-disable max-lines-per-function, max-lines */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StressedTextDisplay from './StressedTextDisplay';

vi.mock('./PhoneticGuideModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="phonetic-guide-modal"><button onClick={onClose}>Close Modal</button></div> : null
}));

vi.mock('@/utils/phoneticMarkers', () => ({
  transformToUI: (text: string | null) => text?.replace(/</, '`').replace(/\?/, '´') ?? null,
  transformToVabamorf: (text: string | null) => text?.replace(/`/, '<').replace(/´/, '?') ?? null,
}));

describe('StressedTextDisplay', () => {
  const defaultProps = {
    stressedText: 'tere maailm',
    originalText: 'tere maailm',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('returns null when no stressedText', () => {
      const { container } = render(
        <StressedTextDisplay {...defaultProps} stressedText={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders phonetic section when stressedText provided', () => {
      render(<StressedTextDisplay {...defaultProps} />);
      expect(screen.getByText('Foneetiline kuju:')).toBeInTheDocument();
    });

    it('renders original words', () => {
      render(<StressedTextDisplay {...defaultProps} />);
      expect(screen.getByText('tere')).toBeInTheDocument();
      expect(screen.getByText('maailm')).toBeInTheDocument();
    });

    it('renders phonetic text', () => {
      render(<StressedTextDisplay {...defaultProps} />);
      expect(screen.getByText('tere maailm')).toBeInTheDocument();
    });

    it('shows edit button', () => {
      render(<StressedTextDisplay {...defaultProps} />);
      expect(screen.getByTitle('Muuda foneetilist teksti')).toBeInTheDocument();
    });
  });

  describe('word click interactions', () => {
    it('makes words clickable when onWordClick provided', () => {
      const onWordClick = vi.fn();
      const { container } = render(
        <StressedTextDisplay {...defaultProps} onWordClick={onWordClick} />
      );
      expect(container.querySelectorAll('.word-element.clickable').length).toBe(2);
    });

    it('calls onWordClick when word clicked', async () => {
      const user = userEvent.setup();
      const onWordClick = vi.fn();
      render(<StressedTextDisplay {...defaultProps} onWordClick={onWordClick} />);
      
      await user.click(screen.getByText('tere'));
      expect(onWordClick).toHaveBeenCalledWith('tere', 0);
    });

    it('highlights selected word when panel open', () => {
      const onWordClick = vi.fn();
      const { container } = render(
        <StressedTextDisplay 
          {...defaultProps} 
          onWordClick={onWordClick}
          selectedWord="tere"
          isPronunciationPanelOpen={true}
        />
      );
      expect(container.querySelector('.word-element.selected')).toBeInTheDocument();
    });

    it('shows interaction hint when onWordClick provided', () => {
      const onWordClick = vi.fn();
      render(<StressedTextDisplay {...defaultProps} onWordClick={onWordClick} />);
      expect(screen.getByText(/klõpsa sõnale/i)).toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('enters edit mode when edit button clicked', async () => {
      const user = userEvent.setup();
      render(<StressedTextDisplay {...defaultProps} />);
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows save and cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      render(<StressedTextDisplay {...defaultProps} />);
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      expect(screen.getByTitle('Salvesta muudatused')).toBeInTheDocument();
      expect(screen.getByTitle('Tühista muudatused')).toBeInTheDocument();
    });

    it('allows editing text', async () => {
      const user = userEvent.setup();
      render(<StressedTextDisplay {...defaultProps} />);
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'new text');
      expect(textarea).toHaveValue('new text');
    });

    it('calls onPhoneticTextChange on save', async () => {
      const user = userEvent.setup();
      const onPhoneticTextChange = vi.fn();
      render(
        <StressedTextDisplay 
          {...defaultProps} 
          onPhoneticTextChange={onPhoneticTextChange}
        />
      );
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'modified');
      await user.click(screen.getByTitle('Salvesta muudatused'));
      
      expect(onPhoneticTextChange).toHaveBeenCalledWith('modified');
    });

    it('cancels edit mode without saving', async () => {
      const user = userEvent.setup();
      const onPhoneticTextChange = vi.fn();
      render(
        <StressedTextDisplay 
          {...defaultProps} 
          onPhoneticTextChange={onPhoneticTextChange}
        />
      );
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'modified');
      await user.click(screen.getByTitle('Tühista muudatused'));
      
      expect(onPhoneticTextChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows phonetic symbol toolbar in edit mode', async () => {
      const user = userEvent.setup();
      render(<StressedTextDisplay {...defaultProps} />);
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      expect(screen.getByTitle('Kolmas välde')).toBeInTheDocument();
      expect(screen.getByTitle('Rõhuline silp')).toBeInTheDocument();
      expect(screen.getByTitle('Palatalisatsioon')).toBeInTheDocument();
      expect(screen.getByTitle('Liitsõna piir')).toBeInTheDocument();
    });

    it('inserts symbol when symbol button clicked', async () => {
      const user = userEvent.setup();
      render(<StressedTextDisplay {...defaultProps} />);
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'test');
      
      await user.click(screen.getByTitle('Kolmas välde'));
      expect(textarea.value).toContain('`');
    });
  });

  describe('action buttons', () => {
    it('shows play button when onPlayStressed provided', () => {
      const onPlayStressed = vi.fn();
      render(<StressedTextDisplay {...defaultProps} onPlayStressed={onPlayStressed} />);
      expect(screen.getByText('Kuula')).toBeInTheDocument();
    });

    it('calls onPlayStressed when play clicked', async () => {
      const user = userEvent.setup();
      const onPlayStressed = vi.fn();
      render(<StressedTextDisplay {...defaultProps} onPlayStressed={onPlayStressed} />);
      
      await user.click(screen.getByText('Kuula'));
      expect(onPlayStressed).toHaveBeenCalled();
    });

    it('disables play button when loading', () => {
      const onPlayStressed = vi.fn();
      render(
        <StressedTextDisplay 
          {...defaultProps} 
          onPlayStressed={onPlayStressed}
          isStressedLoading={true}
        />
      );
      expect(screen.getByText('Kuula').closest('button')).toBeDisabled();
    });

    it('shows add to playlist button when available', () => {
      const onAddStressedToPlaylist = vi.fn();
      render(
        <StressedTextDisplay 
          {...defaultProps} 
          onAddStressedToPlaylist={onAddStressedToPlaylist}
          canAddStressedToPlaylist={true}
        />
      );
      expect(screen.getByText('Lisa kõnevooru')).toBeInTheDocument();
    });

    it('calls onAddStressedToPlaylist when clicked', async () => {
      const user = userEvent.setup();
      const onAddStressedToPlaylist = vi.fn();
      render(
        <StressedTextDisplay 
          {...defaultProps} 
          onAddStressedToPlaylist={onAddStressedToPlaylist}
          canAddStressedToPlaylist={true}
        />
      );
      
      await user.click(screen.getByText('Lisa kõnevooru'));
      expect(onAddStressedToPlaylist).toHaveBeenCalled();
    });

    it('shows add to task button when available', () => {
      const onAddStressedToTask = vi.fn();
      render(
        <StressedTextDisplay 
          {...defaultProps} 
          onAddStressedToTask={onAddStressedToTask}
          canAddStressedToTask={true}
        />
      );
      expect(screen.getByText('Lisa ülesandesse')).toBeInTheDocument();
    });

    it('calls onAddStressedToTask when clicked', async () => {
      const user = userEvent.setup();
      const onAddStressedToTask = vi.fn();
      render(
        <StressedTextDisplay 
          {...defaultProps} 
          onAddStressedToTask={onAddStressedToTask}
          canAddStressedToTask={true}
        />
      );
      
      await user.click(screen.getByText('Lisa ülesandesse'));
      expect(onAddStressedToTask).toHaveBeenCalled();
    });
  });

  describe('phonetic guide modal', () => {
    it('opens guide modal when guide button clicked', async () => {
      const user = userEvent.setup();
      render(<StressedTextDisplay {...defaultProps} />);
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      await user.click(screen.getByTitle('Ava täielik juhend'));
      
      expect(screen.getByTestId('phonetic-guide-modal')).toBeInTheDocument();
    });

    it('closes guide modal', async () => {
      const user = userEvent.setup();
      render(<StressedTextDisplay {...defaultProps} />);
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      await user.click(screen.getByTitle('Ava täielik juhend'));
      expect(screen.getByTestId('phonetic-guide-modal')).toBeInTheDocument();
      
      await user.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('phonetic-guide-modal')).not.toBeInTheDocument();
    });
  });

  describe('does not show word click in edit mode', () => {
    it('words are not clickable in edit mode', async () => {
      const user = userEvent.setup();
      const onWordClick = vi.fn();
      const { container } = render(
        <StressedTextDisplay {...defaultProps} onWordClick={onWordClick} />
      );
      
      await user.click(screen.getByTitle('Muuda foneetilist teksti'));
      
      expect(container.querySelectorAll('.word-element.clickable').length).toBe(0);
    });
  });
});
