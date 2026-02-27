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
    isAuthenticated: false,
    user: null,
    onTasksClick: mockOnTasksClick,
    onHelpClick: mockOnHelpClick,
    onLoginClick: mockOnLoginClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("renders logo", () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      expect(screen.getByAltText("EKI Logo")).toBeInTheDocument();
    });

    it("renders all navigation links", () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      expect(screen.getByText("Tekst kõneks")).toBeInTheDocument();
      expect(screen.getByText("Ülesanded")).toBeInTheDocument();
    });

    it("renders help button", () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      expect(screen.getByTitle("Näita juhendeid")).toBeInTheDocument();
    });

    it("renders login button when not authenticated", () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      expect(screen.getByText("Logi sisse")).toBeInTheDocument();
    });

    it("renders user profile when authenticated", () => {
      render(
        <MemoryRouter>
          <AppHeader
            {...defaultProps}
            isAuthenticated={true}
            user={{ id: "123", name: "Test User", email: "test@test.com" }}
          />
        </MemoryRouter>,
      );
      expect(screen.queryByText("Logi sisse")).not.toBeInTheDocument();
    });
  });

  describe("navigation links", () => {
    it("Tekst kõneks link navigates to /synthesis", () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      const link = screen.getByText("Tekst kõneks");
      expect(link).toHaveAttribute("href", "/synthesis");
    });

    it("Ülesanded link navigates to /tasks", () => {
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      const link = screen.getByText("Ülesanded");
      expect(link).toHaveAttribute("href", "/tasks");
    });
  });

  describe("active state", () => {
    it("marks synthesis link as active on /synthesis", () => {
      render(
        <MemoryRouter initialEntries={["/synthesis"]}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      const link = screen.getByText("Tekst kõneks");
      expect(link).toHaveClass("active");
    });

    it("marks tasks link as active on /tasks", () => {
      render(
        <MemoryRouter initialEntries={["/tasks"]}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      const link = screen.getByText("Ülesanded");
      expect(link).toHaveClass("active");
    });

    it("marks tasks link as active on /tasks/:id", () => {
      render(
        <MemoryRouter initialEntries={["/tasks/123"]}>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );
      const link = screen.getByText("Ülesanded");
      expect(link).toHaveClass("active");
    });
  });

  describe("authentication-gated navigation", () => {
    it("calls onTasksClick when clicking tasks link while not authenticated", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );

      await user.click(screen.getByText("Ülesanded"));
      expect(mockOnTasksClick).toHaveBeenCalled();
    });

    it("allows navigation to tasks when authenticated", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader
            {...defaultProps}
            isAuthenticated={true}
            user={{ id: "123", name: "Test User", email: "test@test.com" }}
          />
        </MemoryRouter>,
      );

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
