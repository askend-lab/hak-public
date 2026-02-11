// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "./context";
import { AuthStorage } from "./storage";
import { TestComponent, createMockJwt } from "./context.test-utils";

vi.mock("./storage");
vi.mock("./config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./config")>();
  return { ...actual, exchangeCodeForTokens: vi.fn().mockResolvedValue(null) };
});

const mockAuthStorage = vi.mocked(AuthStorage);

describe("Token Refresh", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue({ id: "1", email: "test@test.com" });
  });

  afterEach(() => { global.fetch = originalFetch; });

  it("should refresh token when access token is expired", async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("valid-refresh-token");
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: "new-access-token", id_token: "new-id-token", expires_in: 3600 }),
    });

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("new-access-token"); });
  });

  it("should clear auth when refresh token is invalid", async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("invalid-refresh-token");
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 400, json: () => Promise.resolve({ error: "invalid_grant" }) });

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(mockAuthStorage.clear).toHaveBeenCalled(); });
  });

  it("should clear auth when no refresh token available", async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue(null);

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(mockAuthStorage.clear).toHaveBeenCalled(); });
  });

  it("should not authenticate when no stored user", async () => {
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(screen.getByTestId("authenticated")).toHaveTextContent("no"); });
  });

  it("should send exact refresh token params", async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("my-refresh-tok");
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ access_token: "new-at", id_token: "new-id", expires_in: 3600 }),
    });

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("ready"));

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    const body = fetchCall[1].body as URLSearchParams;
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("my-refresh-tok");
    expect(fetchCall[1].method).toBe("POST");
    expect(fetchCall[1].headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });

  it("should store id_token when present in refresh response", async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("rt");
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ access_token: "new-at", id_token: "new-id-tok" }),
    });

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(mockAuthStorage.setIdToken).toHaveBeenCalledWith("new-id-tok"); });
  });

  it("should not store id_token when absent in refresh response", async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("rt");
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ access_token: "new-at" }),
    });

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(mockAuthStorage.setAccessToken).toHaveBeenCalledWith("new-at"); });
    expect(mockAuthStorage.setIdToken).not.toHaveBeenCalled();
  });

  it("should handle fetch exception during refresh", async () => {
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 100 });
    mockAuthStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthStorage.getRefreshToken.mockReturnValue("rt");
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network"));

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(mockAuthStorage.clear).toHaveBeenCalled(); });
  });

  it("should handle token without exp claim", async () => {
    const tokenWithoutExp =
      btoa(JSON.stringify({ alg: "RS256" })) + "." +
      btoa(JSON.stringify({ sub: "123", email: "test@test.com" })) + ".sig";
    mockAuthStorage.getAccessToken.mockReturnValue(tokenWithoutExp);
    mockAuthStorage.getRefreshToken.mockReturnValue("refresh-token");
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ access_token: "new-token", expires_in: 3600 }),
    });

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(screen.getByTestId("loading")).toHaveTextContent("ready"); });
  });

  it("should handle malformed token gracefully", async () => {
    mockAuthStorage.getAccessToken.mockReturnValue("invalid-token-format");
    mockAuthStorage.getRefreshToken.mockReturnValue("refresh-token");
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ access_token: "new-token", expires_in: 3600 }),
    });

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => { expect(screen.getByTestId("loading")).toHaveTextContent("ready"); });
  });
});
