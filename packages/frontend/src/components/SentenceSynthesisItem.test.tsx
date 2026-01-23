/* eslint-disable max-lines-per-function, max-lines */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SentenceSynthesisItem from './SentenceSynthesisItem';

describe('SentenceSynthesisItem', () => {
  const defaultProps = {
    id: 'test-sentence',
    text: 'Hello world test',
    tags: ['Hello', 'world', 'test'],
    mode: 'tags' as const,
    onPlay: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering modes', () => {
    it('renders tags in tags mode', () => {
      render(<SentenceSynthesisItem {...defaultProps} mode="tags" />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('world')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('renders text in readonly mode', () => {
      render(<SentenceSynthesisItem {...defaultProps} mode="readonly" />);
      expect(screen.getByText('Hello world test')).toBeInTheDocument();
    });

    it('renders input field in input mode', () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input" 
          onInputChange={onInputChange}
          currentInput=""
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows placeholder when no tags in input mode', () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input" 
          tags={[]}
          onInputChange={onInputChange}
          currentInput=""
          placeholder="Enter text here"
        />
      );
      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });
  });

  describe('play button', () => {
    it('renders play button', () => {
      render(<SentenceSynthesisItem {...defaultProps} />);
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('calls onPlay when clicked', async () => {
      const user = userEvent.setup();
      render(<SentenceSynthesisItem {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /play/i }));
      expect(defaultProps.onPlay).toHaveBeenCalledWith('test-sentence');
    });

    it('shows loading state', () => {
      render(<SentenceSynthesisItem {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
    });

    it('shows playing state', () => {
      render(<SentenceSynthesisItem {...defaultProps} isPlaying={true} />);
      expect(screen.getByRole('button', { name: /playing/i })).toBeInTheDocument();
    });

    it('disables play button when loading', () => {
      render(<SentenceSynthesisItem {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });

    it('disables play button in input mode with no tags and empty input', () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input" 
          tags={[]}
          onInputChange={onInputChange}
          currentInput=""
        />
      );
      expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
    });

    it('enables play button in input mode with tags', () => {
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input" 
          onInputChange={onInputChange}
          currentInput=""
        />
      );
      expect(screen.getByRole('button', { name: /play/i })).not.toBeDisabled();
    });
  });

  describe('drag and drop', () => {
    it('shows drag handle when draggable', () => {
      render(<SentenceSynthesisItem {...defaultProps} draggable={true} />);
      expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    });

    it('does not show drag handle when not draggable', () => {
      render(<SentenceSynthesisItem {...defaultProps} draggable={false} />);
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });

    it('does not show drag handle in readonly mode', () => {
      render(<SentenceSynthesisItem {...defaultProps} mode="readonly" draggable={true} />);
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });

    it('applies dragging class', () => {
      const { container } = render(<SentenceSynthesisItem {...defaultProps} isDragging={true} />);
      expect(container.querySelector('.sentence-synthesis-item--dragging')).toBeInTheDocument();
    });

    it('applies drag-over class', () => {
      const { container } = render(<SentenceSynthesisItem {...defaultProps} isDragOver={true} />);
      expect(container.querySelector('.sentence-synthesis-item--drag-over')).toBeInTheDocument();
    });
  });

  describe('tag interactions in tags mode', () => {
    it('makes tags clickable when onTagClick provided', () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} onTagClick={onTagClick} />
      );
      expect(container.querySelectorAll('.sentence-synthesis-item__tag--clickable').length).toBe(3);
    });

    it('calls onTagClick when tag clicked', async () => {
      const user = userEvent.setup();
      const onTagClick = vi.fn();
      render(<SentenceSynthesisItem {...defaultProps} onTagClick={onTagClick} />);
      
      await user.click(screen.getByText('world'));
      expect(onTagClick).toHaveBeenCalledWith('test-sentence', 1, 'world');
    });

    it('highlights selected tag when panel open', () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          onTagClick={onTagClick}
          selectedTagIndex={1}
          isPronunciationPanelOpen={true}
        />
      );
      expect(container.querySelector('.sentence-synthesis-item__tag--selected')).toBeInTheDocument();
    });

    it('handles keyboard navigation on tags', () => {
      const onTagClick = vi.fn();
      render(<SentenceSynthesisItem {...defaultProps} onTagClick={onTagClick} />);
      
      const tag = screen.getByText('Hello');
      fireEvent.keyDown(tag, { key: 'Enter' });
      expect(onTagClick).toHaveBeenCalledWith('test-sentence', 0, 'Hello');
    });
  });

  describe('input mode features', () => {
    it('calls onInputChange when typing', async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input"
          tags={[]}
          onInputChange={onInputChange}
          currentInput=""
        />
      );
      
      await user.type(screen.getByRole('textbox'), 'test');
      expect(onInputChange).toHaveBeenCalled();
    });

    it('shows clear button when has content', () => {
      const onClear = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input"
          onInputChange={vi.fn()}
          onClear={onClear}
          currentInput="test"
        />
      );
      expect(screen.getByLabelText('Clear all')).toBeInTheDocument();
    });

    it('calls onClear when clear button clicked', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input"
          onInputChange={vi.fn()}
          onClear={onClear}
          currentInput="test"
        />
      );
      
      await user.click(screen.getByLabelText('Clear all'));
      expect(onClear).toHaveBeenCalledWith('test-sentence');
    });

    it('shows tag dropdown menu when tag menu open', () => {
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input"
          onInputChange={vi.fn()}
          onTagMenuOpen={vi.fn()}
          onTagMenuClose={vi.fn()}
          openTagMenu={{ sentenceId: 'test-sentence', tagIndex: 0 }}
          tagMenuItems={[
            { label: 'Edit', onClick: vi.fn() },
            { label: 'Delete', onClick: vi.fn(), danger: true },
          ]}
        />
      );
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('shows inline edit input when editing tag', () => {
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input"
          onInputChange={vi.fn()}
          editingTag={{ sentenceId: 'test-sentence', tagIndex: 0, value: 'Hello' }}
          onEditTagChange={vi.fn()}
          onEditTagKeyDown={vi.fn()}
          onEditTagCommit={vi.fn()}
        />
      );
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.some(input => (input as HTMLInputElement).value === 'Hello')).toBe(true);
    });
  });

  describe('row menu', () => {
    it('shows menu button when onMenuOpen provided', () => {
      render(
        <SentenceSynthesisItem 
          {...defaultProps}
          onMenuOpen={vi.fn()}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: 'Delete', onClick: vi.fn() }]}
        />
      );
      expect(screen.getByLabelText('Rohkem valikuid')).toBeInTheDocument();
    });

    it('calls onMenuOpen when menu button clicked', async () => {
      const user = userEvent.setup();
      const onMenuOpen = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps}
          onMenuOpen={onMenuOpen}
          onMenuClose={vi.fn()}
          rowMenuItems={[{ label: 'Delete', onClick: vi.fn() }]}
        />
      );
      
      await user.click(screen.getByLabelText('Rohkem valikuid'));
      expect(onMenuOpen).toHaveBeenCalledWith('test-sentence');
    });
  });

  describe('legacy menu', () => {
    it('shows legacy menu button when onMenuOpenLegacy provided', () => {
      render(
        <SentenceSynthesisItem 
          {...defaultProps}
          onMenuOpenLegacy={vi.fn()}
          menuContent={<div>Menu Content</div>}
        />
      );
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
    });

    it('renders menu content', () => {
      render(
        <SentenceSynthesisItem 
          {...defaultProps}
          onMenuOpenLegacy={vi.fn()}
          menuContent={<div data-testid="custom-menu">Custom Menu</div>}
        />
      );
      expect(screen.getByTestId('custom-menu')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SentenceSynthesisItem {...defaultProps} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('drag handle', () => {
    it('renders drag handle when draggable', () => {
      render(<SentenceSynthesisItem {...defaultProps} draggable={true} mode="input" />);
      expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    });

    it('does not render drag handle in readonly mode', () => {
      render(<SentenceSynthesisItem {...defaultProps} draggable={true} mode="readonly" />);
      expect(screen.queryByLabelText('Drag to reorder')).not.toBeInTheDocument();
    });
  });

  describe('tag click', () => {
    it('calls onTagClick when tag clicked', async () => {
      const user = userEvent.setup();
      const onTagClick = vi.fn();
      render(<SentenceSynthesisItem {...defaultProps} mode="tags" onTagClick={onTagClick} />);
      
      await user.click(screen.getByText('Hello'));
      expect(onTagClick).toHaveBeenCalledWith('test-sentence', 0, 'Hello');
    });

    it('tags are not clickable without onTagClick', () => {
      render(<SentenceSynthesisItem {...defaultProps} mode="tags" />);
      const tag = screen.getByText('Hello');
      expect(tag).not.toHaveAttribute('role', 'button');
    });
  });

  describe('input mode interactions', () => {
    it('calls onInputChange when typing', async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input" 
          onInputChange={onInputChange}
          currentInput=""
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      expect(onInputChange).toHaveBeenCalled();
    });

    it('calls onInputKeyDown on key press', async () => {
      const onInputKeyDown = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input" 
          onInputChange={vi.fn()}
          onInputKeyDown={onInputKeyDown}
          currentInput=""
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onInputKeyDown).toHaveBeenCalled();
    });

    it('calls onInputBlur on blur', () => {
      const onInputBlur = vi.fn();
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input" 
          onInputChange={vi.fn()}
          onInputBlur={onInputBlur}
          currentInput=""
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      expect(onInputBlur).toHaveBeenCalledWith('test-sentence');
    });
  });

  describe('play button disabled states', () => {
    it('disables play when loading', () => {
      render(<SentenceSynthesisItem {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });

    it('disables play in input mode with no tags and empty input', () => {
      render(
        <SentenceSynthesisItem 
          {...defaultProps} 
          mode="input"
          tags={[]}
          currentInput=""
          onInputChange={vi.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
    });
  });
});
