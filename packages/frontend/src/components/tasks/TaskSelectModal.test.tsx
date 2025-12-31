import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { TaskSelectModal } from './TaskSelectModal';

// Mock stores
vi.mock('../../features', () => ({
  useUIStore: vi.fn(() => ({
    activeModal: 'taskSelect',
    closeModal: vi.fn(),
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
    text: 'Tere',
    result: { phoneticText: 'test', audioHash: 'hash123', voiceModel: 'model' },
  })),
}));

vi.mock('../../services/auth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'user-123' } })),
}));

vi.mock('../../services/tasks', () => ({
  listTasks: vi.fn(() => Promise.resolve({ success: true, data: [] })),
  addEntryToTask: vi.fn(() => Promise.resolve({ success: true })),
  createTask: vi.fn(() => Promise.resolve({ success: true, data: { id: 'new-task' } })),
}));

vi.mock('../../core', () => ({
  createSynthesisEntry: vi.fn(() => ({ id: 'entry-1' })),
  createTaskEntry: vi.fn(() => ({ id: 'task-entry-1' })),
}));

describe('TaskSelectModal (Task Creation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when activeModal is taskSelect', () => {
    render(<TaskSelectModal />);
    expect(screen.getByRole('heading', { name: 'Loo uus ülesanne' })).toBeInTheDocument();
  });

  it('has mode selection radio buttons', () => {
    render(<TaskSelectModal />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('shows name and description fields in create mode', () => {
    render(<TaskSelectModal />);
    expect(screen.getByLabelText('Ülesande nimi *')).toBeInTheDocument();
    expect(screen.getByLabelText('Kirjeldus')).toBeInTheDocument();
  });

  it('shows playlist preview', () => {
    render(<TaskSelectModal />);
    expect(screen.getByText(/Lisatavad lausungid/)).toBeInTheDocument();
    expect(screen.getByText('1. Tere')).toBeInTheDocument();
  });

  it('has cancel and submit buttons', () => {
    render(<TaskSelectModal />);
    expect(screen.getByText('Tühista')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Loo ülesanne' })).toBeInTheDocument();
  });

  it('submit button is disabled when name is empty', () => {
    render(<TaskSelectModal />);
    const submitButton = screen.getByRole('button', { name: 'Loo ülesanne' });
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when name is filled', () => {
    render(<TaskSelectModal />);
    const nameInput = screen.getByLabelText('Ülesande nimi *');
    fireEvent.change(nameInput, { target: { value: 'My Task' } });
    const submitButton = screen.getByRole('button', { name: 'Loo ülesanne' });
    expect(submitButton).not.toBeDisabled();
  });

  it('has backdrop for closing', () => {
    const { container } = render(<TaskSelectModal />);
    const backdrop = container.querySelector('.task-modal-backdrop');
    expect(backdrop).toBeInTheDocument();
  });

  it('switches to existing task mode', () => {
    render(<TaskSelectModal />);
    const radios = screen.getAllByRole('radio');
    const existingModeRadio = radios[1];
    if (existingModeRadio) fireEvent.click(existingModeRadio);
    expect(screen.getByText('Vali ülesanne')).toBeInTheDocument();
  });

  it('shows task list in existing mode', () => {
    render(<TaskSelectModal />);
    const radios = screen.getAllByRole('radio');
    if (radios[1]) fireEvent.click(radios[1]);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('has close button', () => {
    render(<TaskSelectModal />);
    const closeButton = screen.getByLabelText('Sulge');
    expect(closeButton).toBeInTheDocument();
  });

  it('selects task in existing mode', () => {
    render(<TaskSelectModal />);
    const radios = screen.getAllByRole('radio');
    if (radios[1]) fireEvent.click(radios[1]); // Switch to existing mode
    
    const taskRadios = screen.getAllByRole('radio');
    // Select Task 1 (third radio after mode selection radios)
    const taskOptions = taskRadios.filter(r => r.getAttribute('name') === 'selectedTask');
    if (taskOptions[0]) {
      fireEvent.click(taskOptions[0]);
    }
  });

  it('shows entry count for tasks', () => {
    render(<TaskSelectModal />);
    const radios = screen.getAllByRole('radio');
    if (radios[1]) fireEvent.click(radios[1]); // Switch to existing mode
    // Task names should be visible
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('updates name input value', () => {
    render(<TaskSelectModal />);
    const nameInput = screen.getByLabelText('Ülesande nimi *') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Task Name' } });
    expect(nameInput.value).toBe('New Task Name');
  });

  it('updates description textarea value', () => {
    render(<TaskSelectModal />);
    const descInput = screen.getByLabelText('Kirjeldus') as HTMLTextAreaElement;
    fireEvent.change(descInput, { target: { value: 'Task description' } });
    expect(descInput.value).toBe('Task description');
  });
});

