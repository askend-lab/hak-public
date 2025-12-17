import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';
import type { AuthContextValue, AuthState, User } from './types';
import { cognitoConfig } from './config';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.userPoolWebClientId,
      loginWith: {
        oauth: {
          domain: 'askend-lab-auth.auth.eu-west-1.amazoncognito.com',
          scopes: ['email', 'openid'],
          redirectSignIn: ['http://localhost:5180'],
          redirectSignOut: ['http://localhost:5180'],
          responseType: 'code',
        }
      }
    }
  }
});

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
    const checkUser = async () => {
      try {
        const { userId, username } = await getCurrentUser();
        const user: User = {
          id: userId,
          email: username,
        };
        setState({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch (error) {
        setState({ ...initialState, isLoading: false });
      }
    };

    checkUser();
  }, []);

  const login = useCallback(async () => {
    try {
      await signInWithRedirect();
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
      setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch (error) {
      console.error('Error during sign out:', error);
    }
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
