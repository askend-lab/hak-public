import { render, screen } from '@testing-library/react';

import { useAuth } from '../../services/auth';

import { AuthDisplay } from './AuthDisplay';

// Mock the auth service
jest.mock('../../services/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('AuthDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show login button when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<AuthDisplay />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveStyle({
      padding: '0.75rem 1.5rem',
      background: '#173148',
      color: '#FFFFFF',
    });
  });

  it('should show user email and logout button when authenticated', () => {
    const mockUser = { email: 'test@example.com', id: '123' };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<AuthDisplay />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveStyle({
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      color: '#636B74',
    });
  });

  it('should call login when login button is clicked', () => {
    const mockLogin = jest.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: mockLogin,
      logout: jest.fn(),
    });

    render(<AuthDisplay />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    loginButton.click();

    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('should call logout when logout button is clicked', () => {
    const mockLogout = jest.fn();
    const mockUser = { email: 'test@example.com', id: '123' };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      login: jest.fn(),
      logout: mockLogout,
    });

    render(<AuthDisplay />);

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    logoutButton.click();

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should handle null user email gracefully', () => {
    const mockUser = { email: null, id: '123' };
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<AuthDisplay />);

    // Should not crash and should still show logout button
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should handle undefined user gracefully', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: undefined,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<AuthDisplay />);

    // Should not crash and should still show logout button
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    expect(logoutButton).toBeInTheDocument();
  });
});
