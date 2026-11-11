// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi } from "vitest";
import { logger } from "@hak/shared";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider } from "./context";
import { AuthStorage } from "./storage";
import { TestComponent, createMockJwt } from "./context.test-utils";

vi.mock("./storage");
vi.mock("./config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./config")>();
  return { ...actual, exchangeCodeForTokens: vi.fn().mockResolvedValue(null) };
});

const mockAuthStorage = vi.mocked(AuthStorage);

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStorage.getUser.mockReturnValue(null);
    mockAuthStorage.getAccessToken.mockReturnValue(null);
  });

  it("should initialize with loading state then become ready", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
  });

  it("should restore user from storage when token is valid", async () => {
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "stored@test.com",
    });
    const validToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
      expect(screen.getByTestId("user")).toHaveTextContent("stored@test.com");
    });
  });

  it("should trigger Cognito login redirect", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    await act(async () => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(window.location.href).toContain("/oauth2/authorize");
    });

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("should logout user and clear storage", async () => {
    mockAuthStorage.getUser.mockReturnValue({
      id: "1",
      email: "test@test.com",
    });
    const validToken = createMockJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    mockAuthStorage.getAccessToken.mockReturnValue(validToken);

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      expect(mockAuthStorage.clear).toHaveBeenCalled();
    });

    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });
});

describe("useAuth", () => {
  it("should throw error when used outside AuthProvider", () => {
    const consoleError = vi.spyOn(logger, "error").mockImplementation(vi.fn());

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within AuthProvider",
    );

    consoleError.mockRestore();
  });
});
