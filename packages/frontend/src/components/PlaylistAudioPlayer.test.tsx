import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaylistAudioPlayer from './PlaylistAudioPlayer';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

describe('PlaylistAudioPlayer', () => {
  const defaultProps = {
    id: 'test-id',
    text: 'Test text',
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock HTMLAudioElement
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('rendering', () => {
    it('renders text', () => {
      render(<PlaylistAudioPlayer {...defaultProps} />);
      expect(screen.getByText('Test text')).toBeInTheDocument();
    });

    it('renders stressed text when provided', () => {
      render(<PlaylistAudioPlayer {...defaultProps} stressedText="Stressed text" />);
      expect(screen.getByText('Stressed text')).toBeInTheDocument();
    });

    it('renders audio controls when audioUrl provided', () => {
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      expect(screen.getByTitle('Mängi')).toBeInTheDocument();
    });

    it('renders audio controls when audioBlob provided', () => {
      const blob = new Blob(['test'], { type: 'audio/wav' });
      render(<PlaylistAudioPlayer {...defaultProps} audioBlob={blob} />);
      expect(screen.getByTitle('Mängi')).toBeInTheDocument();
    });

    it('does not render audio controls when no audio', () => {
      render(<PlaylistAudioPlayer {...defaultProps} />);
      expect(screen.queryByTitle('Mängi')).not.toBeInTheDocument();
    });
  });

  describe('drag handle', () => {
    it('shows drag handle when draggable', () => {
      render(<PlaylistAudioPlayer {...defaultProps} isDraggable={true} />);
      expect(screen.getByTitle('Lohista järjekorra muutmiseks')).toBeInTheDocument();
    });

    it('does not show drag handle when not draggable', () => {
      render(<PlaylistAudioPlayer {...defaultProps} isDraggable={false} />);
      expect(screen.queryByTitle('Lohista järjekorra muutmiseks')).not.toBeInTheDocument();
    });
  });

  describe('options buttons', () => {
    it('shows edit button when showOptions and onEdit provided', () => {
      const onEdit = vi.fn();
      render(<PlaylistAudioPlayer {...defaultProps} showOptions={true} onEdit={onEdit} />);
      expect(screen.getByTitle('Muuda')).toBeInTheDocument();
    });

    it('shows delete button when showOptions is true', () => {
      render(<PlaylistAudioPlayer {...defaultProps} showOptions={true} />);
      expect(screen.getByTitle('Kustuta')).toBeInTheDocument();
    });

    it('does not show buttons when showOptions is false', () => {
      render(<PlaylistAudioPlayer {...defaultProps} showOptions={false} />);
      expect(screen.queryByTitle('Kustuta')).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<PlaylistAudioPlayer {...defaultProps} showOptions={true} onEdit={onEdit} />);
      
      await user.click(screen.getByTitle('Muuda'));
      expect(onEdit).toHaveBeenCalledWith('test-id');
    });

    it('calls onDelete when delete button clicked', async () => {
      const user = userEvent.setup();
      render(<PlaylistAudioPlayer {...defaultProps} showOptions={true} />);
      
      await user.click(screen.getByTitle('Kustuta'));
      expect(defaultProps.onDelete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('play functionality', () => {
    it('calls onPlay when play button clicked with onPlay prop', async () => {
      const user = userEvent.setup();
      const onPlay = vi.fn();
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" onPlay={onPlay} />);
      
      await user.click(screen.getByTitle('Mängi'));
      expect(onPlay).toHaveBeenCalledWith('test-id');
    });

    it('shows loading state when isLoading', () => {
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" isLoading={true} />);
      expect(screen.getByTitle('Laen...')).toBeInTheDocument();
    });

    it('disables play button when loading', () => {
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" isLoading={true} />);
      expect(screen.getByTitle('Laen...')).toBeDisabled();
    });

    it('shows pause icon when playing via onPlay callback', () => {
      const onPlay = vi.fn();
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" isPlaying={true} onPlay={onPlay} />);
      expect(screen.getByTitle('Peata')).toBeInTheDocument();
    });
  });

  describe('audio progress', () => {
    it('renders progress bar when audio available', () => {
      const { container } = render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      expect(container.querySelector('.playlist-audio-progress-bar')).toBeInTheDocument();
    });

    it('renders time displays', () => {
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      expect(screen.getAllByText('0:00').length).toBeGreaterThan(0);
    });
  });

  describe('speed control', () => {
    it('shows speed button when audio available', () => {
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      expect(screen.getByTitle('Muuda taasesituse kiirust')).toBeInTheDocument();
    });

    it('shows initial speed of 1x', () => {
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    it('cycles through speed options when clicked', async () => {
      const user = userEvent.setup();
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      
      const speedBtn = screen.getByTitle('Muuda taasesituse kiirust');
      
      expect(screen.getByText('1x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('1.25x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('1.5x')).toBeInTheDocument();
    });
  });

  describe('download button', () => {
    it('shows download button when audio available', () => {
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      expect(screen.getByTitle('Laadi alla')).toBeInTheDocument();
    });
  });

  describe('internal audio playback', () => {
    it('plays audio when no onPlay prop and audio element exists', async () => {
      const user = userEvent.setup();
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      
      await user.click(screen.getByTitle('Mängi'));
      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('pauses audio when playing internally', async () => {
      const user = userEvent.setup();
      render(<PlaylistAudioPlayer {...defaultProps} audioUrl="test.wav" />);
      
      // Trigger internal playing state
      const audio = document.querySelector('audio');
      if (audio) {
        fireEvent.play(audio);
      }
      
      await user.click(screen.getByTitle('Peata'));
      expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    });
  });

  describe('blob URL handling', () => {
    it('creates object URL from blob', () => {
      const blob = new Blob(['test'], { type: 'audio/wav' });
      render(<PlaylistAudioPlayer {...defaultProps} audioBlob={blob} />);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
    });
  });
});
