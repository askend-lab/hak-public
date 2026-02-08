// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TokenPayload {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

export interface TaraTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  loginWithTara: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  handleCodeCallback: (code: string) => Promise<boolean>;
  handleTaraTokens: (tokens: TaraTokens) => boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}
