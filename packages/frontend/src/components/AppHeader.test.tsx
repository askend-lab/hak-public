// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AppHeader from "./AppHeader";

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "123", name: "Test User", email: "test@test.com" },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
}));

describe("AppHeader", () => {
  const mockOnTasksClick = vi.fn();
  const mockOnHelpClick = vi.fn();
  const mockOnLoginClick = vi.fn();

  const defaultProps = {
    isAuthenticated: false, user: null,
    onTasksClick: mockOnTasksClick, onHelpClick: mockOnHelpClick, onLoginClick: mockOnLoginClick,
  };
  const renderHeader = (props = {}, initialEntries = ["/"]) => render(
    <MemoryRouter initialEntries={initialEntries}><AppHeader {...defaultProps} {...props} /></MemoryRouter>,
  );
  beforeEach(() => { vi.clearAllMocks(); });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("renders logo", () => {
      renderHeader();
      expect(screen.getByAltText("EKI Logo")).toBeInTheDocument();
    });
    it("renders all navigation links", () => {
      renderHeader();
      expect(screen.getByText("Tekst kõneks")).toBeInTheDocument();
      expect(screen.getByText("Ülesanded")).toBeInTheDocument();
    });
    it("renders help button when authenticated", () => {
      renderHeader({ isAuthenticated: true, user: { id: "123", name: "Test User", email: "test@test.com" } });
      expect(screen.getByTitle("Näita juhendeid")).toBeInTheDocument();
    });
    it("does not render help button when not authenticated", () => {
      renderHeader();
      expect(screen.queryByTitle("Näita juhendeid")).not.toBeInTheDocument();
    });
    it("renders login button when not authenticated", () => {
      renderHeader();
      expect(screen.getByText("Logi sisse")).toBeInTheDocument();
    });
    it("renders user profile when authenticated", () => {
      renderHeader({ isAuthenticated: true, user: { id: "123", name: "Test User", email: "test@test.com" } });
      expect(screen.queryByText("Logi sisse")).not.toBeInTheDocument();
    });
  });

  describe("navigation links", () => {
    it("Tekst kõneks link navigates to /synthesis", () => {
      renderHeader();
      expect(screen.getByText("Tekst kõneks")).toHaveAttribute("href", "/synthesis");
    });
    it("Ülesanded link navigates to /tasks", () => {
      renderHeader();
      expect(screen.getByText("Ülesanded")).toHaveAttribute("href", "/tasks");
    });
  });

  describe("active state", () => {
    it("marks synthesis link as active on /synthesis", () => {
      renderHeader({}, ["/synthesis"]);
      expect(screen.getByText("Tekst kõneks")).toHaveClass("active");
    });
    it("marks tasks link as active on /tasks", () => {
      renderHeader({}, ["/tasks"]);
      expect(screen.getByText("Ülesanded")).toHaveClass("active");
    });
    it("marks tasks link as active on /tasks/:id", () => {
      renderHeader({}, ["/tasks/123"]);
      expect(screen.getByText("Ülesanded")).toHaveClass("active");
    });
  });

  describe("authentication-gated navigation", () => {
    it("calls onTasksClick when clicking tasks link while not authenticated", async () => {
      const user = userEvent.setup();
      renderHeader();
      await user.click(screen.getByText("Ülesanded"));
      expect(mockOnTasksClick).toHaveBeenCalled();
    });
    it("allows navigation to tasks when authenticated", async () => {
      const user = userEvent.setup();
      renderHeader({ isAuthenticated: true, user: { id: "123", name: "Test User", email: "test@test.com" } });
      await user.click(screen.getByText("Ülesanded"));
      expect(mockOnTasksClick).not.toHaveBeenCalled();
    });
  });

  });

  });

  });

  });

  });

});
