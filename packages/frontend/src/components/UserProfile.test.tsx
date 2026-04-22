// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserProfile from "./UserProfile";

import { useAuth } from "@/features/auth/services";

vi.mock("@/features/auth/services", () => ({
  useAuth: vi.fn(() => ({
    logout: vi.fn(),
  })),
}));

describe("UserProfile", () => {
  const mockUser = {
    id: "user-123",
    name: "Margus Tamm",
    email: "margus@test.ee",
  };
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      logout: mockLogout,
    });
  });

  describe("rendering", () => {
    it("renders user avatar with initials", () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText("MT")).toBeInTheDocument();
    });

    it("renders user name", () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText("Margus Tamm")).toBeInTheDocument();
    });

    it("dropdown is closed by default", () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.queryByText("Logi välja")).not.toBeInTheDocument();
    });
  });

  describe("dropdown interaction", () => {
    it("opens dropdown when button clicked", async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("Logi välja")).toBeInTheDocument();
    });

    it("shows user details in dropdown", async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("margus@test.ee")).toBeInTheDocument();
    });

    it("closes dropdown when backdrop clicked", async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole("button"));
      expect(screen.getByText("Logi välja")).toBeInTheDocument();

      const backdrop = document.querySelector(".user-profile__backdrop");
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(screen.queryByText("Logi välja")).not.toBeInTheDocument();
    });

    it("closes dropdown on Escape key and returns focus to trigger", async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);
      const trigger = screen.getByRole("button");
      await user.click(trigger);
      expect(screen.getByText("Logi välja")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByText("Logi välja")).not.toBeInTheDocument();
      expect(document.activeElement).toBe(trigger);
    });

    it("traps focus within dropdown on Tab", async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);
      await user.click(screen.getByRole("button"));
      const logoutBtn = screen.getByText("Logi välja");
      logoutBtn.focus();
      fireEvent.keyDown(document, { key: "Tab" });
      expect(document.activeElement).toBe(logoutBtn);
    });

    it("traps focus within dropdown on Shift+Tab", async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);
      await user.click(screen.getByRole("button"));
      const logoutBtn = screen.getByText("Logi välja");
      logoutBtn.focus();
      fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(logoutBtn);
    });
  });

  describe("logout", () => {
    it("calls logout when logout button clicked", async () => {
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByText("Logi välja"));

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("avatar initials", () => {
    it("handles single name", () => {
      render(<UserProfile user={{ ...mockUser, name: "Margus" }} />);
      expect(screen.getByText("M")).toBeInTheDocument();
    });

    it("handles multiple names", () => {
      render(<UserProfile user={{ ...mockUser, name: "Margus Erik Tamm" }} />);
      expect(screen.getByText("MET")).toBeInTheDocument();
    });

    it("handles user without name", () => {
      render(
        <UserProfile user={{ id: "user-456", email: "test@example.com" }} />,
      );
      expect(screen.getByText("T")).toBeInTheDocument();
    });
  });
});
