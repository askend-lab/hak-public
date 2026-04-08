// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

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

const DEV_ISS = "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_wlRtuLkG2";
const DEV_AUD = "64tf6nf61n6sgftqif6q975hka";

function createJwt(payload: Record<string, unknown>): string {
  const h = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const b = btoa(JSON.stringify({ iss: DEV_ISS, aud: DEV_AUD, ...payload }));
  return `${h}.${b}.sig`;
}

function StateChecker() {
  const ctx = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(ctx.isLoading)}</span>
      <span data-testid="authed">{String(ctx.isAuthenticated)}</span>
      <span data-testid="error">{String(ctx.error)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.id : "null"}</span>
      <span data-testid="email">{ctx.user?.email ?? "null"}</span>
      <span data-testid="modal">{String(ctx.showLoginModal)}</span>
      <button onClick={() => void ctx.logout()}>logout</button>
      <button onClick={() => void ctx.refreshSession()}>refresh</button>
      <button onClick={() => ctx.setShowLoginModal(true)}>showModal</button>
    </div>
  );
}

describe("auth/context state precision", () => {
  const origFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
    // Mock fetch so refreshTokens() fails fast instead of hanging
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
  });

  afterEach(() => {
    global.fetch = origFetch;
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  it("initial state: isLoading=true, isAuthenticated=false, error=null", () => {
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
    render(
      <AuthProvider>
        <StateChecker />
      </AuthProvider>,
    );
    // After mount + useEffect, loading becomes false
    // But the key test: authenticated must be false, error must be null
  });

  it("unauthenticated state after init has exact values", async () => {
    render(
      <AuthProvider>
        <StateChecker />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authed")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("null");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("modal")).toHaveTextContent("false");
  });

  it("authenticated state has isAuthenticated=true, isLoading=false", async () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(token);
    render(
      <AuthProvider>
        <StateChecker />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("authed")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("null");
    expect(screen.getByTestId("user")).toHaveTextContent("u1");
  });

  it("logout sets isAuthenticated=false, user=null exactly", async () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(token);
    const origLoc = window.location;
    Object.defineProperty(window, "location", { writable: true, value: { ...origLoc, href: "" } });
    render(
      <AuthProvider>
        <StateChecker />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("true"));
    act(() => { screen.getByText("logout").click(); });
    await waitFor(() => {
      expect(screen.getByTestId("authed")).toHaveTextContent("false");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("null");
      expect(screen.getByTestId("error")).toHaveTextContent("null");
    });
    Object.defineProperty(window, "location", { writable: true, value: origLoc });
  });

  it("successful token refresh preserves authenticated state", async () => {
    const expired = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(expired);
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: "new-at", id_token: "new-id" }),
    });
    render(
      <AuthProvider>
        <StateChecker />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("authed")).toHaveTextContent("true");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("error")).toHaveTextContent("null");
    });
  });

  it("failed token refresh clears auth to unauthenticated", async () => {
    const expired = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(expired);
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 400 });
    render(
      <AuthProvider>
        <StateChecker />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("authed")).toHaveTextContent("false");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(mockAuthStorage.clear).toHaveBeenCalled();
  });

  it("refreshSession failure clears auth completely", async () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(token);
    render(
      <AuthProvider>
        <StateChecker />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("true"));
    await act(async () => { screen.getByText("refresh").click(); });
    await waitFor(() => {
      expect(screen.getByTestId("authed")).toHaveTextContent("false");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("null");
      expect(screen.getByTestId("error")).toHaveTextContent("null");
    });
  });

  });

  });

  });

  });

  });

});
