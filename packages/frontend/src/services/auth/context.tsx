import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AuthContextValue, AuthState, User } from './types';
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
    const storedUser = AuthStorage.getUser();
    if (storedUser) {
      setState({ user: storedUser, isAuthenticated: true, isLoading: false, error: null });
    } else {
      setState({ ...initialState, isLoading: false });
    }
  }, []);

  const login = useCallback(async (credentials?: { email: string; password: string }) => {
    const user: User = {
      id: credentials?.email || 'test-user',
      email: credentials?.email || 'test@example.com',
    };
    AuthStorage.setUser(user);
    setState({ user, isAuthenticated: true, isLoading: false, error: null });
  }, []);

  const logout = useCallback(async () => {
    AuthStorage.clear();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const refreshSession = useCallback(async () => {}, []);

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
