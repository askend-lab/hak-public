// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import { DataServiceTestWrapper } from "../test/dataServiceMock";

import { useAuth } from "../features/auth/services/context";

function TestWrapper({ children }: { children?: React.ReactNode }) {
  return <MemoryRouter><DataServiceTestWrapper>{children}</DataServiceTestWrapper></MemoryRouter>;
}

vi.mock("../features/auth/services/context", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    showLoginModal: false,
    setShowLoginModal: vi.fn(),
    login: vi.fn(),
    loginWithTara: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
    handleCodeCallback: vi.fn(),
    handleTaraTokens: vi.fn(),
  })),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard container", () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    expect(document.querySelector(".dashboard")).toBeTruthy();
  });

  it("renders dashboard title after loading", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText("Töölaud")).toBeTruthy());
  });

  it("shows auth prompt when not authenticated", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText(/Logi sisse/)).toBeTruthy());
  });

  it("renders metrics cards", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "t@t.com", name: "T" },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      showLoginModal: false,
      setShowLoginModal: vi.fn(),
      login: vi.fn(),
      loginWithTara: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      handleCodeCallback: vi.fn(),
      handleTaraTokens: vi.fn(),
    });
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText("Ülesanded")).toBeTruthy());
  });

  it("renders quick links section", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText("Kiirlingid")).toBeTruthy());
  });

  it("renders recent activity section", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() =>
      expect(screen.getByText("Hiljutine tegevus")).toBeTruthy(),
    );
  });

  it("shows loading spinner initially", () => {
    const { container } = render(<Dashboard />, { wrapper: TestWrapper });
    expect(container.querySelector(".loader-spinner")).toBeTruthy();
    expect(container.querySelector(".dashboard__loading")).toBeTruthy();
  });

  it("renders subtitle", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText("Rakenduse aktiivsuse ülevaade")).toBeTruthy());
  });

  it("renders metric labels", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => {
      expect(screen.getByText("Ülesanded")).toBeTruthy();
      expect(screen.getByText("Kirjed")).toBeTruthy();
    });
  });

  it("renders metric icons", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => {
      expect(screen.getAllByText("📋").length).toBeGreaterThan(0);
      expect(screen.getByText("📝")).toBeTruthy();
    });
  });

  it("renders quick link buttons", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => {
      expect(screen.getByText("Uus süntees")).toBeTruthy();
      expect(screen.getByText("Loo ülesanne")).toBeTruthy();
      expect(screen.getByText("🎤")).toBeTruthy();
    });
  });

  it("renders empty activity list", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText("Tegevust pole veel")).toBeTruthy());
  });

  it("hides auth prompt when authenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "t@t.com", name: "T" },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      showLoginModal: false,
      setShowLoginModal: vi.fn(),
      login: vi.fn(),
      loginWithTara: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      handleCodeCallback: vi.fn(),
      handleTaraTokens: vi.fn(),
    });
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText("Töölaud")).toBeTruthy());
    expect(screen.queryByText(/Logi sisse/)).toBeNull();
  });

  it("renders metric value elements", async () => {
    const { container } = render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => {
      const values = container.querySelectorAll(".dashboard__metric-value");
      expect(values.length).toBe(2);
    });
  });

  it("has correct dashboard structure classes", async () => {
    const { container } = render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => {
      expect(container.querySelector(".dashboard__header")).toBeTruthy();
      expect(container.querySelector(".dashboard__metrics")).toBeTruthy();
      expect(container.querySelector(".dashboard__sections")).toBeTruthy();
    });
  });

  it("quick link buttons trigger navigation", async () => {
    render(<Dashboard />, { wrapper: TestWrapper });
    await waitFor(() => expect(screen.getByText("Uus süntees")).toBeTruthy());
    fireEvent.click(screen.getByText("Uus süntees"));
    fireEvent.click(screen.getByText("Loo ülesanne"));
  });
});
