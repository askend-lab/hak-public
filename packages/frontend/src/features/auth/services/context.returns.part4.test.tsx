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
