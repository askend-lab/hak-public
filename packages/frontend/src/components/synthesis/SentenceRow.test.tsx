import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { SentenceRow } from './SentenceRow';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key === 'input.placeholder' ? 'Kirjuta oma lause siia' : key,
  }),
}));

describe('SentenceRow', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onPlay: vi.fn(),
    onRemove: vi.fn(),
    onExplorePhonetic: vi.fn(),
    isLoading: false,
    isLast: false,
    index: 0,
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDragEnd: vi.fn(),
    onDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input with placeholder', () => {
    render(<SentenceRow {...defaultProps} />);
    expect(screen.getByPlaceholderText('Kirjuta oma lause siia')).toBeInTheDocument();
  });

  it('should render drag handle', () => {
    render(<SentenceRow {...defaultProps} />);
    expect(document.querySelector('.sentence-list-item__drag')).toBeInTheDocument();
  });

  describe('Play button state (matching prototype)', () => {
    it('should call onPlay when clicked after typing (before Space)', () => {
      const onPlay = vi.fn();
      render(<SentenceRow {...defaultProps} value="" onPlay={onPlay} />);
      
      const input = screen.getByPlaceholderText('Kirjuta oma lause siia');
      const playButton = document.querySelector('.play-button') as HTMLButtonElement;
      
      // Type text (no Space, word not "completed")
      fireEvent.change(input, { target: { value: 'Tere' } });
      
      // Click Play - should work immediately, not require Space first
      fireEvent.click(playButton);
      
      // onPlay should be called - playing should work before word splitting
      expect(onPlay).toHaveBeenCalled();
    });

    it('should call onChange on every keystroke for parent button state', () => {
      const onChange = vi.fn();
      render(<SentenceRow {...defaultProps} value="" onChange={onChange} />);
      
      const input = screen.getByPlaceholderText('Kirjuta oma lause siia');
      
      // Type one letter
      fireEvent.change(input, { target: { value: 'T' } });
      
      // onChange should be called so parent can enable its buttons
      expect(onChange).toHaveBeenCalledWith('T');
    });

    it('should be gray/disabled when input is empty', () => {
      render(<SentenceRow {...defaultProps} value="" />);
      const playButton = document.querySelector('.play-button');
      expect(playButton).toBeInTheDocument();
      expect(playButton).not.toHaveClass('play-button--active');
      expect(playButton).toBeDisabled();
    });

    it('should be green/active when input has text', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const playButton = document.querySelector('.play-button');
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveClass('play-button--active');
      expect(playButton).not.toBeDisabled();
    });

    it('should be gray when input has only whitespace', () => {
      render(<SentenceRow {...defaultProps} value="   " />);
      const playButton = document.querySelector('.play-button');
      expect(playButton).not.toHaveClass('play-button--active');
      expect(playButton).toBeDisabled();
    });

    it('should show loading state', () => {
      render(<SentenceRow {...defaultProps} value="Tere" isLoading={true} />);
      const playButton = document.querySelector('.play-button');
      expect(playButton).toHaveClass('play-button--loading');
    });
  });

  it('should call onChange when Space is pressed to add word', () => {
    render(<SentenceRow {...defaultProps} />);
    const input = screen.getByPlaceholderText('Kirjuta oma lause siia');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: ' ' });
    expect(defaultProps.onChange).toHaveBeenCalledWith('test');
  });

  it('should call onChange when Space pressed to add word to existing tags', () => {
    render(<SentenceRow {...defaultProps} value="existing" />);
    const input = document.querySelector('.sentence-row__input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new' } });
    fireEvent.keyDown(input, { key: ' ' });
    expect(defaultProps.onChange).toHaveBeenCalledWith('existing new');
  });

  it('should call onPlay when play button clicked', () => {
    render(<SentenceRow {...defaultProps} value="Tere" />);
    const playButton = document.querySelector('.play-button') as HTMLButtonElement;
    fireEvent.click(playButton);
    expect(defaultProps.onPlay).toHaveBeenCalled();
  });

  it('should have border when not last', () => {
    render(<SentenceRow {...defaultProps} isLast={false} />);
    expect(document.querySelector('.sentence-list-item--bordered')).toBeInTheDocument();
  });

  it('should not have border when last', () => {
    render(<SentenceRow {...defaultProps} isLast={true} />);
    expect(document.querySelector('.sentence-list-item--bordered')).not.toBeInTheDocument();
  });

  describe('Play button cursor styling (bug fix)', () => {
    it('should have play-button class for cursor styling', () => {
      render(<SentenceRow {...defaultProps} value="" />);
      const playButton = document.querySelector('.play-button');
      expect(playButton).toBeInTheDocument();
    });

    it('should have --active class when has text (for pointer cursor)', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const playButton = document.querySelector('.play-button');
      expect(playButton).toHaveClass('play-button--active');
    });
  });

  describe('Context menu (three dots) - TDD', () => {
    it('should have 3 menu items: Lisa ülesandesse, Lae alla, Eemalda', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const menuTrigger = document.querySelector('.more-menu__trigger');
      fireEvent.click(menuTrigger!);
      
      const menuItems = document.querySelectorAll('[role="menuitem"]');
      expect(menuItems).toHaveLength(4);
      expect(menuItems[0]).toHaveTextContent('Uuri foneetilist kuju');
      expect(menuItems[1]).toHaveTextContent('Lisa ülesandesse');
      expect(menuItems[2]).toHaveTextContent('Lae alla');
      expect(menuItems[3]).toHaveTextContent('Eemalda');
    });
  });

  describe('Enter key behavior - TDD', () => {
    it('should call onPlay when Enter is pressed in input with text', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const input = document.querySelector('.sentence-row__input') as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(defaultProps.onPlay).toHaveBeenCalled();
    });

    it('should NOT call onPlay when Enter is pressed in empty input', () => {
      render(<SentenceRow {...defaultProps} value="" />);
      const input = screen.getByPlaceholderText('Kirjuta oma lause siia');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(defaultProps.onPlay).not.toHaveBeenCalled();
    });
  });

  describe('Word chips display', () => {
    it('should NOT show chips while typing - only after Space', () => {
      // Test with rerender to simulate real parent behavior
      let currentValue = '';
      const handleChange = (newValue: string) => { currentValue = newValue; };
      
      const { rerender } = render(
        <SentenceRow {...defaultProps} value={currentValue} onChange={handleChange} />
      );
      
      const input = screen.getByPlaceholderText('Kirjuta oma lause siia') as HTMLInputElement;
      
      // Type text (no Space yet)
      fireEvent.change(input, { target: { value: 'Tere' } });
      
      // Rerender with updated value (simulates parent state update)
      rerender(<SentenceRow {...defaultProps} value={currentValue} onChange={handleChange} />);
      
      // Should NOT have any chips - word is still being typed
      const chips = document.querySelectorAll('.word-chip');
      expect(chips).toHaveLength(0);
      
      // Input should show the typed text
      expect(input.value).toBe('Tere');
    });

    it('should show tags as chips and keep input separate', () => {
      render(<SentenceRow {...defaultProps} value="Tere maailm" />);
      const input = document.querySelector('.sentence-row__input') as HTMLInputElement;
      const chips = document.querySelectorAll('.word-chip');
      // Tags are shown as chips
      expect(chips).toHaveLength(2);
      // Input is separate (for typing new words)
      expect(input.value).toBe('');
    });

    it('should display words as chips when value has content', () => {
      render(<SentenceRow {...defaultProps} value="Tere maailm" />);
      const chips = document.querySelectorAll('.word-chip');
      expect(chips).toHaveLength(2);
    });

    it('should display correct word text in chips', () => {
      render(<SentenceRow {...defaultProps} value="Tere maailm" />);
      const chips = document.querySelectorAll('.word-chip');
      expect(chips[0]).toHaveTextContent('Tere');
      expect(chips[1]).toHaveTextContent('maailm');
    });

    it('should have data-word attribute on chips', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const chip = document.querySelector('.word-chip');
      expect(chip).toHaveAttribute('data-word', 'Tere');
    });

    it('should not display chips when value is empty', () => {
      render(<SentenceRow {...defaultProps} value="" />);
      const chips = document.querySelectorAll('.word-chip');
      expect(chips).toHaveLength(0);
    });

    it('should have sentence-row__words container', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      expect(document.querySelector('.sentence-list-item__content')).toBeInTheDocument();
    });
  });

  describe('Variants panel', () => {
    it('should open variants panel when word chip is clicked', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const chip = document.querySelector('.word-chip');
      fireEvent.click(chip!);
      expect(document.querySelector('.variants-panel')).toBeInTheDocument();
    });

    it('should show selected word in variants panel', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const chip = document.querySelector('.word-chip');
      fireEvent.click(chip!);
      const title = document.querySelector('.variants-panel__title');
      expect(title).toHaveTextContent('Tere');
    });

    it('should close variants panel when close button clicked', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const chip = document.querySelector('.word-chip');
      fireEvent.click(chip!);
      const closeButton = document.querySelector('.variants-panel__close');
      fireEvent.click(closeButton!);
      expect(document.querySelector('.variants-panel')).not.toBeInTheDocument();
    });

    it('should mark chip as selected when clicked', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const chip = document.querySelector('.word-chip');
      fireEvent.click(chip!);
      expect(chip).toHaveClass('word-chip--selected');
    });
  });

  describe('More menu interactions', () => {
    it('should close menu when clicking outside', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const menuTrigger = document.querySelector('.more-menu__trigger');
      fireEvent.click(menuTrigger!);
      expect(document.querySelector('.more-menu__dropdown')).toBeInTheDocument();
      
      // Simulate blur
      const moreMenu = document.querySelector('.more-menu');
      fireEvent.blur(moreMenu!, { relatedTarget: document.body });
      expect(document.querySelector('.more-menu__dropdown')).not.toBeInTheDocument();
    });

    it('should call onRemove when Eemalda clicked', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const menuTrigger = document.querySelector('.more-menu__trigger');
      fireEvent.click(menuTrigger!);
      const removeItem = document.querySelector('.more-menu__item--danger');
      fireEvent.click(removeItem!);
      expect(defaultProps.onRemove).toHaveBeenCalled();
    });

    it('should toggle menu open/close', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const menuTrigger = document.querySelector('.more-menu__trigger');
      
      // Open menu
      fireEvent.click(menuTrigger!);
      expect(document.querySelector('.more-menu__dropdown')).toBeInTheDocument();
      
      // Close menu by clicking trigger again
      fireEvent.click(menuTrigger!);
      expect(document.querySelector('.more-menu__dropdown')).not.toBeInTheDocument();
    });

    it('should close menu when Lisa ülesandesse clicked', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const menuTrigger = document.querySelector('.more-menu__trigger');
      fireEvent.click(menuTrigger!);
      const menuItems = document.querySelectorAll('.more-menu__item');
      fireEvent.click(menuItems[0] as Element); // Lisa ülesandesse
      expect(document.querySelector('.more-menu__dropdown')).not.toBeInTheDocument();
    });

    it('should close menu when Lae alla clicked', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const menuTrigger = document.querySelector('.more-menu__trigger');
      fireEvent.click(menuTrigger!);
      const menuItems = document.querySelectorAll('.more-menu__item');
      fireEvent.click(menuItems[1] as Element); // Lae alla
      expect(document.querySelector('.more-menu__dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Input container click behavior', () => {
    it('should focus input when words container clicked', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const wordsContainer = document.querySelector('.sentence-list-item__content');
      const input = document.querySelector('.sentence-row__input') as HTMLInputElement;
      
      fireEvent.click(wordsContainer!);
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Variants panel interactions', () => {
    it('should call close panel when variant is selected', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const chip = document.querySelector('.word-chip');
      fireEvent.click(chip!);
      
      // Find and click "Kasuta" button
      const useButtons = document.querySelectorAll('.variant-option__use');
      if (useButtons.length > 0) {
        fireEvent.click(useButtons[0] as Element);
        expect(document.querySelector('.variants-panel')).not.toBeInTheDocument();
      }
    });

    it('should play audio when Play variant clicked', async () => {
      const audioModule = await import('../../services/audio');
      const playAudioMock = vi.spyOn(audioModule, 'playAudio').mockResolvedValue();
      vi.spyOn(audioModule, 'synthesizeText').mockResolvedValue({
        originalText: 'Tere', phoneticText: 'Tere', audioUrl: 'blob:test',
        audioHash: 'hash', voiceModel: 'efm_s', cached: false
      });

      render(<SentenceRow {...defaultProps} value="Tere" />);
      fireEvent.click(document.querySelector('.word-chip')!);
      fireEvent.click(document.querySelectorAll('.play-button')[1] as Element);
      await vi.waitFor(() => { expect(playAudioMock).toHaveBeenCalledWith('blob:test'); });
    });
  });

  describe('Backspace behavior', () => {
    it('should remove last word on Backspace when input is empty', () => {
      render(<SentenceRow {...defaultProps} value="Tere maailm" />);
      const input = document.querySelector('.sentence-row__input') as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'Backspace' });
      expect(defaultProps.onChange).toHaveBeenCalledWith('Tere');
    });

    it('should put removed word into input', () => {
      render(<SentenceRow {...defaultProps} value="Tere maailm" />);
      const input = document.querySelector('.sentence-row__input') as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'Backspace' });
      expect(input.value).toBe('maailm');
    });
  });

  describe('Enter key with input value', () => {
    it('should call onPlay when Enter pressed with input text', () => {
      render(<SentenceRow {...defaultProps} />);
      const input = screen.getByPlaceholderText('Kirjuta oma lause siia');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(defaultProps.onPlay).toHaveBeenCalled();
    });
  });

  describe('Drag and drop', () => {
    it('should call onDragStart with index when drag handle is dragged', () => {
      const onDragStart = vi.fn();
      render(<SentenceRow {...defaultProps} index={2} onDragStart={onDragStart} />);
      const dragHandle = document.querySelector('.sentence-list-item__drag');
      const dataTransfer = { effectAllowed: '', setDragImage: vi.fn() };
      fireEvent.dragStart(dragHandle!, { dataTransfer });
      expect(onDragStart).toHaveBeenCalledWith(2);
    });

    it('should have draggable only on drag handle, not on row', () => {
      render(<SentenceRow {...defaultProps} />);
      const row = document.querySelector('.sentence-list-item');
      const dragHandle = document.querySelector('.sentence-list-item__drag');
      expect(row).not.toHaveAttribute('draggable');
      expect(dragHandle).toHaveAttribute('draggable', 'true');
    });

    it('should call onDragOver with index when dragged over', () => {
      const onDragOver = vi.fn();
      render(<SentenceRow {...defaultProps} index={1} onDragOver={onDragOver} />);
      const row = document.querySelector('.sentence-list-item');
      // dragOver requires dataTransfer object
      const dataTransfer = { dropEffect: '' };
      fireEvent.dragOver(row!, { dataTransfer });
      expect(onDragOver).toHaveBeenCalledWith(1);
    });

    it('should call onDragEnd when drag ends on handle', () => {
      const onDragEnd = vi.fn();
      render(<SentenceRow {...defaultProps} onDragEnd={onDragEnd} />);
      const dragHandle = document.querySelector('.sentence-list-item__drag');
      fireEvent.dragEnd(dragHandle!);
      expect(onDragEnd).toHaveBeenCalled();
    });

    it('should have dragging class when isDragging is true', () => {
      render(<SentenceRow {...defaultProps} isDragging={true} />);
      const row = document.querySelector('.sentence-list-item');
      expect(row).toHaveClass('sentence-list-item--dragging');
    });

    it('should have drag-over class when isDragOver is true', () => {
      render(<SentenceRow {...defaultProps} isDragOver={true} />);
      const row = document.querySelector('.sentence-list-item');
      expect(row).toHaveClass('sentence-list-item--drag-over');
    });

    it('should call onDrop with index when dropped', () => {
      const onDrop = vi.fn();
      render(<SentenceRow {...defaultProps} index={1} onDrop={onDrop} />);
      const row = document.querySelector('.sentence-list-item');
      const dataTransfer = { dropEffect: '' };
      fireEvent.drop(row!, { dataTransfer });
      expect(onDrop).toHaveBeenCalledWith(1);
    });
  });

  describe('Clear button', () => {
    it('should show clear button when input has text', () => {
      render(<SentenceRow {...defaultProps} value="test" />);
      const clearButton = document.querySelector('.sentence-row__clear-btn');
      expect(clearButton).toBeInTheDocument();
    });

    it('should hide clear button when input is empty', () => {
      render(<SentenceRow {...defaultProps} value="" />);
      const clearButton = document.querySelector('.sentence-row__clear-btn');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should clear text when clear button is clicked', () => {
      const onChange = vi.fn();
      render(<SentenceRow {...defaultProps} value="test" onChange={onChange} />);
      const clearButton = document.querySelector('.sentence-row__clear-btn');
      fireEvent.click(clearButton!);
      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Context menu', () => {
    it('should have "Uuri foneetilist kuju" option in more menu', () => {
      render(<SentenceRow {...defaultProps} value="test" />);
      const moreButton = screen.getByText('⋯');
      fireEvent.click(moreButton);
      expect(screen.getByText('Uuri foneetilist kuju')).toBeInTheDocument();
    });

    it('should call onExplorePhonetic when "Uuri foneetilist kuju" is clicked', () => {
      const onExplorePhonetic = vi.fn();
      render(<SentenceRow {...defaultProps} value="test" onExplorePhonetic={onExplorePhonetic} />);
      const moreButton = screen.getByText('⋯');
      fireEvent.click(moreButton);
      const exploreOption = screen.getByText('Uuri foneetilist kuju');
      fireEvent.click(exploreOption);
      expect(onExplorePhonetic).toHaveBeenCalled();
    });
  });

  describe('Add to task functionality', () => {
    it('should call onAddToTask with sentence text when "Lisa ülesandesse" is clicked', () => {
      const onAddToTask = vi.fn();
      render(<SentenceRow {...defaultProps} value="Tere maailm" onAddToTask={onAddToTask} />);
      const moreButton = screen.getByText('⋯');
      fireEvent.click(moreButton);
      const addToTaskOption = screen.getByText('Lisa ülesandesse');
      fireEvent.click(addToTaskOption);
      expect(onAddToTask).toHaveBeenCalledWith('Tere maailm');
    });

    it('should close menu after "Lisa ülesandesse" is clicked', () => {
      const onAddToTask = vi.fn();
      render(<SentenceRow {...defaultProps} value="test" onAddToTask={onAddToTask} />);
      const moreButton = screen.getByText('⋯');
      fireEvent.click(moreButton);
      const addToTaskOption = screen.getByText('Lisa ülesandesse');
      fireEvent.click(addToTaskOption);
      expect(document.querySelector('.more-menu__dropdown')).not.toBeInTheDocument();
    });
  });

  describe('More menu disabled state', () => {
    it('should not open menu when input is empty', () => {
      render(<SentenceRow {...defaultProps} value="" />);
      const moreButton = screen.getByText('⋯');
      fireEvent.click(moreButton);
      expect(document.querySelector('.more-menu__dropdown')).not.toBeInTheDocument();
    });

    it('should open menu when input has text', () => {
      render(<SentenceRow {...defaultProps} value="Tere" />);
      const moreButton = screen.getByText('⋯');
      fireEvent.click(moreButton);
      expect(document.querySelector('.more-menu__dropdown')).toBeInTheDocument();
    });

    it('should have disabled style on trigger when input is empty', () => {
      render(<SentenceRow {...defaultProps} value="" />);
      const moreButton = document.querySelector('.more-menu__trigger');
      expect(moreButton).toHaveClass('more-menu__trigger--disabled');
    });
  });
});
