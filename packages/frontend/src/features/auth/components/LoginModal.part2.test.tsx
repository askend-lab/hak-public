// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginModal from "./LoginModal";

import { useAuth } from "@/features/auth/services";

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(undefined),
    loginWithTara: vi.fn(),
  })),
}));

describe("LoginModal", () => {
  const mockOnClose = vi.fn();
  const mockLogin = vi.fn();
  const mockLoginWithTara = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin.mockResolvedValue(undefined),
      loginWithTara: mockLoginWithTara,
    });
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("TARA login", () => {
    it("calls loginWithTara when TARA button clicked", async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/autentimisteenuse kaudu/));

      expect(mockLoginWithTara).toHaveBeenCalled();
    });

    it("shows loading state after TARA click", async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/autentimisteenuse kaudu/));

      expect(screen.getAllByText("Suunan...").length).toBeGreaterThan(0);
    });
  });

  });

  });

  });

  });

  });

});
