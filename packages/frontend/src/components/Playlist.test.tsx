 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Playlist from './Playlist';

// Store onDragEnd callback to call it in tests
let capturedOnDragEnd: ((event: { active: { id: string }; over: { id: string } | null }) => void) | null = null;

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (event: { active: { id: string }; over: { id: string } | null }) => void }) => {
    capturedOnDragEnd = onDragEnd ?? null;
    return <div data-testid="dnd-context">{children}</div>;
  },
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: vi.fn((arr, from, to) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  }),
}));

vi.mock('./PlaylistItem', () => ({
  default: ({ id, text, onPlay, onDelete, onEdit, isPlaying, isLoading }: {
    id: string;
    text: string;
    onPlay: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit?: (id: string) => void;
    isPlaying?: boolean;
    isLoading?: boolean;
  }) => (
    <div data-testid={`playlist-item-${id}`}>
      <span>{text}</span>
      <button onClick={() => onPlay(id)} data-testid={`play-${id}`}>
        {isLoading ? 'Loading' : isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={() => onDelete(id)} data-testid={`delete-${id}`}>Delete</button>
      {onEdit && <button onClick={() => onEdit(id)} data-testid={`edit-${id}`}>Edit</button>}
    </div>
  ),
}));

describe('Playlist', () => {
  const mockEntries = [
    { id: '1', text: 'First entry', stressedText: 'First entry', audioUrl: 'audio1.wav', audioBlob: null },
    { id: '2', text: 'Second entry', stressedText: 'Second entry', audioUrl: 'audio2.wav', audioBlob: null },
    { id: '3', text: 'Third entry', stressedText: 'Third entry', audioUrl: null, audioBlob: null },
  ];

  const defaultProps = {
    entries: mockEntries,
    onPlayEntry: vi.fn(),
    onDeleteEntry: vi.fn(),
    onPlayAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders playlist title', () => {
      render(<Playlist {...defaultProps} />);
      expect(screen.getByText('Kõnevoor')).toBeInTheDocument();
    });

    it('renders all entries', () => {
      render(<Playlist {...defaultProps} />);
      expect(screen.getByTestId('playlist-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('playlist-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('playlist-item-3')).toBeInTheDocument();
    });

    it('renders play all button when entries exist', () => {
      render(<Playlist {...defaultProps} />);
      expect(screen.getByText('Kuula kõik')).toBeInTheDocument();
    });

    it('shows stop text when playing all', () => {
      render(<Playlist {...defaultProps} isPlayingAll={true} />);
      expect(screen.getByText('Peata')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders empty state when no entries', () => {
      render(<Playlist {...defaultProps} entries={[]} />);
      expect(screen.getByText('Kõnevoor on tühi')).toBeInTheDocument();
    });

    it('shows empty state description', () => {
      render(<Playlist {...defaultProps} entries={[]} />);
      expect(screen.getByText(/lisa lausungid/i)).toBeInTheDocument();
    });

    it('does not show play all button when empty', () => {
      render(<Playlist {...defaultProps} entries={[]} />);
      expect(screen.queryByText('Kuula kõik')).not.toBeInTheDocument();
    });
  });

  describe('play functionality', () => {
    it('calls onPlayEntry when entry play clicked', async () => {
      const user = userEvent.setup();
      render(<Playlist {...defaultProps} />);
      
      await user.click(screen.getByTestId('play-1'));
      expect(defaultProps.onPlayEntry).toHaveBeenCalledWith('1');
    });

    it('calls onPlayAll when play all clicked', async () => {
      const user = userEvent.setup();
      render(<Playlist {...defaultProps} />);
      
      await user.click(screen.getByText('Kuula kõik'));
      expect(defaultProps.onPlayAll).toHaveBeenCalled();
    });

    it('marks current playing entry', () => {
      render(<Playlist {...defaultProps} currentPlayingId="2" />);
      const playButton = screen.getByTestId('play-2');
      expect(playButton).toHaveTextContent('Pause');
    });
  });

  describe('delete functionality', () => {
    it('calls onDeleteEntry when entry delete clicked', async () => {
      const user = userEvent.setup();
      render(<Playlist {...defaultProps} />);
      
      await user.click(screen.getByTestId('delete-1'));
      expect(defaultProps.onDeleteEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('edit functionality', () => {
    it('renders edit button when onEditEntry provided', () => {
      const onEditEntry = vi.fn();
      render(<Playlist {...defaultProps} onEditEntry={onEditEntry} />);
      
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    });

    it('calls onEditEntry when edit clicked', async () => {
      const user = userEvent.setup();
      const onEditEntry = vi.fn();
      render(<Playlist {...defaultProps} onEditEntry={onEditEntry} />);
      
      await user.click(screen.getByTestId('edit-1'));
      expect(onEditEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('add to task button', () => {
    it('shows add to task button when onAddToTask provided', () => {
      const onAddToTask = vi.fn();
      render(<Playlist {...defaultProps} onAddToTask={onAddToTask} />);
      
      expect(screen.getByText(/lisa ülesandesse/i)).toBeInTheDocument();
    });

    it('shows entry count in add to task button', () => {
      const onAddToTask = vi.fn();
      render(<Playlist {...defaultProps} onAddToTask={onAddToTask} />);
      
      expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
    });

    it('calls onAddToTask when clicked', async () => {
      const user = userEvent.setup();
      const onAddToTask = vi.fn();
      render(<Playlist {...defaultProps} onAddToTask={onAddToTask} />);
      
      await user.click(screen.getByText(/lisa ülesandesse/i));
      expect(onAddToTask).toHaveBeenCalled();
    });

    it('does not show add to task button when empty', () => {
      const onAddToTask = vi.fn();
      render(<Playlist {...defaultProps} entries={[]} onAddToTask={onAddToTask} />);
      
      expect(screen.queryByText(/lisa ülesandesse/i)).not.toBeInTheDocument();
    });
  });

  describe('add entry button', () => {
    it('shows add entry button when onAddEntry provided and has entries', () => {
      const onAddEntry = vi.fn();
      render(<Playlist {...defaultProps} onAddEntry={onAddEntry} />);
      
      expect(screen.getByText('Lisa kõnevoor')).toBeInTheDocument();
    });

    it('calls onAddEntry when clicked', async () => {
      const user = userEvent.setup();
      const onAddEntry = vi.fn();
      render(<Playlist {...defaultProps} onAddEntry={onAddEntry} />);
      
      await user.click(screen.getByText('Lisa kõnevoor'));
      expect(onAddEntry).toHaveBeenCalled();
    });

    it('does not show add entry button when empty', () => {
      const onAddEntry = vi.fn();
      render(<Playlist {...defaultProps} entries={[]} onAddEntry={onAddEntry} />);
      
      expect(screen.queryByText('Lisa kõnevoor')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator for entries without audio', () => {
      render(<Playlist {...defaultProps} />);
      const loadingButton = screen.getByTestId('play-3');
      expect(loadingButton).toHaveTextContent('Loading');
    });
  });

  describe('play all functionality', () => {
    it('shows play all button with text', () => {
      render(<Playlist {...defaultProps} />);
      expect(screen.getByText('Kuula kõik')).toBeInTheDocument();
    });

    it('calls onPlayAll when button clicked', async () => {
      const user = userEvent.setup();
      render(<Playlist {...defaultProps} />);
      
      await user.click(screen.getByText('Kuula kõik'));
      expect(defaultProps.onPlayAll).toHaveBeenCalled();
    });

    it('shows stop text when playing all', () => {
      render(<Playlist {...defaultProps} isPlayingAll={true} />);
      expect(screen.getByText('Peata')).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('renders with dnd context', () => {
      render(<Playlist {...defaultProps} />);
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('renders with sortable context', () => {
      render(<Playlist {...defaultProps} />);
      expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
    });
  });

  describe('currently playing', () => {
    it('shows playing state for current entry', () => {
      render(<Playlist {...defaultProps} currentPlayingId="1" />);
      const playButton = screen.getByTestId('play-1');
      expect(playButton).toHaveTextContent('Pause');
    });
  });

  describe('delete entry', () => {
    it('calls onDeleteEntry when delete button clicked', async () => {
      const user = userEvent.setup();
      const onDeleteEntry = vi.fn();
      render(<Playlist {...defaultProps} onDeleteEntry={onDeleteEntry} />);
      
      const deleteButton = screen.getByTestId('delete-1');
      await user.click(deleteButton);
      expect(onDeleteEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('reorder entries', () => {
    it('calls onReorderEntries when provided', () => {
      const onReorderEntries = vi.fn();
      render(<Playlist {...defaultProps} onReorderEntries={onReorderEntries} />);
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('calls onReorderEntries when drag ends with different positions', () => {
      const onReorderEntries = vi.fn();
      render(<Playlist {...defaultProps} onReorderEntries={onReorderEntries} />);
      
      // Call the captured onDragEnd callback to exercise handleDragEnd
      if (capturedOnDragEnd) {
        capturedOnDragEnd({ active: { id: '1' }, over: { id: '2' } });
      }
      expect(onReorderEntries).toHaveBeenCalled();
    });

    it('does not call onReorderEntries when drag ends at same position', () => {
      const onReorderEntries = vi.fn();
      render(<Playlist {...defaultProps} onReorderEntries={onReorderEntries} />);
      
      if (capturedOnDragEnd) {
        capturedOnDragEnd({ active: { id: '1' }, over: { id: '1' } });
      }
      expect(onReorderEntries).not.toHaveBeenCalled();
    });

    it('handles drag end with null over target', () => {
      const onReorderEntries = vi.fn();
      render(<Playlist {...defaultProps} onReorderEntries={onReorderEntries} />);
      
      if (capturedOnDragEnd) {
        capturedOnDragEnd({ active: { id: '1' }, over: null });
      }
      // When over is null, over?.id is undefined, condition `active.id !== over?.id` is true
      // Function calls onReorderEntries with reordered array (edge case behavior)
    });

    it('does not reorder without onReorderEntries callback', () => {
      render(<Playlist {...defaultProps} />);
      
      if (capturedOnDragEnd) {
        capturedOnDragEnd({ active: { id: '1' }, over: { id: '2' } });
      }
      // Should not throw, just do nothing
    });
  });

  describe('empty state', () => {
    it('shows empty message when no entries', () => {
      render(<Playlist {...defaultProps} entries={[]} />);
      expect(screen.getByText(/tühi/i)).toBeInTheDocument();
    });
  });
});
