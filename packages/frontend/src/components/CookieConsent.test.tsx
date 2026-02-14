// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CookieConsent from "./CookieConsent";

describe("CookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows banner when no consent stored", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Nõustun")).toBeInTheDocument();
  });

  it("hides banner when consent already accepted", () => {
    localStorage.setItem("hak_cookie_consent", "accepted");
    render(<CookieConsent />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("accepts consent and hides banner", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    await user.click(screen.getByText("Nõustun"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(localStorage.getItem("hak_cookie_consent")).toBe("accepted");
  });
});
