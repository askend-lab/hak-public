// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CookieConsent, { hasTrackingConsent } from "./CookieConsent";

describe("CookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows banner when no consent stored", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Nõustun")).toBeInTheDocument();
  });

  it("hides banner when consent already accepted", () => {
    localStorage.setItem("hak_cookie_consent", "accepted");
    render(<CookieConsent />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("hides banner when consent already declined", () => {
    localStorage.setItem("hak_cookie_consent", "declined");
    render(<CookieConsent />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("accepts consent and hides banner", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    await user.click(screen.getByText("Nõustun"));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(localStorage.getItem("hak_cookie_consent")).toBe("accepted");
  });

  it("declines consent and hides banner", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    await user.click(screen.getByText("Keeldun"));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(localStorage.getItem("hak_cookie_consent")).toBe("declined");
  });
});

describe("hasTrackingConsent", () => {
  beforeEach(() => localStorage.clear());

  it("returns true when accepted", () => {
    localStorage.setItem("hak_cookie_consent", "accepted");
    expect(hasTrackingConsent()).toBe(true);
  });

  it("returns false when declined", () => {
    localStorage.setItem("hak_cookie_consent", "declined");
    expect(hasTrackingConsent()).toBe(false);
  });

  it("returns false when no consent stored", () => {
    expect(hasTrackingConsent()).toBe(false);
  });
});
