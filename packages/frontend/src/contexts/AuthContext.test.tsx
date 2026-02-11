// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function TestComponent() {
  const { isAuthenticated, user } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">
        {isAuthenticated ? "authenticated" : "not-authenticated"}
      </span>
      <span data-testid="user">{user ? user.email : "no-user"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  it("provides auth context to children", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth-status")).toBeInTheDocument();
  });

  it("initially not authenticated", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "not-authenticated",
    );
  });

  it("throws error when used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    consoleSpy.mockRestore();
  });

  it("shows no user initially", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
  });

  it("provides setShowLoginModal function", async () => {
    function ModalTestComponent() {
      const { showLoginModal, setShowLoginModal } = useAuth();
      return (
        <div>
          <span data-testid="modal-status">
            {showLoginModal ? "open" : "closed"}
          </span>
          <button onClick={() => setShowLoginModal(true)}>Open</button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <ModalTestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("modal-status")).toHaveTextContent("closed");
  });

  it("provides isLoading state", () => {
    function LoadingTestComponent() {
      const { isLoading } = useAuth();
      return (
        <span data-testid="loading">{isLoading ? "loading" : "loaded"}</span>
      );
    }

    render(
      <AuthProvider>
        <LoadingTestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });
});

describe("AuthContext login/logout", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("login throws on invalid isikukood", async () => {
    const { useState } = await import("react");
    function LoginComponent(): React.JSX.Element {
      const { login } = useAuth();
      const [err, setErr] = useState<string | null>(null);
      return (
        <div>
          <div data-testid="err">{err ?? "none"}</div>
          <button onClick={() => login("bad").catch((e: Error) => setErr(e.message))}>Login</button>
        </div>
      );
    }

    render(<AuthProvider><LoginComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("err")).toHaveTextContent("none"));
    await act(async () => { screen.getByText("Login").click(); });
    await waitFor(() => expect(screen.getByTestId("err")).toHaveTextContent("Vigane isikukood"));
  });

  it("logout removes eki_user and sets user to null", async () => {
    localStorage.setItem("eki_user", JSON.stringify({ id: "37605030299", name: "T", email: "t@t.ee" }));

    function LogoutComponent() {
      const { logout, isAuthenticated } = useAuth();
      return (
        <div>
          <div data-testid="auth">{isAuthenticated ? "yes" : "no"}</div>
          <button onClick={logout}>Logout</button>
        </div>
      );
    }

    render(<AuthProvider><LogoutComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth")).toHaveTextContent("yes"));
    act(() => screen.getByText("Logout").click());
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
    expect(localStorage.getItem("eki_user")).toBeNull();
  });

  it("restores valid user from localStorage", async () => {
    localStorage.setItem("eki_user", JSON.stringify({ id: "37605030299", name: "Toomas", email: "t@t.ee" }));

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("user")).toHaveTextContent("t@t.ee");
  });

  it("clears invalid stored user from localStorage", async () => {
    localStorage.setItem("eki_user", JSON.stringify({ id: "invalid", name: "X" }));

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated"));
    expect(localStorage.getItem("eki_user")).toBeNull();
  });

  it("clears corrupted stored user JSON", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("eki_user", "not-json");

    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated"));
    expect(localStorage.getItem("eki_user")).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("throws useAuth error with correct message", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow("useAuth must be used within an AuthProvider");
    consoleSpy.mockRestore();
  });
});
