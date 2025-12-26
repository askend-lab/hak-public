import { vi, type MockedFunction } from 'vitest';
import { render, screen } from '@testing-library/react';

import { useAuth } from './context';
import { ProtectedRoute, useRequireAuth } from './ProtectedRoute';

vi.mock('./context');

const mockUseAuth = useAuth as MockedFunction<typeof useAuth>;

// DRY: Factory function for auth context mock
const createAuthMock = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  ...overrides,
});

describe('ProtectedRoute', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as Window & { location?: Location }).location;
    window.location = Object.assign({}, originalLocation, { href: '', pathname: '/current' });
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should show loading when auth is loading', () => {
    mockUseAuth.mockReturnValue(createAuthMock({ isLoading: true }));
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show custom fallback when loading', () => {
    mockUseAuth.mockReturnValue(createAuthMock({ isLoading: true }));
    render(<ProtectedRoute fallback={<div>Custom Loading</div>}><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue(createAuthMock({ 
      isAuthenticated: true, 
      user: { id: '1', email: 'test@test.com' } 
    }));
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when not authenticated', () => {
    mockUseAuth.mockReturnValue(createAuthMock());
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(window.location.href).toBe('/login');
    expect(sessionStorage.getItem('returnUrl')).toBe('/current');
  });

  it('should redirect to custom URL', () => {
    mockUseAuth.mockReturnValue(createAuthMock());
    render(<ProtectedRoute redirectTo="/custom-login"><div>Protected Content</div></ProtectedRoute>);
    expect(window.location.href).toBe('/custom-login');
  });
});

describe('useRequireAuth', () => {
  function TestComponent() {
    const { isReady, userId } = useRequireAuth();
    return (
      <div>
        <span data-testid="ready">{isReady ? 'yes' : 'no'}</span>
        <span data-testid="userId">{userId ?? 'none'}</span>
      </div>
    );
  }

  it('should return not ready when loading', () => {
    mockUseAuth.mockReturnValue(createAuthMock({ isLoading: true }));
    render(<TestComponent />);
    expect(screen.getByTestId('ready')).toHaveTextContent('no');
  });

  it('should return ready and userId when authenticated', () => {
    mockUseAuth.mockReturnValue(createAuthMock({ 
      isAuthenticated: true, 
      user: { id: 'user-123', email: 'test@test.com' } 
    }));
    render(<TestComponent />);
    expect(screen.getByTestId('ready')).toHaveTextContent('yes');
    expect(screen.getByTestId('userId')).toHaveTextContent('user-123');
  });

  it('should return null userId when not authenticated', () => {
    mockUseAuth.mockReturnValue(createAuthMock());
    render(<TestComponent />);
    expect(screen.getByTestId('userId')).toHaveTextContent('none');
  });
});
