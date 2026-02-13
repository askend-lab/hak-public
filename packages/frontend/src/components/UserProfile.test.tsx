// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserProfile from "./UserProfile";

vi.mock("@/services/auth", () => ({
  useAuth: vi.fn(() => ({
    logout: vi.fn(),
  })),
}));

import { useAuth } from "@/services/auth";

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

    it("renders user id", () => {
      render(<UserProfile user={mockUser} />);
      expect(screen.getByText("user-123")).toBeInTheDocument();
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
      expect(screen.getByText("ID: user-123")).toBeInTheDocument();
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

    it("closes dropdown on Escape key on backdrop", async () => {
      const user = userEvent.setup();
      const { container } = render(<UserProfile user={mockUser} />);
      await user.click(screen.getByRole("button"));
      expect(screen.getByText("Logi välja")).toBeInTheDocument();
      const backdrop = container.querySelector(".user-profile__backdrop");
      if (backdrop) {
        const { fireEvent } = await import("@testing-library/react");
        fireEvent.keyDown(backdrop, { key: "Escape" });
      }
      expect(screen.queryByText("Logi välja")).not.toBeInTheDocument();
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
