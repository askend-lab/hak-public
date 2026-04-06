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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("button interactions", () => {
    it("calls onHelpClick when help button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} isAuthenticated={true} user={{ id: "123", name: "Test User", email: "test@test.com" }} />
        </MemoryRouter>,
      );

      await user.click(screen.getByTitle("Näita juhendeid"));
      expect(mockOnHelpClick).toHaveBeenCalled();
    });

    it("calls onLoginClick when login button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AppHeader {...defaultProps} />
        </MemoryRouter>,
      );

      await user.click(screen.getByText("Logi sisse"));
      expect(mockOnLoginClick).toHaveBeenCalled();
    });
  });

  });

  });

  });

  });

  });

});
