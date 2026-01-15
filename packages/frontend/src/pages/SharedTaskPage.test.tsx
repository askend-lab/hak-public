import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { SharedTaskPage } from './SharedTaskPage';

const mockGetTaskByShareToken = vi.fn();
const mockGetTask = vi.fn();

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getTaskByShareToken: mockGetTaskByShareToken,
      getTask: mockGetTask,
    })),
  },
}));

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
  })),
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/AppHeader', () => ({
  default: () => <div data-testid="app-header">AppHeader</div>,
}));

vi.mock('@/components/TaskDetailView', () => ({
  default: ({ taskId }: { taskId: string }) => (
    <div data-testid="task-detail-view" data-task-id={taskId}>TaskDetailView</div>
  ),
}));

describe('SharedTaskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGetTaskByShareToken.mockImplementation(() => new Promise(() => {}));
    
    render(
      <MemoryRouter initialEntries={['/shared/task/abc123']}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Laadimine/i)).toBeInTheDocument();
  });

  it('renders page with existing components', async () => {
    const mockTask = {
      id: 'task-123',
      name: 'Test Task',
      shareToken: 'abc123',
      entries: [],
    };
    
    mockGetTaskByShareToken.mockResolvedValue(mockTask);
    
    render(
      <MemoryRouter initialEntries={['/shared/task/abc123']}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('app-header')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('task-detail-view')).toBeInTheDocument();
    expect(screen.getByTestId('task-detail-view')).toHaveAttribute('data-task-id', 'task-123');
    expect(screen.getByText('Jagatud ülesanne')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders error message when task not found', async () => {
    mockGetTaskByShareToken.mockResolvedValue(null);
    
    render(
      <MemoryRouter initialEntries={['/shared/task/invalid']}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Ülesannet ei leitud/i)).toBeInTheDocument();
    });
  });

  it('calls getTaskByShareToken with correct token', async () => {
    mockGetTaskByShareToken.mockResolvedValue({ 
      id: 'task-1', 
      name: 'Task',
      shareToken: 'test-token',
      entries: [] 
    });
    
    render(
      <MemoryRouter initialEntries={['/shared/task/test-token']}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockGetTaskByShareToken).toHaveBeenCalledWith('test-token');
    });
  });

  it('handles error during task loading', async () => {
    mockGetTaskByShareToken.mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter initialEntries={['/shared/task/abc123']}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Viga ülesande laadimisel/i)).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  it('copies link to clipboard when copy button clicked', async () => {
    const user = userEvent.setup();
    const mockTask = {
      id: 'task-1',
      name: 'Task',
      shareToken: 'abc123',
      entries: [],
    };
    
    mockGetTaskByShareToken.mockResolvedValue(mockTask);
    
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
    });
    
    render(
      <MemoryRouter initialEntries={['/shared/task/abc123']}>
        <Routes>
          <Route path="/shared/task/:token" element={<SharedTaskPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Jagatud ülesanne')).toBeInTheDocument();
    });
    
    const copyButton = screen.getByRole('button', { name: /kopeeri/i });
    await user.click(copyButton);
    
    expect(writeTextMock).toHaveBeenCalled();
  });
});
