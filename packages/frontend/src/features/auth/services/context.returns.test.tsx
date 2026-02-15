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

function createJwt(payload: Record<string, unknown>): string {
  const h = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const b = btoa(JSON.stringify(payload));
  return `${h}.${b}.sig`;
}

describe("handleCodeCallback return values", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
  });

  it("returns true on successful code exchange", async () => {
    const config = await import("./config");
    const idToken = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    (config.exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: "at", idToken,
    });
    let result: boolean | undefined;
    function Comp() {
      const { handleCodeCallback } = useAuth();
      return <button onClick={async () => { result = await handleCodeCallback("code"); }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("go")).toBeInTheDocument());
    await act(async () => { screen.getByText("go").click(); });
    expect(result).toBe(true);
  });

  it("returns false when exchangeCodeForTokens returns null", async () => {
    const config = await import("./config");
    (config.exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    let result: boolean | undefined;
    function Comp() {
      const { handleCodeCallback } = useAuth();
      return <button onClick={async () => { result = await handleCodeCallback("bad"); }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("go")).toBeInTheDocument());
    await act(async () => { screen.getByText("go").click(); });
    expect(result).toBe(false);
  });

  it("returns false when parseIdToken fails (invalid token)", async () => {
    const config = await import("./config");
    (config.exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: "at", idToken: "bad-token",
    });
    let result: boolean | undefined;
    function Comp() {
      const { handleCodeCallback } = useAuth();
      return <button onClick={async () => { result = await handleCodeCallback("c"); }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("go")).toBeInTheDocument());
    await act(async () => { screen.getByText("go").click(); });
    expect(result).toBe(false);
  });
});

describe("handleTaraTokens return values", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
  });

  it("returns true on valid TARA token", () => {
    const idToken = createJwt({ sub: "t1", email: "t@t.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    let result: boolean | undefined;
    function Comp() {
      const { handleTaraTokens } = useAuth();
      return <button onClick={() => {
        result = handleTaraTokens({ accessToken: "a", idToken });
      }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    act(() => { screen.getByText("go").click(); });
    expect(result).toBe(true);
  });

  it("returns false on invalid TARA token", () => {
    let result: boolean | undefined;
    function Comp() {
      const { handleTaraTokens } = useAuth();
      return <button onClick={() => {
        result = handleTaraTokens({ accessToken: "a", idToken: "bad" });
      }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    act(() => { screen.getByText("go").click(); });
    expect(result).toBe(false);
  });
});

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

describe("parseIdToken expiration boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
  });

  it("rejects token at exact expiration time", () => {
    const now = Math.floor(Date.now() / 1000);
    const idToken = createJwt({ sub: "u1", email: "a@b.com", exp: now });
    let result: boolean | undefined;
    function Comp() {
      const { handleTaraTokens } = useAuth();
      return <button onClick={() => {
        result = handleTaraTokens({ accessToken: "a", idToken });
      }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    act(() => { screen.getByText("go").click(); });
    expect(result).toBe(false);
  });

  it("rejects token with no email claim", () => {
    const idToken = createJwt({ sub: "u1", exp: Math.floor(Date.now() / 1000) + 3600 });
    let result: boolean | undefined;
    function Comp() {
      const { handleTaraTokens } = useAuth();
      return (
        <div>
          <button onClick={() => {
            result = handleTaraTokens({ accessToken: "a", idToken });
          }}>go</button>
        </div>
      );
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    act(() => { screen.getByText("go").click(); });
    expect(result).toBe(false);
  });
});
