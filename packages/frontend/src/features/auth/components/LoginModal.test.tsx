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

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("rendering", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <LoginModal isOpen={false} onClose={mockOnClose} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when open", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Logi sisse")).toBeInTheDocument();
    });

    it("renders Google login button", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(/Jätka Google/)).toBeInTheDocument();
    });

    it("renders intro description", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(/luua ja hallata ülesandeid/)).toBeInTheDocument();
    });

    it("renders TARA button with correct classes", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      const taraBtn = screen.getByText(/autentimisteenuse kaudu/);
      expect(taraBtn.className).toContain("button--primary");
      expect(taraBtn.className).toContain("login-modal__tara-button");
    });

    it("renders Google button with correct classes", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      const googleBtn = screen.getByText(/Jätka Google/);
      expect(googleBtn.className).toContain("button--secondary");
      expect(googleBtn.className).toContain("login-modal__google-button");
    });

    it("renders divider with 'või' text", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("või")).toBeInTheDocument();
    });

    it("renders privacy text", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(/kasutustingimustega/)).toBeInTheDocument();
    });

    it("renders logo image", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      const logo = document.querySelector(".login-modal__intro-logo") as HTMLImageElement;
      expect(logo).toBeTruthy();
      expect(logo?.alt).toBe("EKI Logo");
    });

    it("buttons are not disabled initially", () => {
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);
      const taraBtn = screen.getByText(/autentimisteenuse kaudu/);
      const googleBtn = screen.getByText(/Jätka Google/);
      expect(taraBtn).not.toBeDisabled();
      expect(googleBtn).not.toBeDisabled();
    });
  });

  describe("login flow", () => {
    it("calls login when Google button clicked", async () => {
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      expect(mockLogin).toHaveBeenCalled();
    });

    it("shows loading state during login with disabled buttons", async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      // Both buttons show loading text when loading
      const loadingBtns = screen.getAllByText("Suunan...");
      expect(loadingBtns.length).toBe(2);
      loadingBtns.forEach((btn) => expect(btn).toBeDisabled());
    });

    it("shows error on login failure with alert role", async () => {
      mockLogin.mockRejectedValue(new Error("Login failed"));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      await vi.waitFor(() => {
        expect(screen.getByText("Login failed")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("shows generic error for non-Error rejection", async () => {
      mockLogin.mockRejectedValue("unknown error");
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      await vi.waitFor(() => {
        expect(
          screen.getByText("Sisselogimine ebaõnnestus"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("close handling", () => {
    it("does not close during loading", async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("handleClose", () => {
    it("does not close when loading", async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));
      // Now loading - clicking close should not call onClose
      mockOnClose.mockClear();
      // The BaseModal's onClose triggers handleClose via close button
      const closeBtn = document.querySelector(".modal__close");
      if (closeBtn) {await user.click(closeBtn);}
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("closes when not loading and clears error", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Login failed"));
      const user = userEvent.setup();
      render(<LoginModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText(/Jätka Google/));
      const { waitFor } = await import("@testing-library/react");
      await waitFor(() =>
        expect(screen.getByText(/Login failed/)).toBeInTheDocument(),
      );

      // Now close via BaseModal close button (aria-label="Sulge")
      await user.click(screen.getByRole("button", { name: /sulge/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  });

  });

  });

  });

  });

});
