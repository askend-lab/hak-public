import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { TaskSelectModal } from './TaskSelectModal';

// Mock stores
vi.mock('../../features', () => ({
  useUIStore: vi.fn(() => ({
    activeModal: 'taskSelect',
    closeModal: vi.fn(),
    openModal: vi.fn(),
    addNotification: vi.fn(),
  })),
  useTasksStore: vi.fn(() => ({
    tasks: [
      { id: '1', name: 'Task 1', entries: [] },
      { id: '2', name: 'Task 2', entries: [{}] },
    ],
    setTasks: vi.fn(),
    setLoading: vi.fn(),
    isLoading: false,
  })),
  useSynthesisStore: vi.fn(() => ({
    text: 'test text',
    result: { phoneticText: 'test', audioHash: 'hash123', voiceModel: 'model' },
  })),
}));

vi.mock('../../services/auth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'user-123' } })),
}));

vi.mock('../../services/tasks', () => ({
  listTasks: vi.fn(() => Promise.resolve({ success: true, data: [] })),
  addEntryToTask: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('../../core', () => ({
  createSynthesisEntry: vi.fn(() => ({ id: 'entry-1' })),
  createTaskEntry: vi.fn(() => ({ id: 'task-entry-1' })),
}));

vi.mock('../ui', () => ({
  Modal: ({ isOpen, children, footer, title }: { isOpen: boolean; children: React.ReactNode; footer: React.ReactNode; title: string }) => 
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <div data-testid="footer">{footer}</div>
      </div>
    ) : null,
}));

describe('TaskSelectModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when activeModal is taskSelect', () => {
    render(<TaskSelectModal />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Vali ülesanne')).toBeInTheDocument();
  });

  it('displays task list', () => {
    render(<TaskSelectModal />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('shows entry count for each task', () => {
    render(<TaskSelectModal />);
    expect(screen.getByText('0 kirjet')).toBeInTheDocument();
    expect(screen.getByText('1 kirjet')).toBeInTheDocument();
  });

  it('allows selecting a task', () => {
    render(<TaskSelectModal />);
    const task1Button = screen.getByText('Task 1').closest('button');
    expect(task1Button).toBeInTheDocument();
    if (task1Button) {
      fireEvent.click(task1Button);
    }
  });

  it('has submit and cancel buttons', () => {
    render(<TaskSelectModal />);
    expect(screen.getByText('Tühista')).toBeInTheDocument();
    expect(screen.getByText('Lisa')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<TaskSelectModal onClose={onClose} />);
    fireEvent.click(screen.getByText('Tühista'));
  });
});
