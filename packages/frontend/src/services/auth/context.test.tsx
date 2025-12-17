import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './context';
import { AuthStorage } from './storage';

jest.mock('./storage');

const mockAuthStorage = AuthStorage as jest.Mocked<typeof AuthStorage>;

function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user">{user?.email || 'none'}</div>
      <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should login user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
      expect(mockAuthStorage.setUser).toHaveBeenCalled();
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

    await act(async () => {
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
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within AuthProvider'
    );
    
    consoleError.mockRestore();
  });
});
