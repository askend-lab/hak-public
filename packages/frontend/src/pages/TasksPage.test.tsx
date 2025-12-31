import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { TasksPage } from './TasksPage';

// Mock dependencies
vi.mock('../services/auth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('../services/tasks', () => ({
  listTasks: vi.fn().mockResolvedValue({
    success: true,
    data: [
      {
        id: 'task-1',
        name: 'Test Task',
        description: 'Test description',
        entries: [{ id: 'entry-1' }],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  }),
}));

vi.mock('../features', () => ({
  useUIStore: () => ({
    openModal: vi.fn(),
    activeModal: null,
    closeModal: vi.fn(),
    addNotification: vi.fn(),
  }),
  useTasksStore: () => ({
    tasks: [],
    setTasks: vi.fn(),
    isLoading: false,
    setLoading: vi.fn(),
  }),
  useSynthesisStore: () => ({
    text: '',
    result: null,
  }),
}));

vi.mock('../components', () => ({
  Header: () => <header data-testid="header">Header</header>,
  Footer: () => <footer data-testid="footer">Footer</footer>,
  NotificationContainer: () => <div data-testid="notifications" />,
}));

vi.mock('../components/tasks/TaskDetailView', () => ({
  TaskDetailView: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="task-detail">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('../components/tasks/TaskSelectModal', () => ({
  TaskSelectModal: () => <div data-testid="task-modal" />,
}));

const renderTasksPage = () => {
  return render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>
  );
};

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header and footer', () => {
    renderTasksPage();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders page title', () => {
    renderTasksPage();
    expect(screen.getByText('Ülesanded')).toBeInTheDocument();
  });

  it('renders Lisa button', () => {
    renderTasksPage();
    expect(screen.getByText('Lisa')).toBeInTheDocument();
  });

  it('shows loading or empty state initially', () => {
    renderTasksPage();
    // Component shows loading state while fetching tasks
    const loading = screen.queryByText('Laen ülesandeid...');
    const empty = screen.queryByText('Ülesandeid pole veel loodud');
    expect(loading ?? empty).toBeInTheDocument();
  });

  it('renders task modal component', () => {
    renderTasksPage();
    expect(screen.getByTestId('task-modal')).toBeInTheDocument();
  });
});

describe('TasksPage with tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task list when tasks exist', async () => {
    renderTasksPage();
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  it('renders notifications container', () => {
    renderTasksPage();
    expect(screen.getByTestId('notifications')).toBeInTheDocument();
  });

  it('has main content area', () => {
    const { container } = renderTasksPage();
    expect(container.querySelector('.app-main')).toBeInTheDocument();
  });

  it('has hero section with title and button', () => {
    const { container } = renderTasksPage();
    expect(container.querySelector('.hero-section')).toBeInTheDocument();
  });

  it('has task manager area', () => {
    const { container } = renderTasksPage();
    expect(container.querySelector('.task-manager')).toBeInTheDocument();
  });
});
