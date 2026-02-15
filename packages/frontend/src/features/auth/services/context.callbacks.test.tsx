// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./context";
import { AuthStorage } from "./storage";
import { TestComponent } from "./context.test-utils";

vi.mock("./storage");
vi.mock("./config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./config")>();
  return {
    ...actual,
    getTaraLoginUrl: () => "https://example.com/auth/tara/start",
    exchangeCodeForTokens: vi.fn().mockResolvedValue(null),
  };
});

const mockAuthStorage = vi.mocked(AuthStorage);

describe("handleCodeCallback and handleTaraTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
    // Mock fetch so refreshTokens() fails fast instead of hanging
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
  });

  it("should handle code callback with valid tokens", async () => {
    const config = await import("./config");
    const validIdToken =
      btoa(JSON.stringify({ alg: "RS256" })) + "." +
      btoa(JSON.stringify({ sub: "user-1", email: "test@test.com", exp: Math.floor(Date.now() / 1000) + 3600 })) +
      ".sig";
    (config.exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: "access-tok", idToken: validIdToken,
    });

    function CallbackComponent() {
      const { handleCodeCallback, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={() => void handleCodeCallback("code123")}>Callback</button>
        </div>
      );
    }

    render(<AuthProvider><CallbackComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("no"));
    await act(async () => { screen.getByText("Callback").click(); });
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));
    expect(mockAuthStorage.setUser).toHaveBeenCalled();
    expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("access-tok");
  });

  it("should handle code callback with null tokens", async () => {
    const config = await import("./config");
    (config.exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    function CallbackComponent() {
      const { handleCodeCallback, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={() => void handleCodeCallback("bad-code")}>Callback</button>
        </div>
      );
    }

    render(<AuthProvider><CallbackComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("no"));
    await act(async () => { screen.getByText("Callback").click(); });
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
  });

  it("should handle TARA tokens with valid id_token", async () => {
    const validIdToken =
      btoa(JSON.stringify({ alg: "RS256" })) + "." +
      btoa(JSON.stringify({ sub: "tara-user", email: "tara@test.com", exp: Math.floor(Date.now() / 1000) + 3600 })) +
      ".sig";

    function TaraComponent() {
      const { handleTaraTokens, isAuthenticated, user } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <div data-testid="email">{user?.email ?? "none"}</div>
          <button onClick={() => handleTaraTokens({ accessToken: "a", idToken: validIdToken })}>Tara</button>
        </div>
      );
    }

    render(<AuthProvider><TaraComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("no"));
    act(() => { screen.getByText("Tara").click(); });
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));
    expect(screen.getByTestId("email")).toHaveTextContent("tara@test.com");
  });

  it("should handle TARA tokens with invalid id_token", async () => {
    function TaraComponent() {
      const { handleTaraTokens, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={() => handleTaraTokens({ accessToken: "a", idToken: "invalid" })}>Tara</button>
        </div>
      );
    }

    render(<AuthProvider><TaraComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("no"));
    act(() => { screen.getByText("Tara").click(); });
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
  });

  it("should toggle showLoginModal state", async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("showLoginModal")).toHaveTextContent("no"));
    act(() => { screen.getByText("Show Modal").click(); });
    expect(screen.getByTestId("showLoginModal")).toHaveTextContent("yes");
  });

  it("should call loginWithTara and redirect", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", { writable: true, value: { ...originalLocation, href: "" } });

    function TaraLoginComponent() {
      const { loginWithTara } = useAuth();
      return <button onClick={loginWithTara}>TARA Login</button>;
    }

    render(<AuthProvider><TaraLoginComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("TARA Login")).toBeInTheDocument());
    act(() => { screen.getByText("TARA Login").click(); });
    expect(window.location.href).not.toBe("");
    Object.defineProperty(window, "location", { writable: true, value: originalLocation });
  });

  it("should call refreshSession and clear auth on failure", async () => {
    mockAuthStorage.getUser.mockReturnValue({ id: "1", email: "test@test.com" });
    const validToken =
      btoa(JSON.stringify({ alg: "RS256" })) + "." +
      btoa(JSON.stringify({ sub: "1", email: "test@test.com", exp: Math.floor(Date.now() / 1000) + 3600 })) +
      ".sig";
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);
    function RefreshComponent() {
      const { refreshSession, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={() => void refreshSession()}>Refresh</button>
        </div>
      );
    }

    render(<AuthProvider><RefreshComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));
    await act(async () => { screen.getByText("Refresh").click(); });
    await waitFor(() => {
      expect(mockAuthStorage.clear).toHaveBeenCalled();
      expect(screen.getByTestId("auth")).toHaveTextContent("no");
    });
  });

  it("should store all tokens on handleCodeCallback", async () => {
    const config = await import("./config");
    const validIdToken =
      btoa(JSON.stringify({ alg: "RS256" })) + "." +
      btoa(JSON.stringify({ sub: "u1", email: "test@test.com", exp: Math.floor(Date.now() / 1000) + 3600 })) +
      ".sig";
    (config.exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: "at-1", idToken: validIdToken,
    });

    function CbComponent() {
      const { handleCodeCallback } = useAuth();
      return <button onClick={() => void handleCodeCallback("c")}>Go</button>;
    }

    render(<AuthProvider><CbComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("Go")).toBeInTheDocument());
    await act(async () => screen.getByText("Go").click());
    expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("at-1");
    expect(mockAuthStorage.setIdToken).toHaveBeenCalledWith(validIdToken);
  });

  it("should store all tokens on handleTaraTokens", async () => {
    const validIdToken =
      btoa(JSON.stringify({ alg: "RS256" })) + "." +
      btoa(JSON.stringify({ sub: "t1", email: "tara@test.com", exp: Math.floor(Date.now() / 1000) + 3600 })) +
      ".sig";

    function TComponent() {
      const { handleTaraTokens } = useAuth();
      return (
        <button onClick={() => handleTaraTokens({ accessToken: "ta-1", idToken: validIdToken })}>Go</button>
      );
    }

    render(<AuthProvider><TComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("Go")).toBeInTheDocument());
    act(() => screen.getByText("Go").click());
    expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("ta-1");
    expect(mockAuthStorage.setIdToken).toHaveBeenCalledWith(validIdToken);
  });
});
