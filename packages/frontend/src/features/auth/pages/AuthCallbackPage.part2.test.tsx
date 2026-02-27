// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { AuthCallbackPage } from "./AuthCallbackPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));

const mockHandleCodeCallback = vi.fn();
const mockHandleTaraTokens = vi.fn();
vi.mock("../services", () => ({
  useAuth: () => ({
    handleCodeCallback: mockHandleCodeCallback,
    handleTaraTokens: mockHandleTaraTokens,
  }),
}));

describe("AuthCallbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { search: "", hash: "" },
      writable: true,
    });
  });

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("loading view renders PageLoadingState with correct structure", () => {
    window.location.search = "?code=c";
    mockHandleCodeCallback.mockImplementation(() => new Promise(() => {}));
    render(<AuthCallbackPage />);
    const container = document.querySelector(".page-loading-state") as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.getAttribute("role")).toBe("status");
    expect(container.getAttribute("aria-live")).toBe("polite");
  });

  it("error text includes 'Sisselogimine ebaõnnestus' prefix with generic message", async () => {
    window.location.search = "?error=oops";
    render(<AuthCallbackPage />);
    await waitFor(() => {
      const p = screen.getByText(/Sisselogimine ebaõnnestus/);
      expect(p.textContent).toContain("Autentimise viga");
      expect(p.tagName).toBe("P");
    });
  });

  });

  });

  });

  });

  });

});
