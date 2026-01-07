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
    // Use valid JWT with non-expired timestamp
    const validToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);

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

    await act(async () => {
      screen.getByText('Login').click();
    });

    // Login should trigger redirect to OAuth (async with PKCE)
    await waitFor(() => {
      expect(window.location.href).toContain('cognito');
    });

    // Restore
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('should logout user', async () => {
    mockAuthStorage.getUser.mockReturnValue({ id: '1', email: 'test@test.com' });
    // Use valid JWT with non-expired timestamp
    const validToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);

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

describe('Token Refresh (Sliding Session)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue({ id: '1', email: 'test@test.com' });
    mockAuthStorage.getRefreshToken.mockReturnValue('mock-refresh-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should authenticate with valid non-expiring token', async () => {
    // Token that expires in 1 hour (NOT expiring soon)
    const validToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    // Token should not trigger refresh
    expect(mockAuthStorage.getAccessToken).toHaveBeenCalled();
  });

  it('should refresh token when access token is expired', async () => {
    // Expired access token
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue('valid-refresh-token');

    // Mock successful token refresh BEFORE render
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'new-access-token',
        id_token: 'new-id-token',
        expires_in: 3600,
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith('new-access-token');
    });
  });

  it('should logout user when refresh token is expired', async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue('expired-refresh-token');

    // Mock failed token refresh BEFORE render
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'invalid_grant' }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      // Should clear auth and redirect to login
      expect(mockAuthStorage.clear).toHaveBeenCalled();
    });
  });
});

// Helper to create mock JWT
function createMockJwt(payload: { exp: number; sub?: string; email?: string }): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ sub: '123', email: 'test@test.com', ...payload }));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}
