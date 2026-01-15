 
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import { AuthStorage } from './storage';
import { getLoginUrl, getLogoutUrl, cognitoConfig } from './config';
import type { AuthContextValue, AuthState, User } from './types';

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

function isTokenExpired(token: string, bufferSeconds = 300): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return true;
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() / 1000 > exp - bufferSeconds;
  } catch {
    return true;
  }
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = AuthStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: cognitoConfig.clientId,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    AuthStorage.setAccessToken(data.access_token);
    if (data.id_token) {
      AuthStorage.setIdToken(data.id_token);
    }
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function initAuth() {
      const storedUser = AuthStorage.getUser();
      const accessToken = AuthStorage.getAccessToken();
      
      if (storedUser && accessToken) {
        if (isTokenExpired(accessToken)) {
          const refreshed = await refreshTokens();
          if (refreshed) {
            setState({ user: storedUser, isAuthenticated: true, isLoading: false, error: null });
          } else {
            AuthStorage.clear();
            setState({ ...initialState, isLoading: false });
          }
        } else {
          setState({ user: storedUser, isAuthenticated: true, isLoading: false, error: null });
        }
      } else {
        setState({ ...initialState, isLoading: false });
      }
    }
    void initAuth();
  }, []);

  const login = useCallback(async () => {
    window.location.href = await getLoginUrl();
  }, []);

  const logout = useCallback(async () => {
    AuthStorage.clear();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
    window.location.href = getLogoutUrl();
  }, []);

  const handleCodeCallback = useCallback(async (code: string): Promise<boolean> => {
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (!codeVerifier) return false;

    try {
      const response = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: cognitoConfig.clientId,
          code,
          redirect_uri: cognitoConfig.redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      sessionStorage.removeItem('pkce_code_verifier');

      const user = parseIdToken(data.id_token);
      if (user) {
        AuthStorage.setUser(user);
        AuthStorage.setAccessToken(data.access_token);
        AuthStorage.setIdToken(data.id_token);
        AuthStorage.setRefreshToken(data.refresh_token);
        setState({ user, isAuthenticated: true, isLoading: false, error: null });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      AuthStorage.clear();
      setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshSession,
    handleCodeCallback,
    showLoginModal,
    setShowLoginModal,
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
