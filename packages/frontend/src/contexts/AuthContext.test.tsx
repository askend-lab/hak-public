import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function TestComponent() {
  const { isAuthenticated, user } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toBeInTheDocument();
  });

  it('initially not authenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow();
    
    consoleSpy.mockRestore();
  });

  it('shows no user initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('provides setShowLoginModal function', async () => {
    function ModalTestComponent() {
      const { showLoginModal, setShowLoginModal } = useAuth();
      return (
        <div>
          <span data-testid="modal-status">{showLoginModal ? 'open' : 'closed'}</span>
          <button onClick={() => setShowLoginModal(true)}>Open</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <ModalTestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('modal-status')).toHaveTextContent('closed');
  });

  it('provides isLoading state', () => {
    function LoadingTestComponent() {
      const { isLoading } = useAuth();
      return <span data-testid="loading">{isLoading ? 'loading' : 'loaded'}</span>;
    }

    render(
      <AuthProvider>
        <LoadingTestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
