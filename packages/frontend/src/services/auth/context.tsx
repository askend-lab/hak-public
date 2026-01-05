import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import { AuthStorage } from './storage';
import { getLoginUrl, getLogoutUrl } from './config';

import type { AuthContextValue, AuthState, User, TokenPayload } from './types';

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

function parseIdToken(idToken: string): User | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email?.split('@')[0],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const storedUser = AuthStorage.getUser();
    const accessToken = AuthStorage.getAccessToken();
    if (storedUser && accessToken) {
      setState({ user: storedUser, isAuthenticated: true, isLoading: false, error: null });
    } else {
      setState({ ...initialState, isLoading: false });
    }
  }, []);

  const login = useCallback(() => {
    window.location.href = getLoginUrl();
    return Promise.resolve();
  }, []);

  const logout = useCallback(() => {
    AuthStorage.clear();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
    window.location.href = getLogoutUrl();
    return Promise.resolve();
  }, []);

  const handleCallback = useCallback((tokens: TokenPayload) => {
    const user = parseIdToken(tokens.idToken);
    if (user) {
      AuthStorage.setUser(user);
      AuthStorage.setAccessToken(tokens.accessToken);
      AuthStorage.setIdToken(tokens.idToken);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    }
  }, []);

  const refreshSession = useCallback(() => Promise.resolve(), []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshSession,
    handleCallback,
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
