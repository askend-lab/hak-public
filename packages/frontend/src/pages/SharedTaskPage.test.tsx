import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SharedTaskPage } from './SharedTaskPage';

const mockGetTaskByShareToken = vi.fn();

vi.mock('@/services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      getTaskByShareToken: mockGetTaskByShareToken,
    })),
  },
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

  it('renders task detail when task is found', async () => {
    const mockTask = {
      id: 'task-123',
      name: 'Shared Task',
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
      expect(screen.getByTestId('task-detail-view')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('task-detail-view')).toHaveAttribute('data-task-id', 'task-123');
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
    mockGetTaskByShareToken.mockResolvedValue({ id: 'task-1', shareToken: 'test-token' });
    
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
});
