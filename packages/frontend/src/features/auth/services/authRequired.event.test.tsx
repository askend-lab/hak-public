// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./context";
import { AuthRequiredError } from "@/features/synthesis/utils/synthesize";

vi.mock("./config", () => ({
  getLoginUrl: vi.fn(() => Promise.resolve("https://example.com/login")),
  getLogoutUrl: vi.fn(() => "https://example.com/logout"),
  getTaraLoginUrl: vi.fn(() => "https://example.com/tara"),
  exchangeCodeForTokens: vi.fn(),
  getAuthApiUrl: vi.fn(() => "https://example.com/auth"),
  cognitoConfig: { region: "eu-west-1", userPoolId: "pool", clientId: "client" },
}));

vi.mock("./storage", () => ({
  AuthStorage: {
    getUser: vi.fn(() => null),
    getAccessToken: vi.fn(() => null),
    getIdToken: vi.fn(() => null),
    setUser: vi.fn(),
    setAccessToken: vi.fn(),
    setIdToken: vi.fn(),
    clear: vi.fn(),
  },
}));

function TestComponent() {
  const { showLoginModal } = useAuth();
  return <div data-testid="modal">{showLoginModal ? "open" : "closed"}</div>;
}

describe("AuthRequiredError → login modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show login modal when AuthRequiredError is thrown", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("modal")).toHaveTextContent("closed"));

    // Simulate what happens when an API call throws AuthRequiredError
    try { throw new AuthRequiredError(); } catch { /* expected */ }

    await waitFor(() => expect(screen.getByTestId("modal")).toHaveTextContent("open"));
  });

  it("should show login modal when auth-required event is dispatched", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("modal")).toHaveTextContent("closed"));

    window.dispatchEvent(new CustomEvent("auth-required"));

    await waitFor(() => expect(screen.getByTestId("modal")).toHaveTextContent("open"));
  });
});
