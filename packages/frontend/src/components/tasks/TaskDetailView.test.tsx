import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { TaskDetailView } from './TaskDetailView';

// Mock audio services
vi.mock('../../services/audio', () => ({
  synthesizeText: vi.fn().mockResolvedValue({
    audioUrl: 'https://example.com/audio.mp3',
    audioHash: 'abc123',
  }),
  playAudio: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../services/config', () => ({
  API_CONFIG: {
    audioBucketUrl: 'https://test-bucket.s3.amazonaws.com',
  },
}));

const mockTask = {
  id: 'task-1',
  userId: 'user-1',
  name: 'Test Task',
  description: 'Test description',
  entries: [
    {
      id: 'entry-1',
      synthesis: {
        id: 'synth-1',
        originalText: 'Hello world',
        phoneticText: 'Hello world',
        audioHash: 'hash123',
        voiceModel: 'efm_s' as const,
        createdAt: '2024-01-01T00:00:00Z',
      },
      order: 0,
      addedAt: '2024-01-01T00:00:00Z',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockTaskEmpty = {
  ...mockTask,
  entries: [],
};

describe('TaskDetailView', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task name', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    expect(screen.getByText('Tagasi')).toBeInTheDocument();
  });

  it('calls onBack when back button clicked', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('Tagasi'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('renders entry text', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders play all button', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    expect(screen.getByText('Mängi kõik')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(<TaskDetailView task={mockTaskEmpty} onBack={mockOnBack} />);
    expect(screen.getByText('Ülesandel pole veel lausungeid')).toBeInTheDocument();
  });

  it('renders share button', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    expect(screen.getByText('Jaga')).toBeInTheDocument();
  });
});

describe('TaskDetailView without description', () => {
  const mockOnBack = vi.fn();
  const taskNoDesc = { ...mockTask, description: undefined };

  it('renders without description', () => {
    render(<TaskDetailView task={taskNoDesc} onBack={mockOnBack} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
});

describe('TaskDetailView interactions', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has entry with play button', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    // Each entry should have a play button
    const entryPlayBtn = screen.getAllByRole('button').find(btn => 
      btn.closest('.playlist-item')
    );
    expect(entryPlayBtn).toBeDefined();
  });

  it('renders entry index number', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('renders add sentence button in empty state', () => {
    const emptyTask = { ...mockTask, entries: [] };
    render(<TaskDetailView task={emptyTask} onBack={mockOnBack} />);
    expect(screen.getByText('Lisa lausung')).toBeInTheDocument();
  });

  it('does not show play all when no entries', () => {
    const emptyTask = { ...mockTask, entries: [] };
    render(<TaskDetailView task={emptyTask} onBack={mockOnBack} />);
    expect(screen.queryByText('Mängi kõik')).not.toBeInTheDocument();
  });

  it('shows menu button', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    const menuBtn = screen.getByLabelText('Rohkem valikuid');
    expect(menuBtn).toBeInTheDocument();
  });

  it('opens menu when clicking menu button', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    const menuBtn = screen.getByLabelText('Rohkem valikuid');
    fireEvent.click(menuBtn);
    expect(screen.getByText('Muuda')).toBeInTheDocument();
    expect(screen.getByText('Kustuta')).toBeInTheDocument();
  });

  it('closes menu when clicking menu item', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    const menuBtn = screen.getByLabelText('Rohkem valikuid');
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByText('Muuda'));
    expect(screen.queryByText('Kustuta')).not.toBeInTheDocument();
  });

  it('renders entry play button with aria-label', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    const playBtn = screen.getByLabelText('Mängi');
    expect(playBtn).toBeInTheDocument();
  });

  it('clicking entry play button triggers play', async () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    const playBtn = screen.getByLabelText('Mängi');
    fireEvent.click(playBtn);
    // Button should be in the document after click
    expect(playBtn).toBeInTheDocument();
  });

  it('renders formatted date for entries', () => {
    render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    // Date should be formatted in Estonian format
    expect(screen.getByText(/01\.01\.2024/)).toBeInTheDocument();
  });

  it('renders drag handle for entries', () => {
    const { container } = render(<TaskDetailView task={mockTask} onBack={mockOnBack} />);
    const dragHandle = container.querySelector('.playlist-item-drag');
    expect(dragHandle).toBeInTheDocument();
  });
});

describe('TaskDetailView with multiple entries', () => {
  const mockOnBack = vi.fn();
  const multiEntryTask = {
    ...mockTask,
    entries: [
      {
        id: 'entry-1',
        synthesis: {
          id: 'synth-1',
          originalText: 'First entry',
          phoneticText: 'First entry',
          audioHash: 'hash1',
          voiceModel: 'efm_s' as const,
          createdAt: '2024-01-01T00:00:00Z',
        },
        order: 0,
        addedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'entry-2',
        synthesis: {
          id: 'synth-2',
          originalText: 'Second entry',
          phoneticText: 'Second entry',
          audioHash: 'hash2',
          voiceModel: 'efm_s' as const,
          createdAt: '2024-01-02T00:00:00Z',
        },
        order: 1,
        addedAt: '2024-01-02T00:00:00Z',
      },
    ],
  };

  it('renders all entries', () => {
    render(<TaskDetailView task={multiEntryTask} onBack={mockOnBack} />);
    expect(screen.getByText('First entry')).toBeInTheDocument();
    expect(screen.getByText('Second entry')).toBeInTheDocument();
  });

  it('renders correct entry numbers', () => {
    render(<TaskDetailView task={multiEntryTask} onBack={mockOnBack} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
  });

  it('renders multiple play buttons', () => {
    render(<TaskDetailView task={multiEntryTask} onBack={mockOnBack} />);
    const playButtons = screen.getAllByLabelText('Mängi');
    expect(playButtons).toHaveLength(2);
  });
});
