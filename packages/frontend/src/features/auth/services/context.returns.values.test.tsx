// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
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
