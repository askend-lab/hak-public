import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AppHeader from './AppHeader';

vi.mock('@/services/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '123', name: 'Test User', email: 'test@test.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
}));

describe('AppHeader', () => {
  const mockOnTasksClick = vi.fn();
  const mockOnHelpClick = vi.fn();
  const mockOnLoginClick = vi.fn();

  const defaultProps = {
    isAuthenticated: false,
    user: null,
    onTasksClick: mockOnTasksClick,
    onHelpClick: mockOnHelpClick,
    onLoginClick: mockOnLoginClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders logo', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      expect(screen.getByAltText('EKI Logo')).toBeInTheDocument();
    });

    it('renders all navigation links', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      expect(screen.getByText('Kõnesüntees')).toBeInTheDocument();
      expect(screen.getByText('Ülesanded')).toBeInTheDocument();
      expect(screen.getByText('Testid')).toBeInTheDocument();
      expect(screen.getByText('Töölaud')).toBeInTheDocument();
    });

    it('renders help button', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      expect(screen.getByTitle('Näita juhendeid')).toBeInTheDocument();
    });

    it('renders login button when not authenticated', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      expect(screen.getByText('Logi sisse')).toBeInTheDocument();
    });

    it('renders user profile when authenticated', () => {
      render(
        <MemoryRouter>
          <AppHeader 
            {...defaultProps}
            isAuthenticated={true}
            user={{ id: '123', name: 'Test User', email: 'test@test.com' }}
          />
        </MemoryRouter>
      );
      expect(screen.queryByText('Logi sisse')).not.toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('Kõnesüntees link navigates to /synthesis', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Kõnesüntees');
      expect(link).toHaveAttribute('href', '/synthesis');
    });

    it('Ülesanded link navigates to /tasks', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Ülesanded');
      expect(link).toHaveAttribute('href', '/tasks');
    });

    it('Testid link navigates to /specs', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Testid');
      expect(link).toHaveAttribute('href', '/specs');
    });

    it('Töölaud link navigates to /dashboard', () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Töölaud');
      expect(link).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('active state', () => {
    it('marks synthesis link as active on /synthesis', () => {
      render(
        <MemoryRouter initialEntries={['/synthesis']}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Kõnesüntees');
      expect(link).toHaveClass('active');
    });

    it('marks tasks link as active on /tasks', () => {
      render(
        <MemoryRouter initialEntries={['/tasks']}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Ülesanded');
      expect(link).toHaveClass('active');
    });

    it('marks tasks link as active on /tasks/:id', () => {
      render(
        <MemoryRouter initialEntries={['/tasks/123']}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Ülesanded');
      expect(link).toHaveClass('active');
    });

    it('marks specs link as active on /specs', () => {
      render(
        <MemoryRouter initialEntries={['/specs']}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Testid');
      expect(link).toHaveClass('active');
    });

    it('marks dashboard link as active on /dashboard', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      const link = screen.getByText('Töölaud');
      expect(link).toHaveClass('active');
    });
  });

  describe('authentication-gated navigation', () => {
    it('calls onTasksClick when clicking tasks link while not authenticated', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      
      await user.click(screen.getByText('Ülesanded'));
      expect(mockOnTasksClick).toHaveBeenCalled();
    });

    it('allows navigation to tasks when authenticated', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader 
            {...defaultProps}
            isAuthenticated={true}
            user={{ id: '123', name: 'Test User', email: 'test@test.com' }}
          />
        </MemoryRouter>
      );
      
      await user.click(screen.getByText('Ülesanded'));
      expect(mockOnTasksClick).not.toHaveBeenCalled();
    });
  });

  describe('button interactions', () => {
    it('calls onHelpClick when help button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      
      await user.click(screen.getByTitle('Näita juhendeid'));
      expect(mockOnHelpClick).toHaveBeenCalled();
    });

    it('calls onLoginClick when login button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>
      );
      
      await user.click(screen.getByText('Logi sisse'));
      expect(mockOnLoginClick).toHaveBeenCalled();
    });
  });
});
