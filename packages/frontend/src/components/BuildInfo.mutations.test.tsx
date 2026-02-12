// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import BuildInfo from "./BuildInfo";

/**
 * Mutation-killing tests for BuildInfo
 * Targets: formatDateTime, isLocalDev, Row className, useBuildInfo fallbacks, conditional rows
 */
describe("BuildInfo mutation kills", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("formatDateTime returns empty string for empty input", () => {
    // This tests the `if (!dateString) return ""` branch
    vi.stubGlobal("fetch", vi.fn());
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    // Built row should show empty since buildTime is ""
    const builtRow = screen.getByText("Built").closest(".build-info-row");
    const builtValue = builtRow?.querySelector(".build-info-value");
    expect(builtValue?.textContent).toBe("");
  });

  it("formatDateTime formats a valid date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            commitHash: "abc",
            branch: "main",
            builtAt: "2026-01-13T12:00:00Z",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    // Wait for fetch to resolve and state to update
    await waitFor(() => expect(screen.getByText("abc")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button"));
    const builtRow = screen.getByText("Built").closest(".build-info-row");
    const builtValue = builtRow?.querySelector(".build-info-value");
    // Should contain a formatted date, not empty
    expect(builtValue?.textContent?.length).toBeGreaterThan(0);
  });

  it("isLocalDev returns true for localhost", () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("Row renders className prop correctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            commitHash: "abc",
            branch: "main",
            message: "msg",
            builtAt: "",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    // Wait for fetch to complete and state to update
    await waitFor(() => expect(screen.getByText("abc")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("msg")).toBeInTheDocument();
    const msgEl = screen.getByText("msg");
    expect(msgEl.className).toContain("build-info-message");
  });

  it("useBuildInfo returns fallback commitHash and branch without runtime", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    // Should show "dev" for commitHash and "local" for branch (fallback values)
    expect(screen.getAllByText("dev").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("local")).toBeInTheDocument();
  });

  it("shows runtimeInfo commitHash||buildTimeInfo fallback", async () => {
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
      value: { hostname: "example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => expect(screen.getByText("dev")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button"));
    // Empty commitHash falls back to buildTimeInfo.commitHash = "dev"
    // "dev" appears both in button hash and modal row
    expect(screen.getAllByText("dev").length).toBeGreaterThanOrEqual(2);
    // Empty branch falls back to "local"
    expect(screen.getByText("local")).toBeInTheDocument();
  });

  it("does not show buildId row when no buildId", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Build")).not.toBeInTheDocument();
  });

  it("does not show Deployed row when no deployedAt", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Deployed")).not.toBeInTheDocument();
  });

  it("shows dash for empty message", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("Row without className defaults to empty", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    // Hash value should have "build-info-value" but no extra class
    const hashRow = screen.getByText("Hash").closest(".build-info-row");
    const hashValue = hashRow?.querySelector(".build-info-value");
    expect(hashValue?.className).toBe("build-info-value ");
  });

  it("modal header has h3 with 'Build Info'", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    const h3 = document.querySelector(".build-info-modal__header h3");
    expect(h3?.textContent).toBe("Build Info");
  });

  it("close button contains × character", () => {
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    fireEvent.click(screen.getByRole("button"));
    const closeBtn = document.querySelector(".build-info-modal__close");
    expect(closeBtn?.textContent?.trim()).toBe("×");
  });

  it("fetch is called with /build-info.json on non-localhost (kills L73, L51)", () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window, "location", {
      value: { hostname: "example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    expect(mockFetch).toHaveBeenCalledWith("/build-info.json");
  });

  it("runtimeInfo.builtAt is used when provided (kills L86 true)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            commitHash: "xyz",
            branch: "feat",
            builtAt: "2026-06-15T10:00:00Z",
          }),
      } as Response),
    );
    Object.defineProperty(window, "location", {
      value: { hostname: "example.com" },
      writable: true,
    });
    render(<BuildInfo />);
    await waitFor(() => expect(screen.getByText("xyz")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button"));
    const builtRow = screen.getByText("Built").closest(".build-info-row");
    const builtValue = builtRow?.querySelector(".build-info-value");
    expect(builtValue?.textContent?.length).toBeGreaterThan(0);
    expect(builtValue?.textContent).not.toBe("true");
  });

  it("hostname === localhost check is exact (kills L51:21 empty string)", () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", mockFetch);
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    render(<BuildInfo />);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
