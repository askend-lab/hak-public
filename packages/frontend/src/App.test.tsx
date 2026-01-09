/* eslint-disable max-lines-per-function, max-lines */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './App';

// Mock all contexts
vi.mock('./contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    showLoginModal: false,
    setShowLoginModal: vi.fn(),
  })),
}));

vi.mock('./contexts/NotificationContext', () => ({
  useNotification: vi.fn(() => ({
    showNotification: vi.fn(),
  })),
}));

vi.mock('./contexts/OnboardingContext', () => ({
  useOnboarding: vi.fn(() => ({
    state: { completed: true, selectedRole: 'teacher' },
    isWizardActive: false,
    resetOnboarding: vi.fn(),
    isLoading: false,
  })),
}));

// Mock all hooks
vi.mock('./hooks', () => ({
  useSynthesis: vi.fn(() => ({
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
    handleAddSentence: vi.fn(),
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
  })),
  useTaskHandlers: vi.fn(() => ({
    showAddToTaskDropdown: false,
    setShowAddToTaskDropdown: vi.fn(),
    handleAddAllSentencesToTask: vi.fn(),
    handleSelectTaskFromDropdown: vi.fn(),
    handleCreateNewFromDropdown: vi.fn(),
    handleCreateTask: vi.fn(),
    handleEditTask: vi.fn(),
    handleDeleteTask: vi.fn(),
    handleShareTask: vi.fn(),
    handleAddSentenceToExistingTask: vi.fn(),
    handleCreateNewTaskFromMenu: vi.fn(),
    taskRefreshTrigger: 0,
    showAddTaskModal: false,
    setShowAddTaskModal: vi.fn(),
    handleAddTask: vi.fn(),
    showTaskCreationModal: false,
    setShowTaskCreationModal: vi.fn(),
    handleTaskCreated: vi.fn(),
    showTaskEditModal: false,
    setShowTaskEditModal: vi.fn(),
    taskToEdit: null,
    setTaskToEdit: vi.fn(),
    handleTaskUpdated: vi.fn(),
    showShareTaskModal: false,
    setShowShareTaskModal: vi.fn(),
    taskToShare: null,
    setTaskToShare: vi.fn(),
    showDeleteConfirmation: false,
    taskToDelete: null,
    handleConfirmDelete: vi.fn(),
    handleCancelDelete: vi.fn(),
  })),
  useDragAndDrop: vi.fn(() => ({
    draggedId: null,
    dragOverId: null,
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDrop: vi.fn(),
  })),
  useVariantsPanel: vi.fn(() => ({
    isVariantsPanelOpen: false,
    variantsWord: '',
    selectedSentenceId: null,
    selectedTagIndex: null,
    variantsCustomPhonetic: '',
    setVariantsCustomPhonetic: vi.fn(),
    handleOpenVariantsFromMenu: vi.fn(),
    handleCloseVariants: vi.fn(),
    showSentencePhoneticPanel: false,
    sentencePhoneticId: null,
    handleExplorePhonetic: vi.fn(),
    handleCloseSentencePhonetic: vi.fn(),
  })),
  useSentenceMenu: vi.fn(() => ({
    openMenuId: null,
    menuAnchorEl: {},
    menuSearchQuery: '',
    setMenuSearchQuery: vi.fn(),
    menuTasks: [],
    isLoadingMenuTasks: false,
    handleMenuOpen: vi.fn(),
    handleMenuClose: vi.fn(),
  })),
}));

// Mock child components
vi.mock('./components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('./components/PronunciationVariants', () => ({
  default: () => null,
}));

vi.mock('./components/TaskManager', () => ({
  default: () => <div data-testid="task-manager">TaskManager</div>,
}));

vi.mock('./components/TaskDetailView', () => ({
  default: () => <div data-testid="task-detail-view">TaskDetailView</div>,
}));

vi.mock('./components/TaskCreationModal', () => ({
  default: () => null,
}));

vi.mock('./components/TaskEditModal', () => ({
  default: () => null,
}));

vi.mock('./components/AddEntryModal', () => ({
  default: () => null,
}));

vi.mock('./components/ShareTaskModal', () => ({
  default: () => null,
}));

vi.mock('./components/LoginModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div data-testid="login-modal">LoginModal</div> : null,
}));

vi.mock('./components/UserProfile', () => ({
  default: ({ user }: { user: { name: string } }) => <div data-testid="user-profile">{user.name}</div>,
}));

vi.mock('./components/ConfirmationModal', () => ({
  default: () => null,
}));

vi.mock('./components/AddToTaskDropdown', () => ({
  default: () => null,
}));

vi.mock('./components/SentencePhoneticPanel', () => ({
  default: () => null,
}));

vi.mock('./components/SentenceSynthesisItem', () => ({
  default: ({ id }: { id: string }) => <div data-testid={`sentence-item-${id}`}>SentenceItem</div>,
}));

vi.mock('./components/onboarding', () => ({
  RoleSelectionContent: () => <div data-testid="role-selection">RoleSelection</div>,
  OnboardingWizard: () => <div data-testid="onboarding-wizard">OnboardingWizard</div>,
}));

vi.mock('./services/dataService', () => ({
  DataService: {
    getInstance: vi.fn(() => ({
      addTextEntriesToTask: vi.fn(),
    })),
  },
}));

describe('App (Home)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders header with logo', () => {
      render(<Home />);
      expect(screen.getByAltText('EKI Logo')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      render(<Home />);
      expect(screen.getByText('Kõnesüntees')).toBeInTheDocument();
      expect(screen.getByText('Ülesanded')).toBeInTheDocument();
    });

    it('renders synthesis view by default', () => {
      render(<Home />);
      expect(screen.getByText('Teksti kõnesüntees')).toBeInTheDocument();
    });

    it('renders footer', () => {
      render(<Home />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders help button', () => {
      render(<Home />);
      expect(screen.getByTitle('Näita juhendeid')).toBeInTheDocument();
    });

    it('renders login button when not authenticated', () => {
      render(<Home />);
      expect(screen.getByText('Logi sisse')).toBeInTheDocument();
    });

    it('renders menu button', () => {
      render(<Home />);
      expect(screen.getByLabelText('Menu')).toBeInTheDocument();
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

      const { container } = render(<Home />);
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

      render(<Home />);
      expect(screen.getByTestId('role-selection')).toBeInTheDocument();
    });
  });

  describe('authenticated user', () => {
    it('shows user profile when authenticated', async () => {
      const { useAuth } = await import('./contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: '123', name: 'Test User', email: 'test@test.com' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
      });

      render(<Home />);
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('synthesis link has active class by default', () => {
      render(<Home />);
      const synthesisLink = screen.getByText('Kõnesüntees');
      expect(synthesisLink).toHaveClass('active');
    });

    it('clicking tasks link when not authenticated shows login modal', async () => {
      const setShowLoginModal = vi.fn();
      const { useAuth } = await import('./contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal,
      });

      const user = userEvent.setup();
      render(<Home />);

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
      render(<Home />);
      expect(screen.getByTestId('sentence-item-1')).toBeInTheDocument();
    });

    it('renders add sentence button', () => {
      render(<Home />);
      expect(screen.getByText('Lisa lause')).toBeInTheDocument();
    });

    it('renders page title', () => {
      render(<Home />);
      expect(screen.getByText('Teksti kõnesüntees')).toBeInTheDocument();
    });
  });

  describe('help button', () => {
    it('calls resetOnboarding when clicked', async () => {
      const resetOnboarding = vi.fn();
      const { useOnboarding } = await import('./contexts/OnboardingContext');
      vi.mocked(useOnboarding).mockReturnValue({
        state: { completed: true, selectedRole: 'teacher', currentStep: 0, skipped: false },
        isWizardActive: false,
        resetOnboarding,
        isLoading: false,
        nextStep: vi.fn(),
        prevStep: vi.fn(),
        skipWizard: vi.fn(),
        selectRole: vi.fn(),
        completeWizard: vi.fn(),
        currentSteps: [],
      });

      const user = userEvent.setup();
      render(<Home />);

      await user.click(screen.getByTitle('Näita juhendeid'));
      expect(resetOnboarding).toHaveBeenCalled();
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

      render(<Home />);
      expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument();
    });
  });

  describe('login button', () => {
    it('calls setShowLoginModal when clicked', async () => {
      const setShowLoginModal = vi.fn();
      const { useAuth } = await import('./contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal,
      });

      const user = userEvent.setup();
      render(<Home />);

      await user.click(screen.getByText('Logi sisse'));
      expect(setShowLoginModal).toHaveBeenCalledWith(true);
    });
  });

  describe('tasks view', () => {
    it('shows tasks view when authenticated and tasks selected', async () => {
      const { useAuth } = await import('./contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: '123', name: 'Test User', email: 'test@test.com' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        showLoginModal: false,
        setShowLoginModal: vi.fn(),
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
      render(<Home />);

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
      render(<Home />);

      await user.click(screen.getByText('Lisa lause'));
      expect(handleAddSentence).toHaveBeenCalled();
    });
  });
});
