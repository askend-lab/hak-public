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
      return <button onClick={() => { void handleCodeCallback("code").then(v => { result = v; }); }}>go</button>;
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
      return <button onClick={() => { void handleCodeCallback("bad").then(v => { result = v; }); }}>go</button>;
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
      return <button onClick={() => { void handleCodeCallback("c").then(v => { result = v; }); }}>go</button>;
    }
    render(<AuthProvider><Comp /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("go")).toBeInTheDocument());
    await act(async () => { screen.getByText("go").click(); });
    expect(result).toBe(false);
  });

});
