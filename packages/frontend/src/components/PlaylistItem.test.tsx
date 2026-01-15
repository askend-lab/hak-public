 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaylistItem from './PlaylistItem';

describe('PlaylistItem', () => {
  const defaultProps = {
    id: 'test-id',
    text: 'Hello world test',
    onPlay: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders text as tags when not readonly', () => {
      render(<PlaylistItem {...defaultProps} />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('world')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('renders plain text when readonly', () => {
      render(<PlaylistItem {...defaultProps} readOnly={true} />);
      expect(screen.getByText('Hello world test')).toBeInTheDocument();
    });

    it('renders play button', () => {
      render(<PlaylistItem {...defaultProps} />);
      expect(screen.getByRole('button', { name: /mängi/i })).toBeInTheDocument();
    });

    it('applies readonly class when readOnly is true', () => {
      const { container } = render(<PlaylistItem {...defaultProps} readOnly={true} />);
      expect(container.querySelector('.playlist-item-readonly')).toBeInTheDocument();
    });

    it('renders drag handle when draggable and not readonly', () => {
      render(<PlaylistItem {...defaultProps} isDraggable={true} />);
      expect(screen.getByRole('button', { name: /lohista/i })).toBeInTheDocument();
    });

    it('does not render drag handle when readonly', () => {
      render(<PlaylistItem {...defaultProps} isDraggable={true} readOnly={true} />);
      expect(screen.queryByRole('button', { name: /lohista/i })).not.toBeInTheDocument();
    });
  });

  describe('play button', () => {
    it('calls onPlay with id when clicked', async () => {
      const user = userEvent.setup();
      render(<PlaylistItem {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /mängi/i }));
      expect(defaultProps.onPlay).toHaveBeenCalledWith('test-id');
    });

    it('shows loading state when isLoading', () => {
      render(<PlaylistItem {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: /laen/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /laen/i })).toBeDisabled();
    });

    it('shows pause icon when playing', () => {
      render(<PlaylistItem {...defaultProps} isPlaying={true} />);
      expect(screen.getByRole('button', { name: /peatab/i })).toBeInTheDocument();
    });

    it('applies playing class when isPlaying', () => {
      const { container } = render(<PlaylistItem {...defaultProps} isPlaying={true} />);
      expect(container.querySelector('.play-button.playing')).toBeInTheDocument();
    });

    it('applies loading class when isLoading', () => {
      const { container } = render(<PlaylistItem {...defaultProps} isLoading={true} />);
      expect(container.querySelector('.play-button.loading')).toBeInTheDocument();
    });
  });

  describe('menu', () => {
    it('does not show menu button when showOptions is false', () => {
      render(<PlaylistItem {...defaultProps} showOptions={false} />);
      expect(screen.queryByRole('button', { name: /rohkem/i })).not.toBeInTheDocument();
    });

    it('shows menu button when showOptions is true', () => {
      render(<PlaylistItem {...defaultProps} showOptions={true} />);
      expect(screen.getByRole('button', { name: /rohkem/i })).toBeInTheDocument();
    });

    it('opens dropdown menu on click', async () => {
      const user = userEvent.setup();
      render(<PlaylistItem {...defaultProps} showOptions={true} />);
      
      await user.click(screen.getByRole('button', { name: /rohkem/i }));
      expect(screen.getByText('Kustuta')).toBeInTheDocument();
    });

    it('shows edit option when onEdit provided', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<PlaylistItem {...defaultProps} showOptions={true} onEdit={onEdit} />);
      
      await user.click(screen.getByRole('button', { name: /rohkem/i }));
      expect(screen.getByText('Muuda')).toBeInTheDocument();
    });

    it('calls onEdit when edit clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<PlaylistItem {...defaultProps} showOptions={true} onEdit={onEdit} />);
      
      await user.click(screen.getByRole('button', { name: /rohkem/i }));
      await user.click(screen.getByText('Muuda'));
      expect(onEdit).toHaveBeenCalledWith('test-id');
    });

    it('calls onDelete when delete clicked', async () => {
      const user = userEvent.setup();
      render(<PlaylistItem {...defaultProps} showOptions={true} />);
      
      await user.click(screen.getByRole('button', { name: /rohkem/i }));
      await user.click(screen.getByText('Kustuta'));
      expect(defaultProps.onDelete).toHaveBeenCalledWith('test-id');
    });

    it('closes menu when backdrop clicked', async () => {
      const user = userEvent.setup();
      render(<PlaylistItem {...defaultProps} showOptions={true} />);
      
      await user.click(screen.getByRole('button', { name: /rohkem/i }));
      expect(screen.getByText('Kustuta')).toBeInTheDocument();
      
      await user.click(document.querySelector('.menu-backdrop')!);
      expect(screen.queryByText('Kustuta')).not.toBeInTheDocument();
    });

    it('hides delete option when showDelete is false', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<PlaylistItem {...defaultProps} showOptions={true} showDelete={false} onEdit={onEdit} />);
      
      await user.click(screen.getByRole('button', { name: /rohkem/i }));
      expect(screen.queryByText('Kustuta')).not.toBeInTheDocument();
      expect(screen.getByText('Muuda')).toBeInTheDocument();
    });
  });

  describe('tag interactions', () => {
    it('renders tags with clickable class when onTagClick provided', () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <PlaylistItem {...defaultProps} onTagClick={onTagClick} />
      );
      expect(container.querySelectorAll('.tag-clickable').length).toBe(3);
    });

    it('calls onTagClick with correct params when tag clicked', async () => {
      const user = userEvent.setup();
      const onTagClick = vi.fn();
      render(<PlaylistItem {...defaultProps} onTagClick={onTagClick} />);
      
      await user.click(screen.getByText('world'));
      expect(onTagClick).toHaveBeenCalledWith('test-id', 1, 'world');
    });

    it('highlights selected tag', () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <PlaylistItem 
          {...defaultProps} 
          onTagClick={onTagClick}
          selectedTagIndex={1}
          isPronunciationPanelOpen={true}
        />
      );
      expect(container.querySelector('.tag-selected')).toBeInTheDocument();
    });

    it('does not highlight tag when panel is closed', () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <PlaylistItem 
          {...defaultProps} 
          onTagClick={onTagClick}
          selectedTagIndex={1}
          isPronunciationPanelOpen={false}
        />
      );
      expect(container.querySelector('.tag-selected')).not.toBeInTheDocument();
    });

    it('handles keyboard interaction on tags', async () => {
      const onTagClick = vi.fn();
      render(<PlaylistItem {...defaultProps} onTagClick={onTagClick} />);
      
      const tag = screen.getByText('Hello');
      fireEvent.keyDown(tag, { key: 'Enter' });
      expect(onTagClick).toHaveBeenCalledWith('test-id', 0, 'Hello');
    });

    it('handles space key on tags', async () => {
      const onTagClick = vi.fn();
      render(<PlaylistItem {...defaultProps} onTagClick={onTagClick} />);
      
      const tag = screen.getByText('Hello');
      fireEvent.keyDown(tag, { key: ' ' });
      expect(onTagClick).toHaveBeenCalledWith('test-id', 0, 'Hello');
    });
  });

  describe('edge cases', () => {
    it('handles empty text', () => {
      render(<PlaylistItem {...defaultProps} text="" />);
      const { container } = render(<PlaylistItem {...defaultProps} text="   " />);
      expect(container.querySelector('.tags-group')).toBeInTheDocument();
    });

    it('handles text with multiple spaces', () => {
      render(<PlaylistItem {...defaultProps} text="word1   word2" />);
      expect(screen.getByText('word1')).toBeInTheDocument();
      expect(screen.getByText('word2')).toBeInTheDocument();
    });
  });
});
