// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable max-lines */
import { vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

import { AuthProvider, useAuth } from "./context";
import { AuthStorage } from "./storage";

vi.mock("./storage");
vi.mock("./config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./config")>();
  return { ...actual, exchangeCodeForTokens: vi.fn().mockResolvedValue(null) };
});

const mockAuthStorage = vi.mocked(AuthStorage);

function TestComponent() {
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

function createMockJwt(payload: {
  exp: number;
  sub?: string;
  email?: string;
}): string {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = btoa(
    JSON.stringify({ sub: "123", email: "test@test.com", ...payload }),
  );
  const signature = "mock-signature";
  return `${header}.${body}.${signature}`;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
    mockAuthStorage.getRefreshToken.mockReturnValue(null);
  });

  it("should initialize with loading state then become ready", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
  });

  it("should restore user from storage when token is valid", async () => {
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "stored@test.com",
    });
    const validToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      expect(screen.getByTestId("user")).toHaveTextContent("stored@test.com");
    });
  });

  it("should trigger Cognito login redirect", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(window.location.href).toContain("/login");
    });

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("should logout user and clear storage", async () => {
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
    const validToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      expect(mockAuthStorage.clear).toHaveBeenCalled();
    });

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });
});

describe("useAuth", () => {
  it("should throw error when used outside AuthProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(vi.fn());

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within AuthProvider",
    );

    consoleError.mockRestore();
  });
});

describe("Token Refresh", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should refresh token when access token is expired", async () => {
    const expiredToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) - 100,
    });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("valid-refresh-token");

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new-access-token",
          id_token: "new-id-token",
          expires_in: 3600,
        }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith(
        "new-access-token",
      );
    });
  });

  it("should clear auth when refresh token is invalid", async () => {
    const expiredToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) - 100,
    });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("invalid-refresh-token");

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "invalid_grant" }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockAuthStorage.clear).toHaveBeenCalled();
    });
  });
});

describe("Additional Branch Coverage", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should clear auth when no refresh token available", async () => {
    const expiredToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) - 100,
    });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockAuthStorage.clear).toHaveBeenCalled();
    });
  });

  it("should not authenticate when no stored user", async () => {
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    });
  });
});

describe("handleCodeCallback and handleTaraTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
    mockAuthStorage.getRefreshToken.mockReturnValue(null);
  });

  it("should handle code callback with valid tokens", async () => {
    const config = await import("./config");
    const validIdToken =
      btoa(JSON.stringify({ alg: "RS256" })) +
      "." +
      btoa(
        JSON.stringify({
          sub: "user-1",
          email: "test@test.com",
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ) +
      ".sig";
    (
      config.exchangeCodeForTokens as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      accessToken: "access-tok",
      idToken: validIdToken,
      refreshToken: "refresh-tok",
    });

    function CallbackComponent() {
      const { handleCodeCallback, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={() => void handleCodeCallback("code123")}>
            Callback
          </button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <CallbackComponent />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("auth")).toHaveTextContent("no"),
    );

    await act(async () => {
      screen.getByText("Callback").click();
    });
    await waitFor(() =>
      expect(screen.getByTestId("auth")).toHaveTextContent("yes"),
    );
    expect(mockAuthStorage.setUser).toHaveBeenCalled();
    expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("access-tok");
  });

  it("should handle code callback with null tokens", async () => {
    const config = await import("./config");
    (
      config.exchangeCodeForTokens as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(null);

    function CallbackComponent() {
      const { handleCodeCallback, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={() => void handleCodeCallback("bad-code")}>
            Callback
          </button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <CallbackComponent />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("auth")).toHaveTextContent("no"),
    );
    await act(async () => {
      screen.getByText("Callback").click();
    });
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
  });

  it("should handle TARA tokens with valid id_token", async () => {
    const validIdToken =
      btoa(JSON.stringify({ alg: "RS256" })) +
      "." +
      btoa(
        JSON.stringify({
          sub: "tara-user",
          email: "tara@test.com",
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ) +
      ".sig";

    function TaraComponent() {
      const { handleTaraTokens, isAuthenticated, user } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <div data-testid="email">{user?.email ?? "none"}</div>
          <button
            onClick={() =>
              handleTaraTokens({
                accessToken: "a",
                idToken: validIdToken,
                refreshToken: "r",
              })
            }
          >
            Tara
          </button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TaraComponent />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("auth")).toHaveTextContent("no"),
    );
    act(() => {
      screen.getByText("Tara").click();
    });
    await waitFor(() =>
      expect(screen.getByTestId("auth")).toHaveTextContent("yes"),
    );
    expect(screen.getByTestId("email")).toHaveTextContent("tara@test.com");
  });

  it("should handle TARA tokens with invalid id_token", async () => {
    function TaraComponent() {
      const { handleTaraTokens, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button
            onClick={() =>
              handleTaraTokens({
                accessToken: "a",
                idToken: "invalid",
                refreshToken: "r",
              })
            }
          >
            Tara
          </button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TaraComponent />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("auth")).toHaveTextContent("no"),
    );
    act(() => {
      screen.getByText("Tara").click();
    });
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
  });

  it("should toggle showLoginModal state", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("showLoginModal")).toHaveTextContent("no"),
    );
    act(() => {
      screen.getByText("Show Modal").click();
    });
    expect(screen.getByTestId("showLoginModal")).toHaveTextContent("yes");
  });

  it("should call loginWithTara and redirect", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    function TaraLoginComponent() {
      const { loginWithTara } = useAuth();
      return <button onClick={loginWithTara}>TARA Login</button>;
    }

    render(
      <AuthProvider>
        <TaraLoginComponent />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText("TARA Login")).toBeInTheDocument(),
    );
    act(() => {
      screen.getByText("TARA Login").click();
    });
    expect(window.location.href).not.toBe("");

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("should call refreshSession and clear auth on failure", async () => {
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
    const validToken =
      btoa(JSON.stringify({ alg: "RS256" })) +
      "." +
      btoa(
        JSON.stringify({
          sub: "1",
          email: "test@test.com",
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ) +
      ".sig";
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);
    mockAuthStorage.getRefreshToken.mockReturnValue(null);

    function RefreshComponent() {
      const { refreshSession, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={() => void refreshSession()}>Refresh</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <RefreshComponent />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("auth")).toHaveTextContent("yes"),
    );
    await act(async () => {
      screen.getByText("Refresh").click();
    });
    await waitFor(() => {
      expect(mockAuthStorage.clear).toHaveBeenCalled();
      expect(screen.getByTestId("auth")).toHaveTextContent("no");
    });
  });
});

describe("Edge cases for branch coverage", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should handle token without exp claim", async () => {
    const tokenWithoutExp =
      btoa(JSON.stringify({ alg: "RS256" })) +
      "." +
      btoa(JSON.stringify({ sub: "123", email: "test@test.com" })) +
      ".sig";
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
    mockAuthStorage.getAccessToken.mockReturnValue(tokenWithoutExp);
    mockAuthStorage.getRefreshToken.mockReturnValue("refresh-token");

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: "new-token", expires_in: 3600 }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
  });

  it("should handle refresh without id_token in response", async () => {
    const expiredToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) - 100,
    });
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("valid-refresh");

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: "new-access", expires_in: 3600 }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("new-access");
    });
  });

  it("should handle malformed token gracefully", async () => {
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
    mockAuthStorage.getAccessToken.mockReturnValue("invalid-token-format");
    mockAuthStorage.getRefreshToken.mockReturnValue("refresh-token");

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ access_token: "new-token", expires_in: 3600 }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
  });
});
