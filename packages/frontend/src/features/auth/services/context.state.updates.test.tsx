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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("handleTaraTokens sets all auth state correctly", async () => {
    const idToken = createJwt({ sub: "t1", email: "tara@test.com", exp: Math.floor(Date.now() / 1000) + 3600 });

    function TaraChecker() {
      const ctx = useAuth();
      return (
        <div>
          <span data-testid="authed">{String(ctx.isAuthenticated)}</span>
          <span data-testid="loading">{String(ctx.isLoading)}</span>
          <span data-testid="error">{String(ctx.error)}</span>
          <span data-testid="user">{ctx.user?.id ?? "null"}</span>
          <button onClick={() => ctx.handleTaraTokens({ accessToken: "at", idToken })}>go</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TaraChecker />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("false"));
    act(() => { screen.getByText("go").click(); });
    await waitFor(() => {
      expect(screen.getByTestId("authed")).toHaveTextContent("true");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("error")).toHaveTextContent("null");
      expect(screen.getByTestId("user")).toHaveTextContent("t1");
    });
    expect(mockAuthStorage.setUser).toHaveBeenCalled();
    expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("at");
  });

  });

  });

  });

  });

  });

});
