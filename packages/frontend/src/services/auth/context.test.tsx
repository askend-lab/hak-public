import { vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

import { AuthProvider, useAuth } from './context';
import { AuthStorage } from './storage';

vi.mock('./storage');

const mockAuthStorage = vi.mocked(AuthStorage);

function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user">{user?.email ?? 'none'}</div>
      <button onClick={() => void login({ email: 'test@test.com', password: 'pass' })}>
        Login
      </button>
      <button onClick={() => void logout()}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
  });

  it('should initialize with loading state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
  });

  it('should restore user from storage', async () => {
    mockAuthStorage.getUser.mockReturnValue({ id: '1', email: 'stored@test.com' });
    mockAuthStorage.getAccessToken.mockReturnValue('mock-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
      expect(screen.getByTestId('user')).toHaveTextContent('stored@test.com');
    });
  });

  it('should trigger login redirect', async () => {
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    // Login should trigger redirect to OAuth
    expect(window.location.href).toContain('cognito');

    // Restore
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('should logout user', async () => {
    mockAuthStorage.getUser.mockReturnValue({ id: '1', email: 'test@test.com' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
       
      expect(mockAuthStorage.clear).toHaveBeenCalled();
    });
  });
});

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
     
    const consoleError = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within AuthProvider'
    );
    
    consoleError.mockRestore();
  });
});
