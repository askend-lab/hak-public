// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { logger } from "@hak/shared";
import { AuthStorage } from "./storage";
import {
  getLoginUrl,
  getLogoutUrl,
  getTaraLoginUrl,
  exchangeCodeForTokens,
  getAuthApiUrl,
  cognitoConfig,
} from "./config";
import type { AuthContextValue, AuthState } from "./types";
import { parseIdToken, isTokenExpired } from "./token";

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

export async function refreshTokens(): Promise<boolean> {
  try {
    // Refresh token is in httpOnly cookie — backend reads it automatically
    const response = await fetch(
      `${getAuthApiUrl()}/tara/refresh`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    AuthStorage.setAccessToken(data.access_token);
    if (data.id_token) {
      AuthStorage.setIdToken(data.id_token);
    }
    return true;
  } catch (error) {
    logger.warn("Token refresh failed:", error);
    return false;
  }
}

function storeTokensAndSetAuth(
  tokens: { accessToken: string; idToken: string },
  setState: React.Dispatch<React.SetStateAction<AuthState>>,
): boolean {
  const tokenOptions: Parameters<typeof parseIdToken>[1] = {};
  if (cognitoConfig.region && cognitoConfig.userPoolId) {
    tokenOptions.expectedIssuer =
      `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`;
  }
  if (cognitoConfig.clientId) {
    tokenOptions.expectedAudience = cognitoConfig.clientId;
  }
  const user = parseIdToken(tokens.idToken, tokenOptions);
  if (user) {
    AuthStorage.setUser(user);
    AuthStorage.setAccessToken(tokens.accessToken);
    AuthStorage.setIdToken(tokens.idToken);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    return true;
  }
  return false;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function initAuth() {
      const storedUser = AuthStorage.getUser();
      const accessToken = AuthStorage.getAccessToken();

      if (storedUser && accessToken) {
        // Same session — tokens are in memory, check expiry
        const needsRefresh = isTokenExpired(accessToken);
        const canContinue = !needsRefresh || await refreshTokens();

        if (canContinue) {
          setState({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          AuthStorage.clear();
          setState({ ...initialState, isLoading: false });
        }
      } else if (storedUser) {
        // Page refresh — access/id tokens are gone (in-memory only),
        // refresh token is in httpOnly cookie — try to re-obtain tokens
        const refreshed = await refreshTokens();

        if (refreshed) {
          setState({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          AuthStorage.clear();
          setState({ ...initialState, isLoading: false });
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

  const loginWithTara = useCallback(() => {
    window.location.href = getTaraLoginUrl();
  }, []);

  const logout = useCallback(async () => {
    AuthStorage.clear();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    window.location.href = getLogoutUrl();
  }, []);

  const handleCodeCallback = useCallback(
    async (code: string): Promise<boolean> => {
      const tokens = await exchangeCodeForTokens(code);
      if (!tokens) {return false;}
      return storeTokensAndSetAuth(tokens, setState);
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      AuthStorage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const handleTaraTokens = useCallback(
    (tokens: {
      accessToken: string;
      idToken: string;
    }): boolean => {
      return storeTokensAndSetAuth(tokens, setState);
    },
    [],
  );

  const value: AuthContextValue = {
    ...state,
    login,
    loginWithTara,
    logout,
    refreshSession,
    handleCodeCallback,
    handleTaraTokens,
    showLoginModal,
    setShowLoginModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
