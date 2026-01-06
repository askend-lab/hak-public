import React from 'react';
import { vi, type MockedFunction } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuth } from '../../services/auth';

import { Header } from './Header';
import { setupI18nMock } from './test-utils';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('../ui', async () => {
  const actual = await vi.importActual('../ui');
  return {
    ...actual,
    LogoWithText: (): React.JSX.Element => <div data-testid="logo-with-text">LogoWithText</div>,
    NavTab: ({ label, ...props }: { label: string; [key: string]: unknown }): React.JSX.Element => <button data-testid="nav-tab" {...props}>{label}</button>,
    Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }): React.JSX.Element => <button data-testid="button" {...props}>{children}</button>,
    WaffleMenu: (): React.JSX.Element => <div data-testid="waffle-menu">WaffleMenu</div>,
    UserAvatar: ({ initials, onLogout, ...props }: { initials: string; onLogout?: () => void; [key: string]: unknown }): React.JSX.Element => (
      <div data-testid="user-avatar" {...props}>
        {initials}
        {onLogout && <button onClick={onLogout}>Logi välja</button>}
      </div>
    ),
  };
});

vi.mock('../../services/auth', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as MockedFunction<typeof useAuth>;

describe('Header', () => {
  beforeEach(() => {
    setupI18nMock();
    vi.clearAllMocks();
  });

  it('should render header titles', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByTestId('logo-with-text')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('Kõnesüntees')).toBeInTheDocument();
    expect(screen.getByText('Ülesanded')).toBeInTheDocument();
    expect(screen.getByText('Tests')).toBeInTheDocument();
  });

  it('should render auth section', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('Logi sisse')).toBeInTheDocument();
    expect(screen.getByTestId('waffle-menu')).toBeInTheDocument();
  });

  it('should show user avatar when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user123', email: 'test@example.com' },
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('should handle navigation tab clicks', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    const navTabs = screen.getAllByTestId('nav-tab');
    
    // Check that tabs are rendered
    expect(navTabs).toHaveLength(2);
    expect(navTabs[0]).toHaveTextContent('Kõnesüntees');
    expect(navTabs[1]).toHaveTextContent('Ülesanded');
    
    // Click tasks tab - should not crash
    navTabs[1]?.click();
    
    // Click synthesis tab - should not crash
    navTabs[0]?.click();
  });

  describe('Header styling (bug fixes)', () => {
    it('should have header class for white background styling', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshSession: vi.fn(),
        isLoading: false,
        error: null,
      });
      
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
      const header = document.querySelector('.header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Auth buttons', () => {
    it('should call login when login button clicked', async () => {
      const { fireEvent } = await import('@testing-library/react');
      const mockLogin = vi.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: mockLogin,
        logout: vi.fn(),
        refreshSession: vi.fn(),
        isLoading: false,
        error: null,
      });
      
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
      
      const loginButton = screen.getByText('Logi sisse');
      fireEvent.click(loginButton);
      expect(mockLogin).toHaveBeenCalled();
    });

    it('should call logout when logout button clicked', async () => {
      const { fireEvent } = await import('@testing-library/react');
      const mockLogout = vi.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 'user123', email: 'test@example.com' },
        login: vi.fn(),
        logout: mockLogout,
        refreshSession: vi.fn(),
        isLoading: false,
        error: null,
      });
      
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
      
      const logoutButton = screen.getByText('Logi välja');
      fireEvent.click(logoutButton);
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
