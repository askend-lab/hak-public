// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BuildInfo from "./BuildInfo";

describe("BuildInfo", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("renders button with hash", () => {
    render(<BuildInfo />);
    expect(document.querySelector(".build-info-button")).toBeTruthy();
  });

  it("opens modal when clicked", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Build Info")).toBeTruthy();
  });

  it("closes modal on close button", () => {
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("×"));
    expect(screen.queryByText("Build Info")).toBeNull();
  });
});

describe("BuildInfo runtime fetch", () => {
  it("shows buildId from build-info.json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            buildId: "BUILD-123",
            commitHash: "abc",
            branch: "main",
            deployedAt: "2026-01-13T12:00:00Z",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.askend-lab.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    await waitFor(() => expect(screen.getByText("BUILD-123")).toBeTruthy());
    vi.unstubAllGlobals();
  });
});
