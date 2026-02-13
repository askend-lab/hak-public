// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useAuth } from "./context";

export function TestComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    showLoginModal,
    setShowLoginModal,
  } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</div>
      <div data-testid="user">{user?.email ?? "none"}</div>
      <div data-testid="showLoginModal">{showLoginModal ? "yes" : "no"}</div>
      <button onClick={() => void login()}>Login</button>
      <button onClick={() => void logout()}>Logout</button>
      <button onClick={() => setShowLoginModal(true)}>Show Modal</button>
    </div>
  );
}

export function createMockJwt(payload: {
  exp: number;
  sub?: string;
  email?: string;
}): string {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = btoa(
    JSON.stringify({ sub: "123", email: "test@test.com", ...payload }),
  );
  return `${header}.${body}.mock-signature`;
}
