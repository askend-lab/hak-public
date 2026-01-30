/* eslint-disable max-lines-per-function, max-lines */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Home from './App';
import { mockAuthContext, mockNotificationContext, mockOnboardingContext, mockSynthesis, mockTaskHandlers, mockDragAndDrop, mockVariantsPanel, mockSentenceMenu } from './test/mocks/appMocks';

vi.mock('./services/auth', () => ({ useAuth: vi.fn(() => mockAuthContext()) }));
vi.mock('./contexts/NotificationContext', () => ({ useNotification: vi.fn(() => mockNotificationContext()) }));
vi.mock('./contexts/OnboardingContext', () => ({ useOnboarding: vi.fn(() => mockOnboardingContext()) }));
vi.mock('./hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./hooks')>();
  return {
    ...actual,
    useSynthesis: vi.fn(() => mockSynthesis()),
    useTaskHandlers: vi.fn(() => mockTaskHandlers()),
    useDragAndDrop: vi.fn(() => mockDragAndDrop()),
    useVariantsPanel: vi.fn(() => mockVariantsPanel()),
    useSentenceMenu: vi.fn(() => mockSentenceMenu()),
    useUserTasks: vi.fn(() => ({ tasks: [], isLoading: false, error: null, refresh: vi.fn() })),
    useUserId: vi.fn(() => '38001085718'),
  };
});

vi.mock('./components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('./components/PronunciationVariants', () => ({ default: () => null }));
vi.mock('./components/TaskManager', () => ({ default: () => <div data-testid="task-manager">TaskManager</div> }));
vi.mock('./components/TaskDetailView', () => ({ default: () => <div data-testid="task-detail-view">TaskDetailView</div> }));
vi.mock('./components/TaskEditModal', () => ({ default: () => null }));
vi.mock('./components/AddEntryModal', () => ({ default: () => null }));
vi.mock('./components/ShareTaskModal', () => ({ default: () => null }));
vi.mock('./components/LoginModal', () => ({ default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="login-modal">LoginModal</div> : null }));
vi.mock('./components/UserProfile', () => ({ default: ({ user }: { user: { name: string } }) => <div data-testid="user-profile">{user.name}</div> }));
vi.mock('./components/ConfirmationModal', () => ({ default: () => null }));
vi.mock('./components/AddToTaskDropdown', () => ({ default: () => null }));
vi.mock('./components/SentencePhoneticPanel', () => ({ default: () => null }));
vi.mock('./components/SentenceSynthesisItem', () => ({ default: ({ id }: { id: string }) => <div data-testid={`sentence-item-${id}`}>SentenceItem</div> }));
vi.mock('./components/onboarding', () => ({ RoleSelectionContent: () => <div data-testid="role-selection">RoleSelection</div>, OnboardingWizard: () => <div data-testid="onboarding-wizard">OnboardingWizard</div> }));
vi.mock('./services/dataService', () => ({ DataService: { getInstance: vi.fn(() => ({ addTextEntriesToTask: vi.fn() })) } }));

describe('App (Home)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders header with logo', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByAltText('EKI Logo')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByText('Tekst kõneks')).toBeInTheDocument();
      expect(screen.getByText('Ülesanded')).toBeInTheDocument();
    });

    it('renders synthesis view by default', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByText('Muuda tekst kõneks')).toBeInTheDocument();
    });

    it('renders footer', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders help button', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByTitle('Näita juhendeid')).toBeInTheDocument();
    });

    it('renders login button when not authenticated', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByText('Logi sisse')).toBeInTheDocument();
    });

  });

  describe('loading state', () => {
    it('shows loading spinner when onboarding is loading', async () => {
      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: false, selectedRole: null, currentStep: 0, skipped: false },
        isWizardActive: false,
        resetOnboarding: vi.fn(),
        isLoading: true,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
        skipWizard: vi.fn(),
        selectRole: vi.fn(),
        completeWizard: vi.fn(),
        currentSteps: [],
      });

      const { container } = render(<MemoryRouter><Home /></MemoryRouter>);
      expect(container.querySelector('.loader-spinner')).toBeInTheDocument();
    });
  });

  describe('role selection', () => {
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

      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByTestId('role-selection')).toBeInTheDocument();
    });
  });

  describe('authenticated user', () => {
    it('shows user profile when authenticated', async () => {
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
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('synthesis link is rendered by default', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      const synthesisLink = screen.getByText('Tekst kõneks');
      expect(synthesisLink).toBeInTheDocument();
    });

    it('clicking tasks link when not authenticated shows login modal', async () => {
      const setShowLoginModal = vi.fn();
      const { useAuth } = await import('./services/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal,
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      const user = userEvent.setup();
      render(<MemoryRouter><Home /></MemoryRouter>);

      await user.click(screen.getByText('Ülesanded'));
      expect(setShowLoginModal).toHaveBeenCalledWith(true);
    });
  });

  describe('synthesis view', () => {
    beforeEach(async () => {
      // Ensure onboarding is completed so synthesis view is shown
      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: true, selectedRole: 'teacher', currentStep: 0, skipped: false },
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
    });

    it('renders sentence items', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByTestId('sentence-item-1')).toBeInTheDocument();
    });

    it('renders add sentence button', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByText('Lisa lause')).toBeInTheDocument();
    });

    it('renders page title', () => {
      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByText('Muuda tekst kõneks')).toBeInTheDocument();
    });
  });

  describe('help button', () => {
    it('renders help button', async () => {
      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: true, selectedRole: 'teacher', currentStep: 0, skipped: false },
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

      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByTitle('Näita juhendeid')).toBeInTheDocument();
    });
  });

  describe('onboarding wizard', () => {
    it('shows wizard when active', async () => {
      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: true, selectedRole: 'teacher', currentStep: 0, skipped: false },
        isWizardActive: true,
        resetOnboarding: vi.fn(),
        isLoading: false,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
        skipWizard: vi.fn(),
        selectRole: vi.fn(),
        completeWizard: vi.fn(),
        currentSteps: [],
      });

      render(<MemoryRouter><Home /></MemoryRouter>);
      expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument();
    });
  });

  describe('login button', () => {
    it('calls setShowLoginModal when clicked', async () => {
      const setShowLoginModal = vi.fn();
      const { useAuth } = await import('./services/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal,
        refreshSession: vi.fn(),
        handleCodeCallback: vi.fn(),
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      const user = userEvent.setup();
      render(<MemoryRouter><Home /></MemoryRouter>);

      await user.click(screen.getByText('Logi sisse'));
      expect(setShowLoginModal).toHaveBeenCalledWith(true);
    });
  });

  describe('tasks view', () => {
    it('shows tasks view when authenticated and tasks selected', async () => {
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
        loginWithTara: vi.fn(),
        handleTaraTokens: vi.fn(),
      });

      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: true, selectedRole: 'teacher', currentStep: 0, skipped: false },
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

      const user = userEvent.setup();
      render(<MemoryRouter><Home /></MemoryRouter>);

      await user.click(screen.getByText('Ülesanded'));
      expect(screen.getByTestId('task-manager')).toBeInTheDocument();
    });
  });

  describe('add sentence button', () => {
    it('calls handleAddSentence when clicked', async () => {
      const handleAddSentence = vi.fn();
      const { useSynthesis } = await import('./hooks');
      vi.mocked(useSynthesis).mockReturnValue({
        sentences: [{ id: '1', text: '', tags: [], isPlaying: false, isLoading: false, currentInput: '' }],
        setSentences: vi.fn(),
        isPlayingAll: false,
        isLoadingPlayAll: false,
        editingTag: null,
        openTagMenu: null,
        setOpenTagMenu: vi.fn(),
        setDemoSentences: vi.fn(),
        handleTextChange: vi.fn(),
        handleClearSentence: vi.fn(),
        handleAddSentence,
        handleRemoveSentence: vi.fn(),
        handleInputBlur: vi.fn(),
        handleKeyDown: vi.fn(),
        handlePlay: vi.fn(),
        handlePlayAll: vi.fn(),
        handleDownload: vi.fn(),
        handleDeleteTag: vi.fn(),
        handleEditTag: vi.fn(),
        handleEditTagChange: vi.fn(),
        handleEditTagCommit: vi.fn(),
        handleEditTagKeyDown: vi.fn(),
        handleUseVariant: vi.fn(),
        handleSentencePhoneticApply: vi.fn(),
        synthesizeAndPlay: vi.fn(),
      });

      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: true, selectedRole: 'teacher', currentStep: 0, skipped: false },
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

      const user = userEvent.setup();
      render(<MemoryRouter><Home /></MemoryRouter>);

      await user.click(screen.getByText('Lisa lause'));
      expect(handleAddSentence).toHaveBeenCalled();
    });
  });
});
