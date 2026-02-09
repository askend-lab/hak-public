// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function AuthDisplayComponent() {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="user-email">{user?.email || "no-email"}</span>
      <span data-testid="user-name">{user?.name || "no-name"}</span>
    </div>
  );
}

describe("AuthContext login functionality", () => {
  it("provides isLoading state", () => {
    render(
      <AuthProvider>
        <AuthDisplayComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("initially not authenticated", () => {
    render(
      <AuthProvider>
        <AuthDisplayComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
  });

  it("initially no user email", () => {
    render(
      <AuthProvider>
        <AuthDisplayComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user-email")).toHaveTextContent("no-email");
  });

  it("initially no user name", () => {
    render(
      <AuthProvider>
        <AuthDisplayComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user-name")).toHaveTextContent("no-name");
  });

  it("renders children", () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child content</div>
      </AuthProvider>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Child content");
  });
});
