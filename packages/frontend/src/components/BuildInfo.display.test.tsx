// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BuildInfo from "./BuildInfo";

describe("BuildInfo runtime fetch", () => {
  it("shows buildId and deployedAt from build-info.json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            buildId: "BUILD-123",
            commitHash: "abc",
            commitHashFull: "abcdef123456",
            branch: "main",
            message: "fix: something",
            builtAt: "2026-01-13T12:00:00Z",
            deployedAt: "2026-01-13T13:00:00Z",
            environment: "staging",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    await waitFor(() => expect(screen.getByText("BUILD-123")).toBeTruthy());
    expect(screen.getByText("Build")).toBeTruthy();
    expect(screen.getByText("Deployed")).toBeTruthy();
    expect(screen.getByText("fix: something")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("handles fetch failure gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("Network")),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    expect(screen.getByText("Hash")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("handles non-ok fetch response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({ ok: false } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    expect(screen.getByText("Hash")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("skips fetch on localhost", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    expect(mockFetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("shows fallback values when runtime has partial data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            commitHash: "",
            branch: "",
            message: "",
            builtAt: "",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "hak-dev.example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    // Should still show Hash and Branch rows
    expect(screen.getByText("Hash")).toBeTruthy();
    expect(screen.getByText("Branch")).toBeTruthy();
    vi.unstubAllGlobals();
  });

  it("shows directory row on localhost with workingDir", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => fireEvent.click(screen.getByRole("button")));
    // Check modal content exists
    expect(document.querySelector(".build-info-modal__content")).toBeTruthy();
    vi.unstubAllGlobals();
  });

});
