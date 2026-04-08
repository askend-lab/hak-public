// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

describe("isTokenExpired edge cases via initAuth", () => {
  const origFetch = global.fetch;
  afterEach(() => { global.fetch = origFetch; });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("malformed 2-part token triggers refresh path", async () => {
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue("part1.part2");
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 401 });
    render(
      <AuthProvider>
        <div data-testid="t">ok</div>
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("t")).toBeInTheDocument());
    expect(mockAuthStorage.clear).toHaveBeenCalled();
  });

  it("token without exp triggers refresh path", async () => {
    const noExpToken = createJwt({ sub: "u1", email: "a@b.com" });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(noExpToken);
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 401 });
    render(
      <AuthProvider>
        <div data-testid="t">ok</div>
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("t")).toBeInTheDocument());
    expect(mockAuthStorage.clear).toHaveBeenCalled();
  });

  it("storedUser without accessToken does not authenticate", async () => {
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(null);
    function Checker() {
      const { isAuthenticated } = useAuth();
      return <span data-testid="a">{String(isAuthenticated)}</span>;
    }
    render(<AuthProvider><Checker /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("false"));
  });

  it("accessToken without storedUser does not authenticate", async () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(token);
    function Checker() {
      const { isAuthenticated } = useAuth();
      return <span data-testid="a">{String(isAuthenticated)}</span>;
    }
    render(<AuthProvider><Checker /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("false"));
  });

  it("refresh fetch calls backend /tara/refresh", async () => {
    const expired = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(expired);
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ access_token: "na" }),
    });
    render(
      <AuthProvider>
        <div data-testid="t">ok</div>
      </AuthProvider>,
    );
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(url).toContain("/tara/refresh");
  });

});
