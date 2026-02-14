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

describe("isTokenExpired with 2-part valid-payload token", () => {
  const origFetch = global.fetch;
  afterEach(() => { global.fetch = origFetch; });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("2-part token with valid payload still triggers refresh (parts.length check)", async () => {
    // Create a 2-part token where payload has valid future exp
    const h = btoa(JSON.stringify({ alg: "RS256" }));
    const b = btoa(JSON.stringify({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 9999 }));
    const twoPartToken = `${h}.${b}`; // Missing signature part

    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(twoPartToken);
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 401 });

    function Checker() {
      const { isAuthenticated } = useAuth();
      return <span data-testid="a">{String(isAuthenticated)}</span>;
    }
    render(<AuthProvider><Checker /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("false"));
    // With original: parts.length !== 3 → true (expired) → refresh fails → clear → not authenticated
    // With mutant (false): skips check → parses valid payload → not expired → authenticated
    expect(mockAuthStorage.clear).toHaveBeenCalled();
  });
});

describe("refreshSession with successful refresh", () => {
  const origFetch = global.fetch;
  afterEach(() => { global.fetch = origFetch; });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refreshSession does NOT clear auth when refresh succeeds", async () => {
    const token = createJwt({ sub: "u1", email: "a@b.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(token);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "new-at" }),
    });

    function RefreshChecker() {
      const { refreshSession, isAuthenticated } = useAuth();
      return (
        <div>
          <span data-testid="a">{String(isAuthenticated)}</span>
          <button onClick={() => void refreshSession()}>refresh</button>
        </div>
      );
    }

    render(<AuthProvider><RefreshChecker /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("true"));

    // Reset clear mock to check only refresh-triggered calls
    mockAuthStorage.clear.mockClear();

    await act(async () => { screen.getByText("refresh").click(); });

    // refreshSession should NOT have cleared auth since refresh succeeded
    expect(mockAuthStorage.clear).not.toHaveBeenCalled();
    expect(screen.getByTestId("a")).toHaveTextContent("true");
  });
});

describe("parseIdToken and isTokenExpired catch blocks", () => {
  const origFetch = global.fetch;
  afterEach(() => { global.fetch = origFetch; });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
  });

  it("parseIdToken catch: 3-part token with invalid base64 payload returns null", () => {
    // 3 parts so it passes length check, but payload is invalid base64 → atob throws → catch → null
    const badToken = "header.!!!invalid!!!.signature";
    let result: boolean | undefined;
    function Comp() {
      const { handleTaraTokens } = useAuth();
      return <button onClick={() => {
        result = handleTaraTokens({ accessToken: "a", idToken: badToken });
      }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    act(() => { screen.getByText("go").click(); });
    expect(result).toBe(false);
  });

  it("isTokenExpired catch: 3-part token with invalid base64 triggers refresh", async () => {
    // 3-part token with invalid base64 → isTokenExpired catch → return true → refresh path
    const badToken = "header.!!!invalid!!!.signature";
    mockAuthStorage.getUser.mockReturnValue({ id: "u1", email: "a@b.com" });
    mockAuthStorage.getAccessToken.mockReturnValue(badToken);
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 401 });
    function Checker() {
      const { isAuthenticated } = useAuth();
      return <span data-testid="a">{String(isAuthenticated)}</span>;
    }
    render(<AuthProvider><Checker /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("false"));
    expect(mockAuthStorage.clear).toHaveBeenCalled();
  });
});

describe("parseIdToken exp boundary precision", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
  });

  it("token expiring in 1 second is still accepted (> not >=)", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 1;
    const idToken = createJwt({ sub: "u1", email: "a@b.com", exp: futureExp });
    let result: boolean | undefined;
    function Comp() {
      const { handleTaraTokens } = useAuth();
      return <button onClick={() => {
        result = handleTaraTokens({ accessToken: "a", idToken });
      }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    act(() => { screen.getByText("go").click(); });
    // exp is in the future, so Date.now()/1000 > exp is false → token valid
    expect(result).toBe(true);
  });
});
