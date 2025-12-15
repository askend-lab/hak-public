import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AuthContextValue, AuthState, LoginCredentials, User } from './types';
import { AuthStorage } from './storage';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const user = AuthStorage.getUser();
    if (user) {
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } else {
      setState({ ...initialState, isLoading: false });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      // TODO: Replace with actual Cognito auth
      const user: User = {
        id: `user_${Date.now()}`,
        email: credentials.email,
      };
      AuthStorage.setUser(user);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((s) => ({ ...s, isLoading: false, error: message }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    AuthStorage.clear();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const refreshSession = useCallback(async () => {
    // TODO: Implement token refresh with Cognito
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
