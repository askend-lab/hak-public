/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './App';
import { mockAuthContext, mockNotificationContext, mockOnboardingContext, mockSynthesis, mockTaskHandlers, mockDragAndDrop, mockVariantsPanel, mockSentenceMenu } from './test/mocks/appMocks';

vi.mock('./services/auth', () => ({ useAuth: vi.fn(() => mockAuthContext()) }));
vi.mock('./contexts/NotificationContext', () => ({ useNotification: vi.fn(() => mockNotificationContext()) }));
vi.mock('./contexts/OnboardingContext', () => ({ useOnboarding: vi.fn(() => mockOnboardingContext()) }));
vi.mock('./hooks', () => ({
  useSynthesis: vi.fn(() => mockSynthesis()),
  useTaskHandlers: vi.fn(() => mockTaskHandlers()),
  useDragAndDrop: vi.fn(() => mockDragAndDrop()),
  useVariantsPanel: vi.fn(() => mockVariantsPanel()),
  useSentenceMenu: vi.fn(() => mockSentenceMenu()),
}));
vi.mock('./utils/warmAudioWorker', () => ({ warmAudioWorker: vi.fn() }));

vi.mock('./components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('./components/SynthesisView', () => ({ default: () => <div data-testid="synthesis-view">SynthesisView</div> }));
vi.mock('./components/TasksView', () => ({ default: ({ selectedTaskId }: { selectedTaskId: string | null }) => <div data-testid="tasks-view" data-task-id={selectedTaskId}>TasksView</div> }));
vi.mock('./components/SpecsPage', () => ({ default: () => <div data-testid="specs-page">SpecsPage</div> }));
vi.mock('./components/Dashboard', () => ({ default: () => <div data-testid="dashboard">Dashboard</div> }));
vi.mock('./components/AppModals', () => ({ default: () => null }));
vi.mock('./components/onboarding', () => ({ RoleSelectionContent: () => <div data-testid="role-selection">RoleSelection</div>, OnboardingWizard: () => null }));

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL-based view rendering', () => {
    it('renders synthesis view for /synthesis route', () => {
      render(
        <MemoryRouter initialEntries={['/synthesis']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('synthesis-view')).toBeInTheDocument();
      expect(screen.queryByTestId('tasks-view')).not.toBeInTheDocument();
    });

    it('renders tasks view for /tasks route', async () => {
      const { useAuth } = await import('./services/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: '123', name: 'Test User', email: 'test@test.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/tasks']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('tasks-view')).toBeInTheDocument();
      expect(screen.queryByTestId('synthesis-view')).not.toBeInTheDocument();
    });

    it('renders task detail for /tasks/:id route', async () => {
      const { useAuth } = await import('./services/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: '123', name: 'Test User', email: 'test@test.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/tasks/task-123']}>
          <Home />
        </MemoryRouter>
      );
      
      const tasksView = screen.getByTestId('tasks-view');
      expect(tasksView).toBeInTheDocument();
      expect(tasksView).toHaveAttribute('data-task-id', 'task-123');
    });

    it('renders specs page for /specs route', () => {
      render(
        <MemoryRouter initialEntries={['/specs']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('specs-page')).toBeInTheDocument();
      expect(screen.queryByTestId('synthesis-view')).not.toBeInTheDocument();
    });

    it('renders dashboard for /dashboard route', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('synthesis-view')).not.toBeInTheDocument();
    });

    it('defaults to synthesis view for unknown route', () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('synthesis-view')).toBeInTheDocument();
    });
  });

  describe('pathname parsing', () => {
    it('extracts task ID from /tasks/:id URL', async () => {
      const { useAuth } = await import('./services/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: '123', name: 'Test User', email: 'test@test.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/tasks/abc-def-123']}>
          <Home />
        </MemoryRouter>
      );
      
      const tasksView = screen.getByTestId('tasks-view');
      expect(tasksView).toHaveAttribute('data-task-id', 'abc-def-123');
    });

    it('sets task ID to null for /tasks without ID', async () => {
      const { useAuth } = await import('./services/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: '123', name: 'Test User', email: 'test@test.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/tasks']}>
          <Home />
        </MemoryRouter>
      );
      
      const tasksView = screen.getByTestId('tasks-view');
      expect(tasksView).toHaveAttribute('data-task-id', '');
    });
  });

  describe('view detection from pathname', () => {
    it('detects synthesis view from /synthesis pathname', () => {
      render(
        <MemoryRouter initialEntries={['/synthesis']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('synthesis-view')).toBeInTheDocument();
    });

    it('detects tasks view from /tasks pathname', async () => {
      const { useAuth } = await import('./services/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: '123', name: 'Test User', email: 'test@test.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/tasks/123']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('tasks-view')).toBeInTheDocument();
    });

    it('detects specs view from /specs pathname', () => {
      render(
        <MemoryRouter initialEntries={['/specs']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('specs-page')).toBeInTheDocument();
    });

    it('detects dashboard view from /dashboard pathname', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('authentication-based routing', () => {
    it('shows role selection when onboarding not completed', async () => {
      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: false, selectedRole: null, currentStep: 0, skipped: false },
        isWizardActive: false,
        resetOnboarding: vi.fn(),
        isLoading: false,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
        skipWizard: vi.fn(),
        selectRole: vi.fn(),
        completeWizard: vi.fn(),
        currentSteps: [],
      });

      render(
        <MemoryRouter initialEntries={['/synthesis']}>
          <Home />
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('role-selection')).toBeInTheDocument();
      expect(screen.queryByTestId('synthesis-view')).not.toBeInTheDocument();
    });
  });
});
