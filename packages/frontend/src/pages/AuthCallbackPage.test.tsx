// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));

const mockHandleCodeCallback = vi.fn();
const mockHandleTaraTokens = vi.fn();
vi.mock("../services/auth", () => ({
  useAuth: () => ({
    handleCodeCallback: mockHandleCodeCallback,
    handleTaraTokens: mockHandleTaraTokens,
  }),
}));

import { AuthCallbackPage } from "./AuthCallbackPage";

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { search: "", hash: "" },
      writable: true,
    });
  });

  it("redirects to home when code callback succeeds", async () => {
    window.location.search = "?code=test-auth-code";
    mockHandleCodeCallback.mockResolvedValue(true);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockHandleCodeCallback).toHaveBeenCalledWith("test-auth-code");
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows error when code callback fails with exact text", async () => {
    window.location.search = "?code=invalid-code";
    mockHandleCodeCallback.mockResolvedValue(false);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Sisselogimine ebaõnnestus/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Autentimise viga/)).toBeInTheDocument();
    });
  });

  it("shows error_description from query params", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    window.location.search =
      "?error=access_denied&error_description=User%20denied";

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/User denied/)).toBeInTheDocument();
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "Auth callback error:",
      "access_denied",
      "User denied",
    );
    consoleSpy.mockRestore();
  });

  it("falls back to error param when no description", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    window.location.search = "?error=server_error";

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/server_error/)).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it("redirects to home when no code or error", async () => {
    window.location.search = "";

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows loading spinner and text initially", () => {
    window.location.search = "?code=test-code";
    mockHandleCodeCallback.mockImplementation(() => new Promise(() => {}));

    render(<AuthCallbackPage />);

    expect(screen.getByText("Sisenen...")).toBeInTheDocument();
    const spinner = document.querySelector(".loader-spinner");
    expect(spinner).toBeTruthy();
  });

  it("redirects to home when TARA tokens succeed", async () => {
    window.location.search = "?access_token=at&id_token=it&refresh_token=rt";
    mockHandleTaraTokens.mockReturnValue(true);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockHandleTaraTokens).toHaveBeenCalledWith({
        accessToken: "at",
        idToken: "it",
        refreshToken: "rt",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows TARA error with exact message and back button", async () => {
    window.location.search = "?access_token=at&id_token=it&refresh_token=rt";
    mockHandleTaraTokens.mockReturnValue(false);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/TARA autentimise viga/)).toBeInTheDocument();
      const btn = screen.getByText("Tagasi avalehele");
      expect(btn.className).toContain("button--primary");
    });
  });

  it("does not call handleCodeCallback for TARA token flow", async () => {
    window.location.search = "?access_token=at&id_token=it&refresh_token=rt";
    mockHandleTaraTokens.mockReturnValue(true);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
    expect(mockHandleCodeCallback).not.toHaveBeenCalled();
  });

  it("navigates home when error back button clicked", async () => {
    window.location.search = "?error=access_denied";
    const user = (await import("@testing-library/user-event")).default.setup();

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/Tagasi avalehele/)).toBeInTheDocument();
    });
    await user.click(screen.getByText("Tagasi avalehele"));
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
