// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "./Dashboard";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    showLoginModal: false,
    setShowLoginModal: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock("../services/dataService", () => ({
  DataService: {
    getInstance: vi.fn(() => ({ getUserTasks: vi.fn().mockResolvedValue([]) })),
  },
}));

import { useAuth } from "../contexts/AuthContext";

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard container", () => {
    render(<Dashboard />);
    expect(document.querySelector(".dashboard")).toBeTruthy();
  });

  it("renders dashboard title after loading", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("Töölaud")).toBeTruthy());
  });

  it("shows auth prompt when not authenticated", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText(/Logi sisse/)).toBeTruthy());
  });

  it("renders metrics cards", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "1", email: "t@t.com", name: "T" },
      isAuthenticated: true,
      isLoading: false,
      showLoginModal: false,
      setShowLoginModal: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("Ülesanded")).toBeTruthy());
  });

  it("renders quick links section", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("Kiirlingid")).toBeTruthy());
  });

  it("renders recent activity section", async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText("Hiljutine tegevus")).toBeTruthy(),
    );
  });
});
