import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuth } from '../../services/auth';

import { Header } from './Header';
import { setupI18nMock } from './test-utils';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../ui', () => ({
  ...jest.requireActual('../ui'),
  LogoWithText: (): JSX.Element => <div data-testid="logo-with-text">LogoWithText</div>,
  NavTab: ({ label, ...props }: { label: string; [key: string]: unknown }): JSX.Element => <button data-testid="nav-tab" {...props}>{label}</button>,
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }): JSX.Element => <button data-testid="button" {...props}>{children}</button>,
  WaffleMenu: (): JSX.Element => <div data-testid="waffle-menu">WaffleMenu</div>,
  UserAvatar: ({ initials, ...props }: { initials: string; [key: string]: unknown }): JSX.Element => <div data-testid="user-avatar" {...props}>{initials}</div>,
}));

jest.mock('../../services/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Header', () => {
  beforeEach(() => {
    setupI18nMock();
    jest.clearAllMocks();
  });

  it('should render header titles', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn()
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
      login: jest.fn(),
      logout: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('Süntees')).toBeInTheDocument();
    expect(screen.getByText('Ülesanded')).toBeInTheDocument();
    expect(screen.getByText('Tests')).toBeInTheDocument();
  });

  it('should render auth section', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn()
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
      login: jest.fn(),
      logout: jest.fn()
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
      login: jest.fn(),
      logout: jest.fn()
    });
    
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    const navTabs = screen.getAllByTestId('nav-tab');
    
    // Check that tabs are rendered
    expect(navTabs).toHaveLength(2);
    expect(navTabs[0]).toHaveTextContent('Süntees');
    expect(navTabs[1]).toHaveTextContent('Ülesanded');
    
    // Click tasks tab - should not crash
    navTabs[1].click();
    
    // Click synthesis tab - should not crash
    navTabs[0].click();
  });
});
