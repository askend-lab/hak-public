 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AudioPlayer from './AudioPlayer';

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock HTMLAudioElement
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  describe('rendering', () => {
    it('shows placeholder when no audio, not loading, and no text', () => {
      render(<AudioPlayer audioUrl={null} />);
      expect(screen.getByText(/Audio puudub/)).toBeInTheDocument();
    });

    it('does not show placeholder when loading', () => {
      render(<AudioPlayer audioUrl={null} isLoading={true} />);
      expect(screen.queryByText(/Audio puudub/)).not.toBeInTheDocument();
    });

    it('does not show placeholder when text provided', () => {
      render(<AudioPlayer audioUrl={null} text="Test" />);
      expect(screen.queryByText(/Audio puudub/)).not.toBeInTheDocument();
    });

    it('renders audio element when audioUrl provided', () => {
      render(<AudioPlayer audioUrl="test.wav" />);
      const audio = document.querySelector('audio');
      expect(audio).toBeInTheDocument();
      expect(audio).toHaveAttribute('src', 'test.wav');
    });

    it('renders play button', () => {
      render(<AudioPlayer audioUrl="test.wav" />);
      expect(screen.getByTitle('Mängi')).toBeInTheDocument();
    });

    it('renders text when provided', () => {
      render(<AudioPlayer audioUrl="test.wav" text="Test text" />);
      expect(screen.getByText('Test text')).toBeInTheDocument();
    });

    it('renders speed button', () => {
      render(<AudioPlayer audioUrl="test.wav" />);
      expect(screen.getByTitle('Muuda taasesituse kiirust')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    it('renders download button', () => {
      render(<AudioPlayer audioUrl="test.wav" />);
      expect(screen.getByTitle('Laadi alla')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading spinner when loading', () => {
      render(<AudioPlayer audioUrl={null} isLoading={true} text="Test" />);
      expect(screen.getByTitle('Laen...')).toBeInTheDocument();
    });

    it('disables play button when loading', () => {
      render(<AudioPlayer audioUrl="test.wav" isLoading={true} />);
      expect(screen.getByTitle('Laen...')).toBeDisabled();
    });

    it('disables speed button when loading', () => {
      render(<AudioPlayer audioUrl="test.wav" isLoading={true} />);
      expect(screen.getByTitle('Muuda taasesituse kiirust')).toBeDisabled();
    });

    it('disables download button when loading', () => {
      render(<AudioPlayer audioUrl="test.wav" isLoading={true} />);
      expect(screen.getByTitle('Laadi alla')).toBeDisabled();
    });
  });

  describe('play/pause functionality', () => {
    it('plays audio on click', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer audioUrl="test.wav" />);

      await user.click(screen.getByTitle('Mängi'));
      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('pauses audio when playing', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer audioUrl="test.wav" />);

      const audio = document.querySelector('audio');
      if (audio) fireEvent.play(audio);

      await user.click(screen.getByTitle('Peata'));
      expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    });

    it('shows pause icon when playing', () => {
      render(<AudioPlayer audioUrl="test.wav" />);
      const audio = document.querySelector('audio');
      if (audio) fireEvent.play(audio);

      expect(screen.getByTitle('Peata')).toBeInTheDocument();
    });

    it('resets to play state on audio end', () => {
      render(<AudioPlayer audioUrl="test.wav" />);
      const audio = document.querySelector('audio');
      
      if (audio) {
        fireEvent.play(audio);
        expect(screen.getByTitle('Peata')).toBeInTheDocument();
        
        fireEvent.ended(audio);
        expect(screen.getByTitle('Mängi')).toBeInTheDocument();
      }
    });

    it('disables play when no audio url', () => {
      render(<AudioPlayer audioUrl={null} text="Test" />);
      expect(screen.getByTitle('Mängi')).toBeDisabled();
    });
  });

  describe('playback speed', () => {
    it('cycles through playback rates', async () => {
      const user = userEvent.setup();
      render(<AudioPlayer audioUrl="test.wav" />);

      const speedBtn = screen.getByTitle('Muuda taasesituse kiirust');
      
      expect(screen.getByText('1x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('1.25x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('1.5x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('2x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('0.5x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('0.75x')).toBeInTheDocument();
      await user.click(speedBtn);
      expect(screen.getByText('1x')).toBeInTheDocument();
    });
  });

  describe('download functionality', () => {
    it('download button is enabled when audio url exists', () => {
      render(<AudioPlayer audioUrl="test.wav" text="Hello World" />);
      expect(screen.getByTitle('Laadi alla')).not.toBeDisabled();
    });

    it('download button is disabled when no audio url', () => {
      render(<AudioPlayer audioUrl={null} text="Test" />);
      expect(screen.getByTitle('Laadi alla')).toBeDisabled();
    });

    it('download button is disabled when loading', () => {
      render(<AudioPlayer audioUrl="test.wav" isLoading={true} />);
      expect(screen.getByTitle('Laadi alla')).toBeDisabled();
    });
  });

  describe('action buttons', () => {
    it('renders add to playlist button when callback provided', () => {
      render(
        <AudioPlayer 
          audioUrl="test.wav" 
          onAddToPlaylist={() => {}} 
          canAddToPlaylist={true}
        />
      );
      expect(screen.getByText('Lisa kõnevooru')).toBeInTheDocument();
    });

    it('renders add to task button when callback provided', () => {
      render(
        <AudioPlayer 
          audioUrl="test.wav" 
          onAddToTask={() => {}} 
          canAddToTask={true}
        />
      );
      expect(screen.getByText('Lisa ülesandesse')).toBeInTheDocument();
    });

    it('calls onAddToPlaylist when clicked', async () => {
      const user = userEvent.setup();
      const mockAddToPlaylist = vi.fn();
      render(
        <AudioPlayer 
          audioUrl="test.wav" 
          onAddToPlaylist={mockAddToPlaylist} 
          canAddToPlaylist={true}
        />
      );

      await user.click(screen.getByText('Lisa kõnevooru'));
      expect(mockAddToPlaylist).toHaveBeenCalled();
    });

    it('calls onAddToTask when clicked', async () => {
      const user = userEvent.setup();
      const mockAddToTask = vi.fn();
      render(
        <AudioPlayer 
          audioUrl="test.wav" 
          onAddToTask={mockAddToTask} 
          canAddToTask={true}
        />
      );

      await user.click(screen.getByText('Lisa ülesandesse'));
      expect(mockAddToTask).toHaveBeenCalled();
    });

    it('disables add to playlist when canAddToPlaylist is false', () => {
      render(
        <AudioPlayer 
          audioUrl="test.wav" 
          onAddToPlaylist={() => {}} 
          canAddToPlaylist={false}
        />
      );
      expect(screen.getByText('Lisa kõnevooru').closest('button')).toBeDisabled();
    });

    it('disables add to task when canAddToTask is false', () => {
      render(
        <AudioPlayer 
          audioUrl="test.wav" 
          onAddToTask={() => {}} 
          canAddToTask={false}
        />
      );
      expect(screen.getByText('Lisa ülesandesse').closest('button')).toBeDisabled();
    });

    it('disables action buttons when loading', () => {
      render(
        <AudioPlayer 
          audioUrl="test.wav" 
          isLoading={true}
          onAddToPlaylist={() => {}} 
          onAddToTask={() => {}} 
          canAddToPlaylist={true}
          canAddToTask={true}
        />
      );
      expect(screen.getByText('Lisa kõnevooru').closest('button')).toBeDisabled();
      expect(screen.getByText('Lisa ülesandesse').closest('button')).toBeDisabled();
    });

    it('shows action buttons with text only (no audio)', () => {
      render(
        <AudioPlayer 
          audioUrl={null} 
          text="Test"
          onAddToPlaylist={() => {}} 
          canAddToPlaylist={true}
        />
      );
      expect(screen.getByText('Lisa kõnevooru')).toBeInTheDocument();
    });
  });

  describe('autoPlay', () => {
    it('auto-plays when enabled and audio url provided', () => {
      render(<AudioPlayer audioUrl="test.wav" autoPlay={true} />);
      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('does not auto-play when disabled', () => {
      render(<AudioPlayer audioUrl="test.wav" autoPlay={false} />);
      expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });
  });
});
